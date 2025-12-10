import { get, post } from "@/lib/api";
import { ApiResponse, Brand, Category, FilterProductsPayload, Product, Review, CreateReviewPayload, OrderPayload, Order, ApplyPromoPayload, PromoCodeResponse } from "@/types";

const getProducts = async (locale: string, number?: number) => {
  const endpoint = number ? `products/${number}` : "products";
  const products = await get<ApiResponse<Product[]>>(endpoint, {
    params: { locale },
  });
  return products;
};

const getProduct = async (locale: string, slug: string) => {
  const product = await get<ApiResponse<Product>>(`product/${slug}`, {
    params: { locale },
  });
  return product;
};

const getRelatedProducts = async (locale: string, category_slug: string) => {
  const products = await get<ApiResponse<Product[]>>(`relational-products/${category_slug}`, {
    params: { locale },
  });
  return products;
};

const getProductReviews = async (locale: string, slug: string) => {
  const reviews = await get<ApiResponse<Review[]>>(`comments/${slug}`, {
    params: { locale },
  });
  return reviews;
};

const addComment = async (data: CreateReviewPayload) => {
  const response = await post<ApiResponse<Review>>(`comment`, {
    ...data,
    star: String(data.star),
    product_id: String(data.product_id),
  });
  return response;
};

const getBrands = async () => {
  const brands = await get<ApiResponse<Brand[]>>(`brands`);
  return brands;
};

const getCategories = async () => {
  const categories = await get<ApiResponse<Category[]>>(`categories`);
  return categories;
};

const searchProducts = async (search: string) => {
  const products = await get<ApiResponse<Product[]>>(`search`, {
    params: { search },
  });
  return products;
};

const filterProducts = async (data: FilterProductsPayload, page?: number) => {
  const payload: Partial<FilterProductsPayload> = {}

  if (data.brand_id > 0) payload.brand_id = data.brand_id
  if (Array.isArray(data.category_id) && data.category_id.length > 0) payload.category_id = data.category_id
  if (data.min_price > 0) payload.min_price = data.min_price
  if (data.max_price < 5600) payload.max_price = data.max_price
  if (data.stock > 0) payload.stock = data.stock
  if (data.type > 0) payload.type = data.type

  const products = await post<ApiResponse<Product[]>>(`filter`, payload, {
    params: page ? { page } : undefined,
    // keep JSON; base client already sets application/json
  });
  return products;
};

const order = async (data: OrderPayload) => {
  const response = await post<ApiResponse<string>>(`order`, data);
  return response;
};

const getOrders = async (token: string) => {
  const response = await get<ApiResponse<Order[]>>(`orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

const applyPromo = async (data: ApplyPromoPayload) => {
  const response = await post<PromoCodeResponse>(`order/apply-promocode`, data);
  return response;
};

export {
  getProducts,
  getProduct,
  getRelatedProducts,
  getProductReviews,
  addComment,
  getBrands,
  getCategories,
  searchProducts,
  filterProducts,
  order,
  getOrders,
  applyPromo,
};