import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { generateToken, hashPassword, comparePassword } from '../lib/auth';
import { registerSchema, loginSchema } from '../schemas/auth';

const router = Router();

// rota de registro
router.post('/register', async (req, res, next) => {
  try {
    // valida os dados de entrada
    const { name, email, password } = registerSchema.parse(req.body);

    // verifica se o usuario ja existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    // cria hash da senha
    const hashedPassword = await hashPassword(password);

    // cria o usuario no banco
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // gera token jwt
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      user,
      token
    });
  } catch (error) {
    return next(error);
  }
});

// rota de login
router.post('/login', async (req, res, next) => {
  try {
    // valida os dados de entrada
    const { email, password } = loginSchema.parse(req.body);

    // busca o usuario no banco
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // verifica a senha
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // gera token jwt
    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return res.json({
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    return next(error);
  }
});

export { router as authRoutes };