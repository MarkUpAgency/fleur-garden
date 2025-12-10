import { queryOptions } from "@tanstack/react-query";
import { getAbout, getAdvantages, getFaq, getContact, getFranchises } from "./api";

const getAboutQuery = (locale: string) => {
    return queryOptions({
        queryKey: ["about"],
        queryFn: () => getAbout(locale),
    });
};

const getAdvantagesQuery = (locale: string) => {
    return queryOptions({
        queryKey: ["advantages"],
        queryFn: () => getAdvantages(locale),
    });
};

const getFaqQuery = (locale: string, token: string) => {
    return queryOptions({
        queryKey: ["faq"],
        queryFn: () => getFaq(locale, token),
    });
};

const getContactQuery = (locale: string) => {
    return queryOptions({
        queryKey: ["contact"],
        queryFn: () => getContact(locale),
    });
};

const getFranchisesQuery = () => {
    return queryOptions({
        queryKey: ["franchises"],
        queryFn: () => getFranchises(),
    });
};

export { getAboutQuery, getAdvantagesQuery, getFaqQuery, getContactQuery, getFranchisesQuery };   