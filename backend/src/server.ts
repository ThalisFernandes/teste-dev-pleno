import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { authRoutes } from './routes/auth';
import { operationRoutes } from './routes/operations';
import { userRoutes } from './routes/users';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './swagger';

// carrega as variaveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// middleware de seguranca basico
app.use(helmet());

// cors configurado
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// rate limiting pra nao sobrecarregar a api
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // max 100 requests por IP
});
app.use(limiter);

// parsing do json
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// configuracao do swagger
setupSwagger(app);

// rotas da api
app.use('/api/auth', authRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/users', userRoutes);

// rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// middleware de tratamento de erros
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 Documentação API: http://localhost:${PORT}/api-docs`);
});