import { Action } from "../models/action.model";
import { Adapter, AdapterType } from "../models/adapter.model";
import { CodeWriter } from "../services/codeWriter.service";
import { AdapterService } from "../services/adapter.service";

interface ActionSpec {
  data: {
    type: AdapterType;
    connectionOptions: unknown;
  };
  result: {};
}

/**
 * Setup the adapter for the app
 */
export class SetupAdapter extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']) {
    const adapter = AdapterService.getAdapter(data.type, data.connectionOptions);

    // Validate the connection options
    await this.validateConnectionOptions(adapter);

    await this.createAdapterFile(adapter);

    return {};
  }

  async validateConnectionOptions(adapter: Adapter): Promise<void> {
    try {
      adapter.connect();
      
      // Ping the database to ensure the connection is working
      await adapter.pingDatabase();

      adapter.destroyConnection();
    } catch (error) {
      throw new Error(`Failed to connect to the database: ${error.message}`);
    };
  }

  async createAdapterFile(adapter: Adapter): Promise<void> {
    const codeWriter = new CodeWriter();

    codeWriter.writeAdapterToFile(adapter);
  }
}