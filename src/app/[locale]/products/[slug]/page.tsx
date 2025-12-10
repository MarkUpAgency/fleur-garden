import Container from "@/components/shared/container"
import { Link } from "@/i18n/navigation"

import ProductInfoTabs from "@/components/pages/products/product-info-tabs"
import RelatedProducts from "@/components/pages/products/related-products"
import { getTranslations } from "next-intl/server"
import { getServerLocale } from "@/lib/utils"
import { getServerQueryClient } from "@/providers/server"
import { getProductQuery, getProductReviewsQuery, getRelatedProductsQuery } from "@/services/products/queries"
import ProductContainer from "@/components/pages/products/product-container"

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("product_page")
  const locale = await getServerLocale();
  const queryClient = getServerQueryClient();

  await queryClient.prefetchQuery(getProductQuery(locale, slug));
  await queryClient.prefetchQuery(getProductReviewsQuery(locale, slug));
  const productData = queryClient.getQueryData(getProductQuery(locale, slug).queryKey);
  const productReviewsData = queryClient.getQueryData(getProductReviewsQuery(locale, slug).queryKey);
  const product = productData?.data;
  const productReviews = productReviewsData?.data;

  const categorySlug = product?.category_slug;
  if (categorySlug) {
    await queryClient.prefetchQuery(getRelatedProductsQuery(locale, categorySlug));
  }

  const relatedProductsData = categorySlug
    ? queryClient.getQueryData(getRelatedProductsQuery(locale, categorySlug).queryKey)
    : undefined;
  const relatedProducts = relatedProductsData?.data;

  return (
    <div className="bg-white py-6">
      {/* Breadcrumb */}
      <Container>
        <div className="text-sm text-gray-600 mb-6">
          <Link href="/">{t("home")}</Link>
          <span className="mx-2">/</span>
          <span>{product?.name}</span>
        </div>

        <div>
          <ProductContainer product={product!} />

          {/* Product Information Tabs */}
          <ProductInfoTabs product={product!} reviews={productReviews || []} />

          {/* Related Products */}
          {relatedProducts ? <RelatedProducts products={relatedProducts.slice(0, 4)} /> : null}
        </div>
      </Container>
    </div>
  )
}
