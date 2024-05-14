import { Request, Response } from 'express';
import { KottsterApp } from '../core/app';
import { Stage } from '../models/stage.model';

export async function executeProcedure(this: KottsterApp, req: Request, res: Response) {
  // Check if adapter is set
  if (!this.adapter) {
    res.status(400).json({ error: 'Adapter not set' });
    return;
  }

  const { stage, pageId, componentType, componentId, procedureName } = req.params as { stage: Stage, pageId: string, componentType: string, componentId: string, procedureName: string };
  const params = req.query;

  try {
    const procedure = this.getComponentProcedures(stage, pageId, componentType, componentId)?.find(p => p.procedureName === procedureName);
    if (!procedure) {
      res.status(404).json({ error: 'Procedure not found' });
      return;
    }
  
    const result = await procedure.function.bind(this)(params);
    
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
