import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Check, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { authAPI, orderAPI } from '../api/client';

const CheckoutPage = () => {
  const { cartItems, subtotal, deliveryFee, tax, discount, total, coupon, clearCart, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'cod'
  const [placingOrder, setPlacingOrder] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    address_line: '',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94107',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/restaurants');
      return;
    }

    const loadAddresses = async () => {
      try {
        const res = await authAPI.getAddresses();
        if (res.success && res.addresses?.length > 0) {
          setAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.is_default) || res.addresses[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddress(true);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      }
    };

    loadAddresses();
  }, [isAuthenticated, cartItems.length, navigate]);

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address_line || !newAddress.city || !newAddress.postal_code) {
      showToast('Please fill out all address fields', 'error');
      return;
    }

    try {
      const res = await authAPI.addAddress(newAddress);
      if (res.success) {
        setAddresses((prev) => [...prev, res.address]);
        setSelectedAddressId(res.address.id);
        setShowNewAddress(false);
        showToast('Address saved!');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && !newAddress.address_line) {
      showToast('Please select or provide a delivery address', 'error');
      return;
    }

    try {
      setPlacingOrder(true);
      const payload = {
        address_id: selectedAddressId,
        delivery_address_text: !selectedAddressId ? `${newAddress.address_line}, ${newAddress.city}` : undefined,
        delivery_notes: deliveryNotes,
        payment_method: paymentMethod,
        coupon_code: coupon ? coupon.code : null,
        discount: discount,
      };

      const res = await orderAPI.createOrder(payload);
      if (res.success && res.order) {
        showToast('Order placed successfully! 🍕');
        clearCart();
        navigate(`/order-confirmation/${res.order.order_number}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">Checkout</h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Confirm your delivery address and choose your preferred payment option.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. DELIVERY ADDRESS */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-stone-900">1. Delivery Address</h3>
              </div>

              {!showNewAddress && (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {/* Address Selector list */}
            {!showNewAddress && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-500 bg-brand-50/40 shadow-xs ring-1 ring-brand-500'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                        {addr.label}
                      </span>
                      {selectedAddressId === addr.id && (
                        <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-700 font-medium leading-relaxed">
                      {addr.address_line}, {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    <p className="text-[11px] text-stone-600 mt-1">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Add Address Form */}
            {showNewAddress && (
              <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Label
                    </label>
                    <select
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none"
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
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                      value={newAddress.address_line}
                      onChange={(e) => setNewAddress({ ...newAddress, address_line: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none"
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
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      State / Postal
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-black"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Delivery Notes */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Driver Instructions / Gate Code (Optional)
              </label>
              <input
                type="text"
                placeholder="E.g., Ring bell #4B, leave at front door..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* 2. PAYMENT METHOD */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900">2. Payment Method</h3>
            </div>

            {/* Safe Mock Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Safe Demonstration Environment:</span> Payments are processed securely via mock sandbox. No actual credit card or bank funds are debited.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Mock Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'card'
                    ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <CreditCard className="w-5 h-5 text-brand-600" />
                  {paymentMethod === 'card' && (
                    <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Credit / Debit Card</h4>
                  <p className="text-[11px] text-stone-600">Visa, Mastercard, Amex</p>
                </div>
              </div>

              {/* Option 2: Mock UPI */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'upi'
                    ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Smartphone className="w-5 h-5 text-brand-600" />
                  {paymentMethod === 'upi' && (
                    <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Instant UPI / Wallet</h4>
                  <p className="text-[11px] text-stone-600">Google Pay, Apple Pay</p>
                </div>
              </div>

              {/* Option 3: Cash On Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'cod'
                    ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Banknote className="w-5 h-5 text-brand-600" />
                  {paymentMethod === 'cod' && (
                    <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Cash on Delivery</h4>
                  <p className="text-[11px] text-stone-600">Pay cash at your door</p>
                </div>
              </div>
            </div>

            {/* Simulated Card Inputs */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <input
                  type="text"
                  placeholder="Card Number: 4242 •••• •••• 4242"
                  defaultValue="4242 8899 3322 1004"
                  className="w-full p-2.5 text-xs rounded-xl bg-white border border-stone-200 font-mono"
                  readOnly
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/28"
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-stone-200 font-mono text-center"
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    defaultValue="888"
                    className="w-full p-2.5 text-xs rounded-xl bg-white border border-stone-200 font-mono text-center"
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary & Place Order CTA */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-5 sticky top-28">
          <h3 className="text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
            Order Summary ({cartItems.length} items)
          </h3>

          {/* Items list */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((item) => {
              const food = item.food_item || {};
              const price = food.discounted_price || food.price || 0;
              return (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <span className="w-5 h-5 rounded-md bg-stone-100 font-bold flex items-center justify-center shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-stone-800 truncate">{food.name}</span>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    ${(price * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bill breakdown */}
          <div className="space-y-2 pt-3 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-stone-900">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-stone-900">${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Coupon ({coupon?.code})</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-stone-200 text-base font-black text-stone-900">
              <span>Total to Pay</span>
              <span className="text-brand-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={placingOrder}
            className="w-full py-4 rounded-2xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {placingOrder ? (
              <span>Placing Your Feast...</span>
            ) : (
              <>
                <span>Place Order • ${total.toFixed(2)}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-stone-600">
            By ordering, you agree to FoodieHub terms of delivery & refund policy.
          </p>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
