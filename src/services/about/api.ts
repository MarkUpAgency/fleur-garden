import { ApiResponse } from "@/types";
import { get } from "@/lib/api";
import { Advantage, About, Faq, Contact } from "@/types/home";

const getAbout = async (locale: string) => {
    const response = await get<ApiResponse<About>>(`about`, { params: { locale } });
    return response;
};

const getAdvantages = async (locale: string) => {
    const response = await get<ApiResponse<Advantage[]>>(`advantages`, { params: { locale } });
    return response;
};

const getFaq = async (locale: string, token: string) => {
    const response = await get<ApiResponse<Faq[]>>(`faqs`, { params: { locale }, headers: { Authorization: `Bearer ${token}` } });
    return response;
};

const getContact = async (locale: string) => {
    const response = await get<ApiResponse<Contact>>(`contact`, { params: { locale } });
    return response;
};

const getFranchises = async () => {
    const response = await get<ApiResponse<About>>(`franchises`);
    return response;
};

export { getAbout, getAdvantages, getFaq, getContact, getFranchises };