import routes from '../routes';
import cors from 'cors';
import { Procedure, ProcedureFunction } from '../models/procedure.model';
import { Adapter } from '../models/adapter.model';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import express, { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';
import { Stage } from '../models/stage.model';
import { Role } from '../models/role.model';
import { getEnvOrThrow } from '../utils/getEnvOrThrow';
import { AppContext, ExtendAppContextFunction } from '../models/appContext.model';

export interface KottsterAppOptions {
  appId: string;
  secretKey: string;
}

/**
 * The main app class
 */
export class KottsterApp {
  public readonly appId: string;

  private readonly expressApp = express();
  private readonly jwtSecret = getEnvOrThrow('JWT_SECRET');
  private procedures: Procedure[] = [];
  public extendContext: ExtendAppContextFunction;
  
  public adapter: Adapter;

  constructor(options: KottsterAppOptions) {
    this.appId = options.appId;

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Inject an adapter into the app
   * @param adapter The adapter to use
   */
  public setAdapter(adapter: Adapter) {
    this.adapter = adapter;
    this.adapter?.connect();
  }

  /**
   * Create a context for a request
   * @param req The Express request object
   */
  public createContext(): AppContext {
    const ctx: AppContext = {};
    
    // Add the adapter instance to the context
    const ctxAdapterInstance = this.adapter.getContextInstance();
    if (ctxAdapterInstance) {
      ctx[ctxAdapterInstance.key] = ctxAdapterInstance.value;
    }

    return this.extendContext ? this.extendContext(ctx) : ctx;
  }

  /**
   * Set the context for each request
   * @param extendContext The function to extend the context
   */
  public setupContext(extendContext: ExtendAppContextFunction) {
    this.extendContext = extendContext;
  }

  /**
   * Get the procedures for a specific component
   * @param pageId The ID of the page
   * @param componentType The type of the component
   * @param componentId The ID of the component
   */
  public getComponentProcedures(stage: Stage, pageId: string, componentType: string, componentId: string) {
    const procedures = this.getProcedures();

    return procedures.filter(p => p.stage === stage && p.pageId === pageId && p.componentType === componentType && p.componentId === componentId);
  }

  public getProcedures() {
    return this.procedures;
  }

  /**
   * Register a procedure for a specific component
   * @param pageId The ID of the page
   * @param componentType The type of the component
   * @param componentId The ID of the component
   * @param procedureName The name of the procedure
   * @param fn The function to execute when the procedure is called
   */
  public registerProcedureForComponent(
    stage: Stage,
    pageId: string, 
    componentType: string, 
    componentId: string, 
    procedureName: string,
    procedureFunction: ProcedureFunction
  ): void {
    // Delete all existing procedures for the component
    this.procedures = this.procedures.filter(p => p.stage !== stage || p.pageId !== pageId || p.componentType !== componentType || p.componentId !== componentId);
    
    // Add the procedure
    this.procedures.push({
      stage,
      pageId,
      componentType,
      componentId,
      procedureName,
      function: procedureFunction
    });
  }

  get knex() {
    if (!this.adapter) {
      console.warn('Adapter not set');
      return;
    }

    return this.adapter.getKnexInstance();
  }

  /**
   * Get the auth middleware for Express
   * @param requiredRole The required role
   */
  private getAuthMiddleware = (requiredRole?: Role) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(' ')[1];
  
      if (!this.jwtSecret) {
        return res.status(500).json({ error: 'JWT secret not set' })
      }

      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
  
      try {
        const decodedToken = jwt.verify(token, this.jwtSecret) as { appId: string; role: Role };
        if (String(decodedToken.appId) !== String(this.appId)) {
          return res.status(401).json({ error: 'Invalid token' });
        }
        if (requiredRole && decodedToken.role !== requiredRole) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
  
        next();
      } catch (error) {
        console.debug('Error verifying token', token, error);
        return res.status(401).json({ error: 'Invalid token' });
      }
    };
  }

  private setupMiddleware(): void {
    this.expressApp.use(cors());
    this.expressApp.use(express.json());
    this.expressApp.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    this.expressApp.get('/', routes.healthcheck(this));
    this.expressApp.get('/action/:action', this.getAuthMiddleware(Role.DEVELOPER), routes.executeAction(this));
    this.expressApp.get('/execute/:stage/:pageId/:componentType/:componentId/:procedureName', this.getAuthMiddleware(), routes.executeProcedure(this));
  }

  /**
   * Start the Express server
   * @returns The server instance
   */
  public start(port: number): Server {
    return this.expressApp.listen(port, () => {
      console.log(`Kottster backend is running on port ${port}`);
      console.log(`SERVER URL: ${chalk.green(`http://localhost:${port}`)}`);
    });
  }
}
