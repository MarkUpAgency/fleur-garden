import Container from "@/components/shared/container"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { getTranslations } from "next-intl/server"
import { getServerQueryClient } from "@/providers/server"
import { getCategoriesQuery, getBrandsQuery } from "@/services/products/queries"
import ProductsClient from "../../../components/pages/products/products-client"

export default async function ProductsPage() {
    const t = await getTranslations("product_grid")
    const queryClient = getServerQueryClient();

    await Promise.all([
        queryClient.prefetchQuery(getBrandsQuery()),
        queryClient.prefetchQuery(getCategoriesQuery()),
    ]);

    const brandsData = queryClient.getQueryData(getBrandsQuery().queryKey);
    const brands = brandsData?.data;

    const categoriesData = queryClient.getQueryData(getCategoriesQuery().queryKey);
    const categories = categoriesData?.data;

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
                            <BreadcrumbPage className="text-foreground font-medium">{t("products")}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <ProductsClient brands={brands || []} categories={categories || []} />
            </Container>
        </section>
    )
}
