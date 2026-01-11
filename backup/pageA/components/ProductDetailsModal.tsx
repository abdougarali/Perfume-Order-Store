'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { products } from '@/data/products';
import { getProductImage } from '@/lib/imageUtils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from './ToastContainer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string | null;
}

const categoryLabels: Record<string, string> = {
  'eau-de-parfum': 'Eau de Parfum',
  'eau-de-toilette': 'Eau de Toilette',
  'mens': "Men's Collection",
  'womens': "Women's Collection",
  'unisex': 'Unisex Collection',
};

export default function ProductDetailsModal({ isOpen, onClose, productId }: ProductDetailsModalProps) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string | number, boolean>>({});

  const product = productId ? products.find((p) => p.id === productId) : null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Generate multiple product images
  const productImages = useMemo(() => {
    if (!product) return [];
    
    const images: string[] = [];
    const baseImage = getProductImage(product.image, product.category, product.name);
    images.push(baseImage);
    
    // Add additional images if available
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        const fullPath = getProductImage(img, product.category, product.name);
        if (!images.includes(fullPath)) {
          images.push(fullPath);
        }
      });
    } else {
      // Use base image multiple times for consistency
      for (let i = 1; i < 4; i++) {
        images.push(baseImage);
      }
    }
    
    return images.slice(0, 4);
  }, [product]);

  // Reset volume when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedVolume('');
    }
  }, [isOpen]);

  if (!isOpen || !productId || !product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price / 1000);
  };

  const productDescription = product.description || `Premium ${product.name} from our ${categoryLabels[product.category] || product.category} collection.`;

  const categoryLabel = categoryLabels[product.category] || product.category;

  const handleAddToCart = () => {
    if (!selectedVolume && product.volumes && product.volumes.length > 0) {
      toast.showWarning('Please select a volume', 3000);
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      volume: selectedVolume || product.volumes?.[0] || undefined,
      fragranceNotes: product.fragranceNotes,
      price: product.price,
      image: product.image,
    });
    
    toast.showSuccess(`${product.name} added to cart`, 3000);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" />

      {/* Modal Content */}
      <div className="modal-container relative w-full max-w-4xl max-h-[95vh] bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 font-luxury">
            Product Details
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

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Carousel */}
            <div className="w-full space-y-3">
              {/* Main Carousel */}
              <div className="relative w-full h-96 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-lg overflow-hidden shadow-md">
                <Swiper
                  modules={[Navigation, Thumbs]}
                  spaceBetween={10}
                  navigation
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="h-full rounded-lg"
                >
                  {productImages.map((img, index) => (
                    <SwiperSlide key={index} className="relative">
                      <Image
                        src={img}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 450px"
                        quality={85}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        priority={index === 0}
                        onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                        unoptimized={img.startsWith('https://') || !!imageErrors[index]}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="w-full">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    modules={[Thumbs]}
                    spaceBetween={8}
                    slidesPerView={4}
                    watchSlidesProgress
                    className="product-thumbs"
                  >
                    {productImages.slice(0, 4).map((img, index) => (
                      <SwiperSlide key={index} className="cursor-pointer">
                        <div className="relative w-full h-16 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-[#1a1a1a] transition-all duration-200">
                          <Image
                            src={img}
                            alt={`${product.name} - Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            quality={70}
                            loading="lazy"
                            onError={() => setImageErrors(prev => ({ ...prev, [`thumb-${index}`]: true }))}
                            unoptimized={img.startsWith('https://') || !!imageErrors[`thumb-${index}`]}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="flex flex-col justify-between font-elegant min-h-0">
              <div className="space-y-4">
                {/* Name and Category */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight font-luxury">
                    {product.name}
                  </h3>
                  <p className="text-base text-gray-600 font-medium uppercase tracking-wide">{categoryLabel}</p>
                </div>

                {/* Price */}
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-3xl font-bold text-[#1a1a1a] font-luxury">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Volume Selection */}
                {product.volumes && product.volumes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Select Volume:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.volumes.map((volume) => (
                        <button
                          key={volume}
                          onClick={() => setSelectedVolume(volume)}
                          className={`px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                            selectedVolume === volume
                              ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#d4af37] hover:bg-gray-50'
                          }`}
                        >
                          {volume}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fragrance Notes */}
                {product.fragranceNotes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Fragrance Notes:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      {product.fragranceNotes}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Description:</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {productDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mt-6">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#c9a961] hover:from-[#e5c870] hover:to-[#d4b870] text-[#1a1a1a] font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#d4af37]/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2 text-base btn-gold"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Custom scrollbar for modal */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Swiper Navigation Arrows - Luxury Design */
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: #d4af37 !important;
          background: transparent !important;
          width: 40px !important;
          height: 40px !important;
          margin-top: 0 !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        :global(.swiper-button-next:hover),
        :global(.swiper-button-prev:hover) {
          color: #e5c870 !important;
          transform: scale(1.1) !important;
        }
        :global(.swiper-button-next:active),
        :global(.swiper-button-prev:active) {
          transform: scale(0.95) !important;
        }
        :global(.swiper-button-next::after),
        :global(.swiper-button-prev::after) {
          font-size: 20px !important;
          font-weight: 600 !important;
        }
        :global(.swiper-button-disabled) {
          opacity: 0.2 !important;
          cursor: not-allowed !important;
        }

        /* Thumbnails Styling */
        :global(.product-thumbs .swiper-slide-thumb-active .border-transparent) {
          border-color: #d4af37 !important;
        }
        :global(.product-thumbs .swiper-slide) {
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }
        :global(.product-thumbs .swiper-slide-thumb-active) {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
