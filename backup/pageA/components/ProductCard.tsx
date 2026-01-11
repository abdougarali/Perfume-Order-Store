'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/data/products';
import { getProductImage } from '@/lib/imageUtils';

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
  // Use local image directly, with fallback to Unsplash on error
  const [imageSrc, setImageSrc] = useState(() => {
    return getProductImage(product.image, product.category, product.name);
  });
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset image when product changes
    setImageSrc(getProductImage(product.image, product.category, product.name));
    setImageError(false);
  }, [product.id, product.image, product.category, product.name]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price / 1000);
  };

  const handleImageError = () => {
    if (!imageError) {
      setImageError(true);
      // On error, use Unsplash as fallback
      const fallbackImage = getProductImage('', product.category, product.name);
      setImageSrc(fallbackImage);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col group relative cursor-pointer card-luxury"
      onClick={() => onCardClick(product.id)}
    >
      {/* Bestseller Badge */}
      {product.featured && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-[#d4af37] to-[#c9a961] text-[#1a1a1a] text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-[#d4af37]/30 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>Bestseller</span>
        </div>
      )}

      {/* Product Image - Luxury Design */}
      <div className="w-full h-80 relative bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden">
        {/* Placeholder while loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        
        <Image
          src={imageSrc}
          alt={`${product.name} - ${categoryLabels[product.category] || product.category}`}
          fill
          className="object-cover group-hover:scale-105 transition-all duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          loading={index < 4 ? 'eager' : 'lazy'}
          priority={index < 4}
          quality={85}
          onError={handleImageError}
          unoptimized={imageSrc.startsWith('https://')}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Product Information */}
      <div className="p-5 sm:p-6 font-elegant flex-1 flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 h-[3.5rem] overflow-hidden text-ellipsis line-clamp-2 leading-snug group-hover:text-[#1a1a1a] transition-colors font-luxury" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{categoryLabels[product.category] || product.category}</p>

        {/* Price */}
        <div className="mb-5">
          <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(product.id);
          }}
          className="w-full bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] hover:from-[#2d2d2d] hover:to-[#1a1a1a] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-[#1a1a1a]/30 mt-auto btn-luxury"
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
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
}
