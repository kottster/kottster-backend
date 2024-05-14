import { Action } from "../models/action.model";
import { FileProcedure } from "../models/procedure.model";
import { CodeWriter } from "../services/codeWriter.service";

interface ActionSpec {
  data: {
    pageId: string;
    componentType: string;
    componentId: string;

    procedures: FileProcedure[];
  };
  result: any;
}

/**
 * Add component procedures to the app
 */
export class addProcedures extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']) {
    const { pageId, componentType, componentId, procedures } = data;

    const codeWriter = new CodeWriter();
    codeWriter.writeComponentProceduresToFile(pageId, componentType, componentId, procedures);

    return {};
  }
}