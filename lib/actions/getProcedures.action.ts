import { Action } from "../models/action.model";
import { FileProcedure } from "../models/procedure.model";
import { CodeExtractor } from "../services/codeExtractor.service";

interface ActionSpec {
  data: {
    pageId: string;
    componentType: string;
    componentId: string;
  };
  result: {
    procedures: FileProcedure[]
  };
}

/**
 * Get component procedures from the file
 */
export class GetProcedures extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']) {
    const { pageId, componentType, componentId } = data;

    const codeExtractor = new CodeExtractor();
    const procedures = await codeExtractor.getComponentProceduresFromFile(pageId, componentType, componentId);

    return {
      procedures
    }
  }
}