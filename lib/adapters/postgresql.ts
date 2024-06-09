import { DatabaseSchema } from "../models/databaseSchema.model";
import { Adapter, AdapterType } from "../models/adapter.model";

export class PostgreSQL extends Adapter {
  type = AdapterType.postgresql;

  knexClientKey = 'pg';

  async getDatabaseSchema(): Promise<DatabaseSchema> {
    const schemaName = this.connectionOptions?.searchPath?.[0] || 'public';

    // Query to get all tables and their columns with enum values
    const tablesQueryResult = await this.knex!.raw(`
      SELECT
        t.table_name,
        c.column_name,
        c.data_type,
        CASE WHEN c.data_type = 'USER-DEFINED' THEN (
          SELECT string_agg(e.enumlabel, ', ')
          FROM pg_enum e
          JOIN pg_type t ON e.enumtypid = t.oid
          WHERE t.typname = c.udt_name
        ) ELSE NULL END AS enum_values,
        c.is_nullable = 'YES' AS nullable
      FROM
        information_schema.tables t
        JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      WHERE
        t.table_schema = ?;
    `, [schemaName]);

    const tablesData = tablesQueryResult.rows;

    // Building the schema object
    const schema: DatabaseSchema = {
      name: schemaName,
      tables: [],
    };

    for (const row of tablesData) {
      const tableName = row.table_name;
      let table = schema.tables.find(table => table.name === tableName);

      if (!table) {
        // Table doesn't exist in the schema, create a new table object
        table = {
          name: tableName,
          columns: [],
        };
        schema.tables.push(table);
      }

      // Add the column to the table
      table.columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.nullable,
        enumValues: row.enum_values,
      });
    }

    return schema;
  }
}
