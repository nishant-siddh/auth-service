// src/@types/express/index.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  export interface Request {
    user?: JwtPayload | any;
  }
}
