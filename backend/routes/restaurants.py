from flask import Blueprint, request, jsonify
from models import db, Restaurant, FoodItem, Category, Favourite, Review
from utils import get_current_user, token_required

restaurants_bp = Blueprint('restaurants', __name__, url_prefix='/api/restaurants')

@restaurants_bp.route('', methods=['GET'])
def get_restaurants():
    query = Restaurant.query.filter_by(is_active=True)
    
    # Search
    search = request.args.get('search', '').strip()
    if search:
        query = query.filter(
            (Restaurant.name.ilike(f"%{search}%")) | 
            (Restaurant.cuisine_type.ilike(f"%{search}%")) |
            (Restaurant.description.ilike(f"%{search}%"))
        )
        
    # Cuisine filter
    cuisine = request.args.get('cuisine', '').strip()
    if cuisine and cuisine.lower() != 'all':
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))

    # Min rating filter
    rating = request.args.get('rating')
    if rating:
        try:
            query = query.filter(Restaurant.rating >= float(rating))
        except ValueError:
            pass

    # Max delivery time filter
    max_time = request.args.get('max_time')
    if max_time:
        try:
            query = query.filter(Restaurant.delivery_time_min <= int(max_time))
        except ValueError:
            pass

    # Featured filter
    if request.args.get('featured') == 'true':
        query = query.filter_by(is_featured=True)

    # Sorting
    sort_by = request.args.get('sort', 'rating_desc')
    if sort_by == 'rating_desc':
        query = query.order_by(Restaurant.rating.desc())
    elif sort_by == 'delivery_time_asc':
        query = query.order_by(Restaurant.delivery_time_min.asc())
    elif sort_by == 'delivery_fee_asc':
        query = query.order_by(Restaurant.delivery_fee.asc())
    elif sort_by == 'name_asc':
        query = query.order_by(Restaurant.name.asc())
    else:
        query = query.order_by(Restaurant.rating.desc())

    restaurants = query.all()
    user = get_current_user()
    fav_ids = set()
    if user:
        fav_ids = {f.restaurant_id for f in user.favourites}

    results = []
    for r in restaurants:
        r_dict = r.to_dict()
        r_dict['is_favourite'] = r.id in fav_ids
        results.append(r_dict)

    return jsonify({
        'success': True,
        'count': len(results),
        'restaurants': results
    })

@restaurants_bp.route('/<int:restaurant_id>', methods=['GET'])
def get_restaurant_detail(restaurant_id):
    restaurant = Restaurant.query.filter_by(id=restaurant_id, is_active=True).first_or_404()
    
    # Get all categories
    categories = Category.query.filter_by(is_active=True).all()
    
    # Group available items by category
    items_by_cat = {}
    for item in restaurant.food_items:
        if not item.is_available:
            continue
        cat_name = item.category.name if item.category else 'General'
        if cat_name not in items_by_cat:
            items_by_cat[cat_name] = []
        items_by_cat[cat_name].append(item.to_dict())

    # Get recent reviews
    reviews = Review.query.filter_by(restaurant_id=restaurant.id).order_by(Review.created_at.desc()).limit(10).all()

    user = get_current_user()
    is_favourite = False
    if user:
        is_favourite = Favourite.query.filter_by(user_id=user.id, restaurant_id=restaurant.id).first() is not None

    r_dict = restaurant.to_dict()
    r_dict['menu'] = items_by_cat
    r_dict['reviews'] = [rev.to_dict() for rev in reviews]
    r_dict['is_favourite'] = is_favourite

    return jsonify({
        'success': True,
        'restaurant': r_dict
    })

@restaurants_bp.route('/<int:restaurant_id>/favourite', methods=['POST'])
@token_required
def toggle_favourite(user, restaurant_id):
    fav = Favourite.query.filter_by(user_id=user.id, restaurant_id=restaurant_id).first()
    if fav:
        db.session.delete(fav)
        db.session.commit()
        return jsonify({'success': True, 'is_favourite': False, 'message': 'Removed from favourites'})
    else:
        new_fav = Favourite(user_id=user.id, restaurant_id=restaurant_id)
        db.session.add(new_fav)
        db.session.commit()
        return jsonify({'success': True, 'is_favourite': True, 'message': 'Added to favourites'})

@restaurants_bp.route('/cuisines', methods=['GET'])
def get_cuisines():
    restaurants = Restaurant.query.filter_by(is_active=True).all()
    cuisines_set = set()
    for r in restaurants:
        parts = [c.strip() for c in r.cuisine_type.split(',')]
        cuisines_set.update(parts)
    return jsonify({
        'success': True,
        'cuisines': sorted(list(cuisines_set))
    })
