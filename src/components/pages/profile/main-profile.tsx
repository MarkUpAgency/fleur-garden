"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { User } from '@/types'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { UpdateUserMutation, UpdatePasswordMutation } from '@/services/auth/mutations'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function MainProfile({ user }: { user: User }) {
    const t = useTranslations("profile")
    const updateUserMutation = UpdateUserMutation()

    const ProfileSchema = z.object({
        name: z.string().min(2, { message: t("name_minimum_2_simvol") }),
        email: z.string().email({ message: t("correct_email_input") }),
        mobile: z.string().min(7, { message: t("correct_mobile_input") })
    })

    type ProfileFormValues = z.infer<typeof ProfileSchema>

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: user.name ?? "",
            email: user.email ?? "",
            mobile: user.mobile ?? "",
        },
        mode: "onSubmit"
    })

    function onSubmit(values: ProfileFormValues) {
        updateUserMutation.mutate(values, {
            onSuccess: () => {
                toast.success(t("profile_information_updated"))
            },
            onError: (error: unknown) => {
                const message = error instanceof Error ? error.message : "Yeniləmə zamanı xəta baş verdi"
                toast.error(message)
            }
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Information */}
            <div className="py-7 px-6"
                style={{
                    borderRadius: "8px",
                    border: "1px solid #F2F4F8",
                    background: "#FFF",
                    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                }}
            >
                <div className='mb-8'>
                    <h1 className="text-xl font-medium text-gray-900">{t("profile_information")}</h1>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col h-full">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm text-gray-600">{t("full_name")}</FormLabel>
                                    <FormControl>
                                        <Input className="bg-gray-50 border-gray-200" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm text-gray-600">{t("email")}</FormLabel>
                                    <FormControl>
                                        <Input type="email" className="bg-gray-50 border-gray-200" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm text-gray-600">{t("mobile")}</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            country={'az'}
                                            value={field.value ?? ''}
                                            onChange={(value) => field.onChange(value)}
                                            onBlur={field.onBlur}
                                            inputProps={{ name: field.name, autoComplete: 'tel' }}
                                            containerClass="react-tel-input"
                                            inputClass="!w-full !bg-gray-50 !border-gray-200 !h-10 !text-sm !pl-12"
                                            buttonClass="!bg-gray-50 !border-gray-200"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={updateUserMutation.isPending || form.formState.isSubmitting} className="w-fit self-end bg-gray-900 hover:bg-gray-800 text-white mt-6">
                            {updateUserMutation.isPending || form.formState.isSubmitting ? t("saving") : t("save")}
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Password Reset */}
            <div
                className="py-7 px-6"
                style={{
                    borderRadius: "8px",
                    border: "1px solid #F2F4F8",
                    background: "#FFF",
                    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                }}
            >
                <div className='mb-8'>
                    <h1 className="text-xl font-medium text-gray-900">{t("password_update")}</h1>
                </div>
                <PasswordForm />
            </div>
        </div>
    )
}

export default MainProfile

function PasswordForm() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const t = useTranslations("profile")
    const updatePasswordMutation = UpdatePasswordMutation()

    const PasswordSchema = z.object({
        old_password: z.string().min(1, { message: t("current_password_required") }),
        password: z.string().min(6, { message: t("minimum_6_simvol") }),
        password_confirmation: z.string().min(6, { message: t("minimum_6_simvol") })
    }).refine((data) => data.password === data.password_confirmation, {
        path: ["password_confirmation"],
        message: t("passwords_do_not_match")
    })

    type PasswordFormValues = z.infer<typeof PasswordSchema>

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(PasswordSchema),
        defaultValues: { old_password: "", password: "", password_confirmation: "" },
        mode: "onSubmit"
    })

    function onSubmit(values: PasswordFormValues) {
        updatePasswordMutation.mutate(values, {
            onSuccess: () => {
                toast.success(t("password_updated"))
                form.reset()
                setShowCurrentPassword(false)
                setShowNewPassword(false)
                setShowConfirmPassword(false)
            },
            onError: (error: unknown) => {
                const message = error instanceof Error ? error.message : t("error_occurred_while_updating_password")
                toast.error(message)
            }
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex flex-col h-full">
                <FormField
                    control={form.control}
                    name="old_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm text-gray-600">{t("password")}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        id="current-password"
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder={t("password_placeholder")}
                                        className="bg-gray-50 border-gray-200 pr-10"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm text-gray-600">{t("new_password")}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder={t("new_password_placeholder")}
                                        className="bg-gray-50 border-gray-200 pr-10"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm text-gray-600">{t("password_confirmation")}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder={t("password_confirmation_placeholder")}
                                        className="bg-gray-50 border-gray-200 pr-10"
                                        {...field}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={updatePasswordMutation.isPending || form.formState.isSubmitting} className="w-fit self-end bg-gray-900 hover:bg-gray-800 text-white mt-6">
                    {updatePasswordMutation.isPending || form.formState.isSubmitting ? t("saving") : t("save")}
                </Button>
            </form>
        </Form>
    )
}