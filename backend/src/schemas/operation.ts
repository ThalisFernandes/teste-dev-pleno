import { z } from 'zod';

// schema pra criar operacao
export const createOperationSchema = z.object({
  type: z.enum(['COMPRA', 'VENDA'], {
    errorMap: () => ({ message: 'Tipo deve ser COMPRA ou VENDA' })
  }),
  fuelType: z.enum(['GASOLINA', 'ETANOL', 'DIESEL'], {
    errorMap: () => ({ message: 'Combustível deve ser GASOLINA, ETANOL ou DIESEL' })
  }),
  quantity: z.number()
    .positive('Quantidade deve ser maior que zero')
    .max(100000, 'Quantidade muito alta'),
  date: z.string()
    .datetime('Data deve estar no formato ISO')
    .refine((date) => {
      const operationDate = new Date(date);
      const year = operationDate.getFullYear();
      return year === 2024;
    }, 'Data deve ser do ano de 2024')
});

// schema pra atualizar operacao
export const updateOperationSchema = createOperationSchema.partial();

// schema pra filtros de busca
export const operationFiltersSchema = z.object({
  type: z.enum(['COMPRA', 'VENDA']).optional(),
  fuelType: z.enum(['GASOLINA', 'ETANOL', 'DIESEL']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10)
});

export type CreateOperationInput = z.infer<typeof createOperationSchema>;
export type UpdateOperationInput = z.infer<typeof updateOperationSchema>;
export type OperationFilters = z.infer<typeof operationFiltersSchema>;