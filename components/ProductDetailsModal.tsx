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
import { arabicTranslations } from '@/lib/translations';
import { getArabicProductName } from '@/lib/productTranslations';

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

  // Generate multiple product images - Primary image matches cart card exactly
  const productImages = useMemo(() => {
    if (!product) return [];
    
    const images: string[] = [];
    // Primary image - same as cart card: getProductImage(product.image, product.category, product.name)
    // This ensures the modal shows the exact same image as the cart card
    const baseImage = getProductImage(product.image || '', product.category, product.name);
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
      // Use base image multiple times for consistency (to match cart card image)
      for (let i = 1; i < 4; i++) {
        images.push(baseImage);
      }
    }
    
    // Always return at least one image (fallback to category image if empty)
    if (images.length === 0) {
      images.push(getProductImage('', product.category, product.name));
    }
    
    return images.slice(0, 4);
  }, [product]);

  // Calculate price based on volume
  // Base price is for 50ml, multipliers: 50ml = 1x, 100ml = 1.8x, 200ml = 3.2x
  const getVolumePrice = useMemo(() => {
    return (volume: string | undefined, basePrice: number): number => {
      if (!volume || !basePrice) return basePrice || 0;
      
      const ml = parseInt(volume.replace('ml', ''));
      if (ml === 50) return basePrice;
      if (ml === 100) return Math.round(basePrice * 1.8);
      if (ml === 200) return Math.round(basePrice * 3.2);
      
      // Default multiplier for any other volume
      const multiplier = ml / 50;
      return Math.round(basePrice * multiplier);
    };
  }, []);

  // Get current price based on selected volume - MUST be before early return
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    const volumeToUse = selectedVolume || product.volumes?.[0];
    return getVolumePrice(volumeToUse, product.price);
  }, [selectedVolume, product?.volumes, product?.price, getVolumePrice]);

  // Reset volume when modal closes, or set to first volume when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSelectedVolume('');
      // Reset image errors when modal closes
      setImageErrors({});
    } else if (isOpen && product && product.volumes && product.volumes.length > 0 && !selectedVolume) {
      // Set to first volume when modal opens
      setSelectedVolume(product.volumes[0]);
    }
  }, [isOpen, product, selectedVolume]);

  // Reset image errors when product changes
  useEffect(() => {
    if (product) {
      setImageErrors({});
    }
  }, [product?.id]);

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

  // Parse fragrance notes for pyramid display
  const parseFragranceNotes = (notes: string | undefined) => {
    if (!notes) return { top: '', heart: '', base: '' };
    
    // Try to parse if formatted as "Top: ..., Heart: ..., Base: ..."
    const topMatch = notes.match(/top[:\s]+([^,;]+)/i);
    const heartMatch = notes.match(/heart[:\s]+([^,;]+)/i);
    const baseMatch = notes.match(/base[:\s]+([^,;]+)/i);
    
    if (topMatch || heartMatch || baseMatch) {
      return {
        top: topMatch ? topMatch[1].trim() : '',
        heart: heartMatch ? heartMatch[1].trim() : '',
        base: baseMatch ? baseMatch[1].trim() : '',
      };
    }
    
    // Otherwise, split by common separators and assign
    const parts = notes.split(/[,;]/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      return {
        top: parts[0],
        heart: parts[1],
        base: parts[2],
      };
    } else if (parts.length === 2) {
      return {
        top: parts[0],
        heart: parts[1],
        base: '',
      };
    } else if (parts.length === 1) {
      return {
        top: parts[0],
        heart: '',
        base: '',
      };
    }
    
    return { top: '', heart: '', base: '' };
  };

  const fragranceNotes = parseFragranceNotes(product.fragranceNotes);

  const handleAddToCart = () => {
    if (!selectedVolume && product.volumes && product.volumes.length > 0) {
      toast.showWarning('Please select a volume', 3000);
      return;
    }

    const volumeToUse = selectedVolume || product.volumes?.[0];
    const priceForVolume = getVolumePrice(volumeToUse, product.price);

    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      volume: volumeToUse || undefined,
      fragranceNotes: product.fragranceNotes,
      price: priceForVolume,
      image: product.image,
    });
    
    toast.showSuccess(`${product.name} added to cart`, 3000);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Overlay - Dark Theme */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300" />

      {/* Modal Content - Compact & Light */}
      <div className="modal-container relative w-[600px] max-w-[600px] max-h-[95vh] bg-[#0a0a0a]/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col backdrop-blur-xl" style={{ width: '600px', maxWidth: '600px' }}>
        {/* Header - Minimal & Light */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm flex-shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-white/90 font-luxury tracking-wide">
              Product Details
            </h2>
            <p className="text-sm font-arabic-calligraphy text-[#d4af37] mt-1 font-semibold" dir="rtl">
              {arabicTranslations.ui["Fragrance Experience"]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 active:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 text-white/60 hover:text-white"
            aria-label="Close"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body - No Scrolling, Compact Layout, Single View */}
        <div className="flex-1 overflow-hidden p-3 sm:p-4 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1 min-h-0">
            {/* Image Carousel - Compact */}
            <div className="w-full flex flex-col space-y-2 min-h-0">
              {/* Main Carousel */}
              <div className="relative w-full flex-1 min-h-[220px] max-h-[260px] bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-lg overflow-hidden border border-white/10">
                <Swiper
                  modules={[Navigation, Thumbs]}
                  spaceBetween={10}
                  navigation
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="h-full rounded-lg"
                >
                  {productImages.length > 0 ? (
                    productImages.map((img, index) => {
                      const imageUrl = img || getProductImage('', product.category, product.name);
                      const hasError = !!imageErrors[index];
                      const fallbackUrl = hasError ? getProductImage('', product.category, product.name) : imageUrl;
                      
                      return (
                        <SwiperSlide key={`${product.id}-img-${index}`} className="relative">
                          <Image
                            src={fallbackUrl}
                            alt={`${product.name} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 450px"
                            quality={85}
                            loading={index === 0 ? 'eager' : 'lazy'}
                            priority={index === 0}
                            onError={() => {
                              if (!imageErrors[index]) {
                                setImageErrors(prev => ({ ...prev, [index]: true }));
                              }
                            }}
                            unoptimized={fallbackUrl.startsWith('https://')}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </SwiperSlide>
                      );
                    })
                  ) : (
                    <SwiperSlide className="relative">
                      <Image
                        src={getProductImage('', product.category, product.name)}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 450px"
                        quality={85}
                        priority
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* Thumbnails - Compact */}
              {productImages.length > 1 && (
                <div className="w-full">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    modules={[Thumbs]}
                    spaceBetween={6}
                    slidesPerView={4}
                    watchSlidesProgress
                    className="product-thumbs"
                  >
                    {productImages.slice(0, 4).map((img, index) => {
                      const imageUrl = img || getProductImage('', product.category, product.name);
                      const hasError = !!imageErrors[`thumb-${index}`];
                      const fallbackUrl = hasError ? getProductImage('', product.category, product.name) : imageUrl;
                      
                      return (
                        <SwiperSlide key={`thumb-${index}`} className="cursor-pointer">
                          <div className="relative w-full h-12 sm:h-14 bg-white/5 rounded-md overflow-hidden border border-transparent hover:border-[#d4af37]/50 transition-all duration-200 backdrop-blur-sm">
                            <Image
                              src={fallbackUrl}
                              alt={`${product.name} - Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                              quality={70}
                              loading="lazy"
                              onError={() => setImageErrors(prev => ({ ...prev, [`thumb-${index}`]: true }))}
                              unoptimized={fallbackUrl.startsWith('https://')}
                            />
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
              )}
            </div>

            {/* Product Information - Compact, No Scroll */}
            <div className="flex flex-col justify-between font-elegant min-h-0 overflow-hidden">
              <div className="space-y-2.5 flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 160px)' }}>
                {/* Name and Category */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5 leading-tight font-luxury tracking-tight">
                    {product.name}
                  </h3>
                  {getArabicProductName(product.name) && (
                    <p className="text-lg sm:text-xl font-arabic-calligraphy text-[#d4af37] mb-2 leading-relaxed font-semibold" dir="rtl">
                      {getArabicProductName(product.name)}
                    </p>
                  )}
                  <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">{categoryLabel}</p>
                </div>

                {/* Price - Updates based on selected volume */}
                <div className="pb-2 border-b border-white/10">
                  <p className="text-xl sm:text-2xl font-bold text-[#d4af37] font-luxury">
                    {formatPrice(currentPrice)}
                  </p>
                </div>

                {/* Fragrance Notes Pyramid - Compact */}
                {product.fragranceNotes && (
                  <div className="bg-white/5 backdrop-blur-sm rounded-md border border-white/10 p-2.5">
                    <h4 className="text-xs font-semibold text-white/80 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <svg className="w-3 h-3 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Notes
                    </h4>
                    <div className="space-y-2">
                      {/* Top Notes */}
                      {fragranceNotes.top && (
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-[#d4af37]"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5 font-elegant">Top</p>
                            <p className="text-xs text-white/80 leading-snug font-elegant italic line-clamp-2">
                              {fragranceNotes.top}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Heart Notes */}
                      {fragranceNotes.heart && (
                        <div className="flex items-start gap-2 ml-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-[#d4af37] opacity-80"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5 font-elegant">Heart</p>
                            <p className="text-xs text-white/80 leading-snug font-elegant italic line-clamp-2">
                              {fragranceNotes.heart}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Base Notes */}
                      {fragranceNotes.base && (
                        <div className="flex items-start gap-2 ml-6">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-[#d4af37] opacity-60"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-0.5 font-elegant">Base</p>
                            <p className="text-xs text-white/80 leading-snug font-elegant italic line-clamp-2">
                              {fragranceNotes.base}
                            </p>
                          </div>
                        </div>
                      )}
                      {/* Fallback */}
                      {!fragranceNotes.top && !fragranceNotes.heart && !fragranceNotes.base && (
                        <p className="text-xs text-white/70 leading-snug italic font-elegant line-clamp-3">
                          {product.fragranceNotes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Volume Selection - Shows price for each volume */}
                {product.volumes && product.volumes.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-semibold text-white/80 mb-1.5 uppercase tracking-wide">Volume</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {product.volumes.map((volume) => {
                        const isSelected = selectedVolume === volume;
                        return (
                          <button
                            key={volume}
                            onClick={() => setSelectedVolume(volume)}
                            className={`px-2.5 py-1 text-[10px] rounded-md border font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                              isSelected
                                ? 'bg-[#d4af37] text-[#0a0a0a] border-[#d4af37] shadow-md shadow-[#d4af37]/30'
                                : 'bg-white/5 text-white border-white/20 hover:border-[#d4af37]/50 hover:bg-white/10'
                            }`}
                          >
                            {volume}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Description - Compact */}
                <div>
                  <h4 className="text-[10px] font-semibold text-white/80 mb-1 uppercase tracking-wide">Description</h4>
                  <p className="text-xs text-white/60 leading-relaxed font-elegant line-clamp-2">
                    {productDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Add to Cart Button - Full Width */}
          <div className="mt-4 pt-3 border-t border-white/10 flex-shrink-0">
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#c9a961] hover:from-[#e5c870] hover:to-[#d4b870] text-[#0a0a0a] font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#d4af37]/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-base font-luxury uppercase tracking-wide"
            >
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>{arabicTranslations.ui["Add to Cart"]}</span>
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
        
        /* Force modal width to 600px */
        :global(.modal-container) {
          width: 600px !important;
          max-width: 600px !important;
        }
        
        /* Custom scrollbar for modal - Compact (only for info section if needed) */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
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

        /* Swiper Navigation Arrows - No Circle, Just Arrows */
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: #d4af37 !important;
          background: transparent !important;
          backdrop-filter: none !important;
          border: none !important;
          border-radius: 0 !important;
          width: 40px !important;
          height: 40px !important;
          margin-top: 0 !important;
          transition: all 0.2s ease !important;
          box-shadow: none !important;
        }
        :global(.swiper-button-next:hover),
        :global(.swiper-button-prev:hover) {
          color: #e5c870 !important;
          background: transparent !important;
          border: none !important;
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

        /* Thumbnails Styling - Dark Theme */
        :global(.product-thumbs .swiper-slide-thumb-active .border-transparent) {
          border-color: #d4af37 !important;
        }
        :global(.product-thumbs .swiper-slide) {
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
        :global(.product-thumbs .swiper-slide-thumb-active) {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
