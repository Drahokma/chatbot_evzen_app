import { Response, Request, NextFunction } from "express";

import JWT from "jsonwebtoken";
import { config} from "../../../config";
import {NotAuthorizedError} from "./error-handler";
import {AuthPayload} from "../../../features/auth/interfaces/auth.interface";

export class AuthMiddleware {
  public async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.session?.jwt;
    if (!token) {
      throw new NotAuthorizedError("No token, authorization denied" );
    }

    try {
      const payload: AuthPayload = JWT.verify(token, config.JWT_TOKEN!) as AuthPayload;
      req.currentUser = payload;
    } catch (e) {
      throw new NotAuthorizedError("Token is invalid, please login again" );
    }
    next();
  }

  public async checkAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.currentUser) {
      throw new NotAuthorizedError("Authentication is required for this oute." );
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();

