import { Adapter, AdapterType } from "../models/adapter.model";
import { PostgreSQL } from "../adapters/postgresql";
import { MySQL } from "../adapters/mysql";
import { MSSQL } from "../adapters/mssql";
import { MariaDB } from "../adapters/mariadb";

export class AdapterService {
  static getAdapter(type: AdapterType, connectionOptions: unknown): Adapter {
    switch (type) {
      case AdapterType.postgresql:
        return new PostgreSQL(connectionOptions);
      case AdapterType.mysql:
        return new MySQL(connectionOptions);
      case AdapterType.mariadb:
        return new MariaDB(connectionOptions);
      case AdapterType.mssql:
        return new MSSQL(connectionOptions);
      default:
        throw new Error(`Adapter type ${type} not supported`);
    }
  }
}