from flask import Blueprint, request, jsonify
from models import db, User, Address, Favourite
from utils import generate_token, token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'An account with this email already exists'}), 400

    user = User(
        name=name,
        email=email,
        phone=phone,
        role='customer',
        avatar_url=f"https://api.dicebear.com/7.x/adventurer/svg?seed={email}"
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)
    return jsonify({
        'success': True,
        'message': 'Account created successfully',
        'token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    token = generate_token(user.id, user.role)
    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_me(user):
    user_data = user.to_dict()
    user_data['addresses'] = [a.to_dict() for a in user.addresses]
    user_data['favourites'] = [f.restaurant_id for f in user.favourites]
    return jsonify({
        'success': True,
        'user': user_data
    })

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(user):
    data = request.get_json() or {}
    user.name = data.get('name', user.name).strip()
    user.phone = data.get('phone', user.phone).strip()
    if 'avatar_url' in data:
        user.avatar_url = data.get('avatar_url')
    
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    })

@auth_bp.route('/addresses', methods=['GET', 'POST'])
@token_required
def manage_addresses(user):
    if request.method == 'GET':
        addresses = [a.to_dict() for a in user.addresses]
        return jsonify({'success': True, 'addresses': addresses})
        
    data = request.get_json() or {}
    address_line = data.get('address_line', '').strip()
    city = data.get('city', '').strip()
    state = data.get('state', '').strip()
    postal_code = data.get('postal_code', '').strip()
    phone = data.get('phone', user.phone or '').strip()
    label = data.get('label', 'Home').strip()
    is_default = data.get('is_default', False)

    if not address_line or not city or not postal_code:
        return jsonify({'success': False, 'message': 'Address, city, and postal code are required'}), 400

    if is_default or len(user.addresses) == 0:
        for a in user.addresses:
            a.is_default = False
        is_default = True

    new_addr = Address(
        user_id=user.id,
        label=label,
        address_line=address_line,
        city=city,
        state=state or 'CA',
        postal_code=postal_code,
        phone=phone,
        is_default=is_default
    )
    db.session.add(new_addr)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Address added successfully',
        'address': new_addr.to_dict()
    }), 201

@auth_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@token_required
def delete_address(user, address_id):
    addr = Address.query.filter_by(id=address_id, user_id=user.id).first()
    if not addr:
        return jsonify({'success': False, 'message': 'Address not found'}), 404
        
    db.session.delete(addr)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Address removed'})

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    user = User.query.filter_by(email=email).first()
    # Safe response: don't leak user existence
    return jsonify({
        'success': True,
        'message': f'If an account exists for {email}, a password reset link has been dispatched to your inbox.'
    })
