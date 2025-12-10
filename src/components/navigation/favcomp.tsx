"use client"
import { Heart, Scale } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Link } from '@/i18n/navigation'

function FavComp() {
    const [favoritesCount, setFavoritesCount] = useState(0)
    const [comparisonCount, setComparisonCount] = useState(0)

    useEffect(() => {
        const updateFavoritesCount = () => {
            if (typeof window !== 'undefined') {
                try {
                    const favoritesData = localStorage.getItem('favorites')
                    if (favoritesData) {
                        const favorites = JSON.parse(favoritesData)
                        setFavoritesCount(favorites.length)
                    } else {
                        setFavoritesCount(0)
                    }
                } catch (error) {
                    console.error('Failed to load favorites count', error)
                    setFavoritesCount(0)
                }
            }
        }

        const updateComparisonCount = () => {
            if (typeof window !== 'undefined') {
                try {
                    const comparisonData = localStorage.getItem('comparison')
                    if (comparisonData) {
                        const comparison = JSON.parse(comparisonData)
                        setComparisonCount(comparison.length)
                    } else {
                        setComparisonCount(0)
                    }
                } catch (error) {
                    console.error('Failed to load comparison count', error)
                    setComparisonCount(0)
                }
            }
        }

        updateFavoritesCount()
        updateComparisonCount()

        window.addEventListener('favoritesChanged', updateFavoritesCount)
        window.addEventListener('comparisonChanged', updateComparisonCount)
        window.addEventListener('storage', updateFavoritesCount)
        window.addEventListener('storage', updateComparisonCount)

        return () => {
            window.removeEventListener('favoritesChanged', updateFavoritesCount)
            window.removeEventListener('comparisonChanged', updateComparisonCount)
            window.removeEventListener('storage', updateFavoritesCount)
            window.removeEventListener('storage', updateComparisonCount)
        }
    }, [])

    return (
        <>
            <Link href="/favorites">
                <Button variant="ghost" size="sm" className="p-2 relative">
                    <Heart className="w-5 h-5 text-gray-600" />
                    {favoritesCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                            {favoritesCount > 99 ? '99+' : favoritesCount}
                        </span>
                    )}
                </Button>
            </Link>
            <Link href="/comparison">
                <Button variant="ghost" size="sm" className="p-2 relative">
                    <Scale className="w-5 h-5 text-gray-600" />
                    {comparisonCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                            {comparisonCount > 99 ? '99+' : comparisonCount}
                        </span>
                    )}
                </Button>
            </Link>
        </>
    )
}

export default FavComp