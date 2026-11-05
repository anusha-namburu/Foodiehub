from flask import Blueprint, request, jsonify
from datetime import datetime, date
from models import db, User, Restaurant, FoodItem, Category, Order, Coupon, Payment
from utils import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ----------------- 1. STATS -----------------
@admin_bp.route('/stats', methods=['GET'])
@admin_required
def get_stats(user):
    total_customers = User.query.filter_by(role='customer').count()
    total_orders = Order.query.count()
    active_orders = Order.query.filter(Order.status.in_(['placed', 'accepted', 'preparing', 'out_for_delivery'])).count()
    
    # Total revenue from delivered/completed orders
    revenue_orders = Order.query.filter(Order.status != 'cancelled').all()
    total_revenue = sum(o.total_amount for o in revenue_orders)

    # Today's orders
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_orders = Order.query.filter(Order.created_at >= today_start).all()
    today_sales = sum(o.total_amount for o in today_orders if o.status != 'cancelled')

    total_restaurants = Restaurant.query.count()
    total_foods = FoodItem.query.count()

    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(8).all()

    return jsonify({
        'success': True,
        'stats': {
            'total_customers': total_customers,
            'total_orders': total_orders,
            'active_orders': active_orders,
            'total_revenue': round(total_revenue, 2),
            'today_sales': round(today_sales, 2),
            'total_restaurants': total_restaurants,
            'total_foods': total_foods,
        },
        'recent_orders': [o.to_dict() for o in recent_orders]
    })

# ----------------- 2. RESTAURANTS CRUD -----------------
@admin_bp.route('/restaurants', methods=['GET', 'POST'])
@admin_required
def manage_restaurants(user):
    if request.method == 'GET':
        restaurants = Restaurant.query.order_by(Restaurant.created_at.desc()).all()
        return jsonify({
            'success': True,
            'restaurants': [r.to_dict() for r in restaurants]
        })

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    cuisine_type = data.get('cuisine_type', '').strip()
    image_url = data.get('image_url', '').strip()
    address = data.get('address', '').strip()

    if not name or not cuisine_type or not image_url or not address:
        return jsonify({'success': False, 'message': 'Name, cuisine, image URL, and address are required'}), 400

    restaurant = Restaurant(
        name=name,
        description=data.get('description', ''),
        cuisine_type=cuisine_type,
        rating=float(data.get('rating', 4.5)),
        delivery_time_min=int(data.get('delivery_time_min', 30)),
        delivery_fee=float(data.get('delivery_fee', 2.99)),
        min_order=float(data.get('min_order', 10.0)),
        image_url=image_url,
        banner_url=data.get('banner_url') or image_url,
        address=address,
        is_featured=bool(data.get('is_featured', False)),
        is_active=bool(data.get('is_active', True))
    )
    db.session.add(restaurant)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Restaurant added successfully',
        'restaurant': restaurant.to_dict()
    }), 201

@admin_bp.route('/restaurants/<int:restaurant_id>', methods=['PUT', 'DELETE'])
@admin_required
def update_or_delete_restaurant(user, restaurant_id):
    restaurant = Restaurant.query.get_or_404(restaurant_id)

    if request.method == 'DELETE':
        db.session.delete(restaurant)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Restaurant deleted successfully'})

    data = request.get_json() or {}
    for field in ['name', 'description', 'cuisine_type', 'image_url', 'banner_url', 'address']:
        if field in data:
            setattr(restaurant, field, data[field])
    
    if 'rating' in data:
        restaurant.rating = float(data['rating'])
    if 'delivery_time_min' in data:
        restaurant.delivery_time_min = int(data['delivery_time_min'])
    if 'delivery_fee' in data:
        restaurant.delivery_fee = float(data['delivery_fee'])
    if 'min_order' in data:
        restaurant.min_order = float(data['min_order'])
    if 'is_featured' in data:
        restaurant.is_featured = bool(data['is_featured'])
    if 'is_active' in data:
        restaurant.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Restaurant updated successfully',
        'restaurant': restaurant.to_dict()
    })

# ----------------- 3. FOOD ITEMS CRUD -----------------
@admin_bp.route('/foods', methods=['GET', 'POST'])
@admin_required
def manage_foods(user):
    if request.method == 'GET':
        foods = FoodItem.query.order_by(FoodItem.created_at.desc()).all()
        return jsonify({
            'success': True,
            'items': [f.to_dict() for f in foods]
        })

    data = request.get_json() or {}
    restaurant_id = data.get('restaurant_id')
    name = data.get('name', '').strip()
    price = data.get('price')
    image_url = data.get('image_url', '').strip()

    if not restaurant_id or not name or price is None or not image_url:
        return jsonify({'success': False, 'message': 'Restaurant, name, price, and image URL are required'}), 400

    food = FoodItem(
        restaurant_id=int(restaurant_id),
        category_id=int(data.get('category_id')) if data.get('category_id') else None,
        name=name,
        description=data.get('description', ''),
        price=float(price),
        discounted_price=float(data.get('discounted_price')) if data.get('discounted_price') else None,
        image_url=image_url,
        is_veg=bool(data.get('is_veg', True)),
        is_spicy=bool(data.get('is_spicy', False)),
        is_available=bool(data.get('is_available', True)),
        is_bestseller=bool(data.get('is_bestseller', False)),
        rating=float(data.get('rating', 4.8)),
        preparation_time=int(data.get('preparation_time', 20)),
        ingredients=data.get('ingredients', '')
    )
    db.session.add(food)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Food item created successfully',
        'item': food.to_dict()
    }), 201

@admin_bp.route('/foods/<int:food_id>', methods=['PUT', 'DELETE'])
@admin_required
def update_or_delete_food(user, food_id):
    food = FoodItem.query.get_or_404(food_id)

    if request.method == 'DELETE':
        db.session.delete(food)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Food item deleted successfully'})

    data = request.get_json() or {}
    for field in ['name', 'description', 'image_url', 'ingredients']:
        if field in data:
            setattr(food, field, data[field])

    if 'price' in data:
        food.price = float(data['price'])
    if 'discounted_price' in data:
        val = data['discounted_price']
        food.discounted_price = float(val) if val is not None and val != '' else None
    if 'category_id' in data:
        cat_id = data['category_id']
        food.category_id = int(cat_id) if cat_id else None
    if 'restaurant_id' in data:
        food.restaurant_id = int(data['restaurant_id'])
    if 'is_veg' in data:
        food.is_veg = bool(data['is_veg'])
    if 'is_spicy' in data:
        food.is_spicy = bool(data['is_spicy'])
    if 'is_available' in data:
        food.is_available = bool(data['is_available'])
    if 'is_bestseller' in data:
        food.is_bestseller = bool(data['is_bestseller'])
    if 'preparation_time' in data:
        food.preparation_time = int(data['preparation_time'])

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Food item updated successfully',
        'item': food.to_dict()
    })

# ----------------- 4. CATEGORIES CRUD -----------------
@admin_bp.route('/categories', methods=['GET', 'POST'])
@admin_required
def manage_categories(user):
    if request.method == 'GET':
        categories = Category.query.all()
        return jsonify({
            'success': True,
            'categories': [c.to_dict() for c in categories]
        })

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    slug = data.get('slug', '').strip().lower() or name.lower().replace(' ', '-')

    if not name:
        return jsonify({'success': False, 'message': 'Category name is required'}), 400

    cat = Category(
        name=name,
        slug=slug,
        image_url=data.get('image_url', ''),
        description=data.get('description', ''),
        is_active=bool(data.get('is_active', True))
    )
    db.session.add(cat)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Category added successfully',
        'category': cat.to_dict()
    }), 201

# ----------------- 5. ORDERS MANAGEMENT & STATUS UPDATE -----------------
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def get_all_orders(user):
    status_filter = request.args.get('status')
    query = Order.query
    if status_filter and status_filter != 'all':
        query = query.filter_by(status=status_filter)
    
    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'success': True,
        'count': len(orders),
        'orders': [o.to_dict() for o in orders]
    })

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(user, order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json() or {}
    new_status = data.get('status')

    valid_statuses = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400

    order.status = new_status
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Order status updated to {new_status}',
        'order': order.to_dict()
    })

# ----------------- 6. CUSTOMERS LIST -----------------
@admin_bp.route('/customers', methods=['GET'])
@admin_required
def get_customers(user):
    customers = User.query.filter_by(role='customer').order_by(User.created_at.desc()).all()
    data = []
    for c in customers:
        cd = c.to_dict()
        cd['order_count'] = len(c.orders)
        cd['total_spent'] = round(sum(o.total_amount for o in c.orders if o.status != 'cancelled'), 2)
        data.append(cd)

    return jsonify({
        'success': True,
        'customers': data
    })

# ----------------- 7. COUPONS CRUD -----------------
@admin_bp.route('/coupons', methods=['GET', 'POST'])
@admin_required
def manage_coupons(user):
    if request.method == 'GET':
        coupons = Coupon.query.order_by(Coupon.created_at.desc()).all()
        return jsonify({
            'success': True,
            'coupons': [c.to_dict() for c in coupons]
        })

    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    discount_value = data.get('discount_value')

    if not code or discount_value is None:
        return jsonify({'success': False, 'message': 'Coupon code and discount value are required'}), 400

    coupon = Coupon(
        code=code,
        description=data.get('description', f"Save {discount_value}% on your feast"),
        discount_type=data.get('discount_type', 'percentage'),
        discount_value=float(discount_value),
        min_order_amount=float(data.get('min_order_amount', 0.0)),
        max_discount=float(data.get('max_discount')) if data.get('max_discount') else None,
        is_active=bool(data.get('is_active', True))
    )
    db.session.add(coupon)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Coupon created successfully',
        'coupon': coupon.to_dict()
    }), 201

@admin_bp.route('/coupons/<int:coupon_id>', methods=['DELETE', 'PUT'])
@admin_required
def delete_or_toggle_coupon(user, coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    if request.method == 'DELETE':
        db.session.delete(coupon)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Coupon deleted'})
    
    data = request.get_json() or {}
    if 'is_active' in data:
        coupon.is_active = bool(data['is_active'])
    db.session.commit()
    return jsonify({'success': True, 'message': 'Coupon updated', 'coupon': coupon.to_dict()})
