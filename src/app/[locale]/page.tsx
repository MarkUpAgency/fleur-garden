import { ProductCarousel } from "@/components/pages/home/banner";
import { CarouselWithReviews } from "@/components/pages/home/carousel-reviews";
import { BrandCarousel } from "@/components/pages/home/brand-carousel";
import ProductGrid from "@/components/pages/home/product-grid";
import { BlogSection } from "@/components/pages/home/blog-section";
import { NewsletterSubscribe } from "@/components/pages/home/newsletter-subscribe";
import { getSlidersQuery, getPartnersQuery, getAllCommentsQuery } from "@/services/home/queries";
import { getServerLocale } from "@/lib/utils";
import { getServerQueryClient } from "@/providers/server";
import { getBlogsQuery } from "@/services/blogs/queries";
import { getProductsQuery } from "@/services/products/queries";
import { Fragment } from "react";
import { getMetaTags } from "@/services/home/api";

export async function generateMetadata() {
  const metaTagsData = await getMetaTags();
  const metaTags = metaTagsData?.data?.find((metaTag) => metaTag.title === "Home");
  
  return {
    title: metaTags?.meta_title,
    description: metaTags?.meta_desc,
    keywords: metaTags?.meta_keywords,
  };
}

export default async function Home() {
  const locale = await getServerLocale();
  const queryClient = getServerQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getSlidersQuery(locale)), 
    queryClient.prefetchQuery(getPartnersQuery(locale)),
    queryClient.prefetchQuery(getBlogsQuery(locale)),
    queryClient.prefetchQuery(getProductsQuery(locale)),
    queryClient.prefetchQuery(getAllCommentsQuery()),
  ]);

  const data = queryClient.getQueryData(getSlidersQuery(locale).queryKey);
  const partnersData = queryClient.getQueryData(getPartnersQuery(locale).queryKey);
  const blogPostsData = queryClient.getQueryData(getBlogsQuery(locale).queryKey);
  const productsData = queryClient.getQueryData(getProductsQuery(locale).queryKey);
  const commentsData = queryClient.getQueryData(getAllCommentsQuery().queryKey);

  const comments = commentsData?.data || [];
  const sliders = data?.data;
  const partners = partnersData?.data;
  const blogPosts = blogPostsData?.data;
  const products = productsData?.data;

  const manyComments = [...comments, ...comments, ...comments, ...comments, ...comments];

  return (
    <Fragment>
      <ProductCarousel sliders={sliders || []} />
      <BrandCarousel partners={partners || []} />
      <ProductGrid locale={locale} products={products || []} />
      {/* {banner ? <HeroBanner banner={banner} /> : null}   */}
      <BlogSection blogPosts={blogPosts || []} />
      <CarouselWithReviews comments={manyComments || []} />
      <NewsletterSubscribe />
    </Fragment>
  );
}
