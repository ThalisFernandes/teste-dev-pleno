// aq a gnt configura o swagger pra documentacao da API
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Combustível Manager API',
      version: '1.0.0',
      description: 'API para gestão de operações de combustível com cálculo de impostos',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Operation: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['COMPRA', 'VENDA'] },
            fuelType: { type: 'string', enum: ['GASOLINA', 'ETANOL', 'DIESEL', 'GNV'] },
            quantity: { type: 'number', format: 'float' },
            pricePerLiter: { type: 'number', format: 'float' },
            totalValue: { type: 'number', format: 'float' },
            date: { type: 'string', format: 'date-time' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            userId: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        CreateOperationRequest: {
          type: 'object',
          required: ['type', 'fuelType', 'quantity', 'pricePerLiter', 'date'],
          properties: {
            type: { type: 'string', enum: ['COMPRA', 'VENDA'] },
            fuelType: { type: 'string', enum: ['GASOLINA', 'ETANOL', 'DIESEL', 'GNV'] },
            quantity: { type: 'number', format: 'float' },
            pricePerLiter: { type: 'number', format: 'float' },
            date: { type: 'string', format: 'date-time' },
            description: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // caminho pros arquivos com anotacoes
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Combustível Manager API',
  }));
};