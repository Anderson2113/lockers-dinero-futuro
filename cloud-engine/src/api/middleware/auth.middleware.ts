import { Request, Response, NextFunction } from 'express';
import { logWarn } from '../../utils/logger.js';

const API_SECRET_KEY = process.env.API_SECRET_KEY || 'dev-secret-key-123';

export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logWarn('Auth', 'Intento de acceso sin token Bearer');
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  if (token !== API_SECRET_KEY) {
    logWarn('Auth', 'Intento de acceso con token inválido');
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid token' });
  }

  next();
};
