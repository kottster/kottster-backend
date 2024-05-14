import { Action } from "../models/action.model";
import { CodeWriter } from "../services/codeWriter.service";

interface ActionSpec {
  data: {
    pageId: string;
    
    components?: {
      type: string;
      id: string;
    }[];
  };
  result: {};
}

/**
 * Remove component procedures from the app
 */
export class RemoveProcedures extends Action<ActionSpec> {
  public async execute(data: ActionSpec['data']) {
    const { pageId, components } = data;
    
    const codeWriter = new CodeWriter();

    if (components) {
      // Remove all procedures for the component
      components.forEach(({ type, id }) => {
        codeWriter.removeComponentProceduresFile(pageId, type, id);
      });
    } else {
      // Remove all procedures for the page
      codeWriter.removePageProceduresFromFile(pageId);
    }

    return {};
  }
}