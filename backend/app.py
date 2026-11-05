import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models import db
from seed_data import seed_database

# Blueprints
from routes.auth import auth_bp
from routes.restaurants import restaurants_bp
from routes.food import food_bp
from routes.cart import cart_bp
from routes.orders import orders_bp
from routes.coupons import coupons_bp
from routes.admin import admin_bp
from routes.reviews import reviews_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure Database URI dynamically
    app.config['SQLALCHEMY_DATABASE_URI'] = Config.get_database_uri()
    
    # Enable CORS for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize SQLAlchemy
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(restaurants_bp)
    app.register_blueprint(food_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(coupons_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(reviews_bp)

    @app.route('/')
    def index():
        return jsonify({
            'name': 'FoodieHub REST API',
            'version': '1.0.0',
            'status': 'healthy',
            'endpoints': {
                'auth': '/api/auth',
                'restaurants': '/api/restaurants',
                'food': '/api/food',
                'cart': '/api/cart',
                'orders': '/api/orders',
                'coupons': '/api/coupons',
                'admin': '/api/admin',
                'reviews': '/api/reviews'
            }
        })

    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'service': 'foodiehub-backend'})

    # Create tables and seed data within application context
    with app.app_context():
        try:
            db.create_all()
            seed_database()
        except Exception as e:
            print(f"[INIT ERROR] Failed during db initialization or seeding: {e}")

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"\n🚀 FoodieHub Backend Server running on http://127.0.0.1:{port}\n")
    app.run(host='0.0.0.0', port=port, debug=False)
