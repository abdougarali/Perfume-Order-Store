/**
 * Arabic translations for product names
 * For demo purposes - can be customized with actual Arabic product names
 */

const productNameTranslations: Record<string, string> = {
  // Eau de Parfum
  "Elegant Noir Eau de Parfum": "نوار الأنيق",
  "Royal Essence Eau de Parfum": "جوهر ملكي",
  "Velvet Rose Eau de Parfum": "ورد مخملي",
  "Midnight Bloom Eau de Parfum": "إزهار منتصف الليل",
  "Golden Hour Eau de Parfum": "الساعة الذهبية",
  "Sensual Orchid Eau de Parfum": "أوركيد جذاب",
  "Ivory Garden Eau de Parfum": "حديقة عاجية",
  "Dark Obsession Eau de Parfum": "هوس داكن",
  
  // Eau de Toilette
  "Fresh Morning Eau de Toilette": "صباح منعش",
  "Ocean Breeze Eau de Toilette": "نسيم المحيط",
  "Spring Meadow Eau de Toilette": "مرج الربيع",
  "Citrus Splash Eau de Toilette": "دفقة الحمضيات",
  "Pure Linen Eau de Toilette": "كتان نقي",
  "Misty Garden Eau de Toilette": "حديقة ضبابية",
  "Sunny Days Eau de Toilette": "أيام مشمسة",
  "Cool Waters Eau de Toilette": "مياه باردة",
  "Tropical Breeze Eau de Toilette": "نسيم استوائي",
  
  // Men's Collection
  "Masculine Essence": "جوهر الرجولة",
  "Power & Strength": "قوة وعزيمة",
  "Urban Legend": "أسطورة حضرية",
  "Executive Class": "فئة تنفيذية",
  "Adventure Awaits": "المغامرة تنتظر",
  "Night Vision": "رؤية ليلية",
  "Blue Ocean": "محيط أزرق",
  "Royal Crown": "تاج ملكي",
  
  // Women's Collection
  "Feminine Grace": "جمال الأنوثة",
  "Radiant Beauty": "جمال مشع",
  "Sweet Dreams": "أحلام حلوة",
  "Garden Princess": "أميرة الحديقة",
  "Midnight Romance": "رومانسية منتصف الليل",
  "Sunset Glow": "توهج الغروب",
  "Elegant Bloom": "إزهار أنيق",
  "Divine Essence": "جوهر إلهي",
  
  // Unisex Collection
  "Universal Harmony": "تناغم كوني",
  "Zen Balance": "توازن زن",
  "Modern Classic": "كلاسيكي حديث",
  "Pure Energy": "طاقة نقية",
  "Timeless Elegance": "أناقة خالدة",
  "Mystic Aura": "هالة صوفية",
};

/**
 * Get Arabic translation for product name
 */
export function getArabicProductName(englishName: string): string {
  return productNameTranslations[englishName] || '';
}
