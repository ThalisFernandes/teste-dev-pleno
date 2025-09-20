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
  type: 'COMPRA' | 'VENDA';
  fuelType: 'GASOLINA' | 'ETANOL' | 'DIESEL';
  quantity: number;
  pricePerLiter: number;
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
  type?: 'COMPRA' | 'VENDA';
  fuelType?: 'GASOLINA' | 'ETANOL' | 'DIESEL';
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
    COMPRA: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
    VENDA: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
  };
  byFuelType: {
    GASOLINA: {
      count: number;
      totalValue: number;
      totalQuantity: number;
    };
    ETANOL: {
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