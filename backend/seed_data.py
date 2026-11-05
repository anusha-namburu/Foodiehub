import random
from models import db, User, Restaurant, Category, FoodItem, Coupon, Review, Address

def seed_database():
    print("[SEED] Checking existing records...")
    if User.query.first():
        print("[SEED] Database already populated. Skipping initial seed.")
        return

    print("[SEED] Seeding fresh data...")

    # 1. Users
    admin = User(
        name="Alexander Vance (Admin)",
        email="admin@foodiehub.com",
        phone="+91 9492438966",
        role="admin",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
    )
    admin.set_password("admin123")

    customer = User(
        name="Sophia Martinez",
        email="customer@foodiehub.com",
        phone="+91 9492438966",
        role="customer",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
    )
    customer.set_password("customer123")

    db.session.add_all([admin, customer])
    db.session.flush()

    # Customer Address
    addr1 = Address(
        user_id=customer.id,
        label="Home",
        address_line="Brodipet 4th Lane, Flat 3A",
        city="Guntur",
        state="AP",
        postal_code="522002",
        phone="+91 9492438966",
        is_default=True
    )
    addr2 = Address(
        user_id=customer.id,
        label="Work",
        address_line="Arundelpet Main Road, Suite 201",
        city="Guntur",
        state="AP",
        postal_code="522002",
        phone="+91 9492438966",
        is_default=False
    )
    db.session.add_all([addr1, addr2])

    # 2. Categories
    cat_smoothies = Category(name="Smoothies", slug="smoothies", image_url="https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&fit=crop", description="Fresh fruit, protein & detox smoothies")
    cat_drinks = Category(name="Drinks & Beverages", slug="drinks", image_url="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&fit=crop", description="Craft mocktails, teas, cold brews & fresh juices")
    cat_biryani = Category(name="Biryani & Bowls", slug="biryani", image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&fit=crop", description="Aromatic spiced rice and curry bowls")
    cat_pizza = Category(name="Pizza", slug="pizza", image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&fit=crop", description="Woodfired artisanal pizzas")
    cat_burger = Category(name="Burgers", slug="burgers", image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&fit=crop", description="Juicy smashed & gourmet burgers")
    cat_sushi = Category(name="Sushi", slug="sushi", image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&fit=crop", description="Fresh sashimi, nigiri & rolls")
    cat_pasta = Category(name="Pasta", slug="pasta", image_url="https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=400&fit=crop", description="Handmade pastas & rich sauces")
    cat_dessert = Category(name="Desserts", slug="desserts", image_url="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&fit=crop", description="Sweet indulgence, cakes & shakes")
    cat_healthy = Category(name="Healthy & Bowls", slug="healthy", image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&fit=crop", description="Nutritious greens & superfoods")

    categories = [cat_smoothies, cat_drinks, cat_biryani, cat_pizza, cat_burger, cat_sushi, cat_pasta, cat_dessert, cat_healthy]
    db.session.add_all(categories)
    db.session.flush()

    # 3. Restaurants
    r1 = Restaurant(
        name="The Truffle Crust Pizza Co.",
        description="Authentic Neapolitan sourdough pizzas baked in an 800° woodfired oven with imported San Marzano tomatoes and Fior di Latte.",
        cuisine_type="Italian, Pizza, Gourmet",
        rating=4.9,
        total_reviews=342,
        delivery_time_min=25,
        delivery_fee=2.49,
        min_order=12.0,
        image_url="https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&fit=crop",
        banner_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&fit=crop",
        address="Brodipet 4th Lane, Guntur, AP",
        is_featured=True,
        is_active=True
    )

    r2 = Restaurant(
        name="Smash & Sizzle Burger Bar",
        description="Dry-aged Angus beef patties smashed crispy on a hot griddle, served on toasted brioche with signature truffle umami sauce.",
        cuisine_type="American, Burgers, Fast Food",
        rating=4.8,
        total_reviews=512,
        delivery_time_min=20,
        delivery_fee=1.99,
        min_order=10.0,
        image_url="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&fit=crop",
        banner_url="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&fit=crop",
        address="Arundelpet Main Road, Guntur, AP",
        is_featured=True,
        is_active=True
    )

    r3 = Restaurant(
        name="Sakura Artisanal Sushi",
        description="Masterfully sliced Atlantic salmon, bluefin otoro, and chef-curated maki rolls crafted with premium Koshihikari sushi rice.",
        cuisine_type="Japanese, Sushi, Asian",
        rating=4.9,
        total_reviews=289,
        delivery_time_min=30,
        delivery_fee=3.49,
        min_order=20.0,
        image_url="https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&fit=crop",
        banner_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&fit=crop",
        address="Lakshmipuram Circle, Guntur, AP",
        is_featured=True,
        is_active=True
    )

    r4 = Restaurant(
        name="Royal Spice Biryani House",
        description="Slow-cooked dum biryanis infused with saffron, caramelized onions, and royal spices, paired with cooling mint raita and mirchi ka salan.",
        cuisine_type="Indian, Biryani, Mughlai",
        rating=4.7,
        total_reviews=420,
        delivery_time_min=35,
        delivery_fee=2.99,
        min_order=15.0,
        image_url="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&fit=crop",
        banner_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&fit=crop",
        address="Collector Office Road, Guntur, AP",
        is_featured=True,
        is_active=True
    )

    r5 = Restaurant(
        name="Green Bowl Superfoods",
        description="Organic salad bowls, grain bowls, wild salmon poke, and energizing cold-pressed wellness smoothies made daily.",
        cuisine_type="Healthy, Salads, Vegan",
        rating=4.6,
        total_reviews=195,
        delivery_time_min=20,
        delivery_fee=1.49,
        min_order=10.0,
        image_url="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&fit=crop",
        banner_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&fit=crop",
        address="Koretipadu Main Road, Guntur, AP",
        is_featured=False,
        is_active=True
    )

    r6 = Restaurant(
        name="Pasta Fresca Cucina",
        description="Fresh pasta extruded daily from Italian semolina, tossed with 12-hour braised Bolognese, creamy carbonara, and freshly grated Parmigiano.",
        cuisine_type="Italian, Pasta, Mediterranean",
        rating=4.8,
        total_reviews=230,
        delivery_time_min=28,
        delivery_fee=2.49,
        min_order=14.0,
        image_url="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&fit=crop",
        banner_url="https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=1200&fit=crop",
        address="Old Club Road, Guntur, AP",
        is_featured=False,
        is_active=True
    )

    restaurants = [r1, r2, r3, r4, r5, r6]
    db.session.add_all(restaurants)
    db.session.flush()

    # 4. Food Items
    food_items = [
        # Truffle Crust Pizza
        FoodItem(
            restaurant_id=r1.id,
            category_id=cat_pizza.id,
            name="Black Truffle & Wild Mushroom Pizza",
            description="Woodfired crust topped with creamy truffle ricotta, roasted portobello, mozzarella, fresh thyme, and white truffle oil drizzle.",
            price=19.99,
            discounted_price=17.49,
            image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&fit=crop",
            is_veg=True,
            is_bestseller=True,
            rating=4.9,
            preparation_time=18,
            ingredients="Sourdough base, Black truffle sauce, Portobello mushrooms, Fior di Latte, Thyme, Truffle oil"
        ),
        FoodItem(
            restaurant_id=r1.id,
            category_id=cat_pizza.id,
            name="Classic Margherita D.O.P.",
            description="San Marzano tomato coulis, fresh buffalo mozzarella, fragrant sweet basil, and extra virgin olive oil on blistered crust.",
            price=15.99,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&fit=crop",
            is_veg=True,
            is_bestseller=True,
            rating=4.8,
            preparation_time=15,
            ingredients="San Marzano tomatoes, Fresh mozzarella, Sweet basil leaves, EVOO, Sea salt"
        ),
        FoodItem(
            restaurant_id=r1.id,
            category_id=cat_pizza.id,
            name="Spicy Calabrian Salami & Hot Honey",
            description="Spicy cured salami, crushed hot chilies, melted mozzarella, finished with a generous drizzle of wildflower hot honey.",
            price=18.49,
            discounted_price=16.99,
            image_url="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&fit=crop",
            is_veg=False,
            is_spicy=True,
            is_bestseller=True,
            rating=4.9,
            preparation_time=16,
            ingredients="Spicy pepperoni, Calabrian chili, Hot honey, Tomato sugo, Mozzarella"
        ),
        FoodItem(
            restaurant_id=r1.id,
            category_id=cat_dessert.id,
            name="Nutella & Mascarpone Calzone",
            description="Golden folded crust stuffed with gooey warm Nutella, sweet Italian mascarpone, and dusted with powdered sugar.",
            price=8.99,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&fit=crop",
            is_veg=True,
            is_bestseller=False,
            rating=4.7,
            preparation_time=12,
            ingredients="Nutella hazelnut spread, Sweet mascarpone, Crushed hazelnuts, Powdered sugar"
        ),

        # Smash Burger Bar
        FoodItem(
            restaurant_id=r2.id,
            category_id=cat_burger.id,
            name="The Double Umami Smasher",
            description="Two 100% Angus patties smashed thin with crispy edges, double aged cheddar, grilled shallots, pickles, and secret burger sauce on toasted brioche.",
            price=14.99,
            discounted_price=12.99,
            image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&fit=crop",
            is_veg=False,
            is_bestseller=True,
            rating=4.9,
            preparation_time=15,
            ingredients="Double Angus beef, Cheddar cheese, Brioche bun, Caramelized shallots, Secret burger relish"
        ),
        FoodItem(
            restaurant_id=r2.id,
            category_id=cat_burger.id,
            name="Truffle Bacon & Swiss Burger",
            description="Seared patty crowned with crispy applewood smoked bacon, melted baby Swiss, garlic aioli, and shaved winter truffle sauce.",
            price=16.49,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&fit=crop",
            is_veg=False,
            is_bestseller=True,
            rating=4.8,
            preparation_time=16,
            ingredients="Angus beef patty, Applewood smoked bacon, Swiss cheese, Garlic truffle aioli"
        ),
        FoodItem(
            restaurant_id=r2.id,
            category_id=cat_burger.id,
            name="Crispy Avocado Portobello Burger",
            description="Crispy panko-crusted portobello mushroom stuffed with herbed goat cheese, sliced Haas avocado, and chipotle lime drizzle.",
            price=13.99,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&fit=crop",
            is_veg=True,
            is_bestseller=False,
            rating=4.7,
            preparation_time=15,
            ingredients="Panko portobello, Avocado slices, Goat cheese, Arugula, Chipotle lime glaze"
        ),
        FoodItem(
            restaurant_id=r2.id,
            category_id=cat_drinks.id,
            name="Craft Salted Caramel Milkshake",
            description="Thick handcrafted vanilla bean shake swirled with house-made salted caramel and crushed butter toffee crunch.",
            price=6.99,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&fit=crop",
            is_veg=True,
            is_bestseller=False,
            rating=4.8,
            preparation_time=8,
            ingredients="Vanilla bean gelato, Whole milk, Salted caramel sauce, Butter toffee crumble"
        ),

        # Sakura Sushi
        FoodItem(
            restaurant_id=r3.id,
            category_id=cat_sushi.id,
            name="Dragon Roll Supreme",
            description="Jumbo tempura shrimp and English cucumber topped with thinly sliced eel, avocado fan, tobiko flying fish roe, and unagi glaze.",
            price=18.99,
            discounted_price=16.49,
            image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&fit=crop",
            is_veg=False,
            is_bestseller=True,
            rating=4.9,
            preparation_time=20,
            ingredients="Crispy tempura shrimp, Eel BBQ glaze, Avocado, Japanese cucumber, Red tobiko"
        ),
        FoodItem(
            restaurant_id=r3.id,
            category_id=cat_sushi.id,
            name="Salmon Avocado Maki Platter",
            description="Fresh Atlantic salmon rolled with ripe avocado, toasted sesame seeds, served with authentic wasabi and pickled ginger.",
            price=14.99,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&fit=crop",
            is_veg=False,
            is_bestseller=True,
            rating=4.8,
            preparation_time=15,
            ingredients="Sashimi grade salmon, Avocado, Nori seaweed, Sushi rice, Sesame"
        ),
        FoodItem(
            restaurant_id=r3.id,
            category_id=cat_sushi.id,
            name="Spicy Crunchy Tuna Roll",
            description="Minced yellowfin tuna tossed in fiery Sriracha sesame oil, wrapped with crispy tempura flakes and scallions.",
            price=15.49,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&fit=crop",
            is_veg=False,
            is_spicy=True,
            is_bestseller=True,
            rating=4.8,
            preparation_time=15,
            ingredients="Yellowfin tuna, Spicy mayo, Tempura flakes, Green scallions, Nori"
        ),

        # Royal Spice Biryani
        FoodItem(
            restaurant_id=r4.id,
            category_id=cat_biryani.id,
            name="Hyderabadi Dum Chicken Biryani",
            description="Tender chicken marinated overnight in yogurt and spices, layered with aged basmati rice, saffron milk, and sealed for slow dum cooking.",
            price=17.99,
            discounted_price=15.99,
            image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&fit=crop",
            is_veg=False,
            is_spicy=True,
            is_bestseller=True,
            rating=4.9,
            preparation_time=25,
            ingredients="Aged Basmati, Farm chicken, Saffron, Fried onions, Whole garam spices, Mint raita"
        ),
        FoodItem(
            restaurant_id=r4.id,
            category_id=cat_biryani.id,
            name="Shahi Paneer Tikka Biryani",
            description="Charcoal-smoked cottage cheese cubes tossed in tandoori marinade, layered with fragrant saffron rice and caramelized cashews.",
            price=15.99,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&fit=crop",
            is_veg=True,
            is_spicy=False,
            is_bestseller=True,
            rating=4.8,
            preparation_time=20,
            ingredients="Fresh malai paneer, Roasted cashews, Golden basmati, Biryani masala, Coriander"
        ),
        FoodItem(
            restaurant_id=r4.id,
            category_id=cat_drinks.id,
            name="Alphonso Mango Lassi",
            description="Rich smoothie prepared with chilled sweet mango pulp, probiotic yogurt, and a sprinkle of ground green cardamom.",
            price=5.49,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&fit=crop",
            is_veg=True,
            is_bestseller=False,
            rating=4.9,
            preparation_time=5,
            ingredients="Alphonso mango puree, Greek curd, Green cardamom, Rose water, Pistachios"
        ),

        # Healthy Bowls
        FoodItem(
            restaurant_id=r5.id,
            category_id=cat_healthy.id,
            name="Mediterranean Salmon Quinoa Bowl",
            description="Pan-seared wild salmon over fluffy tri-color quinoa, baby spinach, Persian cucumbers, Kalamata olives, feta, and lemon tahini dressing.",
            price=17.49,
            discounted_price=15.49,
            image_url="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&fit=crop",
            is_veg=False,
            is_bestseller=True,
            rating=4.8,
            preparation_time=15,
            ingredients="Wild salmon fillet, Tri-color quinoa, Persian cucumber, Kalamata olives, Feta, Lemon tahini"
        ),
        FoodItem(
            restaurant_id=r5.id,
            category_id=cat_healthy.id,
            name="Super Green Goddess Avocado Bowl",
            description="Massaged Tuscan kale, crisp broccolini, edamame, sliced avocado, pumpkin seeds, and green goddess herb dressing.",
            price=13.99,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&fit=crop",
            is_veg=True,
            is_bestseller=False,
            rating=4.7,
            preparation_time=12,
            ingredients="Tuscan kale, Haas avocado, Shelled edamame, Toasted pepitas, Green goddess vinaigrette"
        ),

        # Pasta Fresca Cucina
        FoodItem(
            restaurant_id=r6.id,
            category_id=cat_pasta.id,
            name="Handcrafted Tagliatelle al Tartufo",
            description="Fresh ribbon tagliatelle tossed in cultured brown butter, creamy pecorino emulsion, and shaved black winter truffles.",
            price=21.99,
            discounted_price=18.99,
            image_url="https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=600&fit=crop",
            is_veg=True,
            is_bestseller=True,
            rating=4.9,
            preparation_time=20,
            ingredients="Handmade egg pasta, Winter truffle, Butter, Pecorino Romano, Cracked black pepper"
        ),
        FoodItem(
            restaurant_id=r6.id,
            category_id=cat_pasta.id,
            name="Slow-Braised Bolognese Rigatoni",
            description="Bronze-die rigatoni loaded with our 8-hour braised beef and pork ragu, finished with grated aged Parmigiano Reggiano.",
            price=18.49,
            discounted_price=None,
            image_url="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&fit=crop",
            is_veg=False,
            is_bestseller=True,
            rating=4.8,
            preparation_time=18,
            ingredients="Rigatoni, Slow-simmered beef ragu, San Marzano tomatoes, Parmigiano Reggiano"
        )
    ]

    db.session.add_all(food_items)
    db.session.flush()

    # 5. Coupons
    coupons = [
        Coupon(
            code="WELCOME50",
            description="50% off on your first order! (Max discount $15)",
            discount_type="percentage",
            discount_value=50.0,
            min_order_amount=20.0,
            max_discount=15.0,
            is_active=True
        ),
        Coupon(
            code="FOODIE20",
            description="Get 20% off on all orders over $25",
            discount_type="percentage",
            discount_value=20.0,
            min_order_amount=25.0,
            max_discount=10.0,
            is_active=True
        ),
        Coupon(
            code="FREESHIP",
            description="Free delivery voucher ($5 discount)",
            discount_type="fixed",
            discount_value=5.0,
            min_order_amount=15.0,
            is_active=True
        ),
        Coupon(
            code="FEAST10",
            description="$10 flat discount on family feast orders above $50",
            discount_type="fixed",
            discount_value=10.0,
            min_order_amount=50.0,
            is_active=True
        )
    ]
    db.session.add_all(coupons)

    # 6. Reviews
    reviews = [
        Review(
            user_id=customer.id,
            restaurant_id=r1.id,
            rating=5.0,
            comment="Hands down the best truffle pizza in town! The crust is beautifully blistered and the smell when opening the box is heavenly."
        ),
        Review(
            user_id=customer.id,
            restaurant_id=r2.id,
            rating=5.0,
            comment="The smash patties are super crispy around the edges and still juicy inside. Arrived scorching hot in less than 25 minutes!"
        ),
        Review(
            user_id=customer.id,
            restaurant_id=r3.id,
            rating=4.8,
            comment="Melt-in-your-mouth fresh salmon. Presentation looks like fine dining even in delivery containers. Will order again!"
        )
    ]
    db.session.add_all(reviews)

    db.session.commit()
    print("[SEED] Successfully seeded FoodieHub with restaurants, foods, coupons, users, and reviews!")
