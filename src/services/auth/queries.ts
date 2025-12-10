import { queryOptions } from "@tanstack/react-query";
import { getUser } from "./api";

const getUserQuery = (token: string) => {
    return queryOptions({
        queryKey: ["user"],
        queryFn: () => getUser(token),
    });
};

export { getUserQuery };