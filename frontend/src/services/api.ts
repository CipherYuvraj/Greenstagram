// Check if we're in production (Netlify) or development
const isProduction = import.meta.env.PROD;

// API base URL based on environment
const API_BASE_URL = isProduction ? '/.netlify/functions' : 'http://localhost:5000/api';

class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = isProduction 
      ? `${API_BASE_URL}${endpoint}` 
      : `${API_BASE_URL}${endpoint}`;
    
    const token = localStorage.getItem('token');
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log(`Making ${config.method || 'GET'} request to:`, url);
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: any) {
    const endpoint = isProduction ? '/simple-auth/register' : '/auth/register';
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any) {
    const endpoint = isProduction ? '/simple-auth/login' : '/auth/login';
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    const endpoint = isProduction ? '/auth/me' : '/auth/me';
    return this.makeRequest(endpoint);
  }

  // Posts endpoints
  async getPosts(params: any = {}) {
    const endpoint = isProduction ? '/posts/feed' : '/posts/feed';
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`${endpoint}?${queryString}`);
  }

  async getUserPosts(username: string) {
    const endpoint = isProduction ? `/posts/user` : `/posts/user/${username}`;
    const queryString = isProduction ? `?username=${username}` : '';
    return this.makeRequest(`${endpoint}${queryString}`);
  }

  async likePost(postId: string) {
    const endpoint = isProduction ? `/posts/${postId}/like` : `/posts/${postId}/like`;
    return this.makeRequest(endpoint, { method: 'POST' });
  }

  async addComment(postId: string, content: string) {
    const endpoint = isProduction ? `/posts/${postId}/comment` : `/posts/${postId}/comment`;
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Users endpoints
  async getUserProfile(username: string) {
    const endpoint = isProduction ? `/users/profile` : `/users/profile/${username}`;
    if (isProduction) {
      return this.makeRequest(`${endpoint}/${username}`);
    }
    return this.makeRequest(endpoint);
  }

  async followUser(userId: string) {
    const endpoint = isProduction ? `/users/follow/${userId}` : `/users/follow/${userId}`;
    return this.makeRequest(endpoint, { method: 'POST' });
  }

  async unfollowUser(userId: string) {
    const endpoint = isProduction ? `/users/unfollow/${userId}` : `/users/unfollow/${userId}`;
    return this.makeRequest(endpoint, { method: 'POST' });
  }

  // Generic HTTP methods for flexibility
  async get(endpoint: string, params: any = {}) {
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`${endpoint}${queryString}`);
  }

  async post(endpoint: string, data: any = {}) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint: string, data: any = {}) {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string) {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  // Notifications endpoints
  async getNotifications() {
    const endpoint = isProduction ? '/notifications' : '/notifications';
    return this.makeRequest(endpoint);
  }

  async markNotificationAsRead(notificationId: string) {
    const endpoint = isProduction ? `/notifications/${notificationId}/read` : `/notifications/${notificationId}/read`;
    return this.makeRequest(endpoint, { method: 'PUT' });
  }

  async markAllNotificationsAsRead() {
    const endpoint = isProduction ? '/notifications/read-all' : '/notifications/read-all';
    return this.makeRequest(endpoint, { method: 'PUT' });
  }

  async clearNotifications() {
    const endpoint = isProduction ? '/notifications' : '/notifications';
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
