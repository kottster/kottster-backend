import { Request, Response } from 'express';
import { KottsterApp } from '../core/app';

export async function healthcheck(this: KottsterApp, req: Request, res: Response) {
  const dbPingPassed = this.adapter ? (await this.adapter.pingDatabase()) : false;

  res.json({
    appId: this.appId,
    databasePingPassed: dbPingPassed,
  });
}
