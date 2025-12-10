"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { forgotPasswordAction, verifyForgotPasswordAction } from "@/services/auth/server-actions"
import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

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

export default function ForgotPassword() {
    const t = useTranslations("forgot_password")

    const [isCodeSent, setIsCodeSent] = useState(false)
    const [remainingSeconds, setRemainingSeconds] = useState(60)
    const router = useRouter()
    const { locale } = useParams<{ locale: string }>()

    const ForgotPasswordSchema = useMemo(() =>
        z.object({
            value: z.string().email({ message: "Düzgün email daxil edin" }),
            code: z
                .string()
                .optional()
                .refine(
                    (val) => !isCodeSent || (!!val && val.replace(/\s/g, "").length === 6),
                    { message: "6 rəqəmli kodu daxil edin" }
                ),
        })
        , [isCodeSent])

    type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            value: "",
            code: "",
        },
        mode: "onSubmit",
    })

    useEffect(() => {
        if (!isCodeSent) return
        setRemainingSeconds(60)
        const id = setInterval(() => {
            setRemainingSeconds((s) => {
                if (s <= 1) {
                    clearInterval(id)
                    return 0
                }
                return s - 1
            })
        }, 1000)
        return () => clearInterval(id)
    }, [isCodeSent])

    async function handleResend() {
        const value = form.getValues("value")
        if (!value) return
        try {
            await forgotPasswordAction(value)
            setRemainingSeconds(60)
            toast.success(t("success"))
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Şifrə sıfırlama uğursuz oldu"
            toast.error(message)
        }
    }

    async function onSubmit(values: ForgotPasswordFormValues) {
        try {
            if (!isCodeSent) {
                await forgotPasswordAction(values.value)
                setIsCodeSent(true)
                toast.success(t("success"))
                return
            }

            const code = (values.code ?? "").replace(/\s/g, "")
            await verifyForgotPasswordAction(values.value, code)
            toast.success("Kod təsdiqləndi")
            router.push(`/${locale}/password-reset?code=${code}`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Şifrə sıfırlama uğursuz oldu"
            toast.error(message)
        }
    }

    return (
        <section className="w-full pt-20 md:pt-0 h-full flex items-center justify-center pb-12 md:pb-12 px-4 md:px-0">
            <div className={`border border-[#D3D3D7] rounded-[20px] py-12 px-4 md:px-[90px] w-full max-w-[580px] bg-white flex flex-col transform transition-transform duration-300 ease-out`}>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        {t("forgot_password")}
                    </h2>
                    <p className="text-[#77777B] text-left">{t("description")}</p>
                </div>

                {/* Forgot Password Form */}
                <Form {...form}>
                    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingField id="value" label={t("email")}>
                                            <Input
                                                type="email"
                                                placeholder={t("email_placeholder")}
                                                className="w-full h-12 px-4 border border-[#AEAEB2] rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                disabled={isCodeSent || form.formState.isSubmitting}
                                                {...field}
                                            />
                                        </FloatingField>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isCodeSent && (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {t("otp_description", { default: "Sizin mailinizə təsdiq kodu göndərilmişdir. Zəhmət olmasa həmin kodu daxil edin." })}
                                </p>
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <InputOTP
                                                    maxLength={6}
                                                    value={field.value}
                                                    onChange={(val) => field.onChange(val.replace(/\D/g, "").slice(0, 6))}
                                                >
                                                    <InputOTPGroup className="gap-3">
                                                        <InputOTPSlot index={0} className="h-14 w-14 text-lg rounded-sm" />
                                                        <InputOTPSlot index={1} className="h-14 w-14 text-lg rounded-sm border" />
                                                        <InputOTPSlot index={2} className="h-14 w-14 text-lg rounded-sm border" />
                                                        <InputOTPSlot index={3} className="h-14 w-14 text-lg rounded-sm border" />
                                                        <InputOTPSlot index={4} className="h-14 w-14 text-lg rounded-sm border" />
                                                        <InputOTPSlot index={5} className="h-14 w-14 text-lg rounded-sm border" />
                                                    </InputOTPGroup>
                                                </InputOTP>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="text-center text-base font-medium">
                                    {`0:${String(remainingSeconds).padStart(2, "0")}`}
                                </div>

                                <div className="text-center text-muted-foreground">
                                    <span className="mr-2">{t("didnt_get_code", { default: "Kodu almadınız?" })}</span>
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={remainingSeconds > 0}
                                        className="text-foreground disabled:text-muted-foreground underline"
                                    >
                                        {t("resend", { default: "Yenidən göndər" })}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Button */}
                        <Button
                            className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium"
                            type="submit"
                            disabled={form.formState.isSubmitting || (isCodeSent && (form.watch("code")?.length ?? 0) < 6)}
                        >
                            {form.formState.isSubmitting ? t("loading") : isCodeSent ? t("verify", { default: "Təsdiq et" }) : t("send_code")}
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}