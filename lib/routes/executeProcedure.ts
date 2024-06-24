import { Request, Response } from 'express';
import { KottsterApp } from '../core/app';
import { Stage } from '../models/stage.model';

export const executeProcedure = (app: KottsterApp) => async (req: Request, res: Response) => {
  // Check if adapter is set
  if (!app.adapter) {
    res.status(500).json({ error: 'Adapter not set' });
    return;
  }

  const { stage, pageId, componentType, componentId, procedureName } = req.params as { stage: Stage, pageId: string, componentType: string, componentId: string, procedureName: string };
  const args = req.query;

  try {
    const procedure = app.getComponentProcedures(stage, pageId, componentType, componentId)?.find(p => p.procedureName === procedureName);
    if (!procedure) {
      res.status(400).json({ error: `Procedure ${procedureName} not found` });
      return;
    }

    const ctx = app.createContext(req);
    const result = await procedure.function({ ctx, args });
    
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
}
