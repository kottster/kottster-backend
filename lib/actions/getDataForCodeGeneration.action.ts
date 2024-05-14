import { Action } from "../models/action.model";
import { CodeExtractor } from "../services/codeExtractor.service";
import { DatabaseSchema } from "../models/databaseSchema.model";
import { FileProcedure } from "../models/procedure.model";

interface ActionSpec {
  data: {
    pageId: string;
    componentType: string;
    componentId: string;
  };
  result: {
    procedures: FileProcedure[];
    databaseSchema: DatabaseSchema;
  }
}

/**
 * Get the data needed for code generation
 */
export class GetDataForCodeGeneration extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']) {
    const { pageId, componentId, componentType } = data;
    
    // Get procedures
    const codeExtractor = new CodeExtractor();
    const procedures = await codeExtractor.getComponentProceduresFromFile(pageId, componentType, componentId);

    // Get database schema
    const databaseSchema = await this.app.adapter.getDatabaseSchema();
    
    return {
      procedures,
      databaseSchema,
    };
  }
}