import { Adapter, AdapterType } from "../models/adapter.model";
import { PostgreSQL } from "../adapters/postgresql";
import { MySQL } from "../adapters/mysql";

export class AdapterService {
  static getAdapter(type: AdapterType, connectionOptions: unknown): Adapter {
    switch (type) {
      case AdapterType.postgresql:
        return new PostgreSQL(connectionOptions);
      case AdapterType.mysql:
        return new MySQL(connectionOptions);
      default:
        throw new Error(`Adapter type ${type} not supported`);
    }
  }
}