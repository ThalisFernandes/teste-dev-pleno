// aq a gnt testa as rotas de operacoes
import request from 'supertest';
import { app } from '../src/server';
import { prisma } from '../src/lib/prisma';

describe('Operations Routes', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // limpa o banco
    await prisma.operation.deleteMany();
    await prisma.user.deleteMany();

    // cria usuario e pega token
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123456'
    };

    const authResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authToken = authResponse.body.token;
    userId = authResponse.body.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/operations', () => {
    it('deve criar uma nova operacao', async () => {
      const operationData = {
        type: 'COMPRA',
        fuelType: 'GASOLINA',
        quantity: 50.5,
        pricePerLiter: 5.89,
        date: new Date().toISOString(),
        description: 'Abastecimento teste'
      };

      const response = await request(app)
        .post('/api/operations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(operationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe(operationData.type);
      expect(response.body.fuelType).toBe(operationData.fuelType);
      expect(response.body.quantity).toBe(operationData.quantity);
      expect(response.body.totalValue).toBe(operationData.quantity * operationData.pricePerLiter);
    });

    it('nao deve criar operacao sem autenticacao', async () => {
      const operationData = {
        type: 'COMPRA',
        fuelType: 'GASOLINA',
        quantity: 50.5,
        pricePerLiter: 5.89,
        date: new Date().toISOString()
      };

      await request(app)
        .post('/api/operations')
        .send(operationData)
        .expect(401);
    });
  });

  describe('GET /api/operations', () => {
    beforeEach(async () => {
      // cria algumas operacoes pra testar
      const operations = [
        {
          type: 'COMPRA',
          fuelType: 'GASOLINA',
          quantity: 50,
          pricePerLiter: 5.89,
          totalValue: 294.5,
          date: new Date(),
          userId
        },
        {
          type: 'VENDA',
          fuelType: 'ETANOL',
          quantity: 30,
          pricePerLiter: 4.29,
          totalValue: 128.7,
          date: new Date(),
          userId
        }
      ];

      for (const op of operations) {
        await prisma.operation.create({ data: op });
      }
    });

    it('deve listar operacoes do usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/operations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('fuelType');
    });

    it('nao deve listar operacoes sem autenticacao', async () => {
      await request(app)
        .get('/api/operations')
        .expect(401);
    });
  });

  describe('DELETE /api/operations/:id', () => {
    let operationId: string;

    beforeEach(async () => {
      const operation = await prisma.operation.create({
        data: {
          type: 'COMPRA',
          fuelType: 'GASOLINA',
          quantity: 50,
          pricePerLiter: 5.89,
          totalValue: 294.5,
          date: new Date(),
          userId
        }
      });
      operationId = operation.id;
    });

    it('deve deletar operacao do usuario', async () => {
      await request(app)
        .delete(`/api/operations/${operationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // verifica se foi deletada
      const operation = await prisma.operation.findUnique({
        where: { id: operationId }
      });
      expect(operation).toBeNull();
    });

    it('nao deve deletar operacao sem autenticacao', async () => {
      await request(app)
        .delete(`/api/operations/${operationId}`)
        .expect(401);
    });
  });
});