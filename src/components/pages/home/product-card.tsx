"use client"

import { Star } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { ProductCardProps } from '@/types'
import { useTranslations } from 'next-intl'
import FavComp from '../products/favComp'
import CartButton from '../products/cartButton'

function ProductCard({ product }: ProductCardProps) {
    const router = useRouter()
    const hasUnifiedPrice = product.price !== null && product.price !== undefined
    const hasPriceBySizeStructure = product.price_by_size && Array.isArray(product.price_by_size) && product.price_by_size.length > 0
    const t = useTranslations("product_card")

    // Get the display price - either unified price or first price tier
    const displayPrice = useMemo(() => {
        if (hasUnifiedPrice) {
            return product.price ?? 0
        }
        if (hasPriceBySizeStructure && product.price_by_size) {
            return product.price_by_size[product.price_by_size.length - 1].price
        }
        return 0
    }, [hasUnifiedPrice, hasPriceBySizeStructure, product.price, product.price_by_size])

    return (
        <div onClick={() => router.push(`/products/${product.slug}`)} key={product.id} className="bg-white relative group border border-[#F2F4F8] rounded-[12px] p-4"
            style={{
                boxShadow: "0px 8px 12px 0px #00000008",
            }}
        >
            <FavComp product={product} />
            {/* Product Image */}
            <div className="aspect-[2/2] mb-4 rounded-lg overflow-hidden">
                {product.image && product.image !== null && product.image !== 'null' ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#F2F4F8] rounded-lg flex items-center justify-center">
                        <span className="text-[#77777B] text-sm">No Image</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-primary line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-[#FF9500] text-[#FF9500]" />
                        <span className="text-sm text-[#FF9500] font-medium">{product.star}</span>
                    </div>

                </div>
                <p className="text-sm text-[#77777B] line-clamp-1">{product.brand_name}</p>

                <div className='flex items-center gap-2 justify-between mt-3'>
                    {product.stock > 0 && <p className="text-[10px] text-primary bg-[#F2F4F8] rounded-[4px] px-2 py-1 w-fit">{t("in_stock")}</p>}
                </div>

                {/* Price Display */}

                <div className="h-[1px] bg-[#F2F4F8] w-full" />

                <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-lg text-center md:text-left font-semibold text-primary">${displayPrice}</span>
                            {hasPriceBySizeStructure && product.price_by_size && (
                                <span className="text-xs text-center md:text-left text-[#77777B]">
                                    {product.price_by_size[product.price_by_size.length - 1].min}-{product.price_by_size[product.price_by_size.length - 1].max} Gr
                                </span>
                            )}
                        </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                        <CartButton
                            product={product}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard