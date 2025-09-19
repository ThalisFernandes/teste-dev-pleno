import axios from 'axios';
import { AuthResponse, LoginRequest, RegisterRequest, User, Operation, OperationFilters, OperationSummary } from '../types';

// config basica da api
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptor pra adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// interceptor pra lidar com erros de auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// servicos de auth
export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// servicos de usuario
export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  }
};

// servicos de operacoes
export const operationService = {
  async getOperations(filters?: OperationFilters): Promise<Operation[]> {
    const response = await api.get('/operations', { params: filters });
    return response.data;
  },

  async getOperation(id: string): Promise<Operation> {
    const response = await api.get(`/operations/${id}`);
    return response.data;
  },

  async createOperation(data: Omit<Operation, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'totalValue'>): Promise<Operation> {
    const response = await api.post('/operations', data);
    return response.data;
  },

  async updateOperation(id: string, data: Partial<Omit<Operation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Operation> {
    const response = await api.put(`/operations/${id}`, data);
    return response.data;
  },

  async deleteOperation(id: string): Promise<void> {
    await api.delete(`/operations/${id}`);
  },

  async getSummary(filters?: OperationFilters): Promise<OperationSummary> {
    const response = await api.get('/operations/summary', { params: filters });
    return response.data;
  }
};

export default api;