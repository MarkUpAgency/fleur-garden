'use client'


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { ReviewsCarousel } from './reviews-carousel'
import { useTranslations } from 'next-intl'
import { Product, Review } from '@/types'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addCommentMutation } from '@/services/products/mutations'
import { toast } from 'sonner'

function ProductInfoTabs({ product, reviews }: { product: Product, reviews: Review[] }) {
    const t = useTranslations("product_page")
    return (
        <div className="mt-12">
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-gray-200 rounded-none h-auto p-0 lg:w-[calc(45%-16px)]">
                    <TabsTrigger
                        value="details"
                        className="border-b-2 border-transparent data-[state=active]:border-b-black data-[state=active]:bg-transparent bg-transparent rounded-none pb-4 data-[state=active]:shadow-none"
                    >
                        {t("detailed_information")}
                    </TabsTrigger>
                    <TabsTrigger
                        value="reviews"
                        className="border-b-2 border-transparent data-[state=active]:border-b-black data-[state=active]:bg-transparent bg-transparent rounded-none pb-4 data-[state=active]:shadow-none"
                    >
                        {t("reviews")}
                    </TabsTrigger>
                    <TabsTrigger
                        value="conditions"
                        className="border-b-2 border-transparent data-[state=active]:border-b-black data-[state=active]:bg-transparent bg-transparent rounded-none pb-4 data-[state=active]:shadow-none"
                    >
                        {t("order_conditions")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-8 lg:w-[calc(45%-16px)]">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-4">
                            {product.attributes.map((attribute) => (
                                <div className="flex justify-between" key={attribute.key}>
                                    <span className="font-medium text-gray-900">{attribute.key}</span>
                                    <span className="text-gray-600">{attribute.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="reviews" className="mt-8">
                    <div className="space-y-8">
                        <ReviewForm productId={product.id} productSlug={product.slug} />
                        <ReviewsCarousel reviews={reviews} />
                    </div>
                </TabsContent>

                <TabsContent value="conditions" className="mt-8">
                    <div className="prose max-w-none">
                        <p className="text-gray-600">{t("order_conditions_and_delivery_information")}</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProductInfoTabs

function ReviewForm({ productId, productSlug }: { productId: number, productSlug: string }) {
    const t = useTranslations('product_page')

    const queryClient = useQueryClient()
    const [star, setStar] = React.useState<number>(0)
    const [description, setDescription] = React.useState<string>('')
    const [hoverStar, setHoverStar] = React.useState<number>(0)

    const { mutateAsync: addComment, isPending } = useMutation(addCommentMutation({ product_id: productId, star, description }))

    function handleSelectStar(index: number) {
        setStar(index)
    }

    async function handleSubmit() {
        if (!star || description.trim().length === 0) return
        try {
            await addComment(void 0, {
                onSuccess: () => {
                    toast.success(t('comment_added_successfully'));
                },
                onError: () => {
                    toast.error(t('failed_to_add_comment'));
                }
            })
            
            setDescription('')
            setStar(0)
            await queryClient.invalidateQueries({ queryKey: ['product-reviews', productSlug] })
        } catch {}
    }

    return (
        <div className="space-y-4 lg:w-[calc(45%-16px)]">
            <div className="space-y-2 flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-medium">{t('write_review')}</h3>
                    <p className="text-sm text-muted-foreground">{t('share_your_thoughts')}</p>
                </div>
                <div className="flex items-center space-x-1" onMouseLeave={() => setHoverStar(0)}>
                    {Array.from({ length: 5 }).map((_, i) => {
                        const index = i + 1
                        const activeUpTo = hoverStar || star
                        const isActive = index <= activeUpTo
                        return (
                            <button
                                key={index}
                                type="button"
                                className={cn('p-0.5 transition-transform duration-150', isActive ? 'text-amber-500' : 'text-muted-foreground', 'hover:scale-110')}
                                onClick={() => handleSelectStar(index)}
                                onMouseEnter={() => setHoverStar(index)}
                                aria-label={`rate-${index}`}
                            >
                                <Star className={cn('size-5 transition-colors', isActive ? 'fill-amber-400 text-amber-500' : '')} />
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('share_your_thoughts')}
                    className="h-12"
                />
                <Button
                    className="h-12 px-6"
                    onClick={handleSubmit}
                    disabled={isPending || star === 0 || description.trim().length === 0}
                >
                    {isPending ? t('submitting') : t('share')}
                </Button>
            </div>
        </div>
    )
}