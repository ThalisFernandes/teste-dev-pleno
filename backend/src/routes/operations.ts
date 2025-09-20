import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { createOperationSchema, updateOperationSchema, operationFiltersSchema } from '../schemas/operation';
import { calculateOperationValue } from '../lib/fuelPrices';

const router = Router();

// todas as rotas precisam de autenticacao
router.use(authenticateToken);

// criar nova operacao
router.post('/', async (req, res, next) => {
  try {
    const data = createOperationSchema.parse(req.body);
    const operationDate = new Date(data.date);
    const month = operationDate.getMonth() + 1; // getMonth() retorna 0-11

    // calcula os valores automaticamente
    const { unitPrice, taxRate, totalValue } = calculateOperationValue(
      data.quantity,
      data.fuelType,
      month,
      data.type
    );

    // cria a operacao no banco
    const operation = await prisma.operation.create({
      data: {
        type: data.type,
        fuelType: data.fuelType,
        quantity: data.quantity,
        date: operationDate,
        pricePerLiter: unitPrice, // aq a gnt usa o nome correto do campo
        totalValue,
        userId: req.user!.userId
      }
    });

    res.status(201).json({
      message: 'Operação criada com sucesso',
      operation
    });
  } catch (error) {
    next(error);
  }
});

// listar operacoes do usuario
router.get('/', async (req, res, next) => {
  try {
    const filters = operationFiltersSchema.parse({
      ...req.query,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10
    });

    const where: any = {
      userId: req.user!.userId
    };

    // aplica filtros
    if (filters.type) where.type = filters.type;
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    // busca as operacoes com paginacao
    const [operations, total] = await Promise.all([
      prisma.operation.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit
      }),
      prisma.operation.count({ where })
    ]);

    res.json({
      operations,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// pegar operacao por id
router.get('/:id', async (req, res, next) => {
  try {
    const operation = await prisma.operation.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!operation) {
      return res.status(404).json({ error: 'Operação não encontrada' });
    }

    res.json(operation);
  } catch (error) {
    next(error);
  }
});

// atualizar operacao
router.put('/:id', async (req, res, next) => {
  try {
    const data = updateOperationSchema.parse(req.body);
    
    // verifica se a operacao existe e pertence ao usuario
    const existingOperation = await prisma.operation.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!existingOperation) {
      return res.status(404).json({ error: 'Operação não encontrada' });
    }

    // se mudou a data, recalcula os valores
    let updateData: any = { ...data };
    
    if (data.date || data.quantity || data.fuelType || data.type) {
      const operationDate = data.date ? new Date(data.date) : existingOperation.date;
      const month = operationDate.getMonth() + 1;
      const quantity = data.quantity ?? existingOperation.quantity;
      const fuelType = data.fuelType ?? existingOperation.fuelType;
      const type = data.type ?? existingOperation.type;

      const { unitPrice, taxRate, totalValue } = calculateOperationValue(
        quantity,
        fuelType,
        month,
        type
      );

      updateData = {
        ...updateData,
        pricePerLiter: unitPrice, // aq a gnt usa o nome correto do campo
        totalValue,
        date: operationDate
      };
    }

    const operation = await prisma.operation.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      message: 'Operação atualizada com sucesso',
      operation
    });
  } catch (error) {
    next(error);
  }
});

// deletar operacao
router.delete('/:id', async (req, res, next) => {
  try {
    // verifica se a operacao existe e pertence ao usuario
    const operation = await prisma.operation.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!operation) {
      return res.status(404).json({ error: 'Operação não encontrada' });
    }

    await prisma.operation.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Operação deletada com sucesso' });
  } catch (error) {
    next(error);
  }
});

// relatorio de diferenca entre compras e vendas
router.get('/reports/summary', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    
    // aplica os mesmos filtros da listagem
    const filters = operationFiltersSchema.parse({
      ...req.query,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10
    });
    
    // monta o where com filtros
    const where: any = { userId };
    if (filters.type) where.type = filters.type;
    if (filters.fuelType) where.fuelType = filters.fuelType;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    // busca operacoes com filtros aplicados
    const operations = await prisma.operation.findMany({
      where,
      select: {
        type: true,
        totalValue: true,
        fuelType: true,
        date: true
      }
    });

    // calcula totais por tipo
    const summary = operations.reduce((acc, op) => {
      if (op.type === 'COMPRA') {
        acc.totalCompras += op.totalValue;
      } else {
        acc.totalVendas += op.totalValue;
      }
      return acc;
    }, {
      totalCompras: 0,
      totalVendas: 0
    });

    // calcula a diferenca (vendas - compras = lucro/prejuizo)
    const diferenca = summary.totalVendas - summary.totalCompras;

    // agrupa por combustivel
    const porCombustivel = operations.reduce((acc, op) => {
      if (!acc[op.fuelType]) {
        acc[op.fuelType] = { compras: 0, vendas: 0 };
      }
      
      if (op.type === 'COMPRA') {
        acc[op.fuelType].compras += op.totalValue;
      } else {
        acc[op.fuelType].vendas += op.totalValue;
      }
      
      return acc;
    }, {} as Record<string, { compras: number; vendas: number }>);

    res.json({
      resumo: {
        totalCompras: Math.round(summary.totalCompras * 100) / 100,
        totalVendas: Math.round(summary.totalVendas * 100) / 100,
        diferenca: Math.round(diferenca * 100) / 100,
        resultado: diferenca > 0 ? 'LUCRO' : diferenca < 0 ? 'PREJUIZO' : 'EQUILIBRIO'
      },
      porCombustivel: Object.entries(porCombustivel).map(([fuel, values]) => ({
        combustivel: fuel,
        compras: Math.round(values.compras * 100) / 100,
        vendas: Math.round(values.vendas * 100) / 100,
        diferenca: Math.round((values.vendas - values.compras) * 100) / 100
      })),
      totalOperacoes: operations.length
    });
  } catch (error) {
    next(error);
  }
});

export { router as operationRoutes };