import { Adapter, AdapterType } from "../models/adapter.model";
import { PostgreSQL } from "../adapters/postgresql";

export class AdapterService {
  static getAdapter(type: AdapterType, connectionOptions: unknown): Adapter {
    switch (type) {
      case AdapterType.postgresql:
        return new PostgreSQL(connectionOptions);
      default:
        throw new Error(`Adapter type ${type} not supported`);
    }
  }
}