"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import Container from "@/components/shared/container"
import ProductCard from "./product-card"
import { Link } from "@/i18n/navigation"
import { Product } from "@/types"
import { getProductsQuery } from "@/services/products/queries"

interface ProductGridProps {
    locale: string
    products: Product[]
}

export default function ProductGrid({ locale, products }: ProductGridProps) {
    const t = useTranslations("product_grid")
    const [selectedNumber, setSelectedNumber] = useState<number | undefined>(undefined)

    const { data, isLoading, isError } = useQuery(getProductsQuery(locale, selectedNumber))

    const resultProducts = data?.data ?? products

    const heading = selectedNumber === undefined ? t("title") : selectedNumber === 2 ? t("discount") : t("on_sale")

    return (
        <Container className="py-8 md:py-[72px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <h1 className= "text-[28px] md:text-4xl font-medium text-primary">{heading}</h1>
                <nav className="flex items-center gap-6 w-full md:w-auto min-w-0 overflow-x-auto whitespace-nowrap md:mt-0 mt-4">
                    <button
                        className={`relative flex items-center gap-2 text-sm md:text-base font-medium ${selectedNumber === undefined ? "text-primary" : "text-gray-500 hover:text-primary transition-colors"}`}
                        onClick={() => setSelectedNumber(undefined)}
                    >
                        {selectedNumber === undefined ? <div className={`w-2 h-2 rounded-full bg-primary`} /> : null}
                        <span>{t("title")}</span>
                    </button>
                    <button
                        className={`${selectedNumber === 2 ? "text-primary" : "text-gray-500 hover:text-primary transition-colors"} flex items-center gap-2 text-sm md:text-base font-medium`}
                        onClick={() => setSelectedNumber(2)}
                    >
                        {selectedNumber === 2 ? <div className={`w-2 h-2 rounded-full bg-primary`} /> : null}
                        {t("discount")}
                    </button>
                    <button
                        className={`flex items-center gap-2 text-sm md:text-base font-medium ${selectedNumber === 3 ? "text-primary" : "text-gray-500 hover:text-primary transition-colors"}`}
                        onClick={() => setSelectedNumber(3)}
                    >
                        {selectedNumber === 3 ? <div className={`w-2 h-2 rounded-full bg-primary`} /> : null}
                        {t("on_sale")}
                    </button>
                </nav>
            </div>

            {/* States */}
            {isError ? (
                <div className="text-sm text-red-500 mb-4">{t("error")}</div>
            ) : null}

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 md:gap-8 gap-4 mb-8">
                {resultProducts.length > 0 ? (isLoading && !data ? products : resultProducts).map((product) => (
                    <ProductCard key={product.id} product={product} />
                )
                ) : (
                    <div className="text-gray-500 bg-gray-100 rounded-md p-4 w-full col-span-4 text-center text-sm md:text-base font-medium">
                        {t("no_products")}
                    </div>
                )}
            </div>

            {/* Load More Button */}
            {resultProducts.length > 0 && (
                <div className="flex justify-center">
                    <Link href={`/products?type=${selectedNumber === undefined ? 1 : selectedNumber}`} className="border border-black text-sm text-primary px-8 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors">
                        {t("more")}
                    </Link>
                </div>
            )}
        </Container>
    )
}
