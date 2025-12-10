import { useTranslations } from 'next-intl'
import React, { Fragment } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/types'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/navigation'

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

function CartButton({ product }: { product: Product }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [volume, setVolume] = React.useState<string>('')
    const t = useTranslations("product_card")
    const hasUnifiedPrice = product.price !== null && product.price !== undefined
    const router = useRouter()

    const selectedPriceTier = React.useMemo(() => {
        if (hasUnifiedPrice || !product.price_by_size || !Array.isArray(product.price_by_size) || product.price_by_size.length === 0) {
            return null
        }

        const v = Number(volume)
        if (!v || Number.isNaN(v) || v <= 0) {
            return product.price_by_size[0]
        }

        // Find the tier that matches the volume range
        const matchingTier = product.price_by_size.find(tier => v >= tier.min && v <= tier.max)
        return matchingTier || product.price_by_size[0]
    }, [hasUnifiedPrice, product.price_by_size, volume])

    // Get all available ranges for display
    const allRanges = React.useMemo(() => {
        if (hasUnifiedPrice || !product.price_by_size || !Array.isArray(product.price_by_size)) {
            return []
        }
        return product.price_by_size
    }, [hasUnifiedPrice, product.price_by_size])

    const computedDialogPrice = React.useMemo(() => {
        if (hasUnifiedPrice) {
            const v = Number(volume)
            const discountPercent = typeof product.discount === 'number' ? product.discount : 0
            const unitPrice = (product.price ?? 0) * (1 - discountPercent / 100)
            if (!v || Number.isNaN(v) || v <= 0) return unitPrice
            return unitPrice * v
        }

        // Use price_by_size structure with dynamic tier selection
        if (selectedPriceTier) {
            const v = Number(volume)
            if (!v || Number.isNaN(v) || v <= 0) return selectedPriceTier.price
            return selectedPriceTier.price * v
        }

        return 0
    }, [hasUnifiedPrice, volume, product.price, product.discount, selectedPriceTier])

    function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        e.stopPropagation()

        if (hasUnifiedPrice || selectedPriceTier) {
            // Ask for volume in dialog, add on confirm
            setIsOpen(true)
            return
        }
    }

    function addPricedItemToCart(volumeMl: number) {
        try {
            const storageKey = 'cart'
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
            type CartItem = {
                id: string
                product_id: number
                title: string
                brand: string
                volume: string
                price: number
                qty: number
                type: string
                selected: boolean
                image: string
            }
            const cart: CartItem[] = raw ? JSON.parse(raw) : []

            const id = String(product.id)
            let totalPrice = 0

            if (hasUnifiedPrice) {
                // For unified price products, check if product already exists in cart
                // If it does, increase the volume instead of creating separate entry
                const existingProductIndex = cart.findIndex(item => item.product_id === product.id)
                if (existingProductIndex >= 0) {
                    // Product exists, increase volume and recalculate price
                    const existingVolume = Number(cart[existingProductIndex].volume.replace(' Gr', ''))
                    const newVolume = existingVolume + volumeMl
                    const discountPercent = typeof product.discount === 'number' ? product.discount : 0
                    const unitPrice = (product.price ?? 0) * (1 - discountPercent / 100)

                    cart[existingProductIndex].volume = `${newVolume} Gr`
                    cart[existingProductIndex].price = unitPrice * newVolume
                    cart[existingProductIndex].qty = 1 // Keep qty as 1 since we're managing volume directly

                    window.localStorage.setItem(storageKey, JSON.stringify(cart))
                    try {
                        window.dispatchEvent(new Event('cart:updated'))
                        window.dispatchEvent(new CustomEvent('cartChanged'))
                    } catch { }

                    router.push('/cart')
                    return
                }

                // Original unified price logic for new products
                const discountPercent = typeof product.discount === 'number' ? product.discount : 0
                const unitPrice = (product.price ?? 0) * (1 - discountPercent / 100)
                totalPrice = unitPrice * volumeMl
            } else if (selectedPriceTier) {
                // New price_by_size logic - find the correct tier for the volume
                const correctTier = product.price_by_size?.find(tier => volumeMl >= tier.min && volumeMl <= tier.max)
                if (!correctTier) {
                    const ranges = product.price_by_size?.map(tier => `${tier.min}-${tier.max}`).join(', ') || ''
                    toast.error(t('volume_out_of_range') || `Volume must be within one of these ranges: ${ranges}`)
                    return
                }
                totalPrice = correctTier.price * volumeMl
            }

            // if (totalPrice < 400) {
            //     toast.error(t('minimum_order_validation') || 'Minimum sifariş məbləği 400 USD-dir')
            //     return
            // }

            const volumeStr = `${volumeMl} Gr`
            const existingIndex = cart.findIndex(item => item.id === id && item.volume === volumeStr)
            if (existingIndex >= 0) {
                // Same product and same volume → just increment qty
                cart[existingIndex].qty += 1
                cart[existingIndex].price = totalPrice
            } else {
                cart.push({
                    id,
                    product_id: product.id,
                    title: product.name,
                    brand: product.brand_name ?? '',
                    volume: volumeStr,
                    price: totalPrice,
                    qty: hasUnifiedPrice ? 1 : 1,
                    type: hasUnifiedPrice ? 'unified' : 'priced',
                    selected: true,
                    image: product.image || ''
                })
            }

            router.push('/cart')

            window.localStorage.setItem(storageKey, JSON.stringify(cart))
            try {
                window.dispatchEvent(new Event('cart:updated'))
                window.dispatchEvent(new CustomEvent('cartChanged'))
            } catch { }
        } catch (error) {
            console.error('Failed to write cart to localStorage', error)
        }
    }

    return (
        <Fragment>
            <button onClick={handleAddToCart} className="bg-primary text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
                {t("add_to_cart")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            <Dialog open={isOpen} onOpenChange={(open) => {
                setIsOpen(open)
                if (!open) {
                    setVolume('')
                    setTimeout(() => {
                    }, 0)
                }
            }}>
                <DialogContent className="max-w-xl p-0" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 sm:p-6">
                        <DialogHeader>
                            <DialogTitle>{t("add_to_cart_dialog")}</DialogTitle>
                            <DialogDescription />
                        </DialogHeader>

                        <div className="mt-4 grid grid-cols-[72px_1fr_auto] gap-4 items-center">
                            <div className="w-18 h-18 bg-white py-3 rounded-md border flex items-center justify-center overflow-hidden">
                                {product.image && product.image !== null && product.image !== 'null' ? (
                                    <Image src={product.image} alt={product.name} width={100} height={100} />
                                ) : (
                                    <div className="w-full h-full bg-[#F2F4F8] flex items-center justify-center">
                                        <span className="text-[#77777B] text-sm">No Image</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-primary">{product.name}</p>
                                <p className="text-xs text-[#77777B] mt-1">{product.brand_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-primary">(x1) {formatCurrency(computedDialogPrice)}</p>
                                {hasUnifiedPrice && (
                                    <p className="text-[10px] text-muted-foreground">{volume ? `${volume} Gr` : ''}</p>
                                )}
                            </div>
                        </div>

                        {(hasUnifiedPrice || selectedPriceTier) && (
                            <div className="mt-4">
                                <label className="text-xs text-[#77777B] mb-1 block">
                                    Gr {allRanges.length > 0 && (
                                        <span>
                                            ({t("available_ranges")}: {allRanges.map(tier => `${tier.min}-${tier.max}`).join(', ')})
                                        </span>
                                    )}
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    inputMode="numeric"
                                    value={volume}
                                    onChange={(e) => setVolume(e.target.value)}
                                    placeholder={selectedPriceTier ? `e.g. ${selectedPriceTier.min}` : "e.g. 200"}
                                    className="w-32"
                                />
                                {selectedPriceTier && volume && (
                                    <p className="text-xs text-[#77777B] mt-1">
                                        {t("current_tier")}: {selectedPriceTier.min}-{selectedPriceTier.max} Gr @ ${selectedPriceTier.price} per Gr
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-6 flex items-center justify-between text-xs text-[#77777B] border-t pt-2">
                            <span>{t("in_cart")}</span>
                            <span className="text-primary">
                                {t("initial_price")} {
                                    hasUnifiedPrice
                                        ? formatCurrency(product.price ?? 0)
                                        : selectedPriceTier
                                            ? formatCurrency(selectedPriceTier.price)
                                            : formatCurrency(0)
                                }
                            </span>
                        </div>

                        <div className="mt-4 w-full flex justify-end gap-2">
                            <Button
                                className="flex gap-2 items-center bg-primary text-white rounded-md px-3 py-2 text-xs text-center"
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation()
                                    const v = Number(volume)
                                    if (!v || Number.isNaN(v) || v <= 0) {
                                        e.preventDefault()
                                        toast.error(t('please_enter_valid_volume') || 'Zəhmət olmasa həcmi daxil edin')
                                        return
                                    }

                                    if (selectedPriceTier && product.price_by_size) {
                                        const correctTier = product.price_by_size.find(tier => v >= tier.min && v <= tier.max)
                                        if (!correctTier) {
                                            e.preventDefault()
                                            const ranges = product.price_by_size.map(tier => `${tier.min}-${tier.max}`).join(', ')
                                            toast.error(t('volume_out_of_range') || `Volume must be within one of these ranges: ${ranges}`)
                                            return
                                        }
                                    }

                                    addPricedItemToCart(v)
                                    setIsOpen(false)
                                }}
                            >
                                {t("cross_basket")} <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Fragment>
    )
}

export default CartButton