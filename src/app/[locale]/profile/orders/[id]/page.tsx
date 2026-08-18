import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { StatusBadge } from "../page"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { getServerQueryClient } from "@/providers/server"
import { getOrderQuery } from "@/services/products/queries"
import { normalizeOrder } from "@/services/products/normalize"
import { getProductImage } from "@/lib/utils"
import { OrderDetailItem } from "@/types"

const cardStyle = {
    borderRadius: "12px",
    border: "1px solid #F2F4F8",
    background: "#FFF",
    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
}

const headerStyle = {
    borderRadius: "8px",
    border: "1px solid #F2F4F8",
    background: "#FFF",
    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
}

async function OrderLine({ item }: { item: OrderDetailItem }) {
    const t = await getTranslations("order")
    // Order lines carry only a product name on the current API; an image shows
    // up only if the backend enriches them.
    const image = getProductImage(item)

    return (
        <div className="flex items-center justify-between gap-4 border-t border-[#F2F4F8] px-6 py-5">
            <div className="flex items-center gap-4">
                <div className="h-20 w-16 overflow-hidden rounded-md bg-muted flex-shrink-0">
                    {image ? (
                        <Image
                            src={image}
                            alt={item.product}
                            width={64}
                            height={80}
                            className="h-20 w-16 object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-[#F2F4F8] flex items-center justify-center">
                            <span className="text-[#77777B] text-[10px] text-center px-1">No Image</span>
                        </div>
                    )}
                </div>
                <div>
                    <div className="text-base font-medium">
                        {item.slug ? (
                            <Link href={`/products/${item.slug}`} className="hover:underline">
                                {item.product || "-"}
                            </Link>
                        ) : (
                            <span>{item.product || "-"}</span>
                        )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {item.size ? `${item.size} Gr` : "-"} · {item.quantity} {t("items")}
                    </div>
                </div>
            </div>

            <div className="text-sm font-medium whitespace-nowrap">
                {item.total_price || item.price} USD
            </div>
        </div>
    )
}

export default async function OrderDetails({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const t = await getTranslations("order")

    const token = (await cookies()).get("access_token")?.value as string
    const queryClient = getServerQueryClient()

    await queryClient.prefetchQuery(getOrderQuery(id, token))
    const response = queryClient.getQueryData(getOrderQuery(id, token).queryKey)

    const raw = (response as { data?: unknown } | undefined)?.data
    if (!raw) {
        notFound()
    }

    const order = normalizeOrder(raw)

    const quantityTotal = order.details.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0)
    const firstItem = order.details[0]
    const volume = firstItem?.size ? `${firstItem.size} Gr` : "-"
    const orderNumber = order.order_number ?? (order.id ? `#${order.id}` : "-")
    const orderDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString("az-AZ")
        : "-"
    const buyer = order.name || order.address || "-"
    const paymentMethod = order.payment_type === 1 ? t("online_payment") : t("cash_on_delivery")
    const itemsTotal = order.details.reduce((sum, d) => sum + (Number(d.total_price) || 0), 0)

    return (
        <div className="col-span-3 lg:pl-8 lg:px-6 mt-5 lg:mt-0 space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 p-4" style={headerStyle}>
                <Link href="/profile/orders" className="p-0 h-auto">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-medium">{t("all_orders")}</h1>
            </div>

            <div className="space-y-4 py-9 px-8" style={headerStyle}>
                <div className="text-sm">
                    <span className="text-muted-foreground">{t("delivery_number")} : </span>
                    <span className="font-medium">{orderNumber}</span>
                </div>

                {/* Order Summary */}
                <div style={cardStyle}>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4 text-sm text-muted-foreground">
                        <div>
                            <div className="font-medium text-foreground">{t("order_date")}</div>
                            <div>{orderDate}</div>
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{t("buyer")}</div>
                            <div>{buyer}</div>
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{t("volume")}</div>
                            <div>{volume}</div>
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{t("quantity")}</div>
                            <div>{quantityTotal} {t("items")}</div>
                        </div>
                        <div className="md:text-right">
                            <div className="font-medium text-foreground">{t("total")}</div>
                            <div>{order.total_price} USD</div>
                        </div>
                    </div>

                    {order.details.map((item, idx) => (
                        <OrderLine key={`${item.product}-${item.size}-${idx}`} item={item} />
                    ))}

                    <div className="flex items-center justify-between gap-4 border-t border-[#F2F4F8] px-6 py-5">
                        <StatusBadge status={order.order_status} />
                        <Button variant="secondary" className="bg-black hover:bg-black/80 text-white">
                            {t("write_review")}
                        </Button>
                    </div>
                </div>

                {/* Delivery Address and Payment Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-4 p-4" style={cardStyle}>
                        <h2 className="text-lg font-medium">{t("delivery_address")}</h2>
                        <div className="space-y-2">
                            <p className="text-sm font-medium">{order.city || "-"}</p>
                            <p className="text-sm text-muted-foreground">{order.address || "-"}</p>
                            {order.note ? (
                                <p className="text-sm text-muted-foreground">{order.note}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="space-y-4 p-4" style={cardStyle}>
                        <h2 className="text-lg font-medium">{t("payment_details")}</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("payment_method")}</span>
                                <span className="text-sm font-medium">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t("total_price")}</span>
                                <span className="text-sm">{itemsTotal || order.total_price} USD</span>
                            </div>
                            {order.discount ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t("discount")}</span>
                                    <span className="text-sm">{order.discount} USD</span>
                                </div>
                            ) : null}
                            {order.promocode ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t("promocode")}</span>
                                    <span className="text-sm">{order.promocode}</span>
                                </div>
                            ) : null}
                            {order.delivery_price !== null ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">{t("delivery")}</span>
                                    <span className="text-sm">{order.delivery_price} USD</span>
                                </div>
                            ) : null}
                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{t("total_price")}</span>
                                    <span className="font-medium text-lg">{order.total_price} USD</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
