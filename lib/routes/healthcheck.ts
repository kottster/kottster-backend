import { Request, Response } from 'express';
import { KottsterApp } from '../core/app';

export const healthcheck = (app: KottsterApp) => async (req: Request, res: Response) => {
  res.json({
    appId: app.appId,
  });
}
