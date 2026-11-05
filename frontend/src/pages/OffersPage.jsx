import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { couponAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const OffersPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const { applyCouponCode, showToast } = useCart();

  useEffect(() => {
    couponAPI.getCoupons().then((res) => {
      if (res.success) setCoupons(res.coupons || []);
    });
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Exclusive Promotions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Foodie Deals & Vouchers
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Save on your next meal order with these limited-time promotional codes.
        </p>
      </div>

      {/* Coupon Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon.id}
            className="bg-white rounded-3xl p-6 border-2 border-dashed border-stone-200/90 shadow-soft hover:shadow-card hover:border-brand-400 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            {/* Discount Badge */}
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
                <Tag className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-stone-900 text-white">
                {coupon.discount_type === 'percentage'
                  ? `${coupon.discount_value}% OFF`
                  : `$${coupon.discount_value} OFF`}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900">{coupon.description}</h3>
              <p className="text-xs text-stone-600">
                Minimum order amount of ${coupon.min_order_amount.toFixed(2)} required.
              </p>
            </div>

            {/* Code Box & Copy */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
              <div className="p-2 px-3 rounded-xl bg-stone-100 text-stone-800 font-mono font-bold text-xs tracking-wider border border-stone-200">
                {coupon.code}
              </div>

              <button
                onClick={() => handleCopy(coupon.code)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-xs flex items-center gap-1.5 transition-all"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Bottom */}
      <div className="text-center pt-8">
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold bg-stone-900 hover:bg-black text-white shadow-md transition-all hover:gap-3"
        >
          <span>Find Dishes to Apply Coupons</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

export default OffersPage;
