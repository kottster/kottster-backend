import { AppContext } from "./appContext.model";
import { Stage } from "./stage.model";

export type ProcedureFunction = (opts: { ctx: AppContext; args: Record<string, unknown>; }) => void;

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
}
