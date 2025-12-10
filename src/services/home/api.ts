import { get, post } from "@/lib/api";
import { ApiResponse, Review } from "@/types";
import { Slider, Banner, Partner, Contact, Social, MetaTag } from "@/types/home";

const getSliders = async (locale: string) => {
    const response = await get<ApiResponse<Slider[]>>(`sliders`, { params: { locale } });
    return response;
};

const getBanners = async (locale: string) => {
    const response = await get<ApiResponse<Banner>>(`banner`, { params: { locale } });
    return response;
};

const getPartners = async (locale: string) => {
    const response = await get<ApiResponse<Partner[]>>(`partners`, { params: { locale } });
    return response;
};

const getPartner = async (locale: string, slug: string) => {
    const response = await get<ApiResponse<Partner>>(`partner/${slug}`, { params: { locale } });
    return response;
};

const getContact = async () => {
    const response = await get<ApiResponse<Contact>>(`contact`);
    return response;
};

const getSocials = async () => {
    const response = await get<ApiResponse<Social[]>>(`sosial-media`);
    return response;
};

const subscribe = async (email: string) => {
    const response = await post<void>(`subscribe`, { email });
    return response;
};

const getAllComments = async () => {
    const response = await get<ApiResponse<Review[]>>(`all-comments`);
    return response;
};

const postContact = async (data: Contact) => {
    const response = await post<void>(`contactform`, data);
    return response;
};

const getMetaTags = async () => {
    const response = await get<ApiResponse<MetaTag[]>>(`metatags`);
    return response;
};

export { getSliders, getBanners, getPartners, getPartner, getContact, getSocials, subscribe, getAllComments, postContact, getMetaTags };