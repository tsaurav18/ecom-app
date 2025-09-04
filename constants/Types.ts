export type BackendResponse<T> = {
    body: T;
    header: {
      api_msg: string;
      api_status: number;
    };
  };
  
  export interface Product {
    id: string;
    title: string;
    image: string | { uri: string };
    price: number;
    originalPrice?: number;
    discountLabel?: string;
    description?: string;
    category?: string;
    inStock?: boolean;
    rating?: number;
    reviews?: number;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    token?: string;
  }
  
  export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    price: number;
  }
export interface DeviceInterface {
    isSmallPhone: boolean;
    isStandardPhone: boolean;
    isLargePhone: boolean;
    scale: {
      font: number;
      spacing: number;
    };
  }