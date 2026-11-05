from flask import Blueprint, request, jsonify
from models import db, CartItem, FoodItem
from utils import token_required

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

@cart_bp.route('', methods=['GET'])
@token_required
def get_cart(user):
    items = CartItem.query.filter_by(user_id=user.id).all()
    subtotal = 0.0
    restaurant_ids = set()

    formatted_items = []
    for ci in items:
        if not ci.food_item or not ci.food_item.is_available:
            continue
        price = ci.food_item.discounted_price if ci.food_item.discounted_price else ci.food_item.price
        subtotal += price * ci.quantity
        restaurant_ids.add(ci.food_item.restaurant_id)
        formatted_items.append(ci.to_dict())

    # Delivery fee based on items/restaurant, or standard $2.99
    delivery_fee = 2.99 if len(formatted_items) > 0 else 0.0
    tax = round(subtotal * 0.08, 2)  # 8% tax
    total = round(subtotal + delivery_fee + tax, 2)

    return jsonify({
        'success': True,
        'items': formatted_items,
        'item_count': sum(i['quantity'] for i in formatted_items),
        'subtotal': round(subtotal, 2),
        'delivery_fee': delivery_fee,
        'tax': tax,
        'total': total,
        'multiple_restaurants': len(restaurant_ids) > 1
    })

@cart_bp.route('', methods=['POST'])
@token_required
def add_to_cart(user):
    data = request.get_json() or {}
    food_item_id = data.get('food_item_id')
    quantity = max(1, int(data.get('quantity', 1)))
    notes = data.get('notes', '').strip()

    if not food_item_id:
        return jsonify({'success': False, 'message': 'food_item_id is required'}), 400

    food_item = FoodItem.query.filter_by(id=food_item_id, is_available=True).first()
    if not food_item:
        return jsonify({'success': False, 'message': 'Food item not found or unavailable'}), 404

    # Optional: check if cart has items from different restaurant
    existing_items = CartItem.query.filter_by(user_id=user.id).all()
    if existing_items:
        current_rest_id = existing_items[0].food_item.restaurant_id if existing_items[0].food_item else None
        if current_rest_id and current_rest_id != food_item.restaurant_id:
            # If user wants to replace cart from another restaurant, clear old items
            if data.get('replace_cart') is True:
                CartItem.query.filter_by(user_id=user.id).delete()
            else:
                return jsonify({
                    'success': False, 
                    'different_restaurant': True,
                    'message': 'Your cart already contains items from a different restaurant. Would you like to clear cart and start fresh?'
                }), 409

    # Check if item is already in cart
    cart_item = CartItem.query.filter_by(user_id=user.id, food_item_id=food_item_id).first()
    if cart_item:
        cart_item.quantity += quantity
        if notes:
            cart_item.notes = notes
    else:
        cart_item = CartItem(
            user_id=user.id,
            food_item_id=food_item_id,
            quantity=quantity,
            notes=notes
        )
        db.session.add(cart_item)

    db.session.commit()
    return jsonify({
        'success': True,
        'message': f'Added {food_item.name} to cart',
        'item': cart_item.to_dict()
    }), 201

@cart_bp.route('/<int:cart_item_id>', methods=['PUT'])
@token_required
def update_cart_item(user, cart_item_id):
    data = request.get_json() or {}
    quantity = data.get('quantity')
    notes = data.get('notes')

    cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=user.id).first()
    if not cart_item:
        return jsonify({'success': False, 'message': 'Cart item not found'}), 404

    if quantity is not None:
        if quantity <= 0:
            db.session.delete(cart_item)
            db.session.commit()
            return jsonify({'success': True, 'message': 'Item removed from cart', 'deleted': True})
        cart_item.quantity = quantity

    if notes is not None:
        cart_item.notes = notes.strip()

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Cart updated',
        'item': cart_item.to_dict()
    })

@cart_bp.route('/<int:cart_item_id>', methods=['DELETE'])
@token_required
def remove_from_cart(user, cart_item_id):
    cart_item = CartItem.query.filter_by(id=cart_item_id, user_id=user.id).first()
    if not cart_item:
        return jsonify({'success': False, 'message': 'Cart item not found'}), 404

    db.session.delete(cart_item)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Item removed from cart'})

@cart_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_cart(user):
    CartItem.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    return jsonify({'success': True, 'message': 'Cart cleared'})
