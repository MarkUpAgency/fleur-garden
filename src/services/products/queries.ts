import { queryOptions } from "@tanstack/react-query";
import { filterProducts, getBrands, getCategories, getOrders, getProduct, getProductReviews, getProducts, getRelatedProducts, searchProducts } from "./api";
import { infiniteQueryOptions } from "@tanstack/react-query";
import { FilterProductsPayload } from "@/types";

const getProductsQuery = (locale: string, number?: number) => {
    return queryOptions({
        queryKey: ["products", locale, number ?? "all"],
        queryFn: () => getProducts(locale, number),
    });
};

const getSearchProductsQuery = (query: string) => {
    return queryOptions({
        queryKey: ["search-products", query],
        queryFn: () => searchProducts(query),
    });
};

const getProductQuery = (locale: string, slug: string) => {
    return queryOptions({
        queryKey: ["product", slug],
        queryFn: () => getProduct(locale, slug),
    });
};

const getRelatedProductsQuery = (locale: string, category_slug: string) => {
    return queryOptions({
        queryKey: ["related-products", category_slug],
        queryFn: () => getRelatedProducts(locale, category_slug),
    });
};

const getProductReviewsQuery = (locale: string, slug: string) => {
    return queryOptions({
        queryKey: ["product-reviews", slug],
        queryFn: () => getProductReviews(locale, slug),
    });
};

const getBrandsQuery = () => {
    return queryOptions({
        queryKey: ["brands"],
        queryFn: () => getBrands(),
    });
};

const getCategoriesQuery = () => {
    return queryOptions({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
    });
};

const filterProductsQuery = (data: FilterProductsPayload) => {
    return queryOptions({
        queryKey: ["filter-products", data],
        queryFn: () => filterProducts(data),
    });
};

const filterProductsInfiniteQuery = (data: FilterProductsPayload) => {
    return infiniteQueryOptions({
        queryKey: ["filter-products-infinite", data],
        initialPageParam: 1,
        queryFn: ({ pageParam }) => filterProducts(data, pageParam as number),
        getNextPageParam: (lastPage) => {
            const nextUrl = lastPage?.links?.next
            if (!nextUrl) return undefined
            try {
                const url = new URL(nextUrl)
                const nextPage = url.searchParams.get("page")
                return nextPage ? Number(nextPage) : undefined
            } catch {
                return undefined
            }
        },
    })
}

const getOrdersQuery = (token: string) => {
    return queryOptions({
        queryKey: ["orders"],
        queryFn: () => getOrders(token),
    });
};

export {
    getProductsQuery,
    getSearchProductsQuery,
    getProductQuery,
    getRelatedProductsQuery,
    getProductReviewsQuery,
    getBrandsQuery,
    getCategoriesQuery,
    filterProductsQuery,
    filterProductsInfiniteQuery,
    getOrdersQuery,
};