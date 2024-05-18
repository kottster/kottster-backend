import { Action } from "../models/action.model";
import { KottsterApp } from "../core/app";

import { GetDataForCodeGeneration } from "../actions/getDataForCodeGeneration.action";
import { addProcedures } from "../actions/addProcedures.action";
import { SetupAdapter } from "../actions/setupAdapter.action";
import { PublishApp } from "../actions/publishApp.action";
import { RemoveProcedures } from "../actions/removeProcedures.action";
import { GetProcedures } from "../actions/getProcedures.action";

export class ActionService {
  static getAction(app: KottsterApp, action: string): Action<any> {
    switch (action) {
      case 'getProcedures':
        return new GetProcedures(app);
      case 'getDataForCodeGeneration':
        return new GetDataForCodeGeneration(app);
      case 'addProcedures':
        return new addProcedures(app);
      case 'publishApp':
        return new PublishApp(app);
      case 'removeProcedures':
        return new RemoveProcedures(app);
      case 'setupAdapter':
        return new SetupAdapter(app);
      default:
        throw new Error(`Action ${action} not found`);
    }
  }
}