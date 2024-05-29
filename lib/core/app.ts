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
  
  public adapter: Adapter;

  constructor(options: KottsterAppOptions) {
    this.appId = options.appId;

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Inject a adapter into the application
   * @param adapter The adapter to use
   */
  public setAdapters(adapters: Adapter[]) {
    // TODO: allow multiple adapters
    this.adapter = adapters?.[0] ?? null;

    this.adapter?.connect();
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
   * Add the context to a passed function
   * @param fn The function to add context to
   */
  private addContext<T extends Function>(fn: T): T {
    // TODO: use proxy object instead of KottsterApp instance
    return fn.bind(this);
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
    procedure: ProcedureFunction
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
      function: this.addContext(procedure)
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
    this.expressApp.get('/', routes.healthcheck.bind(this));
    this.expressApp.get('/action/:action', this.getAuthMiddleware(Role.DEVELOPER), routes.executeAction.bind(this));
    this.expressApp.get('/execute/:stage/:pageId/:componentType/:componentId/:procedureName', this.getAuthMiddleware(), routes.executeProcedure.bind(this));
    
    Object.entries(routes).forEach(([route, handler]) => {
      this.expressApp.get(route, handler);
    })
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
