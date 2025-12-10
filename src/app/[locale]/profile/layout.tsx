import Container from '@/components/shared/container'
import ProfileSidebar from '@/components/pages/profile/sidebar'
import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from '@/i18n/navigation'
import { getServerLocale } from '@/lib/utils'

async function ProfileLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    const locale = await getServerLocale()

    if (!token) {
        redirect({ href: '/login', locale: locale })
    }

    return (
        <section className="py-8">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-4 items-start">
                    {/* Sidebar */}
                    <ProfileSidebar />
                    {/* Main Content */}
                    {children}
                </div>
            </Container>
        </section>
    )
}

export default ProfileLayout