"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { registerAction } from "@/services/auth/server-actions"
import { toast } from "sonner"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

interface RegisterSheetProps {
  isOpen: boolean
  isAnimating: boolean
  onClose: () => void
  onOpenLogin?: () => void
}

export function RegisterSheet({ isOpen, isAnimating, onClose, onOpenLogin }: RegisterSheetProps) {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const t = useTranslations("register")
  const RegisterSchema = z.object({
    name: z.string().min(2, { message: "Ad minimum 2 simvol olmalıdır" }),
    email: z.string().email({ message: "Düzgün email daxil edin" }),
    password: z.string().min(6, { message: "Şifrə minimum 6 simvol olmalıdır" }),
  })

  type RegisterFormValues = z.infer<typeof RegisterSchema>

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onSubmit",
  })

  async function onSubmit(values: RegisterFormValues) {
    try {
      const res = await registerAction(values.name, values.email, values.password)
      if (res?.status === "success") {
        toast.success(t("register_successfully"))
        onClose()
        router.refresh()
      } else {
        toast.error(t("register_failed"))
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("register_failed")
      toast.error(message)
    }
  }

  return (
    <>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 top-[140px] bg-[#20201E85] z-40"
            onClick={onClose}
          />

          <div className={`fixed right-0 h-[calc(100vh-140px)] top-auto bottom-0 w-full max-w-[400px] bg-white z-50 px-8 py-8 flex flex-col transform transition-transform duration-300 ease-out ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`} onClick={(e) => e.stopPropagation()}>
            <div className="text-left mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {t("title")}
              </h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">{t("name")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t("name_placeholder")}
                          className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-medium text-gray-700">{t("email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t("email_placeholder")}
                          className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-medium text-gray-700">{t("password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={t("password_placeholder")}
                            className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium"
                  type="submit"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? t("loading") : t("register_link")}
                </Button>

                <div className="text-center">
                  <span className="text-sm text-gray-600">{t("no_account")} </span>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                    onClick={onOpenLogin}
                  >
                    {t("login_link")}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </>
      )}
    </>
  )
}

export function useRegisterSheet() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [closeTimeoutId, setCloseTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleOpen = () => {
    if (closeTimeoutId) {
      clearTimeout(closeTimeoutId)
      setCloseTimeoutId(null)
    }
    setIsOpen(true)
    setIsAnimating(false)
  }

  const handleClose = () => {
    setIsAnimating(false)
    const timeoutId = setTimeout(() => {
      setIsOpen(false)
      setCloseTimeoutId(null)
    }, 300)
    setCloseTimeoutId(timeoutId)
  }

  const handleToggle = () => {
    if (isOpen) {
      handleClose()
    } else {
      handleOpen()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setTimeout(() => setIsAnimating(true), 10)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (closeTimeoutId) {
        clearTimeout(closeTimeoutId)
      }
    }
  }, [closeTimeoutId])

  return {
    isOpen,
    isAnimating,
    handleOpen,
    handleClose,
    handleToggle
  }
}
