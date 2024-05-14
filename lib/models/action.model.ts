import { KottsterApp } from "../core/app";

interface ActionSpec {
  data: any;
  result: Record<string, any>;
}

/**
 * The base class for all actions
 * @abstract
 */
export abstract class Action<T extends ActionSpec> {
  constructor(protected readonly app: KottsterApp) {}

  public abstract execute(data: T['data']): Promise<T['result']>;
}
