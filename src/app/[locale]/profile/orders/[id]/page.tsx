"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { StatusBadge } from "../page"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

interface OrderDetailsProps {
    orderId: string
    onBack: () => void
}

interface OrderDetail {
    id: string
    deliveryNumber: string
    date: string
    buyer: string
    product: {
        name: string
        brand: string
        image: string
        rating: number
    }
    volume: string
    quantity: number
    total: number
    status: "delivered" | "cancelled" | "processing"
    deliveryAddress: {
        city: string
        district: string
        street: string
    }
    paymentDetails: {
        method: string
        subtotal: number
        discount: number
        delivery: number
        finalTotal: number
    }
}

const mockOrderDetail: OrderDetail = {
    id: "1",
    deliveryNumber: "#9581347322",
    date: "25.08.2025",
    buyer: "Aysun Feyzullayeva",
    product: {
        name: "YSL Libre",
        brand: "Yves Saint Laurent",
        image: "/images/product.jpg",
        rating: 4.5,
    },
    volume: "50 Gr",
    quantity: 10,
    total: 1200,
    status: "delivered",
    deliveryAddress: {
        city: "Bakı",
        district: "Nəsimi rayonu",
        street: "Tbilisi pros.",
    },
    paymentDetails: {
        method: "Kartla ödəmə",
        subtotal: 310.6,
        discount: 10.6,
        delivery: 5,
        finalTotal: 310.6,
    },
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
    const order = mockOrderDetail
    const t = useTranslations("order")

    return (
        <div className="col-span-3 lg:pl-8 lg:px-6 mt-5 lg:mt-0 space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 p-4"
                style={{
                    borderRadius: "8px",
                    border: "1px solid #F2F4F8",
                    background: "#FFF",
                    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                }}
            >
                <Link href="/profile/orders" className="p-0 h-auto">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-medium">{t("all_orders")}</h1>
            </div>

            {/* Delivery Number */}
            <div className="space-y-4 py-9 px-8"
                style={{
                    borderRadius: "8px",
                    border: "1px solid #F2F4F8",
                    background: "#FFF",
                    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                }}
            >
                <div className="text-sm">
                    <span className="text-muted-foreground">{t("delivery_number")} : </span>
                    <span className="font-medium">{order.deliveryNumber}</span>
                </div>

                {/* Order Summary Table */}
                <div
                    style={{
                        borderRadius: "12px",
                        border: "1px solid #F2F4F8",
                        background: "#FFF",
                        boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                    }}
                >
                    <div className="grid grid-cols-5 gap-4 px-6 py-4 text-sm text-muted-foreground">
                        <div>
                            <div className="font-medium text-foreground">{t("order_date")}</div>
                            <div>{new Date(order.date).toLocaleDateString("az-AZ")}</div>
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{t("buyer")}</div>
                            <div>{order.buyer}</div>
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{t("volume")}</div>
                            <div>{order.volume}</div>
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{t("quantity")}</div>
                            <div>{order.quantity} {t("items")}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-medium text-foreground">{t("total")}</div>
                            <div>{order.total} USD</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-[#F2F4F8] px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-16 overflow-hidden rounded-md bg-muted">
                                <Image
                                    src={order.product.image}
                                    alt={order.product.name}
                                    width={64}
                                    height={80}
                                    className="h-20 w-16 object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-base font-medium">
                                    <span>{order.product.name}</span>
                                    <span className="text-amber-500">★</span>
                                    <span className="text-sm text-muted-foreground">{order.product.rating}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">{order.product.brand}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <StatusBadge status={Number(order.status)} />
                            <Button variant="secondary" className="bg-black hover:bg-black/80 text-white">{t("write_review")}</Button>
                        </div>
                    </div>
                </div >

                {/* Main Content: Delivery Address and Payment Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                    {/* Delivery Address */}
                    <div className="space-y-4 p-4"
                    style={{
                        borderRadius: "12px",
                        border: "1px solid #F2F4F8",
                        background: "#FFF",
                        boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                    }}
                    >
                        <h2 className="text-lg font-medium">{t("delivery_address")}</h2>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">Bakı</p>
                            <p className="text-sm text-muted-foreground">
                                {order.deliveryAddress.district}, {order.deliveryAddress.street}
                            </p>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-4 p-4"
                    style={{
                        borderRadius: "12px",
                        border: "1px solid #F2F4F8",
                        background: "#FFF",
                        boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                    }}
                    >
                        <h2 className="text-lg font-medium">{t("payment_details")}</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("payment_method")}</span>
                                <span className="text-sm font-medium">{order.paymentDetails.method}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("total_price")}</span>
                                <span className="text-sm">{order.paymentDetails.subtotal} USD</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("discount")}</span>
                                <span className="text-sm">{order.paymentDetails.discount} USD</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("delivery")}</span>
                                <span className="text-sm">{order.paymentDetails.delivery} USD</span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t("total_price")}</span>
                                    <span className="font-medium text-lg">{order.paymentDetails.finalTotal} USD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
