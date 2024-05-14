import { Knex, knex } from "knex";
import { DatabaseSchema } from "./databaseSchema.model";

export enum AdapterType {
  postgresql = 'postgresql',
  mysql = 'mysql',
  mariadb = 'mariadb',
  sqlite = 'sqlite',
  oracle = 'oracle',
  mssql = 'mssql',
}

/**
 * The base class for all database adapters
 * @abstract
 */
export abstract class Adapter {
  abstract type: AdapterType;
  protected knex?: Knex;

  constructor(
    protected connectionOptions: any
  ) {}

  /**
   * Connect to the database
   */
  connect(): void {
    const connectionOptions = this.getConnectionOptions();

    this.knex = knex({
      client: this.type,
      connection: typeof connectionOptions?.connection === 'object' ? {...connectionOptions?.connection} : connectionOptions?.connection,
      searchPath: connectionOptions?.searchPath,
    });
  };

  getConnectionOptions(): any {
    return this.connectionOptions;
  }

  pingDatabase() {
    return this.knex?.raw('SELECT 1');
  }

  destroyConnection(): void {
    if (this.knex) {
      this.knex.destroy();
      this.knex = undefined;
    }
  }

  getKnexInstance(): Knex {
    if (!this.knex) {
      throw new Error('Database connection not established');
    }

    return this.knex;
  }

  abstract getDatabaseSchema(): Promise<DatabaseSchema>;
}
