import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The API reports a missing image as the literal string "null" rather than a
 * JSON null, so a plain falsy check is not enough to detect one.
 */
export function normalizeImageUrl(value?: string | null): string | null {
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null

  return trimmed
}

export interface ProductImageSource {
  image?: string | null
  thumb_image?: string | null
  image_url?: string | null
  category_image?: string | null
  category_thumb_image?: string | null
}

/**
 * Resolves which image to show for a product. A product without its own image
 * falls back to the image of the category it belongs to, which the API sends
 * inline on every product as `category_image` / `category_thumb_image`.
 *
 * `image_url` sits between the two: it is an absolute URL imported from the
 * excel feed and is only used when the product has no uploaded image.
 *
 * Returns null when neither the product nor its category has an image, so the
 * caller can render its own "No Image" placeholder.
 */
export function getProductImage(
  source: ProductImageSource | null | undefined,
  options: { preferThumb?: boolean } = {}
): string | null {
  if (!source) return null

  const own = options.preferThumb
    ? [source.thumb_image, source.image]
    : [source.image, source.thumb_image]

  const category = options.preferThumb
    ? [source.category_thumb_image, source.category_image]
    : [source.category_image, source.category_thumb_image]

  for (const candidate of [...own, source.image_url, ...category]) {
    const normalized = normalizeImageUrl(candidate)
    if (normalized) return normalized
  }

  return null
}

export function getCurrentLocale(): string {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // Extract locale from pathname (/en/... -> en)
    const pathname = window.location.pathname
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    if (localeMatch) {
      const locale = localeMatch[1]
      // Validate it's one of our supported locales
      if (['az', 'en', 'ru'].includes(locale)) {
        return locale
      }
    }
  }
  
  // Fallback to default locale
  return 'az'
}

export function getAcceptLanguageHeader(locale?: string): string {
  const currentLocale = locale || getCurrentLocale()
  
  const localeMap: Record<string, string> = {
    'az': 'az-AZ,az;q=0.9,en;q=0.8',
    'en': 'en-US,en;q=0.9,az;q=0.8',
    'ru': 'ru-RU,ru;q=0.9,en;q=0.8'
  }
  
  return localeMap[currentLocale] || localeMap['az']
}

export async function getServerLocale(): Promise<string> {
  try {
    const { getLocale } = await import('next-intl/server')
    return await getLocale()
  } catch {
    return 'az'
  }
}