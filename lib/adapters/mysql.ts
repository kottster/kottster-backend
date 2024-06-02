import { DatabaseSchema, DatabaseSchemaColumn } from "../models/databaseSchema.model";
import { Adapter, AdapterType } from "../models/adapter.model";

export class MySQL extends Adapter {
  type = AdapterType.mysql;

  knexClientKey = 'mysql2';

  async getDatabaseSchema(): Promise<DatabaseSchema> {
    const schemaName = this.connectionOptions?.connection?.database;

    const tablesResult = await this.knex!.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_type = 'BASE TABLE'
    `, [schemaName]);

    const tables = tablesResult[0];

    const databaseSchema: DatabaseSchema = {
      name: schemaName,
      tables: []
    };

    for (const table of tables) {
      const tableName = table.TABLE_NAME;

      const columnsResult = await this.knex!.raw(`
        SELECT column_name, data_type, column_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = ? AND table_name = ?
      `, [schemaName, tableName]);

      const columns = columnsResult[0];

      const schemaColumns: DatabaseSchemaColumn[] = columns.map(column => {
        const enumValues = column.COLUMN_TYPE.includes('enum')
          ? column.COLUMN_TYPE.replace(/enum\((.*)\)/, '$1').replace(/'/g, '')
          : undefined;
          
        return {
          name: column.COLUMN_NAME,
          type: column.DATA_TYPE,
          nullable: column.IS_NULLABLE === 'YES',
          enumValues
        } as DatabaseSchemaColumn;
      });

      databaseSchema.tables.push({
        name: tableName,
        columns: schemaColumns
      });
    }

    return databaseSchema;
  }
}