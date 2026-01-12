import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastContainer";
import { CartProvider } from "@/contexts/CartContext";

const playfairDisplay = Playfair_Display({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const cairo = Cairo({
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Luxury Perfumes",
    template: "%s | Luxury Perfumes"
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  description: "Discover our exquisite collection of luxury perfumes. Eau de Parfum, Eau de Toilette, Men's, Women's, and Unisex fragrances. Order your favorite scent online with fast delivery.",
  keywords: [
    "luxury perfumes",
    "eau de parfum",
    "eau de toilette",
    "men's fragrances",
    "women's fragrances",
    "unisex perfumes",
    "premium perfumes",
    "french perfumes",
    "italian perfumes",
    "designer fragrances",
    "luxury scents",
    "perfume collection",
    "fragrance notes",
    "bestseller perfumes",
    "online perfume store"
  ],
  authors: [{ name: "Luxury Perfumes" }],
  creator: "Luxury Perfumes",
  publisher: "Luxury Perfumes",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://luxury-perfumes.com",
    siteName: "Luxury Perfumes",
    title: "Luxury Perfumes | Premium Fragrances Collection",
    description: "Discover our exquisite collection of luxury perfumes. Eau de Parfum, Eau de Toilette, Men's, Women's, and Unisex fragrances.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Luxury Perfumes Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luxury Perfumes | Premium Fragrances",
    description: "Discover our exquisite collection of luxury perfumes",
    images: ["/images/og-image.jpg"],
  },
  alternates: {
    canonical: "https://luxury-perfumes.com",
  },
  metadataBase: new URL("https://luxury-perfumes.com"),
  category: "Fragrances",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": "https://luxury-perfumes.com/#store",
  name: "Luxury Perfumes",
  description: "Luxury Perfumes - Premium fragrance collection. Eau de Parfum, Eau de Toilette, Men's, Women's, and Unisex perfumes",
  url: "https://luxury-perfumes.com",
  logo: "https://luxury-perfumes.com/icon.svg",
  image: "https://luxury-perfumes.com/images/og-image.jpg",
  priceRange: "$$$",
  telephone: "+1-XXX-XXX-XXXX",
  address: {
    "@type": "PostalAddress",
    addressCountry: "US",
    addressLocality: "New York",
    addressRegion: "NY"
  },
  areaServed: [
    {
      "@type": "Country",
      name: "United States"
    }
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Luxury Perfumes",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Eau de Parfum",
        itemListElement: []
      },
      {
        "@type": "OfferCatalog",
        name: "Eau de Toilette",
        itemListElement: []
      },
      {
        "@type": "OfferCatalog",
        name: "Men's Collection",
        itemListElement: []
      },
      {
        "@type": "OfferCatalog",
        name: "Women's Collection",
        itemListElement: []
      },
      {
        "@type": "OfferCatalog",
        name: "Unisex Collection",
        itemListElement: []
      }
    ]
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "200"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} ${cormorant.variable} ${cairo.variable} ${amiri.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ToastProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
