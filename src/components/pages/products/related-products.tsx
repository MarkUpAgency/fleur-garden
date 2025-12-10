import React from 'react'
import ProductCard from '../home/product-card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Product } from '@/types'
import { useTranslations } from 'next-intl'

function RelatedProducts({ products }: { products: Product[] }) {
    const t = useTranslations("product_page")       
    return (
        <div className="mt-[100px]">
            <div className="flex items-center justify-between">
                <h2 className="text-[32px] font-semibold text-gray-900">{t("our_selection_for_you")}</h2>
                <Link href="/products?type=1" className="group cursor-pointer">
                    <Button className="bg-transparent cursor-pointer border-none shadow-none hover:bg-transparent text-primary text-sm font-medium">{t("more")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-9">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default RelatedProducts