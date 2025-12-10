import Container from "@/components/shared/container"
import ProductCard from "@/components/pages/home/product-card"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { getTranslations } from "next-intl/server"
import { getServerQueryClient } from "@/providers/server"
import { getSearchProductsQuery } from "@/services/products/queries"
import { Product } from "@/types"

export default async function SearchPage({ searchParams }: { searchParams: { search?: string } }) {
    const t = await getTranslations("product_grid")
    const queryClient = getServerQueryClient();

    const search = searchParams?.search ?? ""

    if (search) {
        await queryClient.prefetchQuery(getSearchProductsQuery(search))
    }
    const productsData = search ? queryClient.getQueryData(getSearchProductsQuery(search).queryKey) : undefined
    const products = productsData?.data

    return (
        <section className="w-full py-9">
            <Container>
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/" className="text-muted-foreground hover:text-foreground">
                                {t("home")}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <g clipPath="url(#clip0_295_2185)">
                                <path d="M11.3333 3.3335L4.66663 12.6668" stroke="#D3D3D7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_295_2185">
                                    <rect width="16" height="16" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-foreground font-medium">Axtarış</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="space-y-6">
                    <h1 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-2">{search ? `“${search}”` : ""} {products?.length && products?.length > 0 ? t("products_found") : t("no_products_found")}</h1>
                    {search && (
                        <p className="text-sm text-[#77777B] mb-6">{products?.length ?? 0} nəticə</p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products?.map((product: Product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}


