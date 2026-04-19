import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      User?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
