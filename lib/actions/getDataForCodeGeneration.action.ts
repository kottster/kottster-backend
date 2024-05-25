import { Action } from "../models/action.model";
import { DatabaseSchema } from "../models/databaseSchema.model";

interface ActionSpec {
  data: {
    pageId: string;
    componentType: string;
    componentId: string;
  };
  result: {
    databaseSchema: DatabaseSchema;
  }
}

/**
 * Get the data needed for code generation
 */
export class GetDataForCodeGeneration extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']) {
    // Get database schema
    const databaseSchema = await this.app.adapter.getDatabaseSchema();
    
    return {
      databaseSchema,
    };
  }
}