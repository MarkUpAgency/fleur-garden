import { get } from "@/lib/api";
import { ApiResponse } from "@/types";
import { Blog } from "@/types/blogs";

const getBlogs = async (locale: string, page?: number, search?: string) => {
    const response = await get<ApiResponse<Blog[]>>(`blogs`, { params: { locale, page, search } });
    return response;
};

// The blog detail endpoint returns a nested shape with the blog item under data.data
// and a sibling key named "other-blogs". Normalize this here for easier consumption.
interface RawBlogDetailResponse {
    data?: {
        data?: Blog;
        "other-blogs"?: Blog[];
    };
}

export interface BlogDetailNormalized {
    data: Blog;
    otherBlogs: Blog[];
}

const getBlogPost = async (locale: string, slug: string): Promise<BlogDetailNormalized> => {
    const raw = await get<RawBlogDetailResponse>(`blog/${slug}`, { params: { locale } });
    const blog: Blog | undefined = raw?.data?.data;
    const otherBlogs: Blog[] = raw?.data?.["other-blogs"] ?? [];
    return { data: blog as Blog, otherBlogs };
};

export { getBlogs, getBlogPost };