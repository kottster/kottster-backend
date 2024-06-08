import { AdapterType } from "../models/adapter.model";
import { MySQL } from "./mysql";

export class MariaDB extends MySQL {
  type = AdapterType.mariadb;
}