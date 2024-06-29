import { isStore, isWritableStore, read } from 'openrct2-flexui';
import { Storeless } from './types/types';
import { Singleton } from './Singleton';

export abstract class DataStore<DataStoreType extends Record<string, any>> extends Singleton {
  private _namespace : string | null;

  protected data : DataStoreType;
  private _dataDefaults : DataStoreType;

  protected constructor(namespace : string | null, data : DataStoreType) {
    super();
    
    this._namespace = namespace;
    this.data = data;
    this._dataDefaults = {} as DataStoreType;
    this._carefulCopy(data, this._dataDefaults);
  }

  /**
   * Initialize this DataStore
   */
  public abstract initialize() : void;

  /**
   * Resets this.data to the provided defaults
   */
  public loadDefaults() : void {
    this._carefulCopy(this._dataDefaults as Record<string, any>, this.data as Record<string, any>);
  }

  /**
   * Copies data from one object to another, being careful about Stores.
   * Does NOT delete keys in dest that don't exist in src!
   * @param src Source object
   * @param dest Destination object
   */
  protected _carefulCopy(src : Record<string, any> | DataStoreType, dest : Record<string, any> | DataStoreType) : void {
    src = src as Record<string, any>;
    dest = dest as Record<string, any>;

    for (const key in src as object) {
      const value = read(src[key]);

      if (isStore(dest[key])) {
        dest[key].set(value);
      } else {
        dest[key] = value;
      }
    }
  }

  /**
   * Gets stored data
   * @param key Key to retrieve value of
   * @returns Value of the key
   */
  public get(key : keyof DataStoreType) : any {
    return this.data[key];
  }

  /**
   * Sets stored data
   * @param key Key to set value of
   * @returns True if the setting was successful
   */
  public set(key : keyof DataStoreType, value : any) : boolean {
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
  private getStoredData() : Storeless<DataStoreType> | null {
    if (this._namespace) {
      const savedData = context.getParkStorage().getAll()[this._namespace];

      if (typeof savedData === 'undefined') {
        const newData = {};
        context.getParkStorage().set(this._namespace, newData);
        this.storeData();

        return newData as Storeless<DataStoreType>;
      } else {
        return savedData as Storeless<DataStoreType>;
      }
    } else {
      return null;
    }
  }

  /**
   * Loads data from the persistent park-specific storage
   */
  public loadData() : void {
    const savedData : Storeless<DataStoreType> | null = this.getStoredData();

    if (savedData !== null) {
      for (const key in this.data) {
        const savedValue : any = savedData[key];

        // Filter to only things that are Stores.
        // Otherwise we can't release updates that change these properties.
        if (isWritableStore(this.data[key])) {
          this.data[key].set(savedValue);
        }
      }
    }
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public storeData() : void {
    const savedData : Storeless<DataStoreType> | null = this.getStoredData();

    if (savedData !== null) {
      for (const key in this.data) {
        // Filter to only things that are Stores.
        // Otherwise we can't release updates that change these properties.
        if (isStore(this.data[key])) {
          savedData[key] = read(this.data[key]);
        }
      }
    }
  }
}