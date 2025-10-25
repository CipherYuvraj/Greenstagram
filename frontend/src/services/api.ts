// Base response type for all API responses
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | Record<string, string[]>;
  status?: number;
  errors?: Record<string, string[]>;
};

// Type for login/register response
type AuthResponse = {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
};

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    console.log('🌐 API Base URL:', this.baseURL);
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' })
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const isJson = response.headers.get('content-type')?.includes('application/json');

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthorized - Please log in again');
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = isJson ? await response.json() : await response.text();
      } catch (e) {
        errorData = { message: response.statusText };
      }

      const message = errorData?.message || 
                     errorData?.error?.message || 
                     errorData?.error ||
                     `Request failed with status ${response.status}`;
      
      throw new Error(message);
    }

    if (response.status === 204) {
      return {} as T;
    }

    if (!isJson) {
      return (await response.text()) as unknown as T;
    }

    return response.json();
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    isFormData = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = this.getHeaders(isFormData);
    
    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
      ...(data && { body: isFormData ? data : JSON.stringify(data) })
    };

    const response = await fetch(url, config);
    return this.handleResponse<T>(response);
  }

  // HTTP Methods
  get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      endpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${query.toString()}`;
    }
    return this.makeRequest<T>('GET', endpoint);
  }

  post<T = any>(endpoint: string, data?: any, isFormData = false): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data, isFormData);
  }

  put<T = any>(endpoint: string, data?: any, isFormData = false): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data, isFormData);
  }

  delete<T = any>(endpoint: string): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint);
  }

  // Auth methods
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }
    this.setToken(response.data.token);
    return response.data;
  }

  async register(userData: { username: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
    const response = await this.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await this.get<ApiResponse<{ user: AuthResponse['user'] }>>('/auth/me');
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch user');
    }
    return response.data.user;
  }

  // Plant identification method
  async identifyPlant(formData: FormData): Promise<any> {
    const response = await this.post<ApiResponse<any>>('/ai/identify-plant', formData, true);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to identify plant');
    }
    return response.data;
  }

  // User profile methods
  async getUserProfile(username: string): Promise<any> {
    return this.get(`/users/profile/${username}`);
  }

  async getUserPosts(username: string): Promise<any> {
    return this.get(`/users/${username}/posts`);
  }

  // Follow/Unfollow methods
  async followUser(userId: string): Promise<any> {
    return this.post(`/users/${userId}/follow`);
  }

  async unfollowUser(userId: string): Promise<any> {
    return this.delete(`/users/${userId}/follow`);
  }

  // Post interaction methods
  async likePost(postId: string): Promise<any> {
    return this.post(`/posts/${postId}/like`);
  }

  async addComment(postId: string, content: string): Promise<any> {
    return this.post(`/posts/${postId}/comments`, { content });
  }

  // Notification methods
  async getNotifications(): Promise<any> {
    return this.get('/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    return this.put(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(): Promise<any> {
    return this.put('/notifications/read-all');
  }

  async clearNotifications(): Promise<any> {
    return this.delete('/notifications');
  }
}

// Create a singleton instance
export const apiService = new ApiService();

export default apiService;
