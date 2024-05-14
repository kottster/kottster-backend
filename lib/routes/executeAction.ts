import { Request, Response } from 'express';
import { ActionService } from '../services/action.service';
import { KottsterApp } from '../core/app';

export async function executeAction(this: KottsterApp, req: Request, res: Response) {
  const { action } = req.params;
  
  // Parse action data
  const rawData = req.query.actionData;
  let data = {};
  if (rawData) {
    try {
      data = JSON.parse(rawData.toString());
    } catch (error) {
      res.status(400).json({ error: 'Invalid data' });
      return;
    }
  }

  try {
    // Process the request based on the action and data
    const result = await ActionService.getAction(this, action).execute(data);
    
    res.json({
      result,
    })
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
    return;
  }
}
