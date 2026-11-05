import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Package, 
  Heart, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Edit3, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { authAPI, orderAPI, restaurantAPI } from '../api/client';
import RestaurantCard from '../components/restaurant/RestaurantCard';

const CustomerDashboardPage = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'favourites', 'profile'
  const [orders, setOrders] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address modal/form
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    address_line: '',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94107',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard');
      return;
    }

    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }

    const loadUserData = async () => {
      try {
        setLoadingOrders(true);
        const [ordersRes, addrRes, restRes] = await Promise.all([
          orderAPI.getUserOrders(),
          authAPI.getAddresses(),
          restaurantAPI.getAll(),
        ]);

        if (ordersRes.success) setOrders(ordersRes.orders || []);
        if (addrRes.success) setAddresses(addrRes.addresses || []);

        if (restRes.success && user?.favourites) {
          const favRests = (restRes.restaurants || []).filter((r) =>
            user.favourites.includes(r.id)
          );
          setFavourites(favRests);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, user, navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await authAPI.updateProfile({ name, phone });
      if (res.success) {
        showToast('Profile updated successfully!');
        refreshUser();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.addAddress(newAddr);
      if (res.success) {
        setAddresses((prev) => [...prev, res.address]);
        setShowAddAddress(false);
        showToast('Address added!');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await authAPI.deleteAddress(id);
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        showToast('Address deleted');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.email}`}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-200 shadow-sm"
        />
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-black text-stone-900">{user?.name}</h1>
            {user?.role === 'admin' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 w-max mx-auto sm:mx-0">
                <ShieldCheck className="w-3.5 h-3.5" /> Staff Administrator
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-600 font-medium">{user?.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs font-semibold text-stone-600">
            <span>{orders.length} Total Orders</span>
            <span>•</span>
            <span>{addresses.length} Saved Addresses</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'addresses'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favourites')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'favourites'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Favourites ({favourites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-28 bg-stone-200 rounded-3xl" />
              <div className="h-28 bg-stone-200 rounded-3xl" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8 space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="text-lg font-bold text-stone-900">No orders yet</h3>
              <p className="text-xs text-stone-600">Ready to taste something delicious?</p>
              <Link
                to="/restaurants"
                className="inline-block mt-2 px-6 py-2.5 rounded-full text-xs font-bold bg-brand-500 text-white hover:bg-brand-600"
              >
                Browse Restaurants
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const statusColors = {
                placed: 'bg-blue-100 text-blue-800',
                accepted: 'bg-amber-100 text-amber-800',
                preparing: 'bg-purple-100 text-purple-800',
                out_for_delivery: 'bg-emerald-100 text-emerald-800 animate-pulse',
                delivered: 'bg-stone-100 text-stone-800',
                cancelled: 'bg-red-100 text-red-800',
              };

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-card transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-stone-900">
                        #{order.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          statusColors[order.status] || 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-stone-900">
                      {order.restaurant_name}
                    </h4>

                    <div className="text-xs text-stone-600 space-y-0.5">
                      <p>
                        {order.items?.map((i) => `${i.quantity}x ${i.food_name}`).join(', ')}
                      </p>
                      <p className="text-[11px] text-stone-600">
                        Placed on {order.created_at?.split('T')[0]} • Total: ₹{Math.round(order.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Link
                      to={`/orders/${order.order_number}`}
                      className="px-5 py-2.5 rounded-full text-xs font-bold bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-200 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-stone-900">Saved Addresses</h3>
            {!showAddAddress && (
              <button
                onClick={() => setShowAddAddress(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-stone-900 text-white hover:bg-black flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            )}
          </div>

          {showAddAddress && (
            <form
              onSubmit={handleAddAddress}
              className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4"
            >
              <h4 className="text-sm font-bold text-stone-900">Add New Delivery Location</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Label
                  </label>
                  <select
                    value={newAddr.label}
                    onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123 Main St, Apt 4"
                    value={newAddr.address_line}
                    onChange={(e) => setNewAddr({ ...newAddr, address_line: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.postal_code}
                    onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand-500 text-white"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft flex justify-between items-start"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wide">
                    {addr.label}
                  </span>
                  <p className="text-xs font-semibold text-stone-800 leading-relaxed">
                    {addr.address_line}, {addr.city}, {addr.state} {addr.postal_code}
                  </p>
                  <p className="text-[11px] text-stone-600">Phone: {addr.phone}</p>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-stone-600 hover:text-red-500 p-1 transition-colors"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Favourites */}
      {activeTab === 'favourites' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-stone-900">Favourite Restaurants</h3>
          {favourites.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
              <Heart className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-600">You haven't bookmarked any restaurants yet.</p>
              <Link
                to="/restaurants"
                className="inline-block px-5 py-2 rounded-full text-xs font-bold bg-brand-500 text-white"
              >
                Explore Restaurants
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favourites.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={{ ...rest, is_favourite: true }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Account Profile */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleUpdateProfile}
          className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-soft space-y-5"
        >
          <h3 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
            Edit Account Profile
          </h3>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full p-3 text-xs rounded-xl bg-stone-100 border border-stone-200 text-stone-600 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={updatingProfile}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm disabled:opacity-50"
          >
            {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      )}

    </div>
  );
};

export default CustomerDashboardPage;
