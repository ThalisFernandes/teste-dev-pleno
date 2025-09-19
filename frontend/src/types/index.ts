// tipos de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// tipos de operacao
export interface Operation {
  id: string;
  type: 'BUY' | 'SELL';
  fuelType: 'GASOLINE' | 'ETHANOL' | 'DIESEL';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// tipos de auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// tipos de filtros
export interface OperationFilters {
  type?: 'BUY' | 'SELL';
  fuelType?: 'GASOLINE' | 'ETHANOL' | 'DIESEL';
  startDate?: string;
  endDate?: string;
}

// tipos de resumo
export interface OperationSummary {
  totalOperations: number;
  totalValue: number;
  totalQuantity: number;
  averagePrice: number;
  byType: {
    BUY: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
    SELL: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
  };
  byFuelType: {
    GASOLINE: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
    ETHANOL: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
    DIESEL: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
  };
}