// tipos de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  _count?: {
    operations: number;
  };
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

// tipos de resumo - aq a gnt alinha com o q o backend retorna
export interface OperationSummary {
  resumo: {
    totalCompras: number;
    totalVendas: number;
    diferenca: number;
    resultado: 'LUCRO' | 'PREJUIZO' | 'EQUILIBRIO';
  };
  porCombustivel: Array<{
    combustivel: string;
    compras: number;
    vendas: number;
    diferenca: number;
  }>;
  totalOperacoes: number;
}