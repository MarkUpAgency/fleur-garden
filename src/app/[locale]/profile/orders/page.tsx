"use server"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getServerQueryClient } from "@/providers/server"
import { getOrdersQuery } from "@/services/products/queries"
import { cookies } from "next/headers"
import { Order as ApiOrder } from "@/types"

export async function StatusBadge({ status }: { status: number }) {
    const t = await getTranslations("order")
    if (status === 1)
        return (
            <div className="inline-flex items-center gap-2">
                <Check color="#34C759" size={20} />
                <span>{t("delivered")}</span>
            </div>
        )
    if (status === 0)
        return <span className="text-amber-600">{t("processing")}</span>
    return <span className="text-rose-600">{t("cancelled")}</span>
}

async function OrderCard({ order }: { order: ApiOrder }) {
    const t = await getTranslations("order")
    const firstItem = order.details?.[0]
    const quantityTotal = Array.isArray(order.details)
        ? order.details.reduce((sum, d) => sum + (Number(d.quantity) || 0), 0)
        : 0
    const recipient = order.address || order.city || "-"
    const volume = firstItem?.size ? `${firstItem.size} Gr` : "-"
    const productTitle = firstItem?.product || "-"
    const rating = 0

    return (
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
                    <div className="font-medium text-foreground">{t("promocode")}</div>
                    <div>{order.promocode || "-"}</div>
                </div>
                <div>
                    <div className="font-medium text-foreground">{t("recipient")}</div>
                    <div>{recipient}</div>
                </div>
                <div>
                    <div className="font-medium text-foreground">{t("volume")}</div>
                    <div>{volume}</div>
                </div>
                <div>
                    <div className="font-medium text-foreground">{t("quantity")}</div>
                    <div>{quantityTotal} {t("items")}</div>
                </div>
                <div className="text-right">
                    <div className="font-medium text-foreground">{t("total")}</div>
                    <div>{order.total_price} USD</div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#F2F4F8] px-6 py-5">
                <div className="flex gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-base font-medium">
                            <span>{productTitle}</span>
                            <span className="text-amber-500">★</span>
                            <span className="text-sm text-muted-foreground">{rating}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">{order.payment_status || ""}</div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <StatusBadge status={order.order_status} />
                    <Button disabled variant="secondary" className="bg-black hover:bg-black/80 text-white">{t("order_details")}</Button>
                </div>
            </div>
        </div >
    )
}

export default async function OrdersList() {
    const queryClient = getServerQueryClient();
    const token = (await cookies()).get("access_token")?.value as string;
    await Promise.all([queryClient.prefetchQuery(getOrdersQuery(token))]);
    const ordersData = queryClient.getQueryData(getOrdersQuery(token).queryKey);

    const rawOrders = (ordersData as { data?: unknown })?.data as unknown[] | undefined
    const orders: ApiOrder[] | undefined = rawOrders?.map((o) => normalizeOrder(o as UnknownRecord))

    const t = await getTranslations("order")

    return (
        <div className="w-full col-span-3 lg:pl-8 lg:px-6 mt-5 lg:mt-0 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4"
                style={{
                    borderRadius: "8px",
                    border: "1px solid #F2F4F8",
                    background: "#FFF",
                    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                }}
            >
                <h1 className="text-xl font-medium">{t("orders")}</h1>
                <Select value="7">
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder={t("time_range")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">{t("last_7_days")}</SelectItem>
                        <SelectItem value="30">{t("last_30_days")}</SelectItem>
                        <SelectItem value="90">{t("last_90_days")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-6">
                {orders?.map((order, idx) => (
                    <OrderCard key={`${order.promocode || "order"}-${idx}`} order={order} />
                ))}
            </div>
        </div>
    )
}

interface UnknownRecord {
    [key: string]: unknown
}

function normalizeOrder(o: UnknownRecord): ApiOrder {
    return {
        address: (o?.address as string | null) ?? "",
        city: (o?.city as string | null) ?? "",
        note: (o?.note as string | null) ?? "",
        order_status: Number((o?.order_status as number | string | undefined) ?? (o?.["order-status"] as number | string | undefined) ?? 0),
        payment_status: (o?.payment_status as string | null) ?? (o?.["payment-status"] as string | null) ?? "",
        total_price: Number((o?.total_price as number | string | undefined) ?? 0),
        promocode: (o?.promocode as string | null) ?? "",
        payment_type: Number((o?.payment_type as number | string | undefined) ?? 0),
        details: Array.isArray(o?.details)
            ? (o.details as unknown[]).map((d) => {
                const r = d as UnknownRecord
                return {
                    product: String((r?.product as string | undefined) ?? ""),
                    quantity: String((r?.quantity as string | number | undefined) ?? "0"),
                    size: Number((r?.size as number | string | undefined) ?? 0),
                    price: Number((r?.price as number | string | undefined) ?? 0),
                    total_price: Number((r?.total_price as number | string | undefined) ?? 0),
                }
            })
            : [],
    }
}
