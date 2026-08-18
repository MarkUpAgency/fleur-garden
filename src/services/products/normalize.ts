import { Order, OrderDetailItem } from "@/types"

interface UnknownRecord {
    [key: string]: unknown
}

const str = (...candidates: unknown[]): string => {
    for (const c of candidates) {
        if (typeof c === "string" && c.trim() !== "") return c
        if (typeof c === "number") return String(c)
    }
    return ""
}

const num = (...candidates: unknown[]): number => {
    for (const c of candidates) {
        if (typeof c === "number" && !Number.isNaN(c)) return c
        if (typeof c === "string" && c.trim() !== "" && !Number.isNaN(Number(c))) return Number(c)
    }
    return 0
}

const optionalStr = (...candidates: unknown[]): string | null => {
    const value = str(...candidates)
    return value === "" ? null : value
}

const optionalNum = (...candidates: unknown[]): number | null => {
    for (const c of candidates) {
        if (typeof c === "number" && !Number.isNaN(c)) return c
        if (typeof c === "string" && c.trim() !== "" && !Number.isNaN(Number(c))) return Number(c)
    }
    return null
}

function normalizeOrderDetail(raw: unknown): OrderDetailItem {
    const r = (raw ?? {}) as UnknownRecord

    // `product` is a name string on the known endpoints, but tolerate an object
    // in case the backend starts returning the full product.
    const product = typeof r.product === "object" && r.product !== null
        ? str((r.product as UnknownRecord).name, (r.product as UnknownRecord).title)
        : str(r.product, r.product_name, r.name)

    const nested = (typeof r.product === "object" && r.product !== null
        ? (r.product as UnknownRecord)
        : {}) as UnknownRecord

    return {
        product,
        quantity: str(r.quantity, nested.quantity) || "0",
        size: num(r.size, nested.size),
        price: num(r.price, nested.price),
        total_price: num(r.total_price, r.subtotal, nested.total_price),
        image: optionalStr(r.image, nested.image),
        thumb_image: optionalStr(r.thumb_image, nested.thumb_image),
        category_image: optionalStr(r.category_image, nested.category_image),
        category_thumb_image: optionalStr(r.category_thumb_image, nested.category_thumb_image),
        slug: optionalStr(r.slug, r.product_slug, nested.slug),
    }
}

/**
 * The orders API is inconsistent about field naming (`order_status` vs
 * `order-status`) and about which optional metadata it includes, so both the
 * list and the detail page funnel their raw payloads through here.
 */
export function normalizeOrder(raw: unknown): Order {
    const o = (raw ?? {}) as UnknownRecord

    return {
        id: optionalNum(o.id, o.order_id) ?? undefined,
        address: str(o.address),
        city: str(o.city),
        note: str(o.note),
        order_status: num(o.order_status, o["order-status"]),
        payment_status: str(o.payment_status, o["payment-status"]),
        total_price: num(o.total_price, o.total),
        promocode: str(o.promocode),
        payment_type: num(o.payment_type),
        order_number: optionalStr(o.order_number, o.delivery_number, o.tracking_number, o.code),
        created_at: optionalStr(o.created_at, o.date, o.order_date),
        name: optionalStr(o.name, o.full_name, o.buyer),
        phone: optionalStr(o.phone, o.mobile),
        discount: optionalNum(o.discount, o.discount_price),
        delivery_price: optionalNum(o.delivery_price, o.delivery, o.shipping_price),
        details: Array.isArray(o.details)
            ? o.details.map(normalizeOrderDetail)
            : Array.isArray(o.products)
                ? (o.products as unknown[]).map(normalizeOrderDetail)
                : [],
    }
}
