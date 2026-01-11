/**
 * Product data for luxury perfume brand
 * Can be updated as needed
 */
export interface Product {
  id: string;
  name: string;
  category: 'eau-de-parfum' | 'eau-de-toilette' | 'mens' | 'womens' | 'unisex';
  description?: string;
  fragranceNotes?: string; // "Top: Bergamot, Middle: Rose, Base: Sandalwood"
  price: number; // Price in millimes/cents (e.g., 120000 = 120 TND/USD)
  image: string; // Product image path
  images?: string[]; // Additional images
  volumes?: string[]; // Available volumes ["50ml", "100ml", "200ml"]
  featured?: boolean; // For bestsellers
}

/**
 * Product list
 * - Eau de Parfum: 8 products
 * - Eau de Toilette: 6 products
 * - Men's Collection: 8 products
 * - Women's Collection: 8 products
 * - Unisex: 6 products
 */
export const products: Product[] = [
  // Eau de Parfum (EDP) - 8 products
  {
    id: "edp-1",
    name: "Elegant Noir Eau de Parfum",
    category: "eau-de-parfum",
    description: "A sophisticated blend of dark, mysterious notes perfect for evening wear",
    fragranceNotes: "Top: Bergamot, Black Pepper | Middle: Rose, Jasmine | Base: Sandalwood, Vanilla, Amber",
    price: 120000, // 120 TND/USD
    image: "/images/perfumes/eau-de-parfum/EDP(1).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "edp-2",
    name: "Royal Essence Eau de Parfum",
    category: "eau-de-parfum",
    description: "Luxurious and opulent, with rich oriental notes",
    fragranceNotes: "Top: Saffron, Cardamom | Middle: Rose, Oud | Base: Patchouli, Musk, Amber",
    price: 135000,
    image: "/images/perfumes/eau-de-parfum/EDP(2).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "edp-3",
    name: "Velvet Rose Eau de Parfum",
    category: "eau-de-parfum",
    description: "A romantic fragrance with velvety rose and soft powdery notes",
    fragranceNotes: "Top: Pink Pepper, Freesia | Middle: Rose, Peony | Base: Vanilla, White Musk, Sandalwood",
    price: 125000,
    image: "/images/perfumes/eau-de-parfum/EDP(3).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: true
  },
  {
    id: "edp-4",
    name: "Midnight Bloom Eau de Parfum",
    category: "eau-de-parfum",
    description: "Enigmatic and alluring, perfect for special occasions",
    fragranceNotes: "Top: Black Currant, Fig | Middle: Tuberose, Ylang-Ylang | Base: Tonka Bean, Labdanum",
    price: 130000,
    image: "/images/perfumes/eau-de-parfum/EDP(4).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },
  {
    id: "edp-5",
    name: "Golden Hour Eau de Parfum",
    category: "eau-de-parfum",
    description: "Warm and radiant, capturing the essence of golden sunlight",
    fragranceNotes: "Top: Mandarin, Neroli | Middle: Orange Blossom, Honey | Base: Vanilla, Benzoin, Vetiver",
    price: 128000,
    image: "/images/perfumes/eau-de-parfum/EDP(5).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: true
  },
  {
    id: "edp-6",
    name: "Sensual Orchid Eau de Parfum",
    category: "eau-de-parfum",
    description: "Exotic and sensual, with rare orchid and oriental spices",
    fragranceNotes: "Top: Ginger, Pink Grapefruit | Middle: Orchid, Jasmine | Base: Amber, Incense, White Musk",
    price: 132000,
    image: "/images/perfumes/eau-de-parfum/EDP(6).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },
  {
    id: "edp-7",
    name: "Ivory Garden Eau de Parfum",
    category: "eau-de-parfum",
    description: "Fresh and elegant, like a stroll through a pristine garden",
    fragranceNotes: "Top: Lemon, Green Tea | Middle: Lily of the Valley, White Flowers | Base: Cedarwood, Musk",
    price: 118000,
    image: "/images/perfumes/eau-de-parfum/EDP(8).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: false
  },
  {
    id: "edp-8",
    name: "Dark Obsession Eau de Parfum",
    category: "eau-de-parfum",
    description: "Bold and intense, for those who dare to stand out",
    fragranceNotes: "Top: Blackberry, Saffron | Middle: Rose, Oud | Base: Leather, Patchouli, Amber",
    price: 140000,
    image: "/images/perfumes/eau-de-parfum/EDP(9).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },

  // Eau de Toilette (EDT) - 6 products
  {
    id: "edt-1",
    name: "Fresh Morning Eau de Toilette",
    category: "eau-de-toilette",
    description: "A light, refreshing fragrance ideal for daily wear",
    fragranceNotes: "Top: Lemon, Grapefruit | Middle: Lavender, Mint | Base: Musk, Cedarwood",
    price: 85000, // 85 TND/USD
    image: "/images/perfumes/eau-de-toilette/EDT(1).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: true
  },
  {
    id: "edt-2",
    name: "Ocean Breeze Eau de Toilette",
    category: "eau-de-toilette",
    description: "Crisp and invigorating, like a fresh ocean breeze",
    fragranceNotes: "Top: Sea Salt, Citrus | Middle: Aquatic Notes, Seaweed | Base: Driftwood, Musk",
    price: 90000,
    image: "/images/perfumes/eau-de-toilette/EDT(2).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: true
  },
  {
    id: "edt-3",
    name: "Spring Meadow Eau de Toilette",
    category: "eau-de-toilette",
    description: "Light and airy, perfect for spring and summer",
    fragranceNotes: "Top: Green Apple, Bergamot | Middle: Lily, Jasmine | Base: White Musk, Soft Woods",
    price: 88000,
    image: "/images/perfumes/eau-de-toilette/EDT(3).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: false
  },
  {
    id: "edt-4",
    name: "Citrus Splash Eau de Toilette",
    category: "eau-de-toilette",
    description: "Energizing citrus blend for an active lifestyle",
    fragranceNotes: "Top: Orange, Lemon, Bergamot | Middle: Neroli, Jasmine | Base: Vetiver, White Musk",
    price: 82000,
    image: "/images/perfumes/eau-de-toilette/EDT(4).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },
  {
    id: "edt-5",
    name: "Pure Linen Eau de Toilette",
    category: "eau-de-toilette",
    description: "Clean and sophisticated, like fresh white linen",
    fragranceNotes: "Top: Aldehydes, Green Notes | Middle: Iris, Lily | Base: Clean Musk, Soft Woods",
    price: 92000,
    image: "/images/perfumes/eau-de-toilette/EDT(5).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: true
  },
  {
    id: "edt-6",
    name: "Misty Garden Eau de Toilette",
    category: "eau-de-toilette",
    description: "Delicate and ethereal, with dewy florals",
    fragranceNotes: "Top: Dewy Greens, Violet | Middle: Peony, Rose | Base: Soft Woods, White Musk",
    price: 87000,
    image: "/images/perfumes/eau-de-toilette/EDT(6).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },

  // Men's Collection - 8 products
  {
    id: "mens-1",
    name: "Masculine Essence",
    category: "mens",
    description: "Bold and confident, designed for the modern gentleman",
    fragranceNotes: "Top: Citrus, Spice | Middle: Leather, Tobacco | Base: Oakmoss, Patchouli",
    price: 130000, // 130 TND/USD
    image: "/images/perfumes/mens/Men(1).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "mens-2",
    name: "Power & Strength",
    category: "mens",
    description: "Strong and assertive, with woody and leathery notes",
    fragranceNotes: "Top: Bergamot, Pink Pepper | Middle: Cedarwood, Leather | Base: Amber, Patchouli, Vetiver",
    price: 135000,
    image: "/images/perfumes/mens/Men(2).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "mens-3",
    name: "Urban Legend",
    category: "mens",
    description: "Modern and sophisticated, perfect for city life",
    fragranceNotes: "Top: Grapefruit, Sage | Middle: Juniper, Coriander | Base: Sandalwood, Amberwood",
    price: 128000,
    image: "/images/perfumes/mens/Men(3).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: false
  },
  {
    id: "mens-4",
    name: "Executive Class",
    category: "mens",
    description: "Professional and refined, ideal for business settings",
    fragranceNotes: "Top: Lemon, Lavender | Middle: Geranium, Nutmeg | Base: Tonka Bean, Sandalwood",
    price: 132000,
    image: "/images/perfumes/mens/Men(4).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "mens-5",
    name: "Adventure Awaits",
    category: "mens",
    description: "Bold and adventurous, with fresh and spicy notes",
    fragranceNotes: "Top: Black Pepper, Cardamom | Middle: Clary Sage, Cumin | Base: Leather, Cedar, Musk",
    price: 126000,
    image: "/images/perfumes/mens/Men(5).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },
  {
    id: "mens-6",
    name: "Night Vision",
    category: "mens",
    description: "Mysterious and seductive, perfect for evening occasions",
    fragranceNotes: "Top: Whiskey, Clary Sage | Middle: Oud, Tobacco | Base: Leather, Patchouli, Vanilla",
    price: 140000,
    image: "/images/perfumes/mens/Men(6).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "mens-7",
    name: "Blue Ocean",
    category: "mens",
    description: "Fresh and aquatic, like a deep ocean current",
    fragranceNotes: "Top: Marine Notes, Bergamot | Middle: Lavender, Jasmine | Base: Amber, Musk, Cedarwood",
    price: 118000,
    image: "/images/perfumes/mens/Men(7).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: false
  },
  {
    id: "mens-8",
    name: "Royal Crown",
    category: "mens",
    description: "Regal and luxurious, with opulent oriental notes",
    fragranceNotes: "Top: Saffron, Nutmeg | Middle: Oud, Rose | Base: Amber, Patchouli, Vanilla",
    price: 145000,
    image: "/images/perfumes/mens/Men(8).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },

  // Women's Collection - 8 products
  {
    id: "womens-1",
    name: "Feminine Grace",
    category: "womens",
    description: "Elegant and timeless, a perfect expression of femininity",
    fragranceNotes: "Top: Pear, Freesia | Middle: Peony, Rose | Base: Vanilla, White Musk",
    price: 125000, // 125 TND/USD
    image: "/images/perfumes/womens/womens(1).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "womens-2",
    name: "Radiant Beauty",
    category: "womens",
    description: "Bright and luminous, with sparkling floral notes",
    fragranceNotes: "Top: Bergamot, Pink Pepper | Middle: Jasmine, Rose | Base: Sandalwood, Vanilla",
    price: 128000,
    image: "/images/perfumes/womens/womens(2).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "womens-3",
    name: "Sweet Dreams",
    category: "womens",
    description: "Soft and dreamy, with powdery and floral accords",
    fragranceNotes: "Top: Almond, Violet | Middle: Iris, Heliotrope | Base: Vanilla, Tonka Bean, Musk",
    price: 122000,
    image: "/images/perfumes/womens/womens(3).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: false
  },
  {
    id: "womens-4",
    name: "Garden Princess",
    category: "womens",
    description: "Fresh and floral, like a blooming spring garden",
    fragranceNotes: "Top: Green Apple, Lily of the Valley | Middle: Rose, Jasmine | Base: White Musk, Soft Woods",
    price: 120000,
    image: "/images/perfumes/womens/womens(4).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "womens-5",
    name: "Midnight Romance",
    category: "womens",
    description: "Seductive and mysterious, perfect for special evenings",
    fragranceNotes: "Top: Black Currant, Raspberry | Middle: Tuberose, Jasmine | Base: Amber, Patchouli, Vanilla",
    price: 135000,
    image: "/images/perfumes/womens/womens(5).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "womens-6",
    name: "Sunset Glow",
    category: "womens",
    description: "Warm and radiant, with golden floral notes",
    fragranceNotes: "Top: Mandarin, Peach | Middle: Orange Blossom, Tuberose | Base: Vanilla, Benzoin, Musk",
    price: 130000,
    image: "/images/perfumes/womens/womens(1).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: false
  },
  {
    id: "womens-7",
    name: "Elegant Bloom",
    category: "womens",
    description: "Sophisticated and refined, with classic floral elegance",
    fragranceNotes: "Top: Neroli, Bergamot | Middle: Rose, Ylang-Ylang | Base: Sandalwood, Vetiver, Musk",
    price: 127000,
    image: "/images/perfumes/womens/womens(2).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },
  {
    id: "womens-8",
    name: "Divine Essence",
    category: "womens",
    description: "Luxurious and opulent, with rare and precious ingredients",
    fragranceNotes: "Top: Saffron, Bergamot | Middle: Rose, Oud | Base: Amber, Vanilla, Patchouli",
    price: 140000,
    image: "/images/perfumes/womens/womens(3).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },

  // Unisex Collection - 6 products
  {
    id: "unisex-1",
    name: "Universal Harmony",
    category: "unisex",
    description: "A versatile fragrance that transcends gender boundaries",
    fragranceNotes: "Top: Bergamot, Pink Pepper | Middle: Iris, Violet | Base: Sandalwood, Amber",
    price: 115000, // 115 TND/USD
    image: "/images/perfumes/unisex/unisex(1).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: true
  },
  {
    id: "unisex-2",
    name: "Zen Balance",
    category: "unisex",
    description: "Calming and balanced, with meditative notes",
    fragranceNotes: "Top: Green Tea, Mint | Middle: Iris, White Flowers | Base: Cedarwood, Musk, Amber",
    price: 112000,
    image: "/images/perfumes/unisex/unisex(2).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: true
  },
  {
    id: "unisex-3",
    name: "Modern Classic",
    category: "unisex",
    description: "Contemporary and timeless, with sophisticated accords",
    fragranceNotes: "Top: Bergamot, Cardamom | Middle: Lavender, Juniper | Base: Sandalwood, Vetiver, Amber",
    price: 118000,
    image: "/images/perfumes/unisex/unisex(3).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },
  {
    id: "unisex-4",
    name: "Pure Energy",
    category: "unisex",
    description: "Energizing and vibrant, perfect for active individuals",
    fragranceNotes: "Top: Citrus, Ginger | Middle: Black Pepper, Sage | Base: Cedar, Musk, Amberwood",
    price: 110000,
    image: "/images/perfumes/unisex/unisex(4).jpg",
    volumes: ["50ml", "100ml", "200ml"],
    featured: false
  },
  {
    id: "unisex-5",
    name: "Timeless Elegance",
    category: "unisex",
    description: "Sophisticated and refined, suitable for all occasions",
    fragranceNotes: "Top: Neroli, Bergamot | Middle: Iris, Jasmine | Base: Sandalwood, White Musk, Amber",
    price: 120000,
    image: "/images/perfumes/unisex/unisex(5).jpg",
    volumes: ["50ml", "100ml"],
    featured: true
  },
  {
    id: "unisex-6",
    name: "Mystic Aura",
    category: "unisex",
    description: "Enigmatic and intriguing, with oriental and woody notes",
    fragranceNotes: "Top: Saffron, Cardamom | Middle: Oud, Rose | Base: Patchouli, Amber, Vanilla",
    price: 128000,
    image: "/images/perfumes/unisex/unisex(6).jpg",
    volumes: ["50ml", "100ml"],
    featured: false
  },
];
