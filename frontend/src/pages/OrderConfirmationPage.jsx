import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ArrowRight, Home, Bike } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
      
      {/* Animated icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl"
      >
        <CheckCircle2 className="w-14 h-14" />
      </motion.div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
          Order Confirmed!
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          Your food is being prepared!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
          The restaurant has received your order and the kitchen is firing up the stoves.
        </p>
      </div>

      {/* Order Badge info */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200/80 shadow-soft max-w-sm mx-auto space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-600 font-medium">Order Number:</span>
          <span className="font-mono font-bold text-stone-900">{orderNumber}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-600 font-medium">Est. Delivery Time:</span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 25-35 Minutes
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Link
          to={`/orders/${orderNumber}`}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Bike className="w-4 h-4" />
          <span>Track Order Live</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
