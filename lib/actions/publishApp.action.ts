import { Action } from "../models/action.model";
import { CodeWriter } from "../services/codeWriter.service";

interface ActionSpec {
  data: {};
  result: {};
}

/**
 * Publish the app
 * @description Copies files from the dev folder to the prod one
 */
export class PublishApp extends Action<ActionSpec> {
  public async execute() {
    const codeWriter = new CodeWriter();
    codeWriter.copyDevFilesToProd();

    return {};
  }
}