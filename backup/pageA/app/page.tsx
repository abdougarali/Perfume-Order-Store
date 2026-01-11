"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { products } from "@/data/products";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import dynamic from "next/dynamic";
import ProductCard from "@/components/ProductCard";
import { useToast } from "@/components/ToastContainer";
import { useCart } from "@/contexts/CartContext";
import { getProductImage } from "@/lib/imageUtils";
import Image from "next/image";

// Dynamic imports for heavy components - performance optimization
const ProductDetailsModal = dynamic(() => import("@/components/ProductDetailsModal"), {
  loading: () => null,
  ssr: false
});

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), {
  loading: () => null,
  ssr: false
});

const categoryLabels: Record<string, string> = {
  'eau-de-parfum': 'Eau de Parfum',
  'eau-de-toilette': 'Eau de Toilette',
  'mens': "Men's Collection",
  'womens': "Women's Collection",
  'unisex': 'Unisex Collection',
};

export default function Home() {
  const toast = useToast();
  const { getTotalItems } = useCart();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsProductId, setSelectedDetailsProductId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Check products on load (dev only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Products loaded:', products?.length || 0);
    }
  }, []);

  const handleOpenDetailsModal = (productId: string) => {
    setSelectedDetailsProductId(productId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDetailsProductId(null);
  };

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }),
    []
  );

  const formatPrice = (price?: number) => {
    if (!price) return null;
    return priceFormatter.format(price / 1000);
  };

  // Featured products
  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  
  // Products by category
  const edpProducts = products.filter(p => p.category === 'eau-de-parfum');
  const edtProducts = products.filter(p => p.category === 'eau-de-toilette');
  const mensProducts = products.filter(p => p.category === 'mens');
  const womensProducts = products.filter(p => p.category === 'womens');
  const unisexProducts = products.filter(p => p.category === 'unisex');

  // Search logic
  const searchResults = useMemo(() => {
    if (!searchQuery || typeof searchQuery !== 'string') {
      return [];
    }
    
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return [];
    }
    
    const query = trimmedQuery.toLowerCase();
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return [];
    }
    
    const filtered = products.filter(product => {
      if (!product || !product.name) return false;
      
      const nameMatch = product.name.toLowerCase().includes(query);
      const categoryLabel = categoryLabels[product.category];
      const categoryMatch = categoryLabel ? categoryLabel.toLowerCase().includes(query) : false;
      
      return nameMatch || categoryMatch;
    });
    
    const sorted = filtered.sort((a, b) => {
      const aNameStartsWith = a.name.toLowerCase().startsWith(query);
      const bNameStartsWith = b.name.toLowerCase().startsWith(query);
      if (aNameStartsWith && !bNameStartsWith) return -1;
      if (!aNameStartsWith && bNameStartsWith) return 1;
      
      return a.name.localeCompare(b.name, 'en');
    });
    
    return sorted;
  }, [searchQuery]);

  // Calculate dropdown position
  useEffect(() => {
    if (isSearchFocused && searchQuery && searchQuery.trim()) {
      const input = searchRef.current?.querySelector('input');
      if (input) {
        const rect = input.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
      }
    } else {
      setDropdownPosition(null);
    }
  }, [isSearchFocused, searchQuery]);

  // Close search on outside click
  useEffect(() => {
    if (!isSearchFocused) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        if (!searchQuery || !searchQuery.trim()) {
          setIsSearchFocused(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchFocused, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200/50 shadow-md shadow-gray-100/20" style={{ overflow: 'visible' }}>
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5" style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-between gap-2 sm:gap-4" style={{ overflow: 'visible', position: 'relative' }}>
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-start overflow-visible relative pr-2 sm:pr-4 md:pr-6">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-gray-900 leading-tight font-luxury text-left font-bold tracking-tight bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] bg-clip-text text-transparent whitespace-nowrap">
                Luxury Perfumes
              </h1>
            </div>

            {/* Empty Space in Middle */}
            <div className="flex-1 min-w-0"></div>

            {/* Search Box & Cart Icon */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
              {/* Mobile: Search Icon */}
              <button
                onClick={() => setIsSearchFocused(true)}
                className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0"
                aria-label="Open search"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Desktop Search Box */}
              <div className="hidden sm:block flex-1 min-w-[400px] w-full max-w-[500px] md:max-w-[600px] lg:max-w-[700px]" ref={searchRef}>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      if (value.trim()) {
                        setIsSearchFocused(true);
                      }
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    aria-label="Search for perfume or category"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSearchFocused(false);
                        setSearchQuery("");
                      }
                    }}
                    placeholder="Search for perfume or category..."
                    className="w-full px-4 py-2 pl-11 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all duration-200 placeholder:text-gray-400 font-elegant"
                  />
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Search Results Dropdown */}
                {isSearchFocused && searchQuery && searchQuery.trim().length > 0 && dropdownPosition && (
                  <div 
                    className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl overflow-y-auto"
                    style={{
                      position: 'fixed',
                      zIndex: 10000,
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      width: `${dropdownPosition.width}px`,
                      maxHeight: '500px',
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {searchResults && searchResults.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-600 font-elegant">
                            Results ({searchResults.length})
                          </p>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {searchResults.map((product) => (
                            <button
                              key={product.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenDetailsModal(product.id);
                                setSearchQuery("");
                                setIsSearchFocused(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 group"
                            >
                              <div className="flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                                <Image
                                  src={getProductImage(product.image, product.category, product.name)}
                                  alt={`${product.name} - ${categoryLabels[product.category]}`}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                  quality={75}
                                  loading="lazy"
                                />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1a1a1a] font-elegant line-clamp-1">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-elegant">
                                  {categoryLabels[product.category]}
                                </p>
                                <div className="mt-1">
                                  <span className="text-sm font-bold text-[#1a1a1a]">
                                    {formatPrice(product.price)}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500 font-elegant">No results found</p>
                        <p className="text-xs text-gray-400 mt-1 font-elegant">Try searching for a product name or category</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2.5 sm:p-3 md:p-3.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0 group"
                aria-label={`Open cart${getTotalItems() > 0 ? ` (${getTotalItems()} items)` : ''}`}
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-700 group-hover:text-[#1a1a1a] transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-0 bg-[#d4af37] text-[#1a1a1a] font-bold rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center text-[11px] sm:text-xs border-2 border-white shadow-lg font-elegant leading-none transform translate-x-1/2 -translate-y-1/2">
                    {getTotalItems() > 99 ? '99+' : getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Modal */}
        {isSearchFocused && (
          <div className="sm:hidden fixed inset-0 bg-white z-[60] flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-gray-200">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchFocused(false);
                      setSearchQuery("");
                    }
                  }}
                  autoFocus
                  placeholder="Search for perfume or category..."
                  className="w-full px-4 py-3 pl-12 text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all duration-200 placeholder:text-gray-400 font-elegant"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                onClick={() => {
                  setIsSearchFocused(false);
                  setSearchQuery("");
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-elegant text-sm font-medium"
                aria-label="Close search"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  <div className="p-4">
                    <div className="mb-3 pb-2 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-600 font-elegant">
                        Search Results ({searchResults.length})
                      </p>
                    </div>
                    <div className="space-y-0 divide-y divide-gray-100">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            handleOpenDetailsModal(product.id);
                            setSearchQuery("");
                            setIsSearchFocused(false);
                          }}
                          className="w-full px-4 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-gray-900 font-elegant">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 font-elegant">
                              {categoryLabels[product.category]}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="text-base font-bold text-[#1a1a1a]">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <svg
                      className="w-16 h-16 text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-base text-gray-500 font-elegant text-center">
                      No results found
                    </p>
                    <p className="text-sm text-gray-400 font-elegant text-center mt-2">
                      Try searching for a product name or category
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <svg
                    className="w-16 h-16 text-gray-300 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-base text-gray-500 font-elegant text-center">
                    Search for perfumes
                  </p>
                  <p className="text-sm text-gray-400 font-elegant text-center mt-2">
                    Type a product name or category to search
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] max-h-[700px] overflow-hidden" aria-label="Hero Section">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a]">
          {/* Optional: Add hero image here */}
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-luxury leading-tight">
              Discover Luxury Fragrances
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 font-elegant max-w-2xl mx-auto">
              Experience the essence of French and Italian luxury with our exquisite collection of premium perfumes
            </p>
            <button
              onClick={() => {
                const featuredSection = document.getElementById('featured-products');
                featuredSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-[#d4af37] to-[#c9a961] hover:from-[#e5c870] hover:to-[#d4b870] text-[#1a1a1a] font-semibold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#d4af37]/40 font-elegant text-lg btn-gold"
              aria-label="Scroll to featured products"
            >
              Shop Collection
            </button>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <main className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20">
        <section id="featured-products" className="mb-20 sm:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-luxury mb-3 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent leading-tight pb-1">
              Bestsellers
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-elegant max-w-2xl mx-auto">
              Our most popular fragrances, loved by customers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onCardClick={handleOpenDetailsModal}
              />
            ))}
          </div>
        </section>

        {/* Eau de Parfum Section */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-luxury mb-3 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent leading-tight pb-1">
              Eau de Parfum
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-elegant max-w-2xl mx-auto">
              Intense and long-lasting fragrances for special occasions
            </p>
          </div>

          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              slidesPerGroup={1}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              loop={edpProducts.length > 4}
              watchOverflow={false}
              className="swiper-products"
              breakpoints={{
                640: {
                  slidesPerView: Math.min(2, edpProducts.length),
                  slidesPerGroup: 1,
                },
                1024: {
                  slidesPerView: Math.min(4, edpProducts.length),
                  slidesPerGroup: 1,
                },
                1280: {
                  slidesPerView: Math.min(4, edpProducts.length),
                  slidesPerGroup: 1,
                },
              }}
            >
              {edpProducts.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    index={index}
                    onCardClick={handleOpenDetailsModal}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* Eau de Toilette Section */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-luxury mb-3 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent leading-tight pb-1">
              Eau de Toilette
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-elegant max-w-2xl mx-auto">
              Light and refreshing fragrances perfect for daily wear
            </p>
          </div>

          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              slidesPerGroup={1}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              loop={edtProducts.length > 4}
              watchOverflow={false}
              className="swiper-products"
              breakpoints={{
                640: {
                  slidesPerView: Math.min(2, edtProducts.length),
                  slidesPerGroup: 1,
                },
                1024: {
                  slidesPerView: Math.min(4, edtProducts.length),
                  slidesPerGroup: 1,
                },
                1280: {
                  slidesPerView: Math.min(4, edtProducts.length),
                  slidesPerGroup: 1,
                },
              }}
            >
              {edtProducts.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    index={index}
                    onCardClick={handleOpenDetailsModal}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* Men's Collection Section */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-luxury mb-3 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent leading-tight pb-1">
              Men's Collection
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-elegant max-w-2xl mx-auto">
              Bold and confident fragrances designed for the modern gentleman
            </p>
          </div>

          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              slidesPerGroup={1}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              loop={mensProducts.length > 4}
              watchOverflow={false}
              className="swiper-products"
              breakpoints={{
                640: {
                  slidesPerView: Math.min(2, mensProducts.length),
                  slidesPerGroup: 1,
                },
                1024: {
                  slidesPerView: Math.min(4, mensProducts.length),
                  slidesPerGroup: 1,
                },
                1280: {
                  slidesPerView: Math.min(4, mensProducts.length),
                  slidesPerGroup: 1,
                },
              }}
            >
              {mensProducts.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    index={index}
                    onCardClick={handleOpenDetailsModal}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* Women's Collection Section */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-luxury mb-3 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent leading-tight pb-1">
              Women's Collection
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-elegant max-w-2xl mx-auto">
              Elegant and timeless fragrances that express femininity
            </p>
          </div>

          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              slidesPerGroup={1}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              loop={womensProducts.length > 4}
              watchOverflow={false}
              className="swiper-products"
              breakpoints={{
                640: {
                  slidesPerView: Math.min(2, womensProducts.length),
                  slidesPerGroup: 1,
                },
                1024: {
                  slidesPerView: Math.min(4, womensProducts.length),
                  slidesPerGroup: 1,
                },
                1280: {
                  slidesPerView: Math.min(4, womensProducts.length),
                  slidesPerGroup: 1,
                },
              }}
            >
              {womensProducts.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    index={index}
                    onCardClick={handleOpenDetailsModal}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* Unisex Collection Section */}
        <section className="mb-16 sm:mb-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 font-luxury mb-3 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent leading-tight pb-1">
              Unisex Collection
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-elegant max-w-2xl mx-auto">
              Versatile fragrances that transcend gender boundaries
            </p>
          </div>

          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1}
              slidesPerGroup={1}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              loop={unisexProducts.length > 4}
              watchOverflow={false}
              className="swiper-products"
              breakpoints={{
                640: {
                  slidesPerView: Math.min(2, unisexProducts.length),
                  slidesPerGroup: 1,
                },
                1024: {
                  slidesPerView: Math.min(4, unisexProducts.length),
                  slidesPerGroup: 1,
                },
                1280: {
                  slidesPerView: Math.min(4, unisexProducts.length),
                  slidesPerGroup: 1,
                },
              }}
            >
              {unisexProducts.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <ProductCard
                    product={product}
                    index={index}
                    onCardClick={handleOpenDetailsModal}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* How to Order Section */}
        <section className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl shadow-xl border border-gray-100/50 p-8 sm:p-12 mb-12 sm:mb-16 font-elegant">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center font-luxury bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent">
            How to Order Your Perfume?
          </h2>
          <p className="text-center text-gray-600 mb-10 sm:mb-12 text-sm sm:text-base max-w-2xl mx-auto">
            A simple and quick process in just 4 steps
          </p>
          <div className="max-w-6xl mx-auto pb-6 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-4 md:gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-gray-200 transition-all duration-300 w-full md:w-[240px] h-[180px] flex items-center group shadow-[0_2px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.1),0_5px_16px_rgba(0,0,0,0.08)] mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-[#1a1a1a]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    1
                  </div>
                  <p className="text-gray-800 font-bold text-sm sm:text-base leading-relaxed">
                    Browse and add perfumes to your cart
                  </p>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex justify-center items-center flex-shrink-0 mt-0">
                <svg className="w-10 h-10 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="md:hidden flex justify-center my-2">
                <svg className="w-8 h-8 text-[#1a1a1a] rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-gray-200 transition-all duration-300 w-full md:w-[240px] h-[180px] flex items-center group shadow-[0_2px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.1),0_5px_16px_rgba(0,0,0,0.08)] mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-[#1a1a1a]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    2
                  </div>
                  <p className="text-gray-800 font-bold text-sm sm:text-base leading-relaxed">
                    Open your cart and review your selection
                  </p>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex justify-center items-center flex-shrink-0 mt-0">
                <svg className="w-10 h-10 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="md:hidden flex justify-center my-2">
                <svg className="w-8 h-8 text-[#1a1a1a] rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-gray-200 transition-all duration-300 w-full md:w-[240px] h-[180px] flex items-center group shadow-[0_2px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.1),0_5px_16px_rgba(0,0,0,0.08)] mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-[#1a1a1a]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    3
                  </div>
                  <p className="text-gray-800 font-bold text-sm sm:text-base leading-relaxed">
                    Fill in your details: name, phone, and address
                  </p>
                </div>
              </div>

              {/* Arrow 3 */}
              <div className="hidden md:flex justify-center items-center flex-shrink-0 mt-0">
                <svg className="w-10 h-10 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="md:hidden flex justify-center my-2">
                <svg className="w-8 h-8 text-[#1a1a1a] rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-gray-200 transition-all duration-300 w-full md:w-[240px] h-[180px] flex items-center group shadow-[0_2px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.1),0_5px_16px_rgba(0,0,0,0.08)] mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-[#1a1a1a]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    4
                  </div>
                  <p className="text-gray-800 font-bold text-sm sm:text-base leading-relaxed">
                    Submit your order, and we'll contact you to confirm
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="bg-gradient-to-br from-white via-gray-50/40 to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 p-8 sm:p-12 mb-12 sm:mb-16 font-elegant">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-center font-luxury bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <p className="text-center text-gray-600 mb-10 sm:mb-12 text-sm sm:text-base max-w-2xl mx-auto">
            We offer you the best luxury perfume shopping experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pb-6 px-4 sm:px-6">
            {[
              { 
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ), 
                title: "Fast Delivery", 
                desc: "We deliver your order as quickly as possible" 
              },
              { 
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                title: "Premium Quality", 
                desc: "All products are of the highest quality and guaranteed" 
              },
              { 
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                title: "Competitive Prices", 
                desc: "Competitive and affordable prices for everyone" 
              },
              { 
                icon: (
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ), 
                title: "Excellent Service", 
                desc: "We're always here to help you" 
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:border-gray-300 transition-all duration-300 text-center group shadow-[0_2px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_3px_8px_rgba(0,0,0,0.1),0_5px_16px_rgba(0,0,0,0.08)] mb-3">
                <div className="flex justify-center mb-5 text-[#d4af37] group-hover:text-[#e5c870] transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1a1a1a] transition-colors font-luxury">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-elegant">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gradient-to-br from-white via-gray-50/30 to-white rounded-2xl shadow-xl border border-gray-100/50 p-8 sm:p-12 mb-12 sm:mb-16 font-elegant">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 font-luxury bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Answers to the most commonly asked questions
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-5">
            {[
              {
                question: "How can I pay for my order?",
                answer: "Payment is made cash on delivery. No need to pay in advance."
              },
              {
                question: "How long does delivery take?",
                answer: "We deliver orders within 3-7 business days depending on your location. We will contact you via phone to confirm your address."
              },
              {
                question: "Do you deliver to all areas?",
                answer: "Yes, we offer delivery service throughout the country. You can contact us via WhatsApp to inquire about your area."
              },
              {
                question: "Are all products available?",
                answer: "Yes, all displayed products are available. If an item is out of stock, we will contact you immediately via phone."
              },
              {
                question: "Can I order more than one perfume?",
                answer: "Absolutely! You can order any number of perfumes. Just select the products you want through the cart."
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c9a961] flex items-center justify-center text-[#1a1a1a] shadow-md group-hover:scale-110 transition-transform duration-300 font-bold">
                    Q{index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1a1a1a] transition-colors font-luxury">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-elegant">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        productId={selectedDetailsProductId}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 text-gray-800 py-10 sm:py-12 font-elegant">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-luxury">Luxury Perfumes</h3>
            <p className="text-gray-600 text-sm sm:text-base">Premium Fragrance Collection</p>
          </div>
          <div className="text-center border-t border-gray-300 pt-6 mt-6">
            <p className="text-sm font-elegant">
              © 2025 Luxury Perfumes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
