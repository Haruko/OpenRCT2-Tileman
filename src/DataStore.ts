export class DataStore<DataStoreType> {
  private _namespace : string;

  protected data : DataStoreType;
  private _dataDefaults : DataStoreType;

  protected constructor(namespace : string, data : DataStoreType) {
    this._namespace = namespace;
    this.data = data;
    this._dataDefaults = this.deepCopy(data as object) as DataStoreType;
  }

  /**
   * Deep copies data in an object
   * @param src Object to copy
   * @param dest Optional object to copy to
   * @returns Copy of obj
   */
  protected deepCopy(src : Record<string, any>, dest? : Record<string, any>) : Record<string, any> {
    const newObj : Record<string, any> = dest ?? {};

    for (const key in src) {
      const value : any = src[key];

      if (typeof value === 'object' && value !== null) {
        newObj[key] = this.deepCopy(value);
      } else {
        newObj[key] = value;
      }
    }

    return newObj;
  }

  /**
   * Resets this.data to the provided defaults
   */
  protected _restoreDataDefaults() : void {
    this.deepCopy(this._dataDefaults as Record<string, any>, this.data as Record<string, any>);
  }

  /**
   * Gets stored data
   * @param key Key to retrieve value of
   * @returns Value of the key
   */
  public getValue(key : keyof DataStoreType) : any {
    return this.data[key];
  }

  /**
   * Sets stored data
   * @param key Key to set value of
   * @returns True if the setting was successful
   */
  public setValue(key : keyof DataStoreType, value : any) : boolean {
    if (typeof this.data[key] === typeof value) {
      this.data[key] = value;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Loads data from the persistent park-specific storage
   */
  public getStoredData() : DataStoreType {
    return context.getParkStorage().getAll(this._namespace) as DataStoreType;
  }
}