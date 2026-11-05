import uuid
import random
from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db, Order, OrderItem, Payment, CartItem, Address, Restaurant, FoodItem
from utils import token_required

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

@orders_bp.route('', methods=['POST'])
@token_required
def create_order(user):
    data = request.get_json() or {}
    
    # 1. Delivery address
    address_id = data.get('address_id')
    address_text = data.get('delivery_address_text', '')
    
    if address_id:
        addr = Address.query.filter_by(id=address_id, user_id=user.id).first()
        if addr:
            address_text = f"{addr.label}: {addr.address_line}, {addr.city}, {addr.state} {addr.postal_code} (Phone: {addr.phone})"
    
    if not address_text:
        return jsonify({'success': False, 'message': 'Delivery address is required'}), 400

    # 2. Get cart items or direct items
    cart_items = CartItem.query.filter_by(user_id=user.id).all()
    if not cart_items:
        return jsonify({'success': False, 'message': 'Your cart is empty'}), 400

    subtotal = 0.0
    restaurant_id = None
    items_to_create = []

    for ci in cart_items:
        if not ci.food_item or not ci.food_item.is_available:
            continue
        price = ci.food_item.discounted_price if ci.food_item.discounted_price else ci.food_item.price
        line_total = round(price * ci.quantity, 2)
        subtotal += line_total
        
        if not restaurant_id:
            restaurant_id = ci.food_item.restaurant_id
            
        items_to_create.append({
            'food_item_id': ci.food_item_id,
            'food_name': ci.food_item.name,
            'price': price,
            'quantity': ci.quantity,
            'total_price': line_total,
            'image_url': ci.food_item.image_url
        })

    if not items_to_create:
        return jsonify({'success': False, 'message': 'None of the items in your cart are currently available'}), 400

    restaurant = Restaurant.query.get(restaurant_id)
    delivery_fee = restaurant.delivery_fee if restaurant else 2.99
    tax = round(subtotal * 0.08, 2)
    discount = float(data.get('discount', 0.0))
    coupon_code = data.get('coupon_code')
    total_amount = max(0.0, round(subtotal + delivery_fee + tax - discount, 2))

    order_number = f"FH-{random.randint(100000, 999999)}"

    order = Order(
        order_number=order_number,
        user_id=user.id,
        restaurant_id=restaurant_id,
        address_id=address_id if address_id else None,
        delivery_address_text=address_text,
        status='placed',
        subtotal=round(subtotal, 2),
        delivery_fee=round(delivery_fee, 2),
        tax=tax,
        discount=round(discount, 2),
        total_amount=total_amount,
        coupon_code=coupon_code,
        delivery_notes=data.get('delivery_notes', ''),
        estimated_delivery_time=restaurant.delivery_time_min if restaurant else 35
    )
    db.session.add(order)
    db.session.flush()

    # Add items
    for item_data in items_to_create:
        oi = OrderItem(
            order_id=order.id,
            food_item_id=item_data['food_item_id'],
            food_name=item_data['food_name'],
            price=item_data['price'],
            quantity=item_data['quantity'],
            total_price=item_data['total_price'],
            image_url=item_data['image_url']
        )
        db.session.add(oi)

    # Safe Mock Payment
    payment_method = data.get('payment_method', 'card')  # 'card', 'upi', 'cod'
    payment = Payment(
        order_id=order.id,
        payment_method=payment_method,
        payment_status='completed' if payment_method in ['card', 'upi'] else 'pending',
        transaction_id=f"TXN-{uuid.uuid4().hex[:10].upper()}",
        amount=total_amount,
        paid_at=datetime.utcnow()
    )
    db.session.add(payment)

    # Empty user's cart
    CartItem.query.filter_by(user_id=user.id).delete()

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Order placed successfully!',
        'order': order.to_dict()
    }), 201

@orders_bp.route('', methods=['GET'])
@token_required
def get_user_orders(user):
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    return jsonify({
        'success': True,
        'count': len(orders),
        'orders': [o.to_dict() for o in orders]
    })

@orders_bp.route('/<identifier>', methods=['GET'])
@token_required
def get_order_tracking(user, identifier):
    # identifier can be order ID (int) or order_number string
    query = Order.query
    if identifier.isdigit():
        order = query.filter_by(id=int(identifier)).first()
    else:
        order = query.filter_by(order_number=identifier).first()

    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    # Security check: must be owner or admin
    if order.user_id != user.id and user.role != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized to view this order'}), 403

    return jsonify({
        'success': True,
        'order': order.to_dict()
    })

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@token_required
def cancel_order(user, order_id):
    order = Order.query.filter_by(id=order_id, user_id=user.id).first()
    if not order:
        return jsonify({'success': False, 'message': 'Order not found'}), 404

    if order.status not in ['placed', 'accepted']:
        return jsonify({
            'success': False, 
            'message': f'Cannot cancel order because it is already {order.status.replace("_", " ")}'
        }), 400

    order.status = 'cancelled'
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Order cancelled successfully',
        'order': order.to_dict()
    })
