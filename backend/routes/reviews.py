from flask import Blueprint, request, jsonify
from models import db, Review, Restaurant, FoodItem
from utils import token_required

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('', methods=['GET'])
def get_reviews():
    restaurant_id = request.args.get('restaurant_id')
    food_item_id = request.args.get('food_item_id')
    featured = request.args.get('featured')

    query = Review.query

    if restaurant_id:
        query = query.filter_by(restaurant_id=restaurant_id)
    if food_item_id:
        query = query.filter_by(food_item_id=food_item_id)
    if featured == 'true':
        query = query.filter(Review.rating >= 4.5).limit(6)
    else:
        query = query.order_by(Review.created_at.desc()).limit(20)

    reviews = query.all()
    return jsonify({
        'success': True,
        'reviews': [r.to_dict() for r in reviews]
    })

@reviews_bp.route('', methods=['POST'])
@token_required
def create_review(user):
    data = request.get_json() or {}
    restaurant_id = data.get('restaurant_id')
    food_item_id = data.get('food_item_id')
    rating = float(data.get('rating', 5))
    comment = data.get('comment', '').strip()

    if not comment:
        return jsonify({'success': False, 'message': 'Comment is required'}), 400

    review = Review(
        user_id=user.id,
        restaurant_id=restaurant_id,
        food_item_id=food_item_id,
        rating=max(1.0, min(5.0, rating)),
        comment=comment
    )
    db.session.add(review)
    
    # Recalculate restaurant rating
    if restaurant_id:
        restaurant = Restaurant.query.get(restaurant_id)
        if restaurant:
            all_revs = Review.query.filter_by(restaurant_id=restaurant_id).all()
            total_stars = sum(r.rating for r in all_revs) + rating
            total_count = len(all_revs) + 1
            restaurant.rating = round(total_stars / total_count, 1)
            restaurant.total_reviews = total_count

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Thank you for your review!',
        'review': review.to_dict()
    }), 201
