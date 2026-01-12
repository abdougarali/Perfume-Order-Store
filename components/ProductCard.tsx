'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Product } from '@/data/products';
import { getProductImage } from '@/lib/imageUtils';
import { getArabicProductName } from '@/lib/productTranslations';
import { arabicTranslations } from '@/lib/translations';

interface ProductCardProps {
  product: Product;
  index?: number;
  onCardClick: (productId: string) => void;
}

const categoryLabels: Record<string, string> = {
  'eau-de-parfum': 'Eau de Parfum',
  'eau-de-toilette': 'Eau de Toilette',
  'mens': "Men's Collection",
  'womens': "Women's Collection",
  'unisex': 'Unisex Collection',
};

export default function ProductCard({ product, index = 0, onCardClick }: ProductCardProps) {
  // Use the exact same image logic as ProductDetailsModal - get the first/base image
  // This ensures the card shows the same image as the modal's first slide
  const primaryImage = useMemo(() => {
    // Same logic as modal: use product.image as base image (first image in modal carousel)
    return getProductImage(product.image, product.category, product.name);
  }, [product.image, product.category, product.name]);

  const [imageSrc, setImageSrc] = useState(() => primaryImage);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset image when product changes - use same primary image as modal
    setImageSrc(primaryImage);
    setImageError(false);
  }, [primaryImage]);

  const formatPrice = (price: number) => {
    const amount = (price / 1000).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return (
      <>
        <span>{amount}</span> <span>TND</span>
      </>
    );
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // On error, use same fallback logic - empty string uses category/name fallback
      const fallbackImage = getProductImage('', product.category, product.name);
      setImageSrc(fallbackImage);
    }
  };

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

  return (
    <div
      className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-[#d4af37]/50 hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 h-full flex flex-col group relative cursor-pointer pattern-overlay"
      onClick={() => onCardClick(product.id)}
    >
      {/* Subtle geometric pattern border top */}
      <div className="pattern-border-top opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
      {/* Bestseller Badge */}
      {product.featured && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-[#d4af37] to-[#c9a961] text-[#0a0a0a] text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-[#d4af37]/50 flex items-center gap-1 backdrop-blur-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{arabicTranslations.ui["Bestseller"]}</span>
        </div>
      )}

      {/* Product Image - Dark Theme */}
      <div className="w-full h-80 relative bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] overflow-hidden">
        {/* Placeholder while loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#3a3a3a] to-[#2a2a2a] animate-pulse" />
        
        <Image
          src={imageSrc}
          alt={`${product.name} - ${categoryLabels[product.category] || product.category}`}
          fill
          className="object-cover group-hover:scale-110 transition-all duration-700 ease-out opacity-90 group-hover:opacity-100"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          loading={index < 4 ? 'eager' : 'lazy'}
          priority={index < 4}
          quality={85}
          onError={handleImageError}
          unoptimized={imageSrc.startsWith('https://')}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        
        {/* Fragrance notes pyramid overlay - appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
          {product.fragranceNotes && (
            <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              {/* Top Notes */}
              {fragranceNotes.top && (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse"></div>
                  <span className="text-white text-xs font-elegant uppercase tracking-wider opacity-90">
                    {fragranceNotes.top}
                  </span>
                </div>
              )}
              {/* Heart Notes */}
              {fragranceNotes.heart && (
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <span className="text-white text-xs font-elegant uppercase tracking-wider opacity-80">
                    {fragranceNotes.heart}
                  </span>
                </div>
              )}
              {/* Base Notes */}
              {fragranceNotes.base && (
                <div className="flex items-center gap-2 ml-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  <span className="text-white text-xs font-elegant uppercase tracking-wider opacity-70">
                    {fragranceNotes.base}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Product Information - Dark Theme */}
      <div className="p-5 sm:p-6 font-elegant flex-1 flex flex-col bg-white/5">
        <div className="mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-white h-[2.5rem] overflow-hidden text-ellipsis line-clamp-1 leading-snug group-hover:text-[#d4af37] transition-colors font-luxury" title={product.name}>
            {product.name}
          </h3>
          {getArabicProductName(product.name) && (
            <p className="text-base sm:text-lg font-arabic-calligraphy text-[#d4af37] mt-1.5 leading-relaxed font-semibold" dir="rtl">
              {getArabicProductName(product.name)}
            </p>
          )}
        </div>
        <p className="text-xs text-white/50 mb-3 uppercase tracking-wide">{categoryLabels[product.category] || product.category}</p>

        {/* Fragrance Notes Pyramid - Always visible on card */}
        {product.fragranceNotes && (
          <div className="mb-4 space-y-1.5">
            {fragranceNotes.top && (
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#d4af37]"></div>
                <span className="text-white/60 text-[10px] font-elegant uppercase tracking-wider truncate">
                  {fragranceNotes.top}
                </span>
              </div>
            )}
            {fragranceNotes.heart && (
              <div className="flex items-center gap-2 ml-3">
                <div className="w-1 h-1 rounded-full bg-[#d4af37] opacity-80"></div>
                <span className="text-white/50 text-[10px] font-elegant uppercase tracking-wider truncate">
                  {fragranceNotes.heart}
                </span>
              </div>
            )}
            {fragranceNotes.base && (
              <div className="flex items-center gap-2 ml-6">
                <div className="w-1 h-1 rounded-full bg-[#d4af37] opacity-60"></div>
                <span className="text-white/40 text-[10px] font-elegant uppercase tracking-wider truncate">
                  {fragranceNotes.base}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mb-5">
          <p className="text-xl sm:text-2xl font-bold text-[#d4af37] font-luxury" dir="ltr">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(product.id);
          }}
          className="w-full bg-gradient-to-r from-[#d4af37] to-[#c9a961] hover:from-[#e5c870] hover:to-[#d4b870] text-[#0a0a0a] font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-[#d4af37]/40 mt-auto"
          aria-label={`View details of ${product.name}`}
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span>{arabicTranslations.ui["View Details"]}</span>
        </button>
      </div>
      {/* Subtle geometric pattern border bottom */}
      <div className="pattern-border-bottom opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
    </div>
  );
}
