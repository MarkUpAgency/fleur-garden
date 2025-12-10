import { get, post } from "@/lib/api";
import { ApiResponse, User, AuthLoginResponse, AuthRegisterResponse, UpdateUserPayload } from "@/types";

const login = async (email: string, password: string) => {
    const response = await post<AuthLoginResponse>(`login`, { email, password });
    return response;
};

const register = async (name: string, email: string, password: string) => {
    const response = await post<AuthRegisterResponse>(`register`, { name, email, password });
    return response;
};

const logout = async () => {
    const response = await get<ApiResponse<void>>(`logout`);
    return response;
};

const getUser = async (token: string) => {
    const response = await get<ApiResponse<User>>(`get-user`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

const updateUser = async (data: UpdateUserPayload) => {
    const response = await post<ApiResponse<void>>(`update`, data);
    return response;
};

const updatePassword = async (data: { old_password: string, password_confirmation: string,password: string }) => {
    const response = await post<ApiResponse<void>>(`update-password`, data);
    return response;
};

export { login, register, logout, getUser, updateUser, updatePassword };