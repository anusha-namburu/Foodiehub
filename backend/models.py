from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(30), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), default='customer', nullable=False)  # 'customer', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    addresses = db.relationship('Address', backref='user', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy=True)
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')
    reviews = db.relationship('Review', backref='user', lazy=True)
    favourites = db.relationship('Favourite', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'avatar_url': self.avatar_url,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cuisine_type = db.Column(db.String(100), nullable=False)  # e.g., 'Italian, Pizza, Fast Food'
    rating = db.Column(db.Float, default=4.5)
    total_reviews = db.Column(db.Integer, default=0)
    delivery_time_min = db.Column(db.Integer, default=30)  # in minutes
    delivery_fee = db.Column(db.Float, default=2.99)
    min_order = db.Column(db.Float, default=10.0)
    image_url = db.Column(db.String(500), nullable=False)
    banner_url = db.Column(db.String(500), nullable=True)
    address = db.Column(db.String(255), nullable=False)
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    food_items = db.relationship('FoodItem', backref='restaurant', lazy=True, cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='restaurant', lazy=True)
    reviews = db.relationship('Review', backref='restaurant', lazy=True)

    def to_dict(self, include_items=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'cuisine_type': self.cuisine_type,
            'rating': round(self.rating, 1),
            'total_reviews': self.total_reviews,
            'delivery_time_min': self.delivery_time_min,
            'delivery_fee': round(self.delivery_fee, 2),
            'min_order': round(self.min_order, 2),
            'image_url': self.image_url,
            'banner_url': self.banner_url or self.image_url,
            'address': self.address,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_items:
            data['food_items'] = [item.to_dict() for item in self.food_items if item.is_available]
        return data

class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    slug = db.Column(db.String(80), nullable=False, unique=True)
    image_url = db.Column(db.String(500), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    food_items = db.relationship('FoodItem', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'image_url': self.image_url,
            'description': self.description,
            'is_active': self.is_active
        }

class FoodItem(db.Model):
    __tablename__ = 'food_items'
    
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    discounted_price = db.Column(db.Float, nullable=True)
    image_url = db.Column(db.String(500), nullable=False)
    is_veg = db.Column(db.Boolean, default=True)
    is_spicy = db.Column(db.Boolean, default=False)
    is_available = db.Column(db.Boolean, default=True)
    is_bestseller = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=4.8)
    preparation_time = db.Column(db.Integer, default=20)  # minutes
    ingredients = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'restaurant_id': self.restaurant_id,
            'restaurant_name': self.restaurant.name if self.restaurant else None,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'name': self.name,
            'description': self.description,
            'price': round(self.price, 2),
            'discounted_price': round(self.discounted_price, 2) if self.discounted_price else None,
            'image_url': self.image_url,
            'is_veg': self.is_veg,
            'is_spicy': self.is_spicy,
            'is_available': self.is_available,
            'is_bestseller': self.is_bestseller,
            'rating': round(self.rating, 1),
            'preparation_time': self.preparation_time,
            'ingredients': self.ingredients,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    food_item_id = db.Column(db.Integer, db.ForeignKey('food_items.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    food_item = db.relationship('FoodItem')

    def to_dict(self):
        item_price = self.food_item.discounted_price if self.food_item.discounted_price else self.food_item.price
        return {
            'id': self.id,
            'user_id': self.user_id,
            'food_item_id': self.food_item_id,
            'quantity': self.quantity,
            'notes': self.notes,
            'food_item': self.food_item.to_dict() if self.food_item else None,
            'item_total': round(item_price * self.quantity, 2)
        }

class Address(db.Model):
    __tablename__ = 'addresses'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    label = db.Column(db.String(50), default='Home')  # Home, Work, Other
    address_line = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(30), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'label': self.label,
            'address_line': self.address_line,
            'city': self.city,
            'state': self.state,
            'postal_code': self.postal_code,
            'phone': self.phone,
            'is_default': self.is_default
        }

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(40), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=True)
    status = db.Column(db.String(40), default='placed')  # 'placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
    subtotal = db.Column(db.Float, nullable=False)
    delivery_fee = db.Column(db.Float, default=0.0)
    discount = db.Column(db.Float, default=0.0)
    tax = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    coupon_code = db.Column(db.String(50), nullable=True)
    delivery_notes = db.Column(db.String(255), nullable=True)
    estimated_delivery_time = db.Column(db.Integer, default=35)  # in minutes
    delivery_address_text = db.Column(db.String(500), nullable=True)  # Snapshot
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', uselist=False, cascade='all, delete-orphan')
    delivery_address = db.relationship('Address')

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'customer_name': self.user.name if self.user else 'Customer',
            'customer_email': self.user.email if self.user else '',
            'restaurant_id': self.restaurant_id,
            'restaurant_name': self.restaurant.name if self.restaurant else 'Restaurant',
            'restaurant_image': self.restaurant.image_url if self.restaurant else None,
            'status': self.status,
            'subtotal': round(self.subtotal, 2),
            'delivery_fee': round(self.delivery_fee, 2),
            'discount': round(self.discount, 2),
            'tax': round(self.tax, 2),
            'total_amount': round(self.total_amount, 2),
            'coupon_code': self.coupon_code,
            'delivery_notes': self.delivery_notes,
            'estimated_delivery_time': self.estimated_delivery_time,
            'delivery_address': self.delivery_address_text or (self.delivery_address.address_line if self.delivery_address else ''),
            'items': [item.to_dict() for item in self.order_items],
            'payment': self.payment.to_dict() if self.payment else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    food_item_id = db.Column(db.Integer, db.ForeignKey('food_items.id'), nullable=True)
    food_name = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'food_item_id': self.food_item_id,
            'food_name': self.food_name,
            'price': round(self.price, 2),
            'quantity': self.quantity,
            'total_price': round(self.total_price, 2),
            'image_url': self.image_url
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    payment_method = db.Column(db.String(50), default='card')  # 'card', 'upi', 'cod'
    payment_status = db.Column(db.String(50), default='completed')  # 'completed', 'pending', 'failed'
    transaction_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'transaction_id': self.transaction_id,
            'amount': round(self.amount, 2),
            'paid_at': self.paid_at.isoformat() if self.paid_at else None
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=True)
    food_item_id = db.Column(db.Integer, db.ForeignKey('food_items.id'), nullable=True)
    rating = db.Column(db.Float, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else 'Anonymous Foodie',
            'user_avatar': self.user.avatar_url if self.user else None,
            'restaurant_id': self.restaurant_id,
            'food_item_id': self.food_item_id,
            'rating': round(self.rating, 1),
            'comment': self.comment,
            'created_at': self.created_at.strftime('%b %d, %Y') if self.created_at else None
        }

class Coupon(db.Model):
    __tablename__ = 'coupons'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(40), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    discount_type = db.Column(db.String(20), default='percentage')  # 'percentage' or 'fixed'
    discount_value = db.Column(db.Float, nullable=False)  # 20% or $5
    min_order_amount = db.Column(db.Float, default=0.0)
    max_discount = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    valid_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'description': self.description,
            'discount_type': self.discount_type,
            'discount_value': self.discount_value,
            'min_order_amount': self.min_order_amount,
            'max_discount': self.max_discount,
            'is_active': self.is_active,
            'valid_until': self.valid_until.isoformat() if self.valid_until else None
        }

class Favourite(db.Model):
    __tablename__ = 'favourites'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    restaurant = db.relationship('Restaurant')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'restaurant_id': self.restaurant_id,
            'restaurant': self.restaurant.to_dict() if self.restaurant else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
