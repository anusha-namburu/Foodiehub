import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  Clock, 
  Bike, 
  ChefHat, 
  CheckCircle2, 
  Store, 
  MapPin, 
  Phone, 
  RefreshCw, 
  AlertTriangle,
  ArrowLeft 
} from 'lucide-react';
import { orderAPI } from '../api/client';
import { useCart } from '../context/CartContext';

const STAGES = [
  { key: 'placed', label: 'Order Placed', desc: 'Received & sent to restaurant', icon: Clock },
  { key: 'accepted', label: 'Restaurant Accepted', desc: 'Order confirmed by chef', icon: Store },
  { key: 'preparing', label: 'Food Preparation', desc: 'Cooking fresh in the kitchen', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Driver is on the way to you', icon: Bike },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your hot meal!', icon: CheckCircle2 },
];

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { showToast } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await orderAPI.getTracking(id);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      fetchOrder();
    }, 12000); // Polling every 12s for live status updates
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await orderAPI.cancelOrder(order.id);
      if (res.success) {
        showToast('Order cancelled');
        setOrder(res.order);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-200 rounded-xl" />
        <div className="h-44 bg-stone-200 rounded-3xl" />
        <div className="h-64 bg-stone-200 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/dashboard" className="text-sm font-bold text-brand-600 underline">
          View all your orders
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard" className="text-stone-600 hover:text-stone-900">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Live Order Tracker
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2">
            <span>Order #{order.order_number}</span>
            {isCancelled && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold">
                Cancelled
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>

          {!isCancelled && ['placed', 'accepted'].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="px-4 py-2 rounded-full text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* 1. PROGRESS TIMELINE STEPPER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-soft">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
          <div>
            <span className="text-xs font-semibold text-stone-600">Restaurant</span>
            <h3 className="text-lg font-bold text-stone-900">{order.restaurant_name}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-stone-600">Estimated Delivery</span>
            <p className="text-lg font-black text-emerald-600">
              {isCancelled ? 'Cancelled' : order.status === 'delivered' ? 'Delivered' : `~${order.estimated_delivery_time} mins`}
            </p>
          </div>
        </div>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-red-50 text-red-800 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <span className="text-xs font-semibold">
              This order was cancelled. If you were charged, a full refund will be processed within 1-2 business days.
            </span>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Stepper */}
            <div className="hidden sm:grid grid-cols-5 gap-2 relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-stone-200 -z-0">
                <div
                  className="h-full bg-brand-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100))}%`,
                  }}
                />
              </div>

              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div key={stage.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 ring-4 ring-brand-100'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce' : ''}`} />
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold mt-3 ${
                        isCurrent ? 'text-brand-600' : isPassed ? 'text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-stone-600 mt-0.5 max-w-[110px]">
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="sm:hidden space-y-6 relative pl-6 border-l-2 border-brand-500 ml-4">
              {STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div key={stage.key} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPassed ? 'bg-brand-500 text-white' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-brand-600' : 'text-stone-900'}`}>
                      {stage.label}
                    </h4>
                    <p className="text-[11px] text-stone-600">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. ORDER DETAILS & ADDRESS SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Items */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
            Ordered Items ({order.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-stone-100 font-bold flex items-center justify-center text-stone-700">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-stone-800">{item.food_name}</span>
                </div>
                <span className="font-bold text-stone-900">${item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${order.delivery_fee.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount ({order.coupon_code || 'PROMO'})</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-black text-stone-900">
              <span>Total Paid</span>
              <span className="text-brand-600">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
            Delivery Details
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-800 block">Delivery Address</span>
                <p className="text-stone-600 leading-relaxed mt-0.5">{order.delivery_address}</p>
              </div>
            </div>

            {order.delivery_notes && (
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100">
                <span className="font-bold text-stone-700 block mb-0.5">Instructions:</span>
                <p className="text-stone-600">{order.delivery_notes}</p>
              </div>
            )}

            <div className="pt-2">
              <span className="font-bold text-stone-800 block mb-1">Payment:</span>
              <p className="text-stone-600 uppercase font-mono tracking-wider">
                {order.payment?.payment_method || 'CARD'} • {order.payment?.payment_status || 'COMPLETED'}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrderTrackingPage;
