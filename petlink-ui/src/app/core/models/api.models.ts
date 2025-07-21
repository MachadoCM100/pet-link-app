// API Response models that match the backend structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Authentication models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
}

export interface User {
  username: string;
  email: string;
  createdAt: string;
}

// Pet models
export interface Pet {
  id: number;
  name: string;
  type: string;
  description?: string;
  age?: number;
  adopted: boolean;
  createdAt: string;
}

export interface CreatePetRequest {
  name: string;
  type: string;
  description?: string;
  age?: number;
}

export interface UpdatePetRequest {
  name: string;
  type: string;
  description?: string;
  age?: number;
}

// Error handling models
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: string[];
  timestamp: string;
}
