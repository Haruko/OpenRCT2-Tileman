export class Singleton {
  private static _instance : Singleton;

  /**
   * Prevent Singletons from being constructed, only access through Singletons.instance();
   */
  protected constructor() {}

  /**
   * Gets the singleton instance of this Singleton. Respects derived classes.
   * @returns Singleton instance
   */
  public static instance<T extends Singleton>() : T {
    if (typeof this._instance === 'undefined') {
      this._instance = new this();
    }

    return this._instance as T;
  }
}