"use client"
import React from 'react'
import UserPopover from "../shared/user-popover"
import LanguageSelector from "../shared/language-selector"
import { navigationItems } from "@/utils/static"
import { Link, usePathname } from "@/i18n/navigation"
import { CatalogSheet } from "./catalog-sheet"
import { MobileMenu } from "./mobile-menu"
import Container from "../shared/container"
import FavComp from "./favcomp"
import { SearchBox } from "./SearchBox"
import CartIndicator from "./cart-indicator"
import { User, Category, Product } from "@/types"
import { useTranslations } from 'next-intl'

function ClientHeader({ user, categories, latestProducts }: { user: User, categories: Category[], latestProducts: Product[] }) {
    const t = useTranslations("navigation")
    const pathname = usePathname()

    const routes = ["/login", "/register", "/forgot-password", "/reset-password"]

    const isRouteActive = routes.includes(pathname)

    if (isRouteActive) {
        return <div className='w-full bg-white border-b fixed z-50 top-0 left-0 right-0 md:py-10 py-4'>
            <Container>
                <Link href="/" className='text-2xl font-semibold text-gray-900'>Fleur Garden</Link>
            </Container>
        </div>
    }

    return (
        <header className="w-full bg-white border-b fixed z-50 top-0 left-0 right-0">
            <div className="hidden md:block">
                <Container>
                    <div className="flex items-center py-3 justify-between text-sm border-b border-gray-200">
                        <nav className="flex items-center space-x-6 font-medium">
                            {navigationItems.map((item) => (
                                <Link key={item.label} href={item.href} className="text-[#77777B] hover:text-gray-900">
                                    {t(item.label)}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex items-center space-x-4">
                            <LanguageSelector />
                            <div className="w-px h-4 bg-gray-200" />
                            <UserPopover user={user as User} />
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="flex items-center justify-between h-[84px]">
                    <div className="flex items-center gap-2 md:gap-8">
                        <div className="md:hidden">
                            <MobileMenu user={user as User} categories={categories || []} />
                        </div>

                        <Link href="/" className="flex items-center">
                            <h1 className="text-xl md:text-[32px] font-semibold text-black">Fleur Garden</h1>
                        </Link>

                        <div className="hidden md:block">
                            <CatalogSheet categories={categories || []} />
                        </div>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-[500px] mx-8">
                        <SearchBox latestProducts={latestProducts}/>
                    </div>

                    <div className="flex items-center space-x-2">
                        <CartIndicator />
                        <FavComp />

                        <div className="block md:hidden">
                            <UserPopover user={user as User} />
                        </div>
                    </div>
                </div>
            </Container>
        </header>
    )
}

export default ClientHeader