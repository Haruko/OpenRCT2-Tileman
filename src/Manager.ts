/// <reference path='../lib/openrct2.d.ts' />

export class Manager<IDType extends string | number | symbol, InstanceType> {
  private readonly _instances : Record<IDType, InstanceType> = {} as Record<IDType, InstanceType>;

  /**
   * Registers an instance if it doesn't already exist
   * @param id ID to register to
   * @param instance Instance to register
   * @returns True if the instance was set, otherwise false 
   */
  public registerInstance(id : IDType, instance : InstanceType) : boolean {
    if (typeof this._instances[id] === 'undefined') {
      console.log('register', id)
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