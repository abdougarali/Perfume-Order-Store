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
import { useScrollAnimation } from "@/lib/useScrollAnimation";
import Image from "next/image";
import { arabicTranslations } from "@/lib/translations";

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

  // Track scroll position for header animation
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Floating particles data - generate on client only to avoid hydration mismatch
  const [particles, setParticles] = useState<Array<{
    width: number;
    height: number;
    left: number;
    top: number;
    opacity: number;
    animationDelay: number;
    animationDuration: number;
  }>>([]);

  // Scroll animation refs and state
  const sectionRefs = {
    bestsellers: useRef<HTMLElement>(null),
    eveningElegance: useRef<HTMLElement>(null),
    morningFresh: useRef<HTMLElement>(null),
    mysteriousNights: useRef<HTMLElement>(null),
    feminineGrace: useRef<HTMLElement>(null),
  };

  const [sectionVisible, setSectionVisible] = useState({
    bestsellers: false,
    eveningElegance: false,
    morningFresh: false,
    mysteriousNights: false,
    feminineGrace: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate particles only on client side
  useEffect(() => {
    setParticles(
      Array.from({ length: 12 }, () => ({
        width: Math.random() * 300 + 50,
        height: Math.random() * 300 + 50,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.3 + 0.1,
        animationDelay: Math.random() * 5,
        animationDuration: Math.random() * 10 + 15,
      }))
    );
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = Object.keys(sectionRefs).find(
              (key) => sectionRefs[key as keyof typeof sectionRefs].current === entry.target
            );
            if (sectionId) {
              setSectionVisible((prev) => ({
                ...prev,
                [sectionId]: true,
              }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      Object.values(sectionRefs).forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Floating Minimal Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg' 
            : 'bg-transparent'
        }`}
        style={{ overflow: 'visible' }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-5" style={{ overflow: 'visible' }}>
          <div className="flex items-center justify-between gap-4 sm:gap-6" style={{ overflow: 'visible', position: 'relative' }}>
            {/* Logo - Centered */}
            <div className="flex-shrink-0 flex-1 flex justify-center">
              <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-luxury font-bold tracking-[0.1em] transition-colors duration-500 ${
                isScrolled ? 'text-white' : 'text-white'
              }`}>
                Luxury Perfumes
              </h1>
            </div>

            {/* Search & Cart - Right Side */}
            <div className="flex items-center justify-end gap-3 sm:gap-4 flex-shrink-0">
              {/* Mobile: Search Icon */}
              <button
                onClick={() => setIsSearchFocused(true)}
                className={`md:hidden p-2 rounded-full transition-all duration-300 hover:bg-white/10 active:scale-95 flex-shrink-0 ${
                  isScrolled ? 'text-white' : 'text-white/90'
                }`}
                aria-label="Open search"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Desktop Search Box */}
              <div className="hidden md:block relative" ref={searchRef}>
                <div className="relative w-full">
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
                      onFocus={() => {
                        setIsSearchFocused(true);
                      }}
                      aria-label="Search for perfume or category"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsSearchFocused(false);
                          setSearchQuery("");
                        }
                      }}
                      placeholder={arabicTranslations.ui["Search for perfume or category..."]}
                      dir="rtl"
                      className="w-64 lg:w-80 xl:w-96 pl-10 pr-4 py-2.5 md:py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all duration-300 placeholder:text-white/50 text-white font-elegant"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  {/* Search Results Dropdown */}
                  {(() => {
                    const shouldShow = Boolean(isSearchFocused && searchQuery && searchQuery.trim().length > 0);
                    
                    if (!shouldShow || !dropdownPosition) {
                      return null;
                    }
                    
                    return (
                      <div 
                        className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-y-auto"
                        style={{
                          position: 'fixed',
                          zIndex: 10000,
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          width: `${dropdownPosition.width}px`,
                          maxHeight: '500px',
                          display: 'block',
                          visibility: 'visible',
                          opacity: 1
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        {searchResults && searchResults.length > 0 ? (
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-white/10">
                            <p className="text-xs font-semibold text-white/70 font-elegant">
                              Results ({searchResults.length})
                            </p>
                          </div>
                          <div className="divide-y divide-white/10">
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
                                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors duration-150 flex items-center gap-3 group"
                              >
                                <div className="flex-shrink-0 w-16 h-16 relative rounded-md overflow-hidden border border-white/20 bg-white/5">
                                  <Image
                                    src={getProductImage(product.image, product.category, product.name)}
                                    alt={`${product.name}`}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                    quality={75}
                                    loading="lazy"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white group-hover:text-[#d4af37] font-elegant line-clamp-1">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-white/50 mt-1 font-elegant">
                                    {categoryLabels[product.category]}
                                  </p>
                                  <div className="mt-1">
                                    <span className="text-sm font-bold text-[#d4af37]">
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
                          <p className="text-sm text-white/70 font-elegant">No results</p>
                          <p className="text-xs text-white/50 mt-1 font-elegant">Try searching for a product name or category</p>
                        </div>
                      )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Cart Icon - Elegant */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className={`relative p-2.5 sm:p-3 md:p-3.5 rounded-full transition-all duration-300 hover:bg-white/10 hover:scale-110 active:scale-95 flex-shrink-0 group ${
                  isScrolled ? 'text-white' : 'text-white/90'
                }`}
                aria-label={`Open cart${getTotalItems() > 0 ? ` (${getTotalItems()} items)` : ''}`}
              >
                <svg
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 right-0 bg-[#d4af37] text-[#0a0a0a] font-bold rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center text-[10px] sm:text-xs border-2 border-black/20 shadow-lg font-elegant leading-none transform translate-x-1/2 -translate-y-1/2">
                    {getTotalItems() > 99 ? '99+' : getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Modal */}
        {isSearchFocused && (
          <div className="md:hidden fixed inset-0 bg-black/95 backdrop-blur-xl z-[60] flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
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
                  placeholder={arabicTranslations.ui["Search for perfume or category..."]}
                  dir="rtl"
                  className="w-full px-4 py-3 pr-12 text-base bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all duration-200 placeholder:text-white/50 text-white font-elegant"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60"
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
                className="px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-elegant text-sm font-medium"
                aria-label="Close search"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  <div className="p-4">
                    <div className="mb-3 pb-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-white/70 font-elegant">
                        Search Results ({searchResults.length})
                      </p>
                    </div>
                    <div className="space-y-0 divide-y divide-white/10">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            handleOpenDetailsModal(product.id);
                            setSearchQuery("");
                            setIsSearchFocused(false);
                          }}
                          className="w-full px-4 py-4 text-left hover:bg-white/10 active:bg-white/20 transition-colors duration-150 flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-white font-elegant">
                              {product.name}
                            </p>
                            <p className="text-sm text-white/60 mt-1 font-elegant">
                              {categoryLabels[product.category]}
                            </p>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <span className="text-base font-bold text-[#d4af37]">
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
                      className="w-16 h-16 text-white/30 mb-4"
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
                    <p className="text-base text-white/70 font-elegant text-center">
                      No results found
                    </p>
                    <p className="text-sm text-white/50 font-elegant text-center mt-2">
                      Try searching for a product name or category
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <svg
                    className="w-16 h-16 text-white/30 mb-4"
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
                  <p className="text-base text-white/70 font-elegant text-center">
                    Search for perfumes
                  </p>
                  <p className="text-sm text-white/50 font-elegant text-center mt-2">
                    Type a product name or category to search
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Full-Screen Hero Section with Fragrance Note Visualization */}
      <section className="relative h-screen min-h-[100vh] overflow-hidden" aria-label="Hero Section">
        {/* Dark atmospheric background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0f0f0f]">
          {/* Animated fragrance particles/smoke effect */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating fragrance note elements - rendered only on client to avoid hydration mismatch */}
            {particles.map((particle, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-20 animate-float"
                style={{
                  width: `${particle.width}px`,
                  height: `${particle.height}px`,
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  background: `radial-gradient(circle, rgba(212, 175, 55, ${particle.opacity}) 0%, transparent 70%)`,
                  animationDelay: `${particle.animationDelay}s`,
                  animationDuration: `${particle.animationDuration}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Hero Content */}
        <div className="relative h-full flex items-start sm:items-center justify-center text-center px-4 pt-16 sm:pt-0">
          <div className="max-w-5xl mx-auto">
            {/* Arabic Primary Heading - Hero */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-arabic-calligraphy font-bold text-[#d4af37] mb-3 leading-[1.2] tracking-tight animate-fade-in" dir="rtl">
              {arabicTranslations.hero["Discover Your"]} {arabicTranslations.hero["Signature Scent"]}
            </h1>
            {/* English Secondary Heading */}
            <p className="text-2xl sm:text-3xl md:text-4xl font-luxury text-white/80 mb-6 font-semibold leading-relaxed animate-fade-in-delay">
              Discover Your <span className="bg-gradient-to-r from-[#d4af37] via-[#c9a961] to-[#d4af37] bg-clip-text text-transparent">Signature Scent</span>
            </p>
            
            {/* Subheading */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-12 font-elegant max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Experience the essence of luxury with our curated collection of exquisite fragrances
            </p>
            
            {/* Fragrance notes visualization hint */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 mb-12 animate-fade-in-delay-2">
              <div className="flex items-center gap-2 text-white/60">
                <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></div>
                <span className="text-sm font-elegant uppercase tracking-wider">Top Notes</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-2 text-white/60">
                <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span className="text-sm font-elegant uppercase tracking-wider">Heart Notes</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-2 text-white/60">
                <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="text-sm font-elegant uppercase tracking-wider">Base Notes</span>
              </div>
            </div>
            
            {/* CTA - Subtle, elegant */}
            <button
              onClick={() => {
                const featuredSection = document.getElementById('discover');
                featuredSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative inline-flex items-center gap-3 text-white font-elegant text-sm sm:text-base uppercase tracking-[0.2em] hover:text-[#d4af37] transition-all duration-500 animate-fade-in-delay-3 mb-0 sm:mb-0"
              aria-label="Discover fragrances"
            >
              <span>Explore Collection</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-y-1 transition-transform duration-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-[#d4af37] to-transparent"></div>
        </div>
      </section>

      {/* Decorative Golden Horizontal Line - Mobile Only (Between sections) */}
      <div className="sm:hidden flex justify-center items-center py-8">
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60"></div>
      </div>

      {/* Discover Section */}
      <main id="discover" className="bg-[#0a0a0a]">
        {/* Bestsellers Section */}
        <section ref={sectionRefs.bestsellers} className={`container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 transition-all duration-1000 ${sectionVisible.bestsellers ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-luxury mb-3 leading-tight tracking-tight">
              Timeless Classics
            </h2>
            <p className="text-2xl sm:text-3xl md:text-4xl font-arabic-calligraphy text-[#d4af37] mb-3 font-bold leading-relaxed" dir="rtl">
              {arabicTranslations.sections["Timeless Classics"]}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-arabic-calligraphy text-white/90 mb-2 max-w-3xl mx-auto leading-relaxed font-semibold" dir="rtl">
              {arabicTranslations.descriptions["Our most beloved fragrances, crafted for those who appreciate enduring elegance"]}
            </p>
            <p className="text-white/60 text-sm sm:text-base font-elegant max-w-2xl mx-auto italic">
              Our most beloved fragrances, crafted for those who appreciate enduring elegance
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

        {/* Evening Elegance Section - Mood-based */}
        <section ref={sectionRefs.eveningElegance} className={`mb-16 sm:mb-20 pt-16 sm:pt-20 border-t border-white/10 transition-all duration-1000 ${sectionVisible.eveningElegance ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative mb-12 sm:mb-16">
            {/* Atmospheric background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a1a] via-[#2a0a1a] to-[#1a0a1a] rounded-3xl opacity-50"></div>
            
            <div className="relative text-center py-12 sm:py-16 px-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-luxury mb-3 leading-tight">
                Evening Elegance
              </h2>
              <p className="text-2xl sm:text-3xl md:text-4xl font-arabic-calligraphy text-[#d4af37] mb-3 font-bold leading-relaxed" dir="rtl">
                {arabicTranslations.sections["Evening Elegance"]}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-arabic-calligraphy text-white/90 mb-2 max-w-3xl mx-auto leading-relaxed font-semibold" dir="rtl">
                {arabicTranslations.descriptions["Dark, sophisticated scents for those special moments that demand presence"]}
              </p>
              <p className="text-white/60 text-sm sm:text-base font-elegant max-w-2xl mx-auto italic">
                Dark, sophisticated scents for those special moments that demand presence
              </p>
            </div>
          </div>

          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1.3}
              centeredSlides={true}
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

        {/* Morning Fresh Section - Mood-based */}
        <section ref={sectionRefs.morningFresh} className={`mb-16 sm:mb-20 pt-16 sm:pt-20 border-t border-white/10 transition-all duration-1000 ${sectionVisible.morningFresh ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative mb-12 sm:mb-16">
            {/* Atmospheric background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1a1a] via-[#1a2a1a] to-[#0a1a1a] rounded-3xl opacity-50"></div>
            
            <div className="relative text-center py-12 sm:py-16 px-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-luxury mb-3 leading-tight">
                Morning Fresh
              </h2>
              <p className="text-2xl sm:text-3xl md:text-4xl font-arabic-calligraphy text-[#d4af37] mb-3 font-bold leading-relaxed" dir="rtl">
                {arabicTranslations.sections["Morning Fresh"]}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-arabic-calligraphy text-white/90 mb-2 max-w-3xl mx-auto leading-relaxed font-semibold" dir="rtl">
                {arabicTranslations.descriptions["Light and energizing fragrances that awaken your senses and start your day with vitality"]}
              </p>
              <p className="text-white/60 text-sm sm:text-base font-elegant max-w-2xl mx-auto italic">
                Light and energizing fragrances that awaken your senses and start your day with vitality
              </p>
            </div>
          </div>

          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1.3}
              centeredSlides={true}
              slidesPerGroup={1}
              initialSlide={0}
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

        {/* Mysterious Nights Section - Mood-based */}
        <section ref={sectionRefs.mysteriousNights} className={`mb-16 sm:mb-20 pt-16 sm:pt-20 border-t border-white/10 transition-all duration-1000 ${sectionVisible.mysteriousNights ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative mb-12 sm:mb-16">
            {/* Atmospheric background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2a1a0a] via-[#3a2a1a] to-[#2a1a0a] rounded-3xl opacity-50"></div>
            
            <div className="relative text-center py-12 sm:py-16 px-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-luxury mb-3 leading-tight">
                Mysterious Nights
              </h2>
              <p className="text-2xl sm:text-3xl md:text-4xl font-arabic-calligraphy text-[#d4af37] mb-3 font-bold leading-relaxed" dir="rtl">
                {arabicTranslations.sections["Mysterious Nights"]}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-arabic-calligraphy text-white/90 mb-2 max-w-3xl mx-auto leading-relaxed font-semibold" dir="rtl">
                {arabicTranslations.descriptions["Oriental and intense scents that capture the allure of the evening"]}
              </p>
              <p className="text-white/60 text-sm sm:text-base font-elegant max-w-2xl mx-auto italic">
                Oriental and intense scents that capture the allure of the evening
              </p>
            </div>
          </div>
          
          {/* Combined products from mens and unisex for this mood */}
          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1.3}
              centeredSlides={true}
              slidesPerGroup={1}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true,
              }}
              loop={(mensProducts.length + unisexProducts.length) > 4}
              watchOverflow={false}
              className="swiper-products"
              breakpoints={{
                640: {
                  slidesPerView: Math.min(2, mensProducts.length + unisexProducts.length),
                  slidesPerGroup: 1,
                },
                1024: {
                  slidesPerView: Math.min(4, mensProducts.length + unisexProducts.length),
                  slidesPerGroup: 1,
                },
                1280: {
                  slidesPerView: Math.min(4, mensProducts.length + unisexProducts.length),
                  slidesPerGroup: 1,
                },
              }}
            >
              {[...mensProducts, ...unisexProducts].map((product, index) => (
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

        {/* Feminine Grace Section - Mood-based */}
        <section ref={sectionRefs.feminineGrace} className={`mb-16 sm:mb-20 pt-16 sm:pt-20 border-t border-white/10 transition-all duration-1000 ${sectionVisible.feminineGrace ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative mb-12 sm:mb-16">
            {/* Atmospheric background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2a1a2a] via-[#3a2a3a] to-[#2a1a2a] rounded-3xl opacity-50"></div>
            
            <div className="relative text-center py-12 sm:py-16 px-4">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white font-luxury mb-3 leading-tight">
                Feminine Grace
              </h2>
              <p className="text-2xl sm:text-3xl md:text-4xl font-arabic-calligraphy text-[#d4af37] mb-3 font-bold leading-relaxed" dir="rtl">
                {arabicTranslations.sections["Feminine Grace"]}
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-arabic-calligraphy text-white/90 mb-2 max-w-3xl mx-auto leading-relaxed font-semibold" dir="rtl">
                {arabicTranslations.descriptions["Elegant and timeless fragrances that express the essence of femininity"]}
              </p>
              <p className="text-white/60 text-sm sm:text-base font-elegant max-w-2xl mx-auto italic">
                Elegant and timeless fragrances that express the essence of femininity
              </p>
            </div>
          </div>
          
          {/* Women's products */}
          <div className="mb-16 sm:mb-20 relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={24}
              slidesPerView={1.3}
              centeredSlides={true}
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

        {/* How to Choose Section - Perfume-focused */}
        <section className="container mx-auto px-4 sm:px-6 mb-12 sm:mb-16 pt-16 sm:pt-20 border-t border-white/10">
          <div className="relative bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 sm:p-12 font-elegant">
            <div className="text-center mb-10 sm:mb-12" dir="rtl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-arabic-calligraphy font-bold text-[#d4af37] mb-4 leading-relaxed">
                {arabicTranslations.howToChoose["How to Choose Your Signature Scent?"]}
              </h2>
              <p className="text-white/90 text-lg sm:text-xl font-arabic-calligraphy mb-2 max-w-3xl mx-auto leading-relaxed font-semibold">
                {arabicTranslations.howToChoose["Discover the art of selecting the perfect fragrance for you"]}
              </p>
            </div>
            <div className="max-w-6xl mx-auto pb-6 px-4 sm:px-6" dir="rtl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-4 md:gap-6">
              {/* Step 1 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 sm:p-6 hover:border-[#d4af37]/50 hover:bg-white/15 transition-all duration-300 w-full md:w-[240px] min-h-[200px] flex items-center group mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#c9a961] rounded-2xl flex items-center justify-center text-[#0a0a0a] font-bold text-xl mb-3 shadow-lg shadow-[#d4af37]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    1
                  </div>
                  <p className="text-white font-bold text-base sm:text-lg font-arabic-calligraphy leading-relaxed">
                    {arabicTranslations.howToChoose["Explore our curated collections"]}
                  </p>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex justify-center items-center flex-shrink-0 mt-0">
                <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="md:hidden flex justify-center items-center w-full my-2">
                <svg className="w-8 h-8 text-[#d4af37] -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 sm:p-6 hover:border-[#d4af37]/50 hover:bg-white/15 transition-all duration-300 w-full md:w-[240px] h-[180px] flex items-center group mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#c9a961] rounded-2xl flex items-center justify-center text-[#0a0a0a] font-bold text-xl mb-3 shadow-lg shadow-[#d4af37]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    2
                  </div>
                  <p className="text-white font-bold text-base sm:text-lg font-arabic-calligraphy leading-relaxed">
                    {arabicTranslations.howToChoose["Discover fragrance notes that resonate with you"]}
                  </p>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex justify-center items-center flex-shrink-0 mt-0">
                <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="md:hidden flex justify-center items-center w-full my-2">
                <svg className="w-8 h-8 text-[#d4af37] -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 sm:p-6 hover:border-[#d4af37]/50 hover:bg-white/15 transition-all duration-300 w-full md:w-[240px] h-[180px] flex items-center group mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#c9a961] rounded-2xl flex items-center justify-center text-[#0a0a0a] font-bold text-xl mb-4 shadow-lg shadow-[#d4af37]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    3
                  </div>
                  <p className="text-white font-bold text-base sm:text-lg font-arabic-calligraphy leading-relaxed">
                    {arabicTranslations.howToChoose["Add to your fragrance wardrobe"]}
                  </p>
                </div>
              </div>

              {/* Arrow 3 */}
              <div className="hidden md:flex justify-center items-center flex-shrink-0 mt-0">
                <svg className="w-10 h-10 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div className="md:hidden flex justify-center items-center w-full my-2">
                <svg className="w-8 h-8 text-[#d4af37] -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-5 sm:p-6 hover:border-[#d4af37]/50 hover:bg-white/15 transition-all duration-300 w-full md:w-[240px] h-[180px] flex items-center group mb-3">
                <div className="flex flex-col items-center text-center w-full">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] to-[#c9a961] rounded-2xl flex items-center justify-center text-[#0a0a0a] font-bold text-xl mb-3 shadow-lg shadow-[#d4af37]/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    4
                  </div>
                  <p className="text-white font-bold text-base sm:text-lg font-arabic-calligraphy leading-relaxed">
                    {arabicTranslations.howToChoose["Complete your order and await delivery"]}
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 sm:px-6 mb-12 sm:mb-16 pt-16 sm:pt-20 border-t border-white/10 font-elegant">
          <div className="relative bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 sm:p-12">
            <div className="text-center mb-10 sm:mb-12" dir="rtl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-arabic-calligraphy font-bold text-[#d4af37] mb-4 leading-relaxed">
                {arabicTranslations.whyChooseUs["Why Choose Us?"]}
              </h2>
              <p className="text-white/90 text-lg sm:text-xl font-arabic-calligraphy mb-2 max-w-3xl mx-auto leading-relaxed font-semibold">
                {arabicTranslations.whyChooseUs["We offer you the best luxury perfume shopping experience"]}
              </p>
            </div>
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
              <div key={feature.title} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sm:p-8 hover:border-[#d4af37]/50 hover:bg-white/15 transition-all duration-300 text-center group mb-3">
                <div className="flex justify-center mb-5 text-[#d4af37] group-hover:text-[#e5c870] transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors font-arabic-calligraphy">
                  {arabicTranslations.whyChooseUs[feature.title as keyof typeof arabicTranslations.whyChooseUs]}
                </h3>
                <p className="text-base sm:text-lg text-white/90 leading-relaxed font-arabic-calligraphy font-semibold">
                  {arabicTranslations.whyChooseUs[feature.desc as keyof typeof arabicTranslations.whyChooseUs]}
                </p>
              </div>
            ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 sm:px-6 mb-12 sm:mb-16 pt-16 sm:pt-20 border-t border-white/10 font-elegant">
          <div className="relative bg-gradient-to-br from-white/5 via-white/5 to-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 sm:p-12">
            <div className="text-center mb-10 sm:mb-12" dir="rtl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-arabic-calligraphy font-bold text-[#d4af37] mb-4 leading-relaxed">
                {arabicTranslations.faq["Frequently Asked Questions"]}
              </h2>
              <p className="text-white/90 text-lg sm:text-xl font-arabic-calligraphy mb-2 max-w-3xl mx-auto leading-relaxed font-semibold">
                {arabicTranslations.faq["Answers to the most commonly asked questions"]}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-5" dir="rtl">
              {[
                {
                  question: "How can I pay for my order?",
                  answer: "Payment is made cash on delivery. No need to pay in advance.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )
                },
                {
                  question: "How long does delivery take?",
                  answer: "We deliver orders within 3-7 business days depending on your location. We will contact you via phone to confirm your address.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                {
                  question: "Do you deliver to all areas?",
                  answer: "Yes, we offer delivery service throughout the country. You can contact us via WhatsApp to inquire about your area.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )
                },
                {
                  question: "Are all products available?",
                  answer: "Yes, all displayed products are available. If an item is out of stock, we will contact you immediately via phone.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  question: "Can I order more than one perfume?",
                  answer: "Absolutely! You can order any number of perfumes. Just select the products you want through the cart.",
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20 hover:border-[#d4af37]/50 hover:bg-white/15 transition-all duration-300 group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#c9a961] flex items-center justify-center text-[#0a0a0a] shadow-md group-hover:scale-110 transition-transform duration-300">
                      {faq.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors font-arabic-calligraphy">
                        {arabicTranslations.faq[faq.question as keyof typeof arabicTranslations.faq]}
                      </h3>
                      <p className="text-white/90 text-base sm:text-lg leading-relaxed font-arabic-calligraphy font-semibold">
                        {arabicTranslations.faq[faq.answer as keyof typeof arabicTranslations.faq]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Footer - Minimal & Elegant */}
      <footer className="bg-[#0a0a0a] border-t border-white/10 text-white/60 py-10 sm:py-12 font-elegant">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 font-luxury tracking-wider">Luxury Perfumes</h3>
            <p className="text-white/50 text-sm sm:text-base">Premium Fragrance Collection</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
            <a href="#discover" className="text-white/60 hover:text-white text-sm uppercase tracking-wider transition-colors">Discover</a>
            <span className="hidden sm:inline text-white/30">•</span>
            <a href="#collections" className="text-white/60 hover:text-white text-sm uppercase tracking-wider transition-colors">Collections</a>
          </div>
          <div className="text-center border-t border-white/10 pt-6 mt-6">
            <p className="text-sm font-elegant text-white/40">
              © 2025 Luxury Perfumes. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
