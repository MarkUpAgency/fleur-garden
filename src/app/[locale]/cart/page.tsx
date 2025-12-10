"use client"

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

import Container from '@/components/shared/container'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { LocalStorageCartItem, CartItemData, CartStorageItemV2, ApplyPromoPayload, PromoCodeResponse } from '@/types'
import { applyPromoMutation } from '@/services/products/mutations'

function formatCurrency(amount: number | string) {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numAmount)
}

function transformLocalStorageData(localStorageData: LocalStorageCartItem[]): CartItemData[] {
    return localStorageData.map((item, index) => ({
        id: `${item.id}-${item.product.volume}-${index}`,
        title: item.product.name,
        brand: item.product.brand,
        volume: item.product.volume,
        price: typeof item.product.price === 'string'
            ? parseFloat(item.product.price.replace(/[^\d.-]/g, ''))
            : item.product.price,
        qty: item.qty,
        selected: true,
        image: item.product.image || "",
        type: item.product.type,
    }))
}

function transformV2Data(v2: CartStorageItemV2[]): CartItemData[] {
    return v2.map((item, index) => ({
        id: `${item.id}-${item.size ?? 'na'}-${index}`,
        title: item.name,
        brand: item.product?.brand_name ?? '',
        volume: item.size ? `${item.size} Gr` : '',
        price: item.price,
        qty: item.quantity,
        selected: true,
        image: item.image || "",
        type: item.pricingMode || 'unified',
    }))
}

function CartItem({ item, onChange }: { item: CartItemData; onChange: (next: CartItemData | null) => void }) {
    const handleQty = (delta: number) => {
        const nextQty = item.qty + delta
        if (nextQty < 1) return
        onChange({ ...item, qty: nextQty })
    }

    return (
        <div className="p-4 md:p-6"
            style={{
                borderRadius: "10px",
                border: "1px solid #F2F4F8",
                background: "#FFF",
            }}
        >
            {/* Mobile Layout */}
            <div className="flex flex-col space-y-4 md:hidden">
                <div className="flex items-start gap-3">
                    <Checkbox
                        checked={item.selected}
                        onCheckedChange={(v) => onChange({ ...item, selected: Boolean(v) })}
                        className="mt-1"
                    />
                    <div className="flex-1">
                        <div className="text-base font-semibold text-foreground">{item.title}</div>
                        <div className="text-muted-foreground text-sm mt-1">
                            {item.brand} • {item.volume}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove"
                        className="text-destructive flex-shrink-0"
                        onClick={() => onChange(null)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                        {item.image && item.image !== null && item.image !== 'null' ? (
                            <Image
                                src={item.image}
                                alt={item.title}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover rounded"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-[#77777B] text-xs">No Image</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="text-lg font-semibold text-foreground">{formatCurrency(item.price)}</div>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <div className="flex items-center gap-3">
                        <Button className='rounded-full' variant="outline" size="icon" aria-label="Decrease" onClick={() => handleQty(-1)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-base">{item.qty}</span>
                        <Button className='rounded-full' variant="outline" size="icon" aria-label="Increase" onClick={() => handleQty(1)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-start gap-6">
                <Checkbox
                    checked={item.selected}
                    onCheckedChange={(v) => onChange({ ...item, selected: Boolean(v) })}
                    className="mt-2"
                />

                <div className="flex items-center gap-6 flex-1">
                    <div className="w-20 h-20 flex-shrink-0">
                        {item.image && item.image !== null && item.image !== 'null' ? (
                            <Image
                                src={item.image}
                                alt={item.title}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover rounded"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-[#77777B] text-sm">No Image</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="text-xl font-semibold text-foreground">{item.title}</div>
                        <div className="text-muted-foreground text-base mt-1">
                            {item.brand} • {item.volume}
                        </div>
                        <div className="text-foreground text-2xl font-semibold mt-3">{formatCurrency(item.price)}</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button className='rounded-full' variant="outline" size="icon" aria-label="Decrease" onClick={() => handleQty(-1)}>
                            <Minus />
                        </Button>
                        <span className="w-6 text-center text-lg">{item.qty}</span>
                        <Button className='rounded-full' variant="outline" size="icon" aria-label="Increase" onClick={() => handleQty(1)}>
                            <Plus />
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remove"
                        className="text-destructive"
                        onClick={() => onChange(null)}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function Cart() {
    const [items, setItems] = useState<CartItemData[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [usingV2, setUsingV2] = useState(false)
    const originalV2ByKey = useRef<Record<string, CartStorageItemV2>>({})

    const t = useTranslations("cart")

    useEffect(() => {
        function load() {
            try {
                const savedCart = localStorage.getItem('cart')
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart)
                    if (Array.isArray(parsedCart) && parsedCart.length > 0) {
                        // Detect V2
                        if (parsedCart[0] && typeof parsedCart[0].subtotal === 'number' && 'quantity' in parsedCart[0]) {
                            const v2 = parsedCart as CartStorageItemV2[]
                            setUsingV2(true)
                            // Keep originals for accurate save-back
                            originalV2ByKey.current = v2.reduce((acc, it) => {
                                const key = `${it.id}-${it.size ?? 'na'}`
                                acc[key] = it
                                return acc
                            }, {} as Record<string, CartStorageItemV2>)
                            setItems(transformV2Data(v2))
                        } else if (parsedCart[0].product) {
                            // Very old format from product card - transform it
                            setUsingV2(false)
                            setItems(transformLocalStorageData(parsedCart))
                        } else {
                            setUsingV2(false)
                            // Always regenerate unique IDs to ensure no duplicates
                            const updatedItems = parsedCart.map((item, index) => ({
                                ...item,
                                id: `${item.id}-${item.volume}-${index}`
                            }))
                            setItems(updatedItems)
                        }
                    } else {
                        setItems([])
                    }
                } else {
                    setItems([])
                }
            } catch (error) {
                console.error('Error loading cart from localStorage:', error)
            } finally {
                setIsInitialized(true)
            }
        }
        load()
        const handler = () => load()
        window.addEventListener('cartChanged', handler)
        return () => window.removeEventListener('cartChanged', handler)
    }, [])

    // Save cart data to localStorage whenever items change (but not on initial load)
    useEffect(() => {
        if (isInitialized) {
            try {
                if (usingV2) {
                    // Map back into V2 storage format preserving product info where possible
                    const v2: CartStorageItemV2[] = items.map(it => {
                        const parts = it.id.split('-')
                        const rawId = parts[0]
                        const rawSize = parts[1]
                        const idNum = Number(rawId)
                        const sizeNum = rawSize === 'na' ? null : Number(rawSize)
                        const key = `${idNum}-${sizeNum ?? 'na'}`
                        const original = originalV2ByKey.current[key]
                        const price = it.price
                        const quantity = it.qty
                        const base: CartStorageItemV2 = original ? {
                            ...original,
                            name: it.title,
                            image: it.image,
                            price,
                            quantity,
                            size: sizeNum,
                            subtotal: price * quantity,
                            pricingMode: original.pricingMode,
                            distinguish: original.distinguish ?? `${idNum}-${sizeNum ?? 'na'}`,
                        } : {
                            id: idNum,
                            product: undefined,
                            name: it.title,
                            image: it.image,
                            price,
                            quantity,
                            size: sizeNum,
                            subtotal: price * quantity,
                            pricingMode: undefined,
                            distinguish: `${idNum}-${sizeNum ?? 'na'}`,
                        }
                        return base
                    })
                    localStorage.setItem('cart', JSON.stringify(v2))
                    // Notify listeners (e.g., header cart indicator) in the same tab
                    window.dispatchEvent(new Event('cart:updated'))
                } else {
                    localStorage.setItem('cart', JSON.stringify(items))
                    // Notify listeners (e.g., header cart indicator) in the same tab
                    window.dispatchEvent(new Event('cart:updated'))
                }
            } catch (error) {
                console.error('Error saving cart to localStorage:', error)
            }
        }
    }, [items, isInitialized, usingV2])

    const allSelected = items.length > 0 && items.every((p) => p.selected)
    const [promo, setPromo] = useState<string>('')
    const [promoApplied, setPromoApplied] = useState<boolean>(false)
    const [promoMessage, setPromoMessage] = useState<string>('')
    const [promoData, setPromoData] = useState<PromoCodeResponse['data'] | null>(null)

    const selectedItems = items.filter((i) => i.selected)
    const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.qty, 0)

    // Use dynamic data from API if promo is applied, otherwise use static calculation
    const total = promoApplied && promoData ? promoData.total_price : subtotal
    const discount = promoApplied && promoData ? subtotal - promoData.total_price : 0
    const discountPercentage = promoApplied && promoData ? parseFloat(promoData.percentage) : 0

    const MIN_ORDER = 400
    const isBelowMinimum = total < MIN_ORDER

    const { mutate: applyPromoCode, isPending: isApplyingPromo } = useMutation({
        mutationFn: (payload: ApplyPromoPayload) => {
            const mutationConfig = applyPromoMutation(payload);
            return mutationConfig.mutationFn?.() || Promise.reject('Mutation function not available');
        },
        onSuccess: (response: PromoCodeResponse) => {
            setPromoData(response.data);
            setPromoApplied(true);
            setPromoMessage(t("promo_code_applied"));
        },
        onError: () => {
            setPromoApplied(false);
            setPromoData(null);
            setPromoMessage(t('promo_code_invalid'));
        }
    })

    function handleItemChange(next: CartItemData | null, id: string) {
        if (next === null) {
            setItems((prev) => prev.filter((i) => i.id !== id))
            return
        }
        setItems((prev) => prev.map((i) => (i.id === id ? next : i)))

        // Clear promo data when items change
        if (promoApplied) {
            setPromoApplied(false)
            setPromoData(null)
            setPromoMessage('')
        }
    }

    function handleToggleAll(checked: boolean) {
        setItems((prev) => prev.map((i) => ({ ...i, selected: checked })))

        // Clear promo data when selection changes
        if (promoApplied) {
            setPromoApplied(false)
            setPromoData(null)
            setPromoMessage('')
        }
    }

    function applyPromo() {
        if (!promo.trim()) {
            setPromoMessage(t('promo_code_invalid'));
            return;
        }

        if (selectedItems.length === 0) {
            setPromoMessage(t('select_items_first') || 'Please select items first');
            return;
        }

        const payload: ApplyPromoPayload = {
            promocode: promo.trim().toUpperCase(),
            products: selectedItems.map((i) => {
                const idParts = i.id.split('-');
                const productId = parseInt(idParts[0]);

                return {
                    product_id: productId,
                    [i.type === 'unified' ? 'quantity' : 'size']: i.type === 'unified' ? i.qty : String(i.volume.replace(' Gr', '')),
                };
            }),
        };

        applyPromoCode(payload);
    }

    function clearPromo() {
        setPromoApplied(false);
        setPromoData(null);
        setPromoMessage('');
        setPromo('');
    }

    return (
        <Container className="py-4 md:py-6 lg:py-10">
            <Breadcrumb className="mb-4 md:mb-6 lg:mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">{t("home")}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <g clipPath="url(#clip0_355_8453)">
                            <path d="M11.3332 3.33337L4.6665 12.6667" stroke="#D3D3D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                        <defs>
                            <clipPath id="clip0_355_8453">
                                <rect width="16" height="16" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    <BreadcrumbItem>
                        <BreadcrumbPage>{t("cart")}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                <div className="lg:col-span-8 space-y-4">
                    <div className="p-4 md:p-6"
                        style={{
                            borderRadius: "10px",
                            border: "1px solid #F2F4F8",
                            background: "#FFF",
                        }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Checkbox checked={allSelected} onCheckedChange={(v) => handleToggleAll(Boolean(v))} />
                                <span className="text-sm md:text-base">{t("select_all")}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-sm md:text-base font-semibold">{t("cart")} ({items.length} {t("products")})</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {items.map((item) => (
                            <CartItem key={item.id} item={item} onChange={(n) => handleItemChange(n, item.id)} />
                        ))}
                        {items.length === 0 && (
                            <div className="border rounded-2xl p-6 md:p-8 text-center text-muted-foreground">{t("cart_empty")}</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="p-4 md:p-6 space-y-4 md:space-y-5"
                        style={{
                            borderRadius: "10px",
                            border: "1px solid #F2F4F8",
                            background: "#FFF",
                        }}
                    >
                        <div>
                            <div className="text-base md:text-lg font-semibold mb-2 md:mb-3">{t("promo_code")}</div>
                            <p className="text-muted-foreground text-xs md:text-sm mb-3">{t("promo_code_description")}</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    disabled={items.length === 0 || !total || promoApplied}
                                    placeholder="FLEUR20"
                                    value={promo}
                                    onChange={(e) => setPromo(e.target.value)}
                                    className="flex-1"
                                />
                                {promoApplied ? (
                                    <Button
                                        variant="outline"
                                        onClick={clearPromo}
                                        className="sm:w-auto"
                                    >
                                        {t("clear") || "Clear"}
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={items.length === 0 || !total || isApplyingPromo}
                                        variant="outline"
                                        onClick={applyPromo}
                                        className="sm:w-auto"
                                    >
                                        {isApplyingPromo ? t("applying") || "Applying..." : t("apply")}
                                    </Button>
                                )}
                            </div>
                            {promoMessage && (
                                <div className={promoApplied ? 'text-emerald-600 text-xs md:text-sm mt-2' : 'text-red-500 text-xs md:text-sm mt-2'}>
                                    {promoMessage}
                                </div>
                            )}
                            {promoApplied && promoData && (
                                <div className="text-emerald-600 text-xs md:text-sm mt-2 font-medium">
                                    {t("promo_applied_successfully") || "Promo code applied successfully!"}
                                    {discountPercentage > 0 && ` (${discountPercentage}% off)`}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 text-xs md:text-sm">
                            <div className="flex items-center justify-between">
                                <span>{t("products_price")}</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            {promoApplied && promoData && discount > 0 && (
                                <div className="flex items-center justify-between">
                                    <span>{t("discount")} ({discountPercentage}%)</span>
                                    <span className="font-medium text-green-600">-{formatCurrency(discount)}</span>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-border" />

                        <div className="flex items-center justify-between text-base md:text-lg font-semibold">
                            <span>{t("total_price")}</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        {isBelowMinimum && (
                            <div className="text-xs text-red-500 mt-1">Minimum order amount: {MIN_ORDER} USD</div>
                        )}

                        <Link href={items.length === 0 || isBelowMinimum ? "/cart" : "/cart/order"}>
                            <Button disabled={items.length === 0 || !total || isBelowMinimum} className="w-full h-10 md:h-11 text-sm md:text-base">{t("complete_order")}</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </Container >
    )
}

export default Cart