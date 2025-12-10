export interface ApiResponse<T> {
    status: string;
    message: string;
    meta: {
        current_page: number | undefined;
        last_page: number;
        per_page: number;
        total: number;
    };
    links: {
        first: string;
        last: string;
        prev: string;
        next: string;
    };
    data: T;
}

// Auth
export interface AuthUserInfo {
    name: string
    email: string
    mobile: string
    sv: number
    token_type: string
}

export interface AuthLoginResponse {
    data: {
        token: string
        user: AuthUserInfo
    }
    message: string
}

export interface AuthRegisterResponse {
    remark: string
    status: string
    data: {
        access_token: string
        name: string
        email: string
        sv: number
        token_type: string
    }
}

export interface AuthForgotPasswordResponse {
    remark: string
    status: string
}

export interface Product {
    id: number,
    name: string,
    discount: number | null,
    slug: string,
    code: string,
    price: number | null,
    stock: number,
    image: string,
    thumb_image: string,
    category_name: string,
    category_slug: string,
    brand_name: string,
    brand_slug: string,
    star: number,
    attributes: {
        key: string
        value: string | null
    }[]
    price_by_size?: {
        price: number
        min: number
        max: number
    }[]
}

export interface ProductCardProps {
    product: Product
}

export interface User {
    id?: number
    name: string
    email: string
    mobile: string
    password: string
}

// Payload for updating basic user profile information
export interface UpdateUserPayload {
    name: string
    email: string
    mobile: string
}

export interface Review {
    id: number
    user_id: {
        name: string
        surname: string
    }
    created_at: string
    description: string
    star: number
    image: string
    product_slug: string
    product_id: number
}

// Payload for creating a new review
export interface CreateReviewPayload {
    product_id: number
    star: number
    description: string
}

export interface Brand {
    id: number
    name: string
    slug: string
}

export interface Category {
    id: number
    name: string
    slug: string
    category: {
        id: number
        name: string
        slug: string
    }[]
}

export interface FilterProductsPayload {
    brand_id: number
    category_id: number[]
    min_price: number
    max_price: number
    stock: number
    type: number
}

export interface OrderPayload {
    name: string
    phone: string
    city: string
    address: string
    note: string
    payment_type: string
    promocode: string
    user_id?: number
    products: {
        quantity: number
        product_id: number
        size: number
    }[]
}

export interface Order {
    address: string
    city: string
    note: string
    order_status: number
    payment_status: string
    total_price: number
    promocode: string
    payment_type: number
    details: {
        product: string
        quantity: string
        size: number
        price: number
        total_price: number
    }[]
}


export interface CartItemData {
    id: string
    title: string
    brand: string
    volume: string
    price: number
    qty: number
    selected: boolean
    image: string
    type: string
}

export interface LocalStorageCartItem {
    id: number
    qty: number
    product: {
        id: number
        name: string
        brand: string
        price: string
        image?: string
        rating: number
        inStock: boolean
        volume: string
        type: string
    }
}

export interface CartStorageItemV2 {
    id: number
    product?: Product
    name: string
    image: string
    quantity: number
    size: number | null
    price: number
    subtotal: number
    pricingMode?: 'unified' | 'by_size'
    distinguish?: string
}

export interface ApplyPromoPayload {
    promocode: string
    products: {
        quantity?: number
        product_id: number
        size?: number
    }[]
}

export interface PromoCodeResponse {
    timestamp: string
    status: boolean
    message: string
    lang: string
    data: {
        total_price: number
        percentage: string
    }
}