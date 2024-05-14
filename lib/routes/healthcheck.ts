import { Request, Response } from 'express';
import { KottsterApp } from '../core/app';

export async function healthcheck(this: KottsterApp, req: Request, res: Response) {
  // Ping the database
  let pingPassed: boolean;
  try {
    const pingResult = await this.knex?.raw('SELECT 1');
    pingPassed = pingResult?.rows.length > 0;
  } catch (e) {
    console.error(e);
    pingPassed = false;
  }

  res.json({
    appId: this.appId,
    pingPassed,
  });
}
