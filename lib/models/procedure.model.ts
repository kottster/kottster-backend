import { KottsterApp } from "../core/app";
import { Stage } from "./stage.model";

export type ProcedureFunction = (this: KottsterApp, args: Record<string, unknown>) => void;

export interface Procedure {
  stage: Stage;
  pageId: string;
  componentType: string;
  componentId: string;
  procedureName: string;
  function: ProcedureFunction;
}

export interface FileProcedure extends Omit<Procedure, 'function'> {
  functionBody: string;
  filePath: string;
}
