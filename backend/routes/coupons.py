from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Coupon

coupons_bp = Blueprint('coupons', __name__, url_prefix='/api/coupons')

@coupons_bp.route('', methods=['GET'])
def get_available_coupons():
    coupons = Coupon.query.filter_by(is_active=True).all()
    return jsonify({
        'success': True,
        'coupons': [c.to_dict() for c in coupons]
    })

@coupons_bp.route('/apply', methods=['POST'])
def apply_coupon():
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    subtotal = float(data.get('subtotal', 0.0))

    if not code:
        return jsonify({'success': False, 'message': 'Coupon code is required'}), 400

    coupon = Coupon.query.filter(Coupon.code.ilike(code), Coupon.is_active == True).first()
    if not coupon:
        return jsonify({'success': False, 'message': 'Invalid coupon code'}), 404

    if coupon.valid_until and coupon.valid_until < datetime.utcnow():
        return jsonify({'success': False, 'message': 'This coupon has expired'}), 400

    if subtotal < coupon.min_order_amount:
        return jsonify({
            'success': False, 
            'message': f'Minimum order amount of ${coupon.min_order_amount:.2f} required for this coupon'
        }), 400

    # Calculate discount
    if coupon.discount_type == 'percentage':
        discount = (subtotal * coupon.discount_value) / 100.0
        if coupon.max_discount and discount > coupon.max_discount:
            discount = coupon.max_discount
    else:
        discount = min(coupon.discount_value, subtotal)

    discount = round(discount, 2)

    return jsonify({
        'success': True,
        'message': f'Coupon {coupon.code} applied! Saved ${discount:.2f}',
        'discount': discount,
        'coupon': coupon.to_dict()
    })
