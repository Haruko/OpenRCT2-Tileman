/// <reference path='../lib/openrct2.d.ts' />

import { DataStore } from './DataStore';
import { Manager } from './Manager';
import { DataStoreID } from './types/types';

class TilemanDataStoreManager extends Manager<DataStoreID, DataStore<any>> {
  /**
   * Runs initialize on all data stores
   */
  public initializeAll(isNewPark : boolean) : void {
    Object.keys(DataStoreID)
      .filter((key : string) : boolean => isNaN(Number(key)))
      .forEach((key : string) : void => {
        this.getInstance(DataStoreID[key as keyof typeof DataStoreID]).initialize(isNewPark);
      });
  }

  /**
   * Runs loadData on all data stores
   */
  public loadAllData() : void {
    Object.keys(DataStoreID)
      .filter((key : string) : boolean => isNaN(Number(key)))
      .forEach((key : string) : void => {
        this.getInstance(DataStoreID[key as keyof typeof DataStoreID]).loadData();
      });
  }

  /**
   * Runs storeData on all data stores
   */
  public storeAllData() : void {
    Object.keys(DataStoreID)
      .filter((key : string) : boolean => isNaN(Number(key)))
      .forEach((key : string) : void => {
        this.getInstance(DataStoreID[key as keyof typeof DataStoreID]).storeData();
      });
  }
}

export const DataStoreManager : TilemanDataStoreManager = new TilemanDataStoreManager();