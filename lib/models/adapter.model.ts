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
   * @param reloadOnFailure - If true, will attempt to reconnect to the database on failure
   */
  connect(reloadOnFailure = true): void {
    const connectionOptions = this.getConnectionOptions();

    this.knex = knex({
      client: this.knexClientKey,
      connection: typeof connectionOptions?.connection === 'object' ? {...connectionOptions?.connection} : connectionOptions?.connection,
      searchPath: connectionOptions?.searchPath,
    });

    if (reloadOnFailure) {
      // Handle connection errors
      this.knex.client.pool.on('error', (err) => {
        console.error('Database connection error:', err);
  
        setTimeout(() => {
          console.log('Attempting to reconnect to the database...');
          this.connect();
        }, 3000);
      });
    }
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

  /**
   * Get the instance that will be added to the context
   * @returns The key and value to add to the context
   */
  getContextInstance(): { key: string; value: any; } {
    return {
      key: 'knex',
      value: this.getKnexInstance(),
    }
  }

  abstract knexClientKey: string;

  abstract getDatabaseSchema(): Promise<DatabaseSchema>;
}
