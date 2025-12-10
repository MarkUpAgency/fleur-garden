"use client"

import React from 'react'
import { sidebarItems } from '@/utils/static'
import { Link, usePathname } from '@/i18n/navigation'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { LogoutMutation } from '@/services/auth/mutations'
import { useTranslations } from 'next-intl'

function ProfileSidebar() {
    const pathname = usePathname()
    const activeItem = sidebarItems.find((item) => item.href === pathname)

    const t = useTranslations("profile")

    const { mutate: logoutMutation } = LogoutMutation()

    const handleLogout = () => {
        logoutMutation()
    }
    return (
        <div className="w-full bg-white p-6 sticky top-40"
            style={{
                borderRadius: "8px",
                border: "1px solid #F2F4F8",
                background: "#FFF",
                boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
            }}
        >
            <h1 className="text-xl font-medium text-gray-900 mb-8">{t("profile_and_help")}</h1>

            <nav className="space-y-2">
                {sidebarItems.map((item, index) => (
                    item.href ? (
                        <Link
                            href={item.href}
                            key={index}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${activeItem?.href === item.href ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-sm">{t(item.label)}</span>
                        </Link>
                    ) : (
                        <Dialog key={index}>
                            <DialogTrigger asChild>
                                <button
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors`}
                                >
                                    <item.icon className="w-5 h-5 text-gray-600 hover:text-gray-900" />
                                    <span className="text-sm text-gray-600 hover:text-gray-900">{t(item.label)}</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[383px] p-8">
                                <div className="mx-auto -mt-2 mb-2 flex size-16 items-center justify-center rounded-full bg-red-50">
                                    <AlertTriangle className="h-8 w-8 text-red-500" />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-center text-[#0A6235]">
                                        {t("are_you_sure_you_want_to_logout")}
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogFooter className="sm:justify-center gap-4">
                                    <DialogClose asChild>
                                        <Button variant="outline" className="rounded-[12px] min-w-32">
                                            {t("cancel")}
                                        </Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button onClick={handleLogout} variant="destructive" className="rounded-[12px] min-w-32">
                                            {t("logout")}
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )
                ))}
            </nav>
        </div>
    )
}

export default ProfileSidebar