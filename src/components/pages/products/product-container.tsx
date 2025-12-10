"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Heart, Scale, Star, Plus, Minus } from "lucide-react"
import Image from "next/image"
import ShareDialog from "@/components/shared/share-dialog"
import { useTranslations } from "next-intl"
import { Product } from "@/types"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

function ProductContainer({ product }: { product: Product }) {
    const [quantity, setQuantity] = useState(1)
    const hasUnifiedPrice = product.price !== null && product.price !== undefined
    const [customSize, setCustomSize] = useState<string>("")
    const [isFavorite, setIsFavorite] = useState(false)
    const [isInComparison, setIsInComparison] = useState(false)

    const t = useTranslations("product_page")

    const selectedSizePrice = useMemo(() => {
        const v = Number(customSize)
        if (!v || Number.isNaN(v) || v <= 0) {
            if (hasUnifiedPrice) return product.price ?? 0
            if (product.price_by_size && product.price_by_size.length > 0) {
                return product.price_by_size[product.price_by_size.length - 1].price
            }
            return 0
        }

        if (hasUnifiedPrice) {
            return (product.price ?? 0) * v
        } else {
            // Find the correct tier for this volume
            const correctTier = product.price_by_size?.find(tier => v >= tier.min && v <= tier.max)
            return correctTier ? correctTier.price * v : 0
        }
    }, [hasUnifiedPrice, product.price, product.price_by_size, customSize])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
            const isInFavorites = favorites.some((item: { id: number; product: Product }) => item.id === product.id)
            setIsFavorite(isInFavorites)

            // Check comparison
            const comparison = JSON.parse(localStorage.getItem('comparison') || '[]')
            const isInComparisonList = comparison.some((item: { id: number; product: Product }) => item.id === product.id)
            setIsInComparison(isInComparisonList)
        }
    }, [product.id])

    const incrementQuantity = () => setQuantity((prev) => prev + 1)
    const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

    const handleToggleFavorite = () => {
        try {
            const storageKey = 'favorites'
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
            const favorites: Array<{ id: number; product: Product }> = raw ? JSON.parse(raw) : []

            const existingIndex = favorites.findIndex(item => item.id === product.id)

            if (existingIndex >= 0) {
                favorites.splice(existingIndex, 1)
                setIsFavorite(false)
                toast.success('Məhsul sevimlilərdən çıxarıldı')
            } else {
                favorites.push({ id: product.id, product: product })
                setIsFavorite(true)
                toast.success('Məhsul sevimlilərə əlavə olundu')
            }

            window.localStorage.setItem(storageKey, JSON.stringify(favorites))
            window.dispatchEvent(new CustomEvent('favoritesChanged'))
        } catch (error) {
            console.error('Failed to write favorites to localStorage', error)
            toast.error('Xəta baş verdi')
        }
    }

    const handleAddToComparison = () => {
        try {
            const storageKey = 'comparison'
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
            const comparison: Array<{ id: number; product: Product }> = raw ? JSON.parse(raw) : []

            const existingIndex = comparison.findIndex(item => item.id === product.id)
            if (existingIndex === -1) {
                comparison.push({ id: product.id, product: product })
                window.localStorage.setItem(storageKey, JSON.stringify(comparison))
                setIsInComparison(true)
                toast.success('Məhsul müqayisə siyahısına əlavə olundu')
                window.dispatchEvent(new CustomEvent('comparisonChanged'))
            } else {
                toast.error('Məhsul artıq müqayisə siyahısına əlavə olunub')
            }
        } catch (error) {
            console.error('Failed to write comparison to localStorage', error)
            toast.error('Xəta baş verdi')
        }
    }

    const handleAddToCart = () => {
        try {
            type CartItem = {
                id: string
                product_id: number
                title: string
                brand: string
                volume: string
                price: number
                qty: number
                selected: boolean
                image: string
                type: string
            }

            const storageKey = 'cart'
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
            const cart: CartItem[] = raw ? JSON.parse(raw) : []

            const id = String(product.id)

            let volumeLabel = ''
            let priceValue = 0

            if (hasUnifiedPrice) {
                const v = Number(customSize)
                if (!v || Number.isNaN(v) || v <= 0) {
                    toast.error(t('please_enter_valid_volume') || 'Zəhmət olmasa həcmi daxil edin')
                    return
                }

                const existingProductIndex = cart.findIndex(item => item.product_id === product.id)
                if (existingProductIndex >= 0) {
                    const existingVolume = Number(cart[existingProductIndex].volume)
                    const newVolume = existingVolume + (v * quantity)
                    cart[existingProductIndex].volume = `${newVolume}`
                    cart[existingProductIndex].price = (product.price ?? 0) * newVolume
                    cart[existingProductIndex].qty = 1

                    window.localStorage.setItem(storageKey, JSON.stringify(cart))
                    try {
                        window.dispatchEvent(new Event('cart:updated'))
                        window.dispatchEvent(new CustomEvent('cartChanged'))
                    } catch { }
                    toast.success(t('added_to_cart') || 'Səbətə əlavə olundu')
                    return
                }

                volumeLabel = `${v * quantity}`
                priceValue = (product.price ?? 0) * v * quantity
            } else {
                const v = Number(customSize)
                if (!v || Number.isNaN(v) || v <= 0) {
                    toast.error(t('please_enter_valid_volume') || 'Zəhmət olmasa həcmi daxil edin')
                    return
                }

                const correctTier = product.price_by_size?.find(tier => v >= tier.min && v <= tier.max)
                if (!correctTier) {
                    const ranges = product.price_by_size?.map(tier => `${tier.min}-${tier.max}`).join(', ') || ''
                    toast.error(t('volume_out_of_range') || `Volume must be within one of these ranges: ${ranges}`)
                    return
                }

                volumeLabel = `${v}`
                priceValue = correctTier.price * v
            }

            const existingIndex = cart.findIndex(item => item.id === id && item.volume === volumeLabel)
            if (existingIndex >= 0) {
                cart[existingIndex].qty += quantity
                cart[existingIndex].price = priceValue * quantity // Adjusted for quantity
            } else {
                cart.push({
                    id,
                    product_id: product.id,
                    title: product.name,
                    brand: product.brand_name ?? '',
                    volume: volumeLabel,
                    price: priceValue,
                    qty: hasUnifiedPrice ? 1 : quantity,
                    selected: true,
                    image: product.image || '',
                    type: hasUnifiedPrice ? 'unified' : 'priced'
                })
            }

            window.localStorage.setItem(storageKey, JSON.stringify(cart))
            try {
                window.dispatchEvent(new Event('cart:updated'))
                window.dispatchEvent(new CustomEvent('cartChanged'))
            } catch { }
            toast.success(t('added_to_cart') || 'Səbətə əlavə olundu')
        } catch (error) {
            console.error('Failed to add to cart', error)
            toast.error('Xəta baş verdi')
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 3
        }).format(price);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Image Section */}
            <div className="relative w-full lg:w-[calc(45%-16px)]">
                <div className="border border-[#D3D3D7] h-[520px] rounded-[12px] p-8 bg-white">
                    <div className="relative aspect-square h-full w-full">
                        {product.image && product.image !== null && product.image !== 'null' ? (
                            <Image
                                width={1000}
                                height={1000}
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full bg-[#F2F4F8] flex items-center justify-center">
                                <span className="text-[#77777B] text-sm">No Image</span>
                            </div>
                        )}

                        {/* Action Icons */}
                        <div className="absolute top-4 right-4 flex flex-col gap-3">
                            <button
                                onClick={handleToggleFavorite}
                                className="p-2 bg-white border border-none rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-black text-black' : 'text-gray-600'}`} />
                            </button>
                            <button
                                onClick={handleAddToComparison}
                                className="p-2 bg-white border border-none rounded-full hover:bg-gray-50 transition-colors"
                            >
                                <Scale className={`w-5 h-5 ${isInComparison ? 'text-blue-600' : 'text-gray-600'}`} />
                            </button>
                            <ShareDialog />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-14 w-full lg:w-[calc(55%-16px)]">
                {/* Product Code */}
                <div className="space-y-6">
                    <div className="text-sm text-gray-500">{t("product_code")}: {product.code}</div>

                    {/* Product Title and Rating */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                            <p className="text-lg text-gray-600">{product.brand_name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">{product.stock > 0 ? t("in_stock") : t("not_in_stock")}</div>
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-[#FF9500] text-[#FF9500]" />
                                <span className="text-sm font-medium text-[#FF9500]">{product.star}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Volume: Number input for both unified price and price_by_size */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            min={1}
                            inputMode="numeric"
                            value={customSize}
                            onChange={(e) => setCustomSize(e.target.value)}
                            className="w-32"
                            placeholder={t("Gr")}
                        />
                    </div>
                    {!hasUnifiedPrice && product.price_by_size && product.price_by_size.length > 0 && (
                        <div className="text-xs text-gray-500">
                            {t("available_ranges")}: {product.price_by_size.map(tier => `${tier.min}-${tier.max} Gr`).join(', ')}
                        </div>
                    )}
                    {customSize && !hasUnifiedPrice && product.price_by_size && (
                        (() => {
                            const v = Number(customSize)
                            const currentTier = product.price_by_size.find(tier => v >= tier.min && v <= tier.max)
                            return currentTier ? (
                                <div className="text-xs text-green-600">
                                    {t("current_tier")}: {currentTier.min}-{currentTier.max} Gr @ ${currentTier.price} per Gr
                                </div>
                            ) : (
                                <div className="text-xs text-red-600">
                                    {t("volume_outside_available_ranges")}
                                </div>
                            )
                        })()
                    )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <div className="text-3xl font-bold text-gray-900">{formatPrice(selectedSizePrice)} USD</div>
                    <div className="flex justify-end">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 9H12.01M11 12H12V16H13M12 3C19.2 3 21 4.8 21 12C21 19.2 19.2 21 12 21C4.8 21 3 19.2 3 12C3 4.8 4.8 3 12 3Z" stroke="#77777B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <span>{t("minimum_order_amount")}: 400 USD</span>
                        </div>
                    </div>
                </div>

                {/* Quantity and Add to Cart */}
                <div className="flex items-center gap-14">
                    <div className="flex items-center border border-gray-300 rounded-full">
                        <button onClick={decrementQuantity} className="p-3 hover:bg-gray-50 rounded-full">
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 min-w-[3rem] text-center font-medium">{quantity}</span>
                        <button onClick={incrementQuantity} className="p-3 hover:bg-gray-50 rounded-full">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <Button onClick={handleAddToCart} className="flex-1 bg-black hover:bg-gray-800 text-white py-3 px-8 rounded-[10px] font-medium">
                        {t("add_to_cart")}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ProductContainer