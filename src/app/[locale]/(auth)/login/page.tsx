"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { loginAction } from "@/services/auth/server-actions"
import { toast } from "sonner"
import { Link, useRouter } from "@/i18n/navigation"

interface FloatingFieldProps {
    id: string
    label: string
    children: React.ReactNode
    className?: string
}

function FloatingField({ id, label, children, className }: FloatingFieldProps) {
    return (
        <div className={`relative ${className ?? ''}`}>
            {children}
            <Label htmlFor={id} className={'pointer-events-none bg-white absolute left-3 -top-2 px-1 text-xs text-foreground'}>
                {label}
            </Label>
        </div>
    )
}

export default function LoginSheet() {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()
    const t = useTranslations("login")

    const LoginSchema = z.object({
        email: z.string().email({ message: "Düzgün email daxil edin" }),
        password: z.string().min(6, { message: "Şifrə minimum 6 simvol olmalıdır" }),
        remember: z.boolean().optional(),
    })

    type LoginFormValues = z.infer<typeof LoginSchema>

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
        mode: "onSubmit",
    })

    async function onSubmit(values: LoginFormValues) {
        try {
            await loginAction(values.email, values.password)
            toast.success(t("login"))
            router.push("/")
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Giriş uğursuz oldu"
            toast.error(message)
        }
    }

    return (
        <section className="w-full pt-20 md:pt-0 h-full flex items-center justify-center pb-12 md:pb-12 px-4 md:px-0">
            <div className={`border border-[#D3D3D7] rounded-[20px] py-12 px-4 md:px-[90px] w-full max-w-[580px] bg-white flex flex-col transform transition-transform duration-300 ease-out`}>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {t("login")}
                    </h2>
                </div>

                {/* Login Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingField id="email" label={t("email")}>
                                            <Input
                                                type="email"
                                                placeholder={t("email_placeholder")}
                                                className="w-full h-12 px-4 border border-[#AEAEB2] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                {...field}
                                            />
                                        </FloatingField>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingField id="password" label={t("password")}>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder={t("password_placeholder")}
                                                className="w-full h-12 px-4 pr-12 border border-[#AEAEB2] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                        </FloatingField>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Remember Me & Forgot Password */}
                        <div className="flex justify-end">
                            <Link href="/forgot-password" type="button" className="text-sm text-primary hover:underline hover:text-primary/80">
                                {t("forgot_password")}
                            </Link>
                        </div>

                        {/* Login Button */}
                        <Button
                            className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium"
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? t("loading") : t("login")}
                        </Button>

                        {/* Register Link */}
                        <div className="text-center">
                            <span className="text-sm text-gray-600">
                                {t("no_account")} {" "}
                            </span>
                            <button
                                type="button"
                                className="text-sm text-primary hover:text-primary/80 font-medium"
                                onClick={() => router.push("/register")}
                            >
                                {t("register_link")}
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </section>
    )
}