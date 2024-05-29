import { Action } from "../models/action.model";
import { DatabaseSchema } from "../models/databaseSchema.model";

interface ActionSpec {
  data: {};
  result: {
    databaseSchema: DatabaseSchema;
  }
}

/**
 * Get the data needed for code generation
 */
export class GetDataForCodeGeneration extends Action<ActionSpec> {
  public async execute() {
    // Get database schema
    const databaseSchema = await this.app.adapter.getDatabaseSchema();
    
    return {
      databaseSchema,
    };
  }
}