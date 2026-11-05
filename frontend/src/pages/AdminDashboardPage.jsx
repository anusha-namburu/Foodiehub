import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Store, 
  Users, 
  Tag, 
  FolderTree, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  Package, 
  ShieldCheck, 
  LogOut,
  RefreshCw
} from 'lucide-react';
import { adminAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const AdminDashboardPage = () => {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, restaurants, foods, categories, coupons, customers
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Forms
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    description: '',
    cuisine_type: 'Italian, Pizza',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&fit=crop',
    address: '123 Market St, San Francisco',
    rating: 4.8,
    delivery_time_min: 25,
    delivery_fee: 2.99,
    min_order: 10.0,
  });

  const [newFood, setNewFood] = useState({
    restaurant_id: '',
    category_id: '',
    name: '',
    description: '',
    price: 14.99,
    discounted_price: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&fit=crop',
    is_veg: true,
    is_spicy: false,
    is_bestseller: false,
    preparation_time: 20,
    ingredients: '',
  });

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 25,
    max_discount: 10,
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&fit=crop',
    description: '',
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [sRes, oRes, rRes, fRes, cRes, coupRes, custRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getOrders(),
        adminAPI.getRestaurants(),
        adminAPI.getFoods(),
        adminAPI.getCategories(),
        adminAPI.getCoupons(),
        adminAPI.getCustomers(),
      ]);

      if (sRes.success) setStats(sRes.stats);
      if (oRes.success) setOrders(oRes.orders || []);
      if (rRes.success) {
        setRestaurants(rRes.restaurants || []);
        if (rRes.restaurants?.length > 0 && !newFood.restaurant_id) {
          setNewFood((prev) => ({ ...prev, restaurant_id: rRes.restaurants[0].id }));
        }
      }
      if (fRes.success) setFoods(fRes.items || []);
      if (cRes.success) {
        setCategories(cRes.categories || []);
        if (cRes.categories?.length > 0 && !newFood.category_id) {
          setNewFood((prev) => ({ ...prev, category_id: cRes.categories[0].id }));
        }
      }
      if (coupRes.success) setCoupons(coupRes.coupons || []);
      if (custRes.success) setCustomers(custRes.customers || []);
    } catch (err) {
      console.error('Admin data load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login?redirect=/admin');
      return;
    }
    loadAllData();
  }, [isAdmin, navigate]);

  // Order Status update handler
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminAPI.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order #${res.order.order_number} status updated to ${newStatus}`);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Restaurant handler
  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createRestaurant(newRestaurant);
      if (res.success) {
        showToast('Restaurant added!');
        setRestaurants((prev) => [res.restaurant, ...prev]);
        setShowAddRestaurant(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (!window.confirm('Delete this restaurant and its menu items?')) return;
    try {
      const res = await adminAPI.deleteRestaurant(id);
      if (res.success) {
        showToast('Restaurant deleted');
        setRestaurants((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Food handler
  const handleCreateFood = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createFood(newFood);
      if (res.success) {
        showToast('Food item created!');
        setFoods((prev) => [res.item, ...prev]);
        setShowAddFood(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      const res = await adminAPI.deleteFood(id);
      if (res.success) {
        showToast('Food item deleted');
        setFoods((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Coupon handler
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createCoupon(newCoupon);
      if (res.success) {
        showToast(`Coupon ${res.coupon.code} created!`);
        setCoupons((prev) => [res.coupon, ...prev]);
        setShowAddCoupon(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      const res = await adminAPI.deleteCoupon(id);
      if (res.success) {
        showToast('Coupon removed');
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Add Category handler
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createCategory(newCategory);
      if (res.success) {
        showToast('Category created!');
        setCategories((prev) => [...prev, res.category]);
        setShowAddCategory(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!isAdmin) {
    return null;
  }

  const navTabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
    { key: 'restaurants', label: 'Restaurants', icon: Store, badge: restaurants.length },
    { key: 'foods', label: 'Food Menu', icon: UtensilsCrossed, badge: foods.length },
    { key: 'categories', label: 'Categories', icon: FolderTree },
    { key: 'coupons', label: 'Coupons', icon: Tag },
    { key: 'customers', label: 'Customers', icon: Users, badge: customers.length },
  ];

  return (
    <div className="min-h-screen bg-stone-100/60 pb-20">
      
      {/* Admin Top Header */}
      <header className="bg-white border-b border-stone-200 sticky top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-900 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-stone-900 flex items-center gap-2">
                <span>FoodieHub Central Control</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Admin Panel
                </span>
              </h1>
              <p className="text-[11px] text-stone-600">Logged in as {user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700"
            >
              View Storefront
            </Link>
          </div>
        </div>

        {/* Tab navigation bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 pt-1">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-stone-700 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-stone-600 text-xs font-bold uppercase tracking-wider">
                  <span>Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-stone-900">
                  ${stats.total_revenue.toFixed(2)}
                </div>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  Today: ${stats.today_sales.toFixed(2)}
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-stone-600 text-xs font-bold uppercase tracking-wider">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-brand-600" />
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {stats.total_orders}
                </div>
                <p className="text-[11px] text-brand-600 font-semibold">
                  {stats.active_orders} active in progress
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-stone-600 text-xs font-bold uppercase tracking-wider">
                  <span>Registered Foodies</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {stats.total_customers}
                </div>
                <p className="text-[11px] text-stone-600">Active customer base</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-soft space-y-2">
                <div className="flex items-center justify-between text-stone-600 text-xs font-bold uppercase tracking-wider">
                  <span>Catalog Size</span>
                  <UtensilsCrossed className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-stone-900">
                  {stats.total_foods} Dishes
                </div>
                <p className="text-[11px] text-stone-600">Across {stats.total_restaurants} kitchens</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Table */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-soft p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Recent Customer Orders</h3>
                  <p className="text-xs text-stone-600">Live order stream and delivery statuses</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-600 uppercase font-bold text-[10px] tracking-wider border-y border-stone-100">
                    <tr>
                      <th className="py-3 px-3">Order</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Restaurant</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.slice(0, 6).map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/70">
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">
                          #{order.order_number}
                        </td>
                        <td className="py-3 px-3 font-medium text-stone-800">
                          {order.customer_name}
                        </td>
                        <td className="py-3 px-3 text-stone-600">{order.restaurant_name}</td>
                        <td className="py-3 px-3 font-bold text-stone-900">
                          ${order.total_amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-stone-100 text-stone-800'
                                : order.status === 'out_for_delivery'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-brand-100 text-brand-800'
                            }`}
                          >
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="p-1 text-[11px] font-semibold rounded-lg bg-stone-100 border border-stone-200 text-stone-800 focus:outline-none cursor-pointer"
                          >
                            <option value="placed">Placed</option>
                            <option value="accepted">Accepted</option>
                            <option value="preparing">Preparing</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 2. ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-soft p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-stone-900">All Orders Management</h3>
                <p className="text-xs text-stone-600">Update live order stages for real-time tracking</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-bold text-[10px] tracking-wider border-y border-stone-100">
                  <tr>
                    <th className="py-3 px-3">Order #</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Restaurant</th>
                    <th className="py-3 px-3">Items</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Current Status</th>
                    <th className="py-3 px-3 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">
                        #{o.order_number}
                      </td>
                      <td className="py-3 px-3 text-stone-600 text-[11px]">
                        {o.created_at?.split('T')[0]}
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-800">
                        {o.customer_name}
                      </td>
                      <td className="py-3 px-3 text-stone-600">{o.restaurant_name}</td>
                      <td className="py-3 px-3 text-stone-600 text-[11px] max-w-xs truncate">
                        {o.items?.map((i) => `${i.quantity}x ${i.food_name}`).join(', ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-900">
                        ${o.total_amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800">
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="p-1.5 text-xs font-bold rounded-xl bg-brand-50 border border-brand-200 text-brand-900 focus:outline-none cursor-pointer"
                        >
                          <option value="placed">Placed</option>
                          <option value="accepted">Accepted</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. RESTAURANTS TAB */}
        {activeTab === 'restaurants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Manage Restaurants</h3>
                <p className="text-xs text-stone-600">Onboard new kitchens or edit details</p>
              </div>
              <button
                onClick={() => setShowAddRestaurant(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Restaurant</span>
              </button>
            </div>

            {/* Modal: Add Restaurant */}
            {showAddRestaurant && (
              <form
                onSubmit={handleCreateRestaurant}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-card space-y-4"
              >
                <h4 className="text-sm font-bold text-stone-900">Add New Partner Restaurant</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bella Napoli Pizzeria"
                      value={newRestaurant.name}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Cuisines (comma separated)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Italian, Pizza, Pasta"
                      value={newRestaurant.cuisine_type}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, cuisine_type: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Delivery Time (mins)
                    </label>
                    <input
                      type="number"
                      required
                      value={newRestaurant.delivery_time_min}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, delivery_time_min: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Delivery Fee ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newRestaurant.delivery_fee}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, delivery_fee: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Min Order ($)
                    </label>
                    <input
                      type="number"
                      required
                      value={newRestaurant.min_order}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, min_order: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Image Cover URL
                    </label>
                    <input
                      type="url"
                      required
                      value={newRestaurant.image_url}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, image_url: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      required
                      value={newRestaurant.address}
                      onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddRestaurant(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white"
                  >
                    Create Restaurant
                  </button>
                </div>
              </form>
            )}

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-soft flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={rest.image_url}
                      alt={rest.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-stone-900 truncate">{rest.name}</h4>
                      <p className="text-xs text-stone-600 line-clamp-1">{rest.cuisine_type}</p>
                      <p className="text-[11px] text-stone-600 mt-1">
                        ⭐ {rest.rating} • {rest.delivery_time_min} mins • ${rest.delivery_fee} fee
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <Link
                      to={`/restaurants/${rest.id}`}
                      className="font-bold text-brand-600 hover:underline"
                    >
                      View Menu →
                    </Link>
                    <button
                      onClick={() => handleDeleteRestaurant(rest.id)}
                      className="text-stone-600 hover:text-red-500 p-1"
                      title="Delete restaurant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FOOD MENU ITEMS TAB */}
        {activeTab === 'foods' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Food Menu Catalog ({foods.length})</h3>
                <p className="text-xs text-stone-600">Add, edit prices, or toggle availability</p>
              </div>
              <button
                onClick={() => setShowAddFood(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dish</span>
              </button>
            </div>

            {/* Modal: Add Food */}
            {showAddFood && (
              <form
                onSubmit={handleCreateFood}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-card space-y-4"
              >
                <h4 className="text-sm font-bold text-stone-900">Add New Dish to Menu</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Restaurant
                    </label>
                    <select
                      value={newFood.restaurant_id}
                      onChange={(e) => setNewFood({ ...newFood, restaurant_id: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    >
                      {restaurants.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={newFood.category_id}
                      onChange={(e) => setNewFood({ ...newFood, category_id: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Dish Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Classic Carbonara"
                      value={newFood.name}
                      onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Regular Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newFood.price}
                      onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Discounted Price ($ Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newFood.discounted_price}
                      onChange={(e) => setNewFood({ ...newFood, discounted_price: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Prep Time (mins)
                    </label>
                    <input
                      type="number"
                      value={newFood.preparation_time}
                      onChange={(e) => setNewFood({ ...newFood, preparation_time: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={newFood.image_url}
                    onChange={(e) => setNewFood({ ...newFood, image_url: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Description & Ingredients
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description of taste and ingredients..."
                    value={newFood.description}
                    onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFood.is_veg}
                      onChange={(e) => setNewFood({ ...newFood, is_veg: e.target.checked })}
                    />
                    <span>Vegetarian</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFood.is_spicy}
                      onChange={(e) => setNewFood({ ...newFood, is_spicy: e.target.checked })}
                    />
                    <span>Spicy</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFood.is_bestseller}
                      onChange={(e) => setNewFood({ ...newFood, is_bestseller: e.target.checked })}
                    />
                    <span>Bestseller</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFood(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white"
                  >
                    Save Dish
                  </button>
                </div>
              </form>
            )}

            {/* Foods table */}
            <div className="bg-white rounded-3xl border border-stone-200 shadow-soft overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-bold text-[10px] tracking-wider border-b border-stone-100">
                  <tr>
                    <th className="py-3 px-3">Dish</th>
                    <th className="py-3 px-3">Restaurant</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Diet</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {foods.map((food) => (
                    <tr key={food.id} className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={food.image_url}
                            alt={food.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">{food.name}</span>
                            <span className="text-[10px] text-stone-600">⭐ {food.rating}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-stone-700 font-medium">
                        {food.restaurant_name}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {food.category_name || 'General'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">
                        ${food.price.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            food.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {food.is_veg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleDeleteFood(food.id)}
                          className="text-stone-600 hover:text-red-500 p-1"
                          title="Delete dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Food Categories</h3>
                <p className="text-xs text-stone-600">Organize dishes into browsable cuisine sections</p>
              </div>
              <button
                onClick={() => setShowAddCategory(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-stone-900 text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            {showAddCategory && (
              <form
                onSubmit={handleCreateCategory}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-soft space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Category name (e.g. Mexican Tacos)"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newCategory.image_url}
                    onChange={(e) => setNewCategory({ ...newCategory, image_url: e.target.value })}
                    className="p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-brand-500 text-white rounded-xl"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-3xl border border-stone-200 shadow-soft flex items-center gap-3"
                >
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{c.name}</h4>
                    <span className="text-[10px] text-stone-600 font-mono">/{c.slug}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">Promotions & Coupons</h3>
                <p className="text-xs text-stone-600">Create discount codes for customer marketing</p>
              </div>
              <button
                onClick={() => setShowAddCoupon(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Coupon</span>
              </button>
            </div>

            {showAddCoupon && (
              <form
                onSubmit={handleCreateCoupon}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-card space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Coupon Code (e.g. SUMMER30)"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 uppercase font-mono"
                  />
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Discount Value"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                    className="p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Description (e.g. 30% off orders above $20)"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    className="p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                  <input
                    type="number"
                    placeholder="Min Order Amount ($)"
                    value={newCoupon.min_order_amount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: e.target.value })}
                    className="p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCoupon(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-brand-500 text-white rounded-xl"
                  >
                    Activate Coupon
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-3xl border border-stone-200 shadow-soft flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-sm font-black text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                        {c.code}
                      </span>
                      <p className="text-xs font-semibold text-stone-800 mt-2">{c.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="text-stone-600 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-stone-600 pt-2 border-t border-stone-100">
                    Min order: ${c.min_order_amount} • {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `$${c.discount_value} off`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-soft p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Registered Customers ({customers.length})</h3>
              <p className="text-xs text-stone-600">Review user profiles and order frequencies</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase font-bold text-[10px] tracking-wider border-y border-stone-100">
                  <tr>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Orders Placed</th>
                    <th className="py-3 px-3">Total Spend</th>
                    <th className="py-3 px-3">Member Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50/70">
                      <td className="py-3 px-3 font-bold text-stone-900">{c.name}</td>
                      <td className="py-3 px-3 text-stone-600">{c.email}</td>
                      <td className="py-3 px-3 text-stone-600">{c.phone || 'N/A'}</td>
                      <td className="py-3 px-3 font-semibold text-stone-800">
                        {c.order_count || 0} orders
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        ${(c.total_spent || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-stone-600 text-[11px]">
                        {c.created_at?.split('T')[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboardPage;
