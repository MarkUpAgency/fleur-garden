export interface Slider {
    image: string;
    thumb_image: string;
}

export interface Banner {
    title: string;
    description: string;
    btn_text: string;
    btn_link: string;
    image: string;
    thumb_image: string;
}

export interface Partner {
    name: string;
    slug: string;
    description: string;
    link: string;
    image: string;
    thumb_image: string;
    logo: string;
    thumb_logo: string;
    content: string;
}

export interface Contact {
    address: string;
    phone: string;
    email: string;
    logo: string;
    full_name: string;
    message: string;
}

export interface Social {
    name: string;
    link: string;
    image: string;
    thumb_image: string;
}

export interface Advantage {
    title: string;
    description: string;
    image: string;
    thumb_image: string;
}

export interface About {
    title: string;
    description: string;
    image: string;
    thumb_image: string;
}

export interface Faq {
    name: string;
    faqs: FaqItem[];
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface MetaTag {
    title: string;
    meta_keywords: string;
    meta_title: string;
    meta_desc: string;
}