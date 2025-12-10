import { getMetaTags } from "@/services/home/api";

export async function generateMetadata() {
    const metaTagsData = await getMetaTags();
    const metaTags = metaTagsData?.data?.find((metaTag) => metaTag.title === "Blogs");

    return {
        title: metaTags?.meta_title,
        description: metaTags?.meta_desc,
        keywords: metaTags?.meta_keywords,
    };
}

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
    return (
        <>{children}</>
    )
}