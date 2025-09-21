import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

// middleware global pra tratar erros
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Erro capturado:', error);

  // erro de validacao do zod
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // erros do prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Dados duplicados',
          message: 'Este registro já existe'
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Registro não encontrado'
        });
      default:
        return res.status(500).json({
          error: 'Erro no banco de dados',
          message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
        });
    }
  }

  // erro generico
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};