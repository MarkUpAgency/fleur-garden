"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { resetPasswordAction } from "@/services/auth/server-actions"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { toast } from "sonner"

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

export default function PasswordResetPage() {
    const t = useTranslations("password_reset")
    const router = useRouter()
    const { locale } = useParams<{ locale: string }>()
    const searchParams = useSearchParams()
    const codeFromUrl = (searchParams.get("code") || "").trim()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const Schema = useMemo(() => z.object({
        password: z.string().min(6, { message: "Minimum 6 simvol" }),
        confirm: z.string().min(6, { message: "Minimum 6 simvol" })
    }).refine((val) => val.password === val.confirm, {
        message: "Şifrələr uyğun deyil",
        path: ["confirm"],
    }), [])

    type FormValues = z.infer<typeof Schema>

    const form = useForm<FormValues>({
        resolver: zodResolver(Schema),
        defaultValues: { password: "", confirm: "" },
        mode: "onSubmit",
    })

    async function onSubmit(values: FormValues) {
        if (!codeFromUrl) {
            toast.error("Kod tapılmadı")
            return
        }
        try {
            setIsSubmitting(true)
            await resetPasswordAction(codeFromUrl, values.password)
            toast.success("Şifrə uğurla dəyişdirildi")
            router.replace(`/${locale}/login`)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Şifrə yenilənmədi"
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="w-full pt-20 md:pt-0 h-full flex items-center justify-center pb-12 md:pb-12 px-4 md:px-0">
            <div className={`border border-[#D3D3D7] rounded-[20px] py-12 px-4 md:px-[90px] w-full max-w-[580px] bg-white flex flex-col`}>
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        {t("title", { default: "Yeni şifrə" })}
                    </h2>
                    <p className="text-[#77777B] text-left">{t("description", { default: "Yeni şifrənizi daxil edin." })}</p>
                </div>

                <Form {...form}>
                    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingField id="password" label={t("new_password", { default: "Yeni şifrə" })}>
                                            <Input type="password" placeholder={t("password_placeholder", { default: "Yeni şifrənizi daxil edin" })} className="h-12" {...field} />
                                        </FloatingField>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingField id="confirm" label={t("confirm_password", { default: "Şifrənin təkrarı" })}>
                                            <Input type="password" placeholder={t("confirm_placeholder", { default: "Şifrənizi təkrar edin" })} className="h-12" {...field} />
                                        </FloatingField>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full h-12 bg-gray-800 text-white" disabled={isSubmitting || !codeFromUrl}>
                            {isSubmitting ? t("loading", { default: "Gözləyin..." }) : t("save", { default: "Yadda saxla" })}
                        </Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}


