import { Action } from "../models/action.model";
import { Adapter, AdapterType } from "../models/adapter.model";
import { CodeWriter } from "../services/codeWriter.service";
import { AdapterService } from "../services/adapter.service";

interface ActionSpec {
  data: {
    type: AdapterType;
    connectionOptions: unknown;
  };
  result: {
    noTables: boolean;
  };
}

/**
 * Setup the adapter for the app
 */
export class SetupAdapter extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']): Promise<ActionSpec['result']> {
    const adapter = AdapterService.getAdapter(data.type, data.connectionOptions);

    try {
      await adapter.connect();
      await adapter.pingDatabase();
    } catch (error) {
      throw new Error(`Failed to connect to the database: ${error.message}`);
    };

    // Check for tables in the database
    const databaseSchema = await adapter.getDatabaseSchema();
    const noTables = databaseSchema.tables.length === 0;

    await this.createAdapterFile(adapter);

    await adapter.destroyConnection();

    return {
      noTables
    };
  }

  async createAdapterFile(adapter: Adapter): Promise<void> {
    const codeWriter = new CodeWriter();

    codeWriter.writeAdapterToFile(adapter);
  }
}