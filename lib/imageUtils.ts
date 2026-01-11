/**
 * Function to get appropriate image for each perfume product
 * Uses local images first, then Unsplash as fallback
 */
export function getProductImage(imagePath: string, category: string, productName?: string): string {
  // If path starts with /images/, use it directly (local image)
  if (imagePath && imagePath.startsWith('/images/')) {
    return imagePath;
  }
  
  // If no local image, use Unsplash as fallback
  const categoryImages: Record<string, string> = {
    'eau-de-parfum': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop&q=90',
    'eau-de-toilette': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=1000&fit=crop&q=90',
    'mens': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop&q=90',
    'womens': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=1000&fit=crop&q=90',
    'unisex': 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&h=1000&fit=crop&q=90',
  };

  return categoryImages[category] || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop&q=90';
}

/**
 * Function to check if image exists
 * Can be used in the future to verify file existence
 */
export async function checkImageExists(imagePath: string): Promise<boolean> {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
