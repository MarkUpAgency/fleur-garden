import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout, updatePassword, updateUser } from "./api";
import { AuthLoginResponse, UpdateUserPayload } from "@/types";
import { loginAction, logoutAction, registerAction } from "./server-actions";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

const LoginMutation = (email: string, password: string) => {
    return useMutation<AuthLoginResponse, unknown, void>({
        mutationFn: async () => {
            const result = await loginAction(email, password)
            return result
        },
    });
};

const RegisterMutation = (name: string, email: string, password: string) => {
    return useMutation({
        mutationFn: async () => {
            const result = await registerAction(name, email, password)
            return result
        },
    });
};

const LogoutMutation = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    return useMutation({
        mutationFn: () => logout(),
        onSuccess: () => {
            logoutAction()
            queryClient.invalidateQueries({ queryKey: ["user"] });
            router.push("/");
            router.refresh();
            toast.success("Hesabdan çıxış oldu");
        },
        onError: (error) => {
            const errorMessage = error.message || "Naməlum bir xəta baş verdi.";
            toast.error(errorMessage);
        },
    });
};

const UpdateUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateUserPayload) => updateUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Profil məlumatları yeniləndi");
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "Yeniləmə zamanı xəta baş verdi";
            toast.error(message);
        }
    });
};

const UpdatePasswordMutation = () => {
    return useMutation({
        mutationFn: (data: { old_password: string, password_confirmation: string, password: string }) => updatePassword(data),
    });
};

export { LoginMutation, RegisterMutation, LogoutMutation, UpdateUserMutation, UpdatePasswordMutation };