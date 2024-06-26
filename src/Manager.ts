/// <reference path='../lib/openrct2.d.ts' />

export class Manager<IDType extends string | number | symbol, InstanceType> {
  private static _instance : Manager<any, any>;
  private readonly _instances : Record<IDType, InstanceType> = {} as Record<IDType, InstanceType>;

  

  /**
   * Prevent Managers from being constructed, only access through Manager.instance();
   */
  protected constructor() {}

  /**
   * Gets the singleton instance of this Manager. Respects derived classes.
   * @returns Singleton instance
   */
  public static instance<T extends Manager<any, any>>() : T {
    if (typeof this._instance === 'undefined') {
      this._instance = new this();
    }

    return this._instance as T;
  }

  /**
   * Registers an instance if it doesn't already exist
   * @param id ID to register to
   * @param instance Instance to register
   * @returns True if the instance was set, otherwise false 
   */
  public registerInstance(id : IDType, instance : InstanceType) : boolean {
    if (typeof this._instances[id] === 'undefined') {
      this._instances[id] = instance;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Gets an instance
   * @param id ID of the instance to retrieve
   * @returns The requested instance if it exists
   */
  public getInstance(id : IDType) : InstanceType {
    return this._instances[id];
  }
}