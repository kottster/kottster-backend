import { AdapterType } from "../models/adapter.model";
import { AdapterService } from "../services/adapter.service";

interface AdapterSpec {
  connectionOptions: any;
}

/**
 * Create an adapter
 * @param type The adapter type
 * @param data The adapter data
 */
export function createAdapter(type: AdapterType, data: AdapterSpec) {
  const adapter = AdapterService.getAdapter(type, data.connectionOptions);

  return adapter;
}
