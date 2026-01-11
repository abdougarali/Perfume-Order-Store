"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/imageUtils";
import { useToast } from "./ToastContainer";
import { arabicTranslations } from "@/lib/translations";
import { getArabicProductName } from "@/lib/productTranslations";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryLabels: Record<string, string> = {
  'eau-de-parfum': 'Eau de Parfum',
  'eau-de-toilette': 'Eau de Toilette',
  'mens': "Men's Collection",
  'womens': "Women's Collection",
  'unisex': 'Unisex Collection',
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateCartItem, getTotalPrice, clearCart } = useCart();
  const toast = useToast();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Customer information form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price / 1000);
  };

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      if (!customerName || !customerPhone || !customerAddress) {
        const errorMessage = "Please enter your name, phone number, and address.";
        setErrorMsg(errorMessage);
        toast.showError(errorMessage);
        setSubmitting(false);
        return;
      }
      if (cartItems.length === 0) {
        const errorMessage = "Please add at least one product to the cart.";
        setErrorMsg(errorMessage);
        toast.showError(errorMessage);
        setSubmitting(false);
        return;
      }

      // Convert products to required format
      const productsPayload = cartItems.map((item) => ({
        id: item.productId,
        name: item.name,
        category: item.category,
        volume: item.volume,
        fragranceNotes: item.fragranceNotes,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }));

      const payload = {
        customerName,
        customerPhone,
        customerAddress,
        products: productsPayload,
        totalPrice: getTotalPrice(),
        notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMessage = data?.error || "An error occurred while submitting your order.";
        setErrorMsg(errorMessage);
        toast.showError(errorMessage);
      } else {
        const successMessage = data?.message || "Your order has been submitted successfully!";
        setSuccessMsg(successMessage);
        toast.showSuccess(successMessage);
        // Clear form and cart
        setCustomerName("");
        setCustomerPhone("");
        setCustomerAddress("");
        setNotes("");
        clearCart();
        // Close drawer after success
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred. Please try again.";
      setErrorMsg(errorMessage);
      toast.showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = getTotalPrice();
  const totalFormatted = formatPrice(totalPrice);

  return (
    <>
      {/* Overlay - Dark Theme */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar - Dark Theme */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 md:w-[450px] bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col backdrop-blur-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fragrance Wardrobe */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-luxury tracking-wide">
                My Fragrance Wardrobe
              </h2>
              <p className="text-base font-arabic-calligraphy text-[#d4af37] mt-1.5 font-semibold" dir="rtl">
                {arabicTranslations.ui["My Fragrance Wardrobe"]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 active:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 text-white/70 hover:text-white"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items - Dark Theme */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <svg
                className="w-24 h-24 text-white/20 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <h3 className="text-lg sm:text-xl font-semibold text-white/80 mb-2 font-elegant">
                Wardrobe is Empty
              </h3>
              <p className="text-sm text-white/50 font-elegant max-w-xs">
                Discover your signature scents and build your fragrance collection
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => {
                const imageSrc = imageErrors[item.id]
                  ? getProductImage("", item.category, item.name)
                  : getProductImage(item.image, item.category, item.name);

                return (
                  <div
                    key={item.id}
                    className="group bg-gradient-to-br from-white/5 via-white/5 to-white/3 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 hover:border-[#d4af37]/40 hover:from-white/8 hover:to-white/5 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#d4af37]/10"
                  >
                    <div className="flex gap-3.5">
                      {/* Product Image - Enhanced */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 shadow-inner group-hover:border-[#d4af37]/30 transition-all duration-300">
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          fill
                          className="object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          sizes="112px"
                          onError={() => handleImageError(item.id)}
                          unoptimized={imageSrc.startsWith("https://")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Product Info - Enhanced */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex-1">
                          {/* Name and Category */}
                          <div className="mb-2">
                            <h3 className="text-sm sm:text-base font-bold text-white mb-1 line-clamp-1 font-luxury leading-tight group-hover:text-[#d4af37] transition-colors">
                              {item.name}
                            </h3>
                            {getArabicProductName(item.name) && (
                              <p className="text-sm font-arabic-calligraphy text-[#d4af37] leading-relaxed line-clamp-1 font-semibold mb-1" dir="rtl">
                                {getArabicProductName(item.name)}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[10px] text-white/50 uppercase tracking-widest font-elegant">
                                {categoryLabels[item.category] || item.category}
                              </p>
                              {item.volume && (
                                <>
                                  <span className="text-white/20">•</span>
                                  <p className="text-[10px] text-white/60 font-elegant flex items-center gap-1">
                                    <svg className="w-2.5 h-2.5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="uppercase tracking-wide">{item.volume}</span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mb-3">
                            <div className="flex items-baseline gap-2">
                              <p className="text-base sm:text-lg font-bold text-[#d4af37] font-luxury">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-white/40 font-elegant">
                                  ({formatPrice(item.price)} × {item.quantity})
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls & Actions - Enhanced */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-0.5 border border-white/10">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 active:bg-white/20 hover:text-[#d4af37] transition-all duration-200 group/btn"
                              aria-label="Decrease quantity"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-white/70 group-hover/btn:text-[#d4af37] transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="text-sm font-bold text-white w-8 text-center font-elegant min-w-[32px]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 active:bg-white/20 hover:text-[#d4af37] transition-all duration-200 group/btn"
                              aria-label="Increase quantity"
                            >
                              <svg
                                className="w-3.5 h-3.5 text-white/70 group-hover/btn:text-[#d4af37] transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 hover:bg-red-500/20 active:bg-red-500/30 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30 group/remove"
                            aria-label="Remove item"
                          >
                            <svg
                              className="w-4 h-4 text-red-400/70 group-hover/remove:text-red-400 transition-colors"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Form & Total - Dark Theme - Compact & Scrollable */}
        {cartItems.length > 0 && (
          <div className="border-t border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0 flex flex-col max-h-[45vh]">
            {/* Total - Fixed at top */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 flex-shrink-0">
              <span className="text-sm font-semibold text-white/80 font-elegant uppercase tracking-wide">Total:</span>
              <span className="text-xl font-bold text-[#d4af37] font-luxury">{totalFormatted}</span>
            </div>

            {/* Order Form - Scrollable & Compact */}
            <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar-thin min-h-0" dir="rtl">
              <form id="order-form" onSubmit={handleSubmit} className="space-y-2.5">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-white/70 mb-1 font-arabic-calligraphy font-semibold">
                    {arabicTranslations.form["Full Name"]} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    dir="rtl"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-xs text-white placeholder:text-white/40 font-arabic-calligraphy transition-all duration-200"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-white/70 mb-1 font-arabic-calligraphy font-semibold">
                    {arabicTranslations.form["Phone Number"]} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    dir="rtl"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-xs text-white placeholder:text-white/40 font-arabic-calligraphy transition-all duration-200"
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs font-medium text-white/70 mb-1 font-arabic-calligraphy font-semibold">
                    {arabicTranslations.form["Address"]} *
                  </label>
                  <textarea
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    required
                    rows={2}
                    dir="rtl"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-xs text-white placeholder:text-white/40 font-arabic-calligraphy resize-none transition-all duration-200"
                    placeholder="أدخل عنوانك الكامل"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-xs font-medium text-white/50 mb-1 font-arabic-calligraphy font-semibold">
                    {arabicTranslations.form["Notes (Optional)"]}
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    dir="rtl"
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] text-xs text-white placeholder:text-white/40 font-arabic-calligraphy resize-none transition-all duration-200"
                    placeholder="ملاحظات إضافية (إن وجدت)"
                  />
                </div>

                {/* Messages - Compact */}
                {errorMsg && (
                  <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-md text-xs text-red-300 font-elegant backdrop-blur-sm">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-2 bg-green-500/20 border border-green-500/50 rounded-md text-xs text-green-300 font-elegant backdrop-blur-sm">
                    {successMsg}
                  </div>
                )}
              </form>
            </div>

            {/* Submit Button - Fixed at bottom */}
            <div className="border-t border-white/10 px-4 py-3 flex-shrink-0 bg-black/30 backdrop-blur-sm">
              <button
                type="submit"
                form="order-form"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#d4af37] to-[#c9a961] hover:from-[#e5c870] hover:to-[#d4b870] disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 text-[#0a0a0a] font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#d4af37]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md flex items-center justify-center gap-2 text-xs font-luxury tracking-wide uppercase"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{arabicTranslations.ui["Complete Order"]}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles - Dark Theme */}
      <style jsx global>{`
        /* Cart Drawer Scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
        
        /* Compact Form Scrollbar */
        .custom-scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </>
  );
}
