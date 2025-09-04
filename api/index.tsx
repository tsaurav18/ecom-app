import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decrypt, decryptAPIResponse } from '@/hooks/secureUtility';

import { BackendResponse, CartItem, Product, User } from '@/constants/Types';
const SECRET_KEY="T4LXYFqvDkzN7BpMjh3oWsR1V2gJ9uZk"
// Types for API responses
type EncryptedBody = { enc_data: string; signature: string };
type CsrfResponse = { token: string };
const RESPONSE = {
    "header": {
        "api_status": 9999,
        "api_msg": "서버 연결에 실패하였습니다. \n잠시 후 다시 시도해주세요"
    },
    "body": {}
};
// API Configuration
const API_CONFIG = {
  // Replace with your actual API URL
//   BASE_URL:"http://localhost:9999/api/",
  BASE_URL: 'https://api.duhappi.com/api/',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private csrfToken: string | null = null; 
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
    this.loadStoredToken();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add device info
        config.headers['X-Device-Platform'] = 'mobile';
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
        
        // Handle token expiration
        if (error.response?.status === 401) {
          await this.handleTokenExpiration();
        }

        // Retry logic for network errors
        if (this.shouldRetry(error)) {
          return this.retryRequest(error);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Load stored auth token
   */
  private async loadStoredToken() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('Failed to load stored token:', error);
    }
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string) {
    this.authToken = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  async clearAuthToken() {
    this.authToken = null;
    await AsyncStorage.removeItem('auth_token');
  }

  /**
   * Handle token expiration
   */
  private async handleTokenExpiration() {
    await this.clearAuthToken();
    // You can add navigation to login screen here
    // NavigationService.navigate('Login');
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response && // Network error
      error.code !== 'ECONNABORTED' && // Not a timeout
      !error.config?.__retryCount // Not already retried
    );
  }

  /**
   * Retry failed request
   */
  private async retryRequest(error: AxiosError): Promise<any> {
    const config = error.config as any;
    config.__retryCount = config.__retryCount || 0;

    if (config.__retryCount >= API_CONFIG.RETRY_ATTEMPTS) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    // Wait before retrying
    await new Promise(resolve => 
      setTimeout(resolve, API_CONFIG.RETRY_DELAY * config.__retryCount)
    );

    return this.api(config);
  }

  /**
   * Handle and format API errors
   */
  private handleError(error: AxiosError|any): BackendResponse {
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        data: null,
        error: error.response.data?.message || `Server Error: ${error.response.status}`,
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        data: null,
        error: 'Network error. Please check your internet connection.',
      };
    } else {
      // Other error
      return {
        success: false,
        data: null,
        error: 'An unexpected error occurred.',
      };
    }
  }

  /** CSRF 토큰 가져오기 */
  private async getCsrfToken(force = false): Promise<string> {
    if (this.csrfToken && !force) return this.csrfToken;
    const res = await this.api.get<CsrfResponse>('get_csrf/');
    this.csrfToken = res.data["token"];
    
    return this.csrfToken!;
  }

  /** CSRF 실패 시 토큰 갱신해서 한 번 재시도 */
  private async retryWithFreshCsrf<T>(fn: () => Promise<T>): Promise<T> {
    await this.getCsrfToken(true);
    return fn();
  }

  /**
   * 암호화된 바디로 CSRF 포함 POST (enc_data만 바디에, signature/CSRF는 헤더)
   * 서버 응답은 enc_data + signature 조합으로 온다고 가정
   */
  private async postWithCsrfEncrypted<T>(
    url: string,
    body: EncryptedBody
  ): Promise<BackendResponse<T>> {
    const doRequest = async () => {
      const csrf = await this.getCsrfToken();
      let bodyData = JSON.stringify({ enc_data: body["enc_data"] });
      const res = await this.api.post(url, bodyData, {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrf,
          'X-Signature': body["signature"],
        },
      });
    
      const ok = decryptAPIResponse(res.data.enc_data, res.data.signature);
      if (!ok) {
        return RESPONSE
      }
      try{
        const decrypted = decrypt(res.data.enc_data, SECRET_KEY);
        return JSON.parse(decrypted);
      }
       catch(er){
        console.log("err", er)
       }
    };

    try {
      return await doRequest();
    } catch (err: any) {
      // CSRF 오류로 보이면 한 번만 갱신 후 재시도
      const status = err?.response?.status;
      const msg = err?.response?.data || '';
      if (status === 403 || (typeof msg === 'string' && msg.toLowerCase().includes('csrf'))) {
        try {
          return await this.retryWithFreshCsrf(doRequest);
        } catch (e2) {
          return this.handleError(e2 as AxiosError);
        }
      }
      return this.handleError(err as AxiosError);
    }
  }


  /**
   * Generic API method
   */
  private async request<T>(config: AxiosRequestConfig): Promise<BackendResponse<T>> {
    try {
      const response = await this.api(config);
       const res = decryptAPIResponse(
        response.data.enc_data,
        response.data.signature
      );
      if(res){
        const decryptedData = decrypt(response.data.enc_data, SECRET_KEY);
        return JSON.parse(decryptedData);
      }else{
        console.log("Signature Incorrect verifyOtp");
         return this.handleError(response);
      }
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  
  /**
   * Get all products
   */
  async getCategoryProductList(
    bodyData: EncryptedBody
  ): Promise<BackendResponse<any>> {
    return this.postWithCsrfEncrypted<Product[]>('get_products/', bodyData);
  }

  /**
   * Get new arrivals
   */
  async fetchNewArrivalProducts( bodyData: EncryptedBody
  ): Promise<BackendResponse<any>> {
    return this.postWithCsrfEncrypted<any>('get_products/', bodyData);
  }

}

// Create singleton instance
const apiService = new ApiService();

export default apiService;

// Export for direct use
export { apiService };