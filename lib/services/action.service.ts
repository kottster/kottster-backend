import { Action } from "../models/action.model";
import { KottsterApp } from "../core/app";

import { GetDataForCodeGeneration } from "../actions/getDataForCodeGeneration.action";
import { SetupAdapter } from "../actions/setupAdapter.action";
import { PublishApp } from "../actions/publishApp.action";
import { SetProcedures } from "../actions/setProcedures.action";

export class ActionService {
  static getAction(app: KottsterApp, action: string): Action<any> {
    switch (action) {
      case 'getDataForCodeGeneration':
        return new GetDataForCodeGeneration(app);
      case 'setProcedures':
        return new SetProcedures(app);
      case 'publishApp':
        return new PublishApp(app);
      case 'setupAdapter':
        return new SetupAdapter(app);
      default:
        throw new Error(`Action ${action} not found`);
    }
  }
}