"use client"

import { useEffect, useMemo, useRef } from "react"
import ProductCard from "@/components/pages/home/product-card"
import FilterSidebar from "@/components/pages/products/filter-sidebar"
import { useTranslations } from "next-intl"
import { Brand, Category, FilterProductsPayload, Product } from "@/types"
import { useSearchParams } from "next/navigation"
import { useInfiniteQuery } from "@tanstack/react-query"
import { filterProductsInfiniteQuery } from "@/services/products/queries"
import { Loader2 } from "lucide-react"

interface ProductsClientProps {
    brands: Brand[]
    categories: Category[]
}

export default function ProductsClient({ brands, categories }: ProductsClientProps) {
    const t = useTranslations("product_grid")
    const searchParams = useSearchParams()
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    const brand_id = Number(searchParams.get("brand_id") || 0)
    const categoryParamValues = searchParams.getAll("category_id")
    const categoryParamCsv = searchParams.get("category_id")
    const category_ids: number[] = (
        categoryParamValues.length > 0 ? categoryParamValues : (categoryParamCsv ? [categoryParamCsv] : [])
    )
        .flatMap((v) => v.split(","))
        .map((v) => Number(v))
        .filter((n) => !Number.isNaN(n))
    const min_price = Number(searchParams.get("min_price") || 0)
    const max_price = Number(searchParams.get("max_price") || 5600)
    const type = Number(searchParams.get("type") || 0)

    const filters: FilterProductsPayload = {
        brand_id,
        category_id: category_ids,
        min_price,
        max_price,
        stock: 0,
        type,
    }

    const isAnyFilterActive = brand_id > 0 || category_ids.length > 0 || min_price > 0 || max_price < 5600 || type > 0

    const query = useInfiniteQuery({
        ...filterProductsInfiniteQuery(filters),
        enabled: isAnyFilterActive,
    })

    const products: Product[] = useMemo(() => {
        return query.data?.pages.flatMap(p => p.data) ?? []
    }, [query.data])

    const productsCount = products?.length ?? 0

    const brandId = brand_id
    const selectedCategoryId = category_ids[0]
    const typeId = type
    const categoryName = useMemo(() => {
        if (!selectedCategoryId || selectedCategoryId <= 0) return ""

        const findInSubcategories = (
            subs: { id: number; name: string; slug: string }[],
            id: number
        ): string => {
            for (const sub of subs) {
                if (sub.id === id) return sub.name
            }
            return ""
        }

        const findCategoryName = (items: Category[], id: number): string => {
            for (const item of items) {
                if (item.id === id) return item.name
                if (item.category && item.category.length > 0) {
                    const found = findInSubcategories(item.category, id)
                    if (found) return found
                }
            }
            return ""
        }

        return findCategoryName(categories, selectedCategoryId)
    }, [categories, selectedCategoryId])

    const brandName = useMemo(() => {
        if (!brandId || brandId <= 0) return ""
        return brands.find(b => b.id === brandId)?.name ?? ""
    }, [brands, brandId])

    const dynamicTitle = useMemo(() => {
        if (brandName && categoryName) return `${brandName} — ${categoryName}`
        if (categoryName) return categoryName
        if (brandName) return brandName
        if (typeId) return typeId === 1 ? t("title") : typeId === 2 ? t("discount") : t("on_sale")
    }, [brandName, categoryName, typeId, t])

    const { hasNextPage, isFetchingNextPage, fetchNextPage } = query

    useEffect(() => {
        if (!sentinelRef.current) return
        const el = sentinelRef.current
        const observer = new IntersectionObserver((entries) => {
            const first = entries[0]
            if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }, { rootMargin: "200px" })
        observer.observe(el)
        return () => observer.unobserve(el)
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 items-start gap-6">
            <FilterSidebar brands={brands} categories={categories} isFetching={query.isFetching || query.isFetchingNextPage} />

            <div className="space-y-6 md:col-span-3">
                <h1 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-2">{dynamicTitle}</h1>
                <p className="text-sm text-[#77777B] mb-6">{productsCount} {t("products_found")}</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 md:gap-6 gap-4">
                    {products?.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                <div ref={sentinelRef} />
                {query.isFetchingNextPage && (
                    <div className="flex justify-center pt-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /></div>
                )}
                {!query.hasNextPage && productsCount > 0 && (
                    <div className="flex justify-center pt-2 text-sm text-muted-foreground">{t("no_more")}</div>
                )}
            </div>
        </div>
    )
}