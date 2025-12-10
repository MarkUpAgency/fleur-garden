import { queryOptions } from "@tanstack/react-query";
import { getSliders, getBanners, getPartners, getPartner, getContact, getSocials, getAllComments, getMetaTags } from "./api";

const getSlidersQuery = (locale: string) => {
    return queryOptions({
        queryKey: ["sliders"],
        queryFn: () => getSliders(locale),
    });
}

const getBannersQuery = (locale: string) => {
    return queryOptions({
        queryKey: ["banners"],
        queryFn: () => getBanners(locale),
    });
}

const getPartnersQuery = (locale: string) => {
    return queryOptions({
        queryKey: ["partners"],
        queryFn: () => getPartners(locale),
    });
}

const getPartnerQuery = (locale: string, slug: string) => {
    return queryOptions({
        queryKey: ["partner", slug],
        queryFn: () => getPartner(locale, slug),
    });
}

const getContactQuery = () => {
    return queryOptions({
        queryKey: ["contact"],
        queryFn: () => getContact(),
    });
}

const getSocialsQuery = () => {
    return queryOptions({
        queryKey: ["socials"],
        queryFn: () => getSocials(),
    });
}

const getAllCommentsQuery = () => {
    return queryOptions({
        queryKey: ["all-comments"],
        queryFn: () => getAllComments(),
    });
}

const getMetaTagsQuery = () => {
    return queryOptions({
        queryKey: ["meta-tags"],
        queryFn: () => getMetaTags(),
    });
}

export { getSlidersQuery, getBannersQuery, getPartnersQuery, getPartnerQuery, getContactQuery, getSocialsQuery, getAllCommentsQuery, getMetaTagsQuery };