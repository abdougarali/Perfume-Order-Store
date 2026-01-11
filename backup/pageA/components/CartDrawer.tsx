"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/imageUtils";
import { useToast } from "./ToastContainer";

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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 md:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 font-luxury">
            Shopping Cart
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <svg
                className="w-24 h-24 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-700 mb-2 font-elegant">
                Cart is Empty
              </h3>
              <p className="text-sm text-gray-500 font-elegant">
                Add products to your cart to get started
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
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                          onError={() => handleImageError(item.id)}
                          unoptimized={imageSrc.startsWith("https://")}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 font-elegant">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-elegant">
                          {categoryLabels[item.category] || item.category}
                        </p>
                        {item.volume && (
                          <p className="text-xs text-gray-600 mb-2 font-elegant">
                            Volume: {item.volume}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[#1a1a1a] mb-2">
                          {formatPrice(item.price * item.quantity)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="text-sm font-semibold text-gray-900 w-8 text-center font-elegant">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto p-1 hover:bg-red-50 active:bg-red-100 rounded transition-colors"
                            aria-label="Remove item"
                          >
                            <svg
                              className="w-4 h-4 text-red-600"
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

        {/* Order Form & Total */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white flex-shrink-0">
            <div className="p-4 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-lg font-semibold text-gray-900 font-elegant">Total:</span>
                <span className="text-xl font-bold text-[#1a1a1a] font-luxury">{totalFormatted}</span>
              </div>

              {/* Order Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 font-elegant">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm font-elegant"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 font-elegant">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm font-elegant"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 font-elegant">
                    Address *
                  </label>
                  <textarea
                    id="address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm font-elegant resize-none"
                    placeholder="123 Main Street, City, State, ZIP"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 font-elegant">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent text-sm font-elegant resize-none"
                    placeholder="Special delivery instructions..."
                  />
                </div>

                {/* Messages */}
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 font-elegant">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 font-elegant">
                    {successMsg}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#d4af37] to-[#c9a961] hover:from-[#e5c870] hover:to-[#d4b870] disabled:from-gray-400 disabled:to-gray-500 text-[#1a1a1a] font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#d4af37]/40 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md flex items-center justify-center gap-2 btn-gold"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>Place Order</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
