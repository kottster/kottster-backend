import { Action } from "../models/action.model";
import { FileProcedure } from "../models/procedure.model";
import { Stage } from "../models/stage.model";
import { CodeWriter } from "../services/codeWriter.service";

interface ActionSpec {
  data: {
    stage: Stage;
    procedures: FileProcedure[];
  };
  result: any;
}

/**
 * Set procedures to the app
 */
export class SetProcedures extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']) {
    const { stage, procedures } = data;

    const codeWriter = new CodeWriter();
    codeWriter.writeProceduresToFile(stage, procedures);

    return {};
  }
}