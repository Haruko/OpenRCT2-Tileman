import { DataStore } from './DataStore';
import { Manager } from './Manager';
import { DataStoreID } from './types/enums';

export class DataStoreManager extends Manager<DataStoreID, DataStore<any>> {
  /**
   * Runs initialize on all data stores
   */
  public initializeAll() : void {
    Object.keys(DataStoreID)
      .filter((key : string) : boolean => isNaN(Number(key)))
      .forEach((key : string) : void => {
        this.getInstance(DataStoreID[key as keyof typeof DataStoreID])?.initialize();
      });
  }

  /**
   * Runs loadData on all data stores
   */
  public loadAllData() : void {
    Object.keys(DataStoreID)
      .filter((key : string) : boolean => isNaN(Number(key)))
      .forEach((key : string) : void => {
        this.getInstance(DataStoreID[key as keyof typeof DataStoreID])?.loadData();
      });
  }

  /**
   * Runs storeData on all data stores
   */
  public storeAllData() : void {
    Object.keys(DataStoreID)
      .filter((key : string) : boolean => isNaN(Number(key)))
      .forEach((key : string) : void => {
        this.getInstance(DataStoreID[key as keyof typeof DataStoreID])?.storeData();
      });
  }
}