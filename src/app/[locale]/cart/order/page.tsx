"use client"

import React from 'react'
import Image from 'next/image'

import Container from '@/components/shared/container'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'
import PhoneInput from 'react-phone-input-2'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orderMutation } from '@/services/products/mutations'
import type { OrderPayload } from '@/types'
import { useRouter } from '@/i18n/navigation'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
import { getUserQuery } from '@/services/auth/queries'

interface CheckoutItem {
    id: string
    title: string
    brand: string
    volume: string
    price: number
    qty: number
    image: string
}

function formatCurrency(amount: number) {
    return `${amount.toFixed(3)} USD`
}

function Order() {
    const [items, setItems] = React.useState<CheckoutItem[]>([])

    const [payment, setPayment] = React.useState<'card' | 'cod'>('card')
    const [fullName, setFullName] = React.useState('')
    const [phone, setPhone] = React.useState('')
    const [city, setCity] = React.useState('Bakı')
    const [address, setAddress] = React.useState('')
    const [note, setNote] = React.useState('')
    const [promo, setPromo] = React.useState('')

    const t = useTranslations("order")
    const router = useRouter()

    const accessToken = Cookies.get('access_token')

    // Fetch authenticated user if token exists
    const userQuery = useQuery({
        ...getUserQuery(accessToken || ''),
        enabled: Boolean(accessToken),
        staleTime: 5 * 60 * 1000,
    })

    // LocalStorage keys
    const STORAGE_KEYS = React.useMemo(() => ({
        items: 'cart',
        form: 'order.form',
        payload: 'order.payload',
    }), [])

    function safeParseJSON<T>(value: string | null, fallback: T): T {
        if (!value) return fallback
        try {
            return JSON.parse(value) as T
        } catch {
            return fallback
        }
    }

    // Helpers to detect cart format and transform for UI + payload
    function parseMl(value: unknown): number {
        if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.floor(value))
        if (typeof value === 'string') {
            const match = value.match(/(\d+)(?=\s*ml)/i) || value.match(/(\d+)/)
            if (match && match[1]) return Math.max(0, Math.floor(Number(match[1])))
        }
        return 0
    }
    const buildProductsPayload = React.useCallback((raw: unknown): OrderPayload['products'] => {
        if (!Array.isArray(raw)) return []
        // V2 format: { id, quantity, size, subtotal, ... }
        if (raw.length > 0 && typeof raw[0] === 'object' && raw[0] && 'quantity' in raw[0] && 'subtotal' in raw[0]) {
            return (raw as Array<{ id: number; quantity: number; size: number | null }>).
                map((it) => ({
                    product_id: Number(it.id),
                    quantity: Number(it.quantity),
                    size: parseMl(it.size), // ensure ml
                }))
        }
        // Very old format: { id, qty, product: {...} }
        if (raw.length > 0 && typeof raw[0] === 'object' && raw[0] && 'product' in raw[0]) {
            return (raw as Array<{ id: number; qty: number }>).map((it) => ({
                product_id: Number(it.id),
                quantity: Number(it.qty),
                size: 0, // legacy format lacks size; server may handle default
            }))
        }
        // Already UI CheckoutItem[] with id like `${id}-${size}`
        return (raw as CheckoutItem[]).map((i) => {
            const [rawId, rawSize] = String(i.id).split('-')
            const productId = Number(rawId)
            const sizeFromId = rawSize && rawSize !== 'na' ? parseMl(rawSize) : 0
            const sizeFromVolume = parseMl(i.volume)
            const finalSize = sizeFromVolume || sizeFromId
            return {
                product_id: productId,
                quantity: Number(i.qty),
                size: finalSize,
            }
        })
    }, [])

    function transformForUI(raw: unknown): CheckoutItem[] {
        if (!Array.isArray(raw)) return []
        // V2
        if (raw.length > 0 && typeof raw[0] === 'object' && raw[0] && 'quantity' in raw[0] && 'subtotal' in raw[0]) {
            return (raw as Array<{
                id: number
                name: string
                image: string
                price: number
                quantity: number
                size: number | null
                product?: { brand_name?: string }
            }>).map((it) => ({
                id: `${it.id}-${it.size ?? 'na'}`,
                title: it.name,
                brand: it.product?.brand_name ?? '',
                volume: it.size ? `${it.size} Gr` : '',
                price: Number(it.price),
                qty: Number(it.quantity),
                image: it.image || '',
            }))
        }
        // Very old format
        if (raw.length > 0 && typeof raw[0] === 'object' && raw[0] && 'product' in raw[0]) {
            return (raw as Array<{ id: number; qty: number; product: { name: string; brand: string; price: string | number; image?: string } }>).
                map((it) => ({
                    id: String(it.id),
                    title: it.product.name,
                    brand: it.product.brand,
                    volume: '',
                    price: typeof it.product.price === 'string' ? parseFloat(it.product.price.replace(/[^\d.-]/g, '')) : Number(it.product.price ?? 0),
                    qty: Number(it.qty),
                    image: it.product.image || '',
                }))
        }
        // Assume CheckoutItem[]
        return raw as CheckoutItem[]
    }

    // Load from localStorage on mount
    React.useEffect(() => {
        try {
            const raw = safeParseJSON<unknown>(
                typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.items) : null,
                []
            )
            const uiItems = transformForUI(raw)
            if (uiItems.length) setItems(uiItems)

            const savedForm = safeParseJSON<{
                fullName?: string
                phone?: string
                city?: string
                address?: string
                note?: string
                payment?: 'card' | 'cod'
                promo?: string
            }>(typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEYS.form) : null, {})

            if (savedForm.fullName) setFullName(savedForm.fullName)
            if (savedForm.phone) setPhone(savedForm.phone)
            if (savedForm.city) setCity(savedForm.city)
            if (savedForm.address) setAddress(savedForm.address)
            if (savedForm.note) setNote(savedForm.note)
            if (savedForm.payment) setPayment(savedForm.payment)
            if (savedForm.promo) setPromo(savedForm.promo)
        } catch {
            // ignore storage errors
        }
    }, [STORAGE_KEYS.form, STORAGE_KEYS.items])

    // Persist items
    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items))
            }
        } catch {
            // ignore storage errors
        }
    }, [items, STORAGE_KEYS])

    // Persist form
    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(
                    STORAGE_KEYS.form,
                    JSON.stringify({ fullName, phone, city, address, note, payment, promo })
                )
            }
        } catch {
            // ignore storage errors
        }
    }, [fullName, phone, city, address, note, payment, promo, STORAGE_KEYS])

    // Autofill from user when available
    React.useEffect(() => {
        const user = userQuery.data?.data
        if (!user) return
        if (!fullName && user.name) setFullName(user.name)
        if (!phone && user.mobile) setPhone(user.mobile)
        // No address/city in user shape; keep as-is
    }, [userQuery.data, fullName, phone])

    // Force COD when unauthenticated
    React.useEffect(() => {
        if (!accessToken) setPayment('cod')
    }, [accessToken])

    // Build and persist API payload whenever dependencies change
    const payload: OrderPayload = React.useMemo(() => {
        return {
            name: fullName,
            city,
            address,
            phone,
            note,
            payment_type: payment === 'card' ? '1' : '2',
            products: buildProductsPayload(items),
            promocode: promo,
            user_id: userQuery.data?.data?.id
        }
    }, [fullName, phone, city, address, note, payment, promo, items, buildProductsPayload, userQuery.data])

    React.useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(STORAGE_KEYS.payload, JSON.stringify(payload))
            }
        } catch {
            // ignore storage errors
        }
    }, [payload, STORAGE_KEYS])

    const submitOrder = useMutation(orderMutation(payload))

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const total = subtotal
    const MIN_ORDER = 400
    const isBelowMinimum = total < MIN_ORDER

    function clearCart() {
        try {
            setItems([])
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(STORAGE_KEYS.items)
                window.localStorage.removeItem(STORAGE_KEYS.payload)
            }
        } catch {
            // ignore storage errors
        }
    }

    const orderAction = () => {
        if (isBelowMinimum) {
            toast.error(t("minimum_order_amount") + ` ${MIN_ORDER} USD`)
            return
        }
        submitOrder.mutateAsync(undefined, {
            onSuccess: (data) => {
                // Reset cart on successful order
                clearCart()
                if (payment === 'card') {
                    router.push(data.data)
                } else {
                    router.push('/')
                }
                toast.success(t("order_success"))
                window.dispatchEvent(new Event('cart:updated'))
            },
            onError: () => {
                toast.error(t("order_failed"))
            }
        })
    }

    return (
        <Container className="py-6 md:py-10">
            <Breadcrumb className="mb-6 md:mb-8">
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
                        <BreadcrumbLink href="/cart">{t("cart")}</BreadcrumbLink>
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
                        <BreadcrumbPage>{t("order_confirmation")}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="text-xl md:text-2xl font-semibold mb-4 p-4" style={{ borderRadius: '10px', border: '1px solid #F2F4F8', background: '#FFF' }}>{t("order_confirmation")}</div>
                    <div className="p-5 md:p-6 space-y-6" style={{ borderRadius: '10px', border: '1px solid #F2F4F8', background: '#FFF' }}>
                        <div className="space-y-2">
                            <div className="text-lg font-semibold">{t("payment_method")}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {accessToken && (
                                    <label className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer ${payment === 'card' ? 'border-primary' : 'border-[#F2F4F8]'}`}>
                                        <input type="radio" name="payment" className="sr-only" checked={payment === 'card'} onChange={() => setPayment('card')} />
                                        <span className="size-4 rounded-full border border-[#E4E7EC] grid place-content-center">
                                            <span className={`size-2 rounded-full ${payment === 'card' ? 'bg-primary' : 'bg-transparent'}`} />
                                        </span>
                                        <span>{t("online_payment")}</span>
                                    </label>
                                )}
                                <label className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer ${payment === 'cod' ? 'border-primary' : 'border-[#F2F4F8]'}`}>
                                    <input type="radio" name="payment" className="sr-only" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                                    <span className="size-4 rounded-full border border-[#E4E7EC] grid place-content-center">
                                        <span className={`size-2 rounded-full ${payment === 'cod' ? 'bg-primary' : 'bg-transparent'}`} />
                                    </span>
                                    <span>{t("cash_on_delivery")}</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-lg font-semibold">{t("personal_information")}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input placeholder={t("full_name")} value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                <PhoneInput
                                    country={'az'}
                                    value={phone?.replace(/^\+/, '')}
                                    onChange={(val) => setPhone(val ? `+${val}` : '')}
                                    placeholder={t("phone")}
                                    countryCodeEditable={false}
                                    inputProps={{ name: 'phone', required: true }}
                                    containerClass="w-full"
                                    inputClass="!w-full !h-9 !text-base !bg-white !border !border-[#E4E7EC] !rounded-md !pl-12 !shadow-none focus:!border-[#E4E7EC] focus:!shadow-none"
                                    buttonClass="!border !border-[#E4E7EC] !bg-white !rounded-l-md !h-9"
                                    dropdownClass="!shadow-lg"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-lg font-semibold">{t("delivery_information")}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Select value={city} onValueChange={setCity}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("city")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Bakı">Bakı</SelectItem>
                                        <SelectItem value="Gəncə">Gəncə</SelectItem>
                                        <SelectItem value="Sumqayıt">Sumqayıt</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input placeholder={t("address")} value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <Textarea placeholder={t("additional_information")} value={note} onChange={(e) => setNote(e.target.value)} />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="h-11 flex-1"
                                onClick={() => router.push('/cart')}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                className="h-11 flex-1"
                                disabled={submitOrder.isPending || items.length === 0}
                                onClick={orderAction}
                            >
                                {submitOrder.isPending ? t('processing') : t("continue")}
                            </Button>
                        </div>
                        {submitOrder.isError && (
                            <div className="text-red-500 text-sm">{t('order_failed')}</div>
                        )}
                        {submitOrder.isSuccess && (
                            <div className="text-emerald-600 text-sm">{t('order_success')}</div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 sticky top-0">
                    <div className="p-5 md:p-6 space-y-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                                {t("cart")} ({items.length} {t("products")})
                            </h3>
                            {items.length > 0 && (
                                <div className="text-sm text-gray-500">
                                    {items.reduce((sum, item) => sum + item.qty, 0)} {t("items")}
                                </div>
                            )}
                        </div>

                        {items.length > 0 ? (
                            <div className="space-y-4">
                                {items.map((i) => (
                                    <div key={i.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div className="w-16 h-16 flex-shrink-0">
                                            {i.image && i.image !== null && i.image !== 'null' ? (
                                                <Image
                                                    src={i.image}
                                                    alt={i.title}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-gray-900 line-clamp-2">{i.title}</div>
                                            <div className="text-sm text-gray-500 mt-1">{i.brand} • {i.volume}</div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm text-gray-600">Qty: {i.qty}</span>
                                                <span className="font-semibold text-gray-900">{formatCurrency(i.price)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                </svg>
                                <p className="text-gray-500 text-sm">Your cart is empty</p>
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="space-y-3">
                                <div className="h-px bg-gray-200" />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{t("total_price")}</span>
                                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                                    </div>
                                    {/* <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{t("discount")}</span>
                                        <span className="font-medium text-green-600">-{formatCurrency(0)}</span>
                                    </div> */}
                                </div>

                                <div className="h-px bg-gray-200" />

                                <div className="flex items-center justify-between text-lg font-semibold">
                                    <span className="text-gray-900">{t("total_price")}</span>
                                    <span className="text-gray-900">{formatCurrency(total)}</span>
                                </div>

                                {isBelowMinimum && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span className="text-sm text-red-700 font-medium">
                                                {t("minimum_order_amount")}: {MIN_ORDER} USD
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default Order