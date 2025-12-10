import { queryOptions } from "@tanstack/react-query";
import { getBlogs, getBlogPost } from "./api";

const getBlogsQuery = (locale: string, page?: number, search?: string) => {
    return queryOptions({
        queryKey: ["blogs", locale, { page, search }],
        queryFn: () => getBlogs(locale, page, search),
    });
};

const getBlogPostQuery = (locale: string, slug: string) => {
    return queryOptions({
        queryKey: ["blogPost", locale, slug],
        queryFn: () => getBlogPost(locale, slug),
    });
};

export { getBlogsQuery, getBlogPostQuery };