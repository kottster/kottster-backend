import { DatabaseSchema, DatabaseSchemaColumn } from "../models/databaseSchema.model";
import { Adapter, AdapterType } from "../models/adapter.model";

export class MySQL extends Adapter {
  type = AdapterType.mysql;

  knexClientKey = 'mysql2';

  async getDatabaseSchema(): Promise<DatabaseSchema> {
    const schemaName = this.connectionOptions?.connection?.database;

    const tablesResult = await this.knex!.raw(`
      SELECT table_name AS table_name
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_type = 'BASE TABLE'
    `, [schemaName]);

    const tables = tablesResult[0];

    const databaseSchema: DatabaseSchema = {
      name: schemaName,
      tables: []
    };

    for (const table of tables) {
      const tableName = table.table_name;

      const columnsResult = await this.knex!.raw(`
        SELECT 
          column_name AS column_name, 
          data_type AS data_type, 
          column_type AS column_type, 
          is_nullable AS is_nullable
        FROM information_schema.columns 
        WHERE table_schema = ? AND table_name = ?
      `, [schemaName, tableName]);

      const columns = columnsResult[0];

      const schemaColumns: DatabaseSchemaColumn[] = columns.map(column => {
        const enumValues = column.column_type.includes('enum')
          ? column.column_type.replace(/enum\((.*)\)/, '$1').replace(/'/g, '')
          : undefined;

        return {
          name: column.column_name,
          type: column.data_type,
          nullable: column.is_nullable === 'YES',
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