import { Knex, knex } from "knex";
import { DatabaseSchema } from "./databaseSchema.model";
import { attachPaginate } from 'knex-paginate';

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
  ) {
    try {
      attachPaginate();
    } catch (e) {
      console.error('Error attaching paginate to knex', e);
    }
  }

  /**
   * Connect to the database
   */
  connect(): void {
    const connectionOptions = this.getConnectionOptions();

    this.knex = knex({
      client: this.knexClientKey,
      connection: typeof connectionOptions?.connection === 'object' ? {...connectionOptions?.connection} : connectionOptions?.connection,
      searchPath: connectionOptions?.searchPath,
    });

    // Handle connection errors
    this.knex.client.pool.on('error', (err) => {
      console.error('Database connection error:', err);

      setTimeout(() => {
        console.log('Attempting to reconnect to the database...');
        this.connect();
      }, 3000);
    });
  };

  getConnectionOptions(): any {
    return this.connectionOptions;
  }

  async pingDatabase(): Promise<boolean> {
    try {
      await this.knex?.raw('SELECT 1');
      return true;
    } catch (e) {
      console.error(e);
    }
    return false;
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

  abstract knexClientKey: string;

  abstract getDatabaseSchema(): Promise<DatabaseSchema>;
}
