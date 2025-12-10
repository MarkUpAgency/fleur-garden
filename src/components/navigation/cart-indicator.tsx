"use client"

import React from "react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

interface CartItem {
    id: string
    title: string
    brand: string
    volume: string
    price: number
    qty: number
    selected: boolean
    image: string
}

function getCartCount(): number {
    try {
        if (typeof window === "undefined") return 0
        const raw = window.localStorage.getItem("cart")
        if (!raw) return 0
        const items: CartItem[] = JSON.parse(raw)
        if (!Array.isArray(items)) return 0
        return items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0)
    } catch {
        return 0
    }
}

export function CartIndicator() {
    const [count, setCount] = React.useState<number>(0)

    React.useEffect(() => {
        setCount(getCartCount())

        function handleStorage(e: StorageEvent) {
            if (e.key === "cart") setCount(getCartCount())
        }

        function handleCustomUpdate() {
            setCount(getCartCount())
        }

        window.addEventListener("storage", handleStorage)
        window.addEventListener("cart:updated", handleCustomUpdate as EventListener)
        return () => {
            window.removeEventListener("storage", handleStorage)
            window.removeEventListener("cart:updated", handleCustomUpdate as EventListener)
        }
    }, [])

    return (
        <Link href="/cart" className="relative inline-block">
            <Button variant="ghost" size="sm" className="p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
                    <path d="M6.00005 9V4C6.00005 3.20435 6.31612 2.44129 6.87873 1.87868C7.44133 1.31607 8.2044 1 9.00005 1C9.7957 1 10.5588 1.31607 11.1214 1.87868C11.684 2.44129 12 3.20435 12 4V9M3.33105 6H14.67C14.9584 5.99997 15.2434 6.06229 15.5054 6.1827C15.7674 6.30311 16.0003 6.47876 16.1881 6.6976C16.3759 6.91645 16.5141 7.17331 16.5933 7.45059C16.6726 7.72786 16.6909 8.01898 16.647 8.304L15.392 16.456C15.2831 17.1644 14.9241 17.8105 14.38 18.2771C13.836 18.7438 13.1428 19.0002 12.426 19H5.57405C4.85745 19 4.16453 18.7434 3.62068 18.2768C3.07683 17.8102 2.71797 17.1643 2.60905 16.456L1.35405 8.304C1.31022 8.01898 1.32854 7.72786 1.40775 7.45059C1.48697 7.17331 1.62521 6.91645 1.81299 6.6976C2.00078 6.47876 2.23367 6.30311 2.49569 6.1827C2.75772 6.06229 3.04268 5.99997 3.33105 6Z" stroke="#20201E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </Button>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] leading-4 text-center">
                    {count}
                </span>
            )}
        </Link>
    )
}

export default CartIndicator


