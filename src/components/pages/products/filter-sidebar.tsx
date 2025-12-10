"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Brand, Category, FilterProductsPayload } from "@/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen)

  return (
    <div className="border-b border-[#F2F4F8] py-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-sm font-medium text-primary"
      >
        <span>{title}</span>
        <span className="text-gray-400">{isOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}</span>
      </button>
      {isOpen && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  )
}

export interface FilterSidebarProps {
  className?: string
  brands: Brand[]
  categories: Category[]
  isFetching?: boolean
}

export function FilterSidebar({ className, brands, categories, isFetching }: FilterSidebarProps) {
  const t = useTranslations("product_grid")
  const tf = useTranslations("favorites")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [brandId, setBrandId] = useState<number>(0)
  const [categoryIds, setCategoryIds] = useState<number[]>([])
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(5600)
  const [typeId, setTypeId] = useState<number>(0)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set())

  const prevUrlKeyRef = useRef<string | null>(null)
  useEffect(() => {
    const spBrand = Number(searchParams.get("brand_id") || 0)
    const spCategoryVals = searchParams.getAll("category_id")
    const spCategoryCsv = searchParams.get("category_id")
    const spMin = Number(searchParams.get("min_price") || 0)
    const spMax = Number(searchParams.get("max_price") || 5600)
    const spType = Number(searchParams.get("type") || 0)

    const nextBrand = Number.isNaN(spBrand) ? 0 : spBrand
    const nextCategoryIds = (
      spCategoryVals.length > 0 ? spCategoryVals : (spCategoryCsv ? [spCategoryCsv] : [])
    )
      .flatMap((v) => v.split(","))
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n))
    const nextMin = Number.isNaN(spMin) ? 0 : spMin
    const nextMax = Number.isNaN(spMax) ? 5600 : spMax
    const nextType = Number.isNaN(spType) ? 0 : spType

    const nextKey = `${nextBrand}|${nextCategoryIds.join(',')}|${nextMin}|${nextMax}|${nextType}`

    if (!isInitialized) {
      setBrandId(nextBrand)
      setCategoryIds(nextCategoryIds)
      setMinPrice(nextMin)
      setMaxPrice(nextMax)
      setTypeId(nextType)
      prevUrlKeyRef.current = nextKey
      setIsInitialized(true)
      return
    }

    if (prevUrlKeyRef.current !== nextKey) {
      setBrandId(nextBrand)
      setCategoryIds(nextCategoryIds)
      setMinPrice(nextMin)
      setMaxPrice(nextMax)
      setTypeId(nextType)
      prevUrlKeyRef.current = nextKey
    }
  }, [searchParams, isInitialized])

  const updateURL = useCallback((
    newBrandId: number,
    newCategoryIds: number[],
    newMinPrice: number,
    newMaxPrice: number,
    newTypeId: number
  ) => {
    if (!isInitialized) return

    const params = new URLSearchParams()

    if (newBrandId > 0) params.set("brand_id", String(newBrandId))
    if (newCategoryIds.length > 0) params.set("category_id", newCategoryIds.join(","))
    if (newMinPrice > 0) params.set("min_price", String(newMinPrice))
    if (newMaxPrice < 5600) params.set("max_price", String(newMaxPrice))
    if (newTypeId > 0) params.set("type", String(newTypeId))

    const queryString = params.toString()
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname

    router.replace(newUrl, { scroll: false })
  }, [pathname, router, isInitialized])

  // Update URL when filter values change
  useEffect(() => {
    updateURL(brandId, categoryIds, minPrice, maxPrice, typeId)
  }, [brandId, categoryIds, minPrice, maxPrice, typeId, updateURL])

  const filters: FilterProductsPayload = useMemo(() => ({
    brand_id: brandId,
    category_id: categoryIds,
    min_price: minPrice,
    max_price: maxPrice,
    stock: 0,
    type: typeId,
  }), [brandId, categoryIds, minPrice, maxPrice, typeId])

  useMemo(() => filters, [filters])

  function toggleCategoryExpanded(categoryIdToToggle: number) {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryIdToToggle)) {
        next.delete(categoryIdToToggle)
      } else {
        next.add(categoryIdToToggle)
      }
      return next
    })
  }

  return (
    <aside
      className={`w-full lg:w-[280px] rounded-[12px] bg-white border border-[#F2F4F8] p-4 ${className ?? ""}`}
      style={{ boxShadow: "0px 8px 12px 0px #00000008" }}
    >
      <FilterSection title={t("price")} defaultOpen>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Min"
            className="h-9"
            value={minPrice}
            onChange={(e) => {
              const nextMin = Number(e.target.value) || 0
              const clamped = Math.max(0, Math.min(nextMin, maxPrice))
              setMinPrice(clamped)
            }}
          />
          <span className="text-sm text-[#77777B]">—</span>
          <Input
            placeholder="Max"
            className="h-9"
            value={maxPrice}
            onChange={(e) => {
              const nextMax = Number(e.target.value) || 0
              const clamped = Math.max(minPrice, nextMax)
              setMaxPrice(clamped)
            }}
          />
        </div>
        <PriceRangeSlider
          min={0}
          max={5600}
          step={10}
          defaultValue={[minPrice, maxPrice]}
          onValueChange={(val) => {
            setMinPrice(val[0])
            setMaxPrice(val[1])
          }}
        />
      </FilterSection>

      <FilterSection title={t("product")} defaultOpen>
        <label className="flex items-center gap-2 text-sm text-primary">
          <Checkbox
            className="border-primary"
            checked={typeId === 1}
            onCheckedChange={() => setTypeId(typeId === 1 ? 0 : 1)}
          />
          {t("title")}
        </label>
        <label className="flex items-center gap-2 text-sm text-primary">
          <Checkbox
            className="border-primary"
            checked={typeId === 2}
            onCheckedChange={() => setTypeId(typeId === 2 ? 0 : 2)}
          />
          {t("discount")}
        </label>
        <label className="flex items-center gap-2 text-sm text-primary">
          <Checkbox
            className="border-primary"
            checked={typeId === 3}
            onCheckedChange={() => setTypeId(typeId === 3 ? 0 : 3)}
          />
          {t("on_sale")}
        </label>
      </FilterSection>

      <FilterSection title="Brend" defaultOpen>
        <Input placeholder="Axtarın" className="h-9" />
        <div className="max-h-40 overflow-auto pr-1 space-y-2 mt-2">
          {brands.map((brand) => {
            const checked = (brandId ?? 0) === brand.id
            return (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-primary">
                <Checkbox
                  className="border-primary"
                  checked={checked}
                  onCheckedChange={() => setBrandId(checked ? 0 : brand.id)}
                />
                {brand.name}
              </label>
            )
          })}
        </div>
      </FilterSection>

      <FilterSection title={tf("category")} defaultOpen>
        <div className="max-h-48 overflow-auto pr-1 space-y-2 mt-1">
          {categories.map((cat) => {
            const hasChildren = !!cat.category && cat.category.length > 0
            const childIds = hasChildren ? cat.category.map((c) => c.id) : []
            const selectedChildrenCount = childIds.filter((id) => categoryIds.includes(id)).length
            const allChildrenSelected = hasChildren && childIds.length > 0 && selectedChildrenCount === childIds.length
            const someChildrenSelected = hasChildren && selectedChildrenCount > 0 && !allChildrenSelected
            const parentChecked = hasChildren ? (allChildrenSelected ? true : (someChildrenSelected ? "indeterminate" : false)) : categoryIds.includes(cat.id)
            const isExpanded = expandedCategoryIds.has(cat.id)
            return (
              <div key={cat.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-primary">
                    <Checkbox
                      className="border-primary"
                      checked={parentChecked}
                      onCheckedChange={() => {
                        if (hasChildren) {
                          setCategoryIds((prev) => {
                            const set = new Set(prev)
                            if (allChildrenSelected || someChildrenSelected) {
                              // Unselect all children
                              childIds.forEach((id) => set.delete(id))
                            } else {
                              // Select all children
                              childIds.forEach((id) => set.add(id))
                            }
                            // Ensure parent ID is not included in payload
                            set.delete(cat.id)
                            return Array.from(set)
                          })
                        } else {
                          // Leaf category without children – toggle itself
                          setCategoryIds((prev) => {
                            const set = new Set(prev)
                            if (set.has(cat.id)) set.delete(cat.id)
                            else set.add(cat.id)
                            return Array.from(set)
                          })
                        }
                      }}
                    />
                    {cat.name}
                  </label>
                  {hasChildren && (
                    <button
                      type="button"
                      aria-label="Toggle subcategories"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => toggleCategoryExpanded(cat.id)}
                    >
                      {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    </button>
                  )}
                </div>
                {hasChildren && isExpanded && (
                  <div className="ml-6 space-y-2">
                    {cat.category.map((sub) => {
                      const subChecked = categoryIds.includes(sub.id)
                      return (
                        <label key={sub.id} className="flex items-center gap-2 text-sm text-primary">
                          <Checkbox
                            className="border-primary"
                            checked={subChecked}
                            onCheckedChange={() => {
                              setCategoryIds((prev) => {
                                const set = new Set(prev)
                                if (subChecked) set.delete(sub.id)
                                else set.add(sub.id)
                                return Array.from(set)
                              })
                            }}
                          />
                          {sub.name}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </FilterSection>
      {isFetching && (
        <div className="mt-2 text-xs text-muted-foreground">{t("loading")}</div>
      )}
    </aside>
  )
}

export default FilterSidebar

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: [number, number];
  onValueChange?: (value: [number, number]) => void;
  className?: string;
  currency?: string;
}

function PriceRangeSlider({
  min = 0,
  max = 5600,
  step = 10,
  defaultValue = [0, 5],
  onValueChange,
  className,
  currency = "USD",
}: PriceRangeSliderProps) {
  const [value, setValue] = useState<[number, number]>(defaultValue);

  useEffect(() => {
    if (defaultValue && (defaultValue[0] !== value[0] || defaultValue[1] !== value[1])) {
      setValue([defaultValue[0], defaultValue[1]])
    }
  }, [defaultValue, value])

  const handleValueChange = (newValue: number[]) => {
    const rangeValue: [number, number] = [newValue[0], newValue[1]];
    setValue(rangeValue);
    onValueChange?.(rangeValue);
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} ${currency}`;
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Price Display */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">
          {formatPrice(value[0])}
        </div>
        <div className="text-sm font-medium text-gray-700">
          {formatPrice(value[1])}
        </div>
      </div>

      {/* Slider */}
      <div className="px-2">
        <Slider
          value={value}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          step={step}
          className="w-full"
          minStepsBetweenThumbs={1}
        />
      </div>
    </div>
  );
}