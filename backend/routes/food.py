from flask import Blueprint, request, jsonify
from models import db, FoodItem, Category, Restaurant

food_bp = Blueprint('food', __name__, url_prefix='/api/food')

@food_bp.route('', methods=['GET'])
def get_foods():
    query = FoodItem.query.filter_by(is_available=True)
    
    # Search
    search = request.args.get('search', '').strip()
    if search:
        query = query.filter(
            (FoodItem.name.ilike(f"%{search}%")) |
            (FoodItem.description.ilike(f"%{search}%"))
        )

    # Category filter
    category_id = request.args.get('category_id')
    category_slug = request.args.get('category')
    if category_id:
        query = query.filter_by(category_id=category_id)
    elif category_slug and category_slug != 'all':
        cat = Category.query.filter_by(slug=category_slug).first()
        if cat:
            query = query.filter_by(category_id=cat.id)

    # Restaurant filter
    restaurant_id = request.args.get('restaurant_id')
    if restaurant_id:
        query = query.filter_by(restaurant_id=restaurant_id)

    # Veg filter
    if request.args.get('veg_only') == 'true':
        query = query.filter_by(is_veg=True)

    # Bestseller
    if request.args.get('bestseller') == 'true':
        query = query.filter_by(is_bestseller=True)

    # Price range
    max_price = request.args.get('max_price')
    if max_price:
        try:
            query = query.filter(FoodItem.price <= float(max_price))
        except ValueError:
            pass

    # Limit
    limit = request.args.get('limit', type=int)
    if limit:
        foods = query.limit(limit).all()
    else:
        foods = query.all()

    return jsonify({
        'success': True,
        'count': len(foods),
        'items': [item.to_dict() for item in foods]
    })

@food_bp.route('/<int:food_id>', methods=['GET'])
def get_food_detail(food_id):
    item = FoodItem.query.filter_by(id=food_id, is_available=True).first_or_404()
    item_dict = item.to_dict()
    if item.restaurant:
        item_dict['restaurant'] = item.restaurant.to_dict()
    return jsonify({
        'success': True,
        'food': item_dict
    })

@food_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.filter_by(is_active=True).all()
    results = []
    for cat in categories:
        c_dict = cat.to_dict()
        c_dict['items_count'] = len([f for f in cat.food_items if f.is_available])
        results.append(c_dict)
    return jsonify({
        'success': True,
        'categories': results
    })

@food_bp.route('/bestsellers', methods=['GET'])
def get_bestsellers():
    limit = request.args.get('limit', default=8, type=int)
    items = FoodItem.query.filter_by(is_available=True, is_bestseller=True).limit(limit).all()
    return jsonify({
        'success': True,
        'items': [item.to_dict() for item in items]
    })
