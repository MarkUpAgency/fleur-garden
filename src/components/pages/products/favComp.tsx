import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { Scale } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRight, Star } from 'lucide-react'
import { Product } from '@/types'


function FavComp({ product }: { product: Product }) {
    const [isComparisonOpen, setIsComparisonOpen] = React.useState(false)
    const [isFavorite, setIsFavorite] = React.useState(false)

    const t = useTranslations("product_card")

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
            const isInFavorites = favorites.some((item: { id: number; product: typeof product }) => item.id === product.id)
            setIsFavorite(isInFavorites)
        }
    }, [product.id])

    function handleAddToComparison(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        e.stopPropagation()

        try {
            const storageKey = 'comparison'
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
            const comparison: Array<{ id: number; product: typeof product, image: string }> = raw ? JSON.parse(raw) : []

            const existingIndex = comparison.findIndex(item => item.id === product.id)
            if (existingIndex === -1) {
                comparison.push({ id: product.id, product, image: product.image })
                window.localStorage.setItem(storageKey, JSON.stringify(comparison))
                setIsComparisonOpen(true)
                toast.success(t("add_to_compare_dialog"))
                // Notify header and others
                window.dispatchEvent(new CustomEvent('comparisonChanged'))
            }
            else {
                toast.error(t("already_in_compare"))
            }
        } catch (error) {
            console.error('Failed to write comparison to localStorage', error)
        }
    }

    function handleToggleFavorite(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault()
        e.stopPropagation()

        try {
            const storageKey = 'favorites'
            const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null
            const favorites: Array<{ id: number; product: typeof product, image: string }> = raw ? JSON.parse(raw) : []

            const existingIndex = favorites.findIndex(item => item.id === product.id)

            if (existingIndex >= 0) {
                // Remove from favorites
                favorites.splice(existingIndex, 1)
                setIsFavorite(false)
                toast.success(t("remove_from_wishlist_dialog"))
            } else {
                // Add to favorites
                favorites.push({ id: product.id, product, image: product.image })
                setIsFavorite(true)
                toast.success(t("add_to_wishlist_dialog"))
            }

            window.localStorage.setItem(storageKey, JSON.stringify(favorites))

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('favoritesChanged'))
        } catch (error) {
            console.error('Failed to write favorites to localStorage', error)
            toast.error('Xəta baş verdi')
        }
    }
    return (
        <>
            <div className="flex flex-col items-center justify-end z-10 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="ghost" size="sm" className="p-2" onClick={handleToggleFavorite}>
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-black text-black' : 'text-gray-600'}`} />
                </Button>
                <Button variant="ghost" size="sm" className="p-2" onClick={handleAddToComparison}>
                    <Scale className="w-5 h-5 text-gray-600" />
                </Button>
            </div>
            <Dialog open={isComparisonOpen} onOpenChange={(open) => {
                setIsComparisonOpen(open)
                if (!open) {
                    setTimeout(() => {
                    }, 0)
                }
            }}>
                <DialogContent className="max-w-md p-0" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-medium">{t("add_to_compare_dialog")}</DialogTitle>
                        </DialogHeader>

                        <div className="mt-4 flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-md border flex items-center justify-center overflow-hidden flex-shrink-0">
                                <Image
                                    width={64}
                                    height={64}
                                    src={product.image || '/placeholder.svg'}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-primary">{product.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-[#FF9500] text-[#FF9500]" />
                                        <span className="text-sm text-[#FF9500] font-medium">{product.star}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-[#77777B] mt-1">{product.brand_name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-primary">{product.price} USD</p>
                                <p className="text-xs text-[#77777B]">200 Gr (1.50 ₼ / Gr)</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Link
                                href="/comparison"
                                className="flex items-center gap-2 bg-gray-800 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
                                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                    e.stopPropagation()
                                    setIsComparisonOpen(false)
                                }}
                            >
                                {t("add_to_compare")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FavComp