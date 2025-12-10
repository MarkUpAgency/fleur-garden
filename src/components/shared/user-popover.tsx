"use client"

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { CircleUserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { User } from '@/types'
import { Link } from '@/i18n/navigation'

function UserPopover({ user }: { user: User }) {
    const t = useTranslations("navigation")
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)

    return (
        <>
            {user ? (
                <Link href='/profile' className='w-8 h-8 rounded-full bg-black text-white flex items-center justify-center'>
                    <span>{user.name.charAt(0)}</span>
                </Link>
            ) : (
                <>
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="md:border-[#F2F4F8] border-none md:border !p-0 px-0 md:!px-2 md:py-4 font-medium text-[#20201E] rounded-full md:rounded-[8px] hover:bg-[#20201E] hover:text-white">
                                <CircleUserRound className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:block">{t("login")}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[262px] p-5 z-[150]">
                            <div className="flex flex-col gap-2">
                                <Link
                                    href='/login'
                                    className="bg-primary text-white rounded-[12px] hover:bg-primary/80 hover:text-white py-1 text-center text-sm"
                                >
                                    {t("login")}
                                </Link>
                                <Link
                                    href='/register'
                                    className="border border-[#F2F4F8] text-[#20201E] rounded-[12px] hover:bg-[#20201E] hover:text-white py-1 text-center text-sm"
                                >
                                    {t("register")}
                                </Link>
                            </div>
                        </PopoverContent>
                    </Popover>
                </>
            )}
        </>
    )
}

export default UserPopover