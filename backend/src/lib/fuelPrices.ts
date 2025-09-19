// aq ficam as tabelas de precos e tributos dos combustiveis
export interface FuelPriceData {
  gasolina: number;
  etanol: number;
  diesel: number;
  tributo: number;
}

// tabela de precos para COMPRA (valores em R$/litro)
export const PURCHASE_PRICES: Record<number, FuelPriceData> = {
  1: { gasolina: 5.92, etanol: 3.38, diesel: 5.87, tributo: 17.20 }, // janeiro
  2: { gasolina: 5.95, etanol: 3.53, diesel: 5.88, tributo: 19.30 }, // fevereiro
  3: { gasolina: 5.90, etanol: 3.56, diesel: 5.84, tributo: 18.10 }, // março
  4: { gasolina: 5.94, etanol: 3.63, diesel: 5.85, tributo: 19.20 }, // abril
  5: { gasolina: 5.93, etanol: 3.82, diesel: 5.86, tributo: 19.70 }, // maio
  6: { gasolina: 5.90, etanol: 3.81, diesel: 5.83, tributo: 20.10 }, // junho
  7: { gasolina: 5.89, etanol: 4.09, diesel: 5.93, tributo: 20.60 }, // julho
  8: { gasolina: 5.99, etanol: 4.06, diesel: 5.93, tributo: 21.10 }, // agosto
  9: { gasolina: 6.04, etanol: 4.07, diesel: 5.91, tributo: 21.60 }, // setembro
  10: { gasolina: 6.01, etanol: 4.03, diesel: 5.92, tributo: 22.10 }, // outubro
  11: { gasolina: 6.03, etanol: 4.02, diesel: 5.96, tributo: 22.60 }, // novembro
  12: { gasolina: 6.08, etanol: 4.10, diesel: 6.01, tributo: 23.10 }  // dezembro
};

// tabela de precos para VENDA (valores em R$/litro)
export const SALE_PRICES: Record<number, FuelPriceData> = {
  1: { gasolina: 5.94, etanol: 3.40, diesel: 5.88, tributo: 17.00 }, // janeiro
  2: { gasolina: 5.97, etanol: 3.55, diesel: 5.90, tributo: 19.00 }, // fevereiro
  3: { gasolina: 5.92, etanol: 3.58, diesel: 5.86, tributo: 18.00 }, // março
  4: { gasolina: 5.96, etanol: 3.65, diesel: 5.87, tributo: 19.00 }, // abril
  5: { gasolina: 5.95, etanol: 3.84, diesel: 5.88, tributo: 19.50 }, // maio
  6: { gasolina: 5.92, etanol: 3.83, diesel: 5.85, tributo: 20.00 }, // junho
  7: { gasolina: 5.91, etanol: 4.11, diesel: 5.95, tributo: 20.50 }, // julho
  8: { gasolina: 6.01, etanol: 4.08, diesel: 5.95, tributo: 21.00 }, // agosto
  9: { gasolina: 6.06, etanol: 4.09, diesel: 5.93, tributo: 21.50 }, // setembro
  10: { gasolina: 6.03, etanol: 4.05, diesel: 5.94, tributo: 22.00 }, // outubro
  11: { gasolina: 6.05, etanol: 4.04, diesel: 5.98, tributo: 22.50 }, // novembro
  12: { gasolina: 6.10, etanol: 4.12, diesel: 6.03, tributo: 23.00 }  // dezembro
};

export type FuelType = 'GASOLINA' | 'ETANOL' | 'DIESEL';
export type OperationType = 'COMPRA' | 'VENDA';

// pega o preco unitario do combustivel baseado no mes e tipo de operacao
export const getFuelPrice = (
  fuelType: FuelType, 
  month: number, 
  operationType: OperationType
): number => {
  const priceTable = operationType === 'COMPRA' ? PURCHASE_PRICES : SALE_PRICES;
  const monthData = priceTable[month];
  
  if (!monthData) {
    throw new Error(`Dados não encontrados para o mês ${month}`);
  }

  switch (fuelType) {
    case 'GASOLINA':
      return monthData.gasolina;
    case 'ETANOL':
      return monthData.etanol;
    case 'DIESEL':
      return monthData.diesel;
    default:
      throw new Error(`Tipo de combustível inválido: ${fuelType}`);
  }
};

// pega a taxa de tributo baseada no mes e tipo de operacao
export const getTaxRate = (month: number, operationType: OperationType): number => {
  const priceTable = operationType === 'COMPRA' ? PURCHASE_PRICES : SALE_PRICES;
  const monthData = priceTable[month];
  
  if (!monthData) {
    throw new Error(`Dados não encontrados para o mês ${month}`);
  }

  return monthData.tributo;
};

// calcula o valor total da operacao usando a formula:
// Valor = Quantidade × Preço × (1 + Tributo/100) × (1 + Selic/100)
export const calculateOperationValue = (
  quantity: number,
  fuelType: FuelType,
  month: number,
  operationType: OperationType,
  selicRate: number = 11.5
): { unitPrice: number; taxRate: number; totalValue: number } => {
  const unitPrice = getFuelPrice(fuelType, month, operationType);
  const taxRate = getTaxRate(month, operationType);
  
  // aplica a formula de calculo
  const totalValue = quantity * unitPrice * (1 + taxRate / 100) * (1 + selicRate / 100);
  
  return {
    unitPrice,
    taxRate,
    totalValue: Math.round(totalValue * 100) / 100 // arredonda pra 2 casas decimais
  };
};