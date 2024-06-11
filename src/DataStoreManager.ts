/// <reference path='../lib/openrct2.d.ts' />

import { DataStore } from './DataStore';
import { Manager } from './Manager';
import { DataStoreID } from './types/types';

class TilemanDataStoreManager extends Manager<DataStoreID, DataStore<any>> {
  /**
   * Runs initialize on all data stores
   */
  public initializeAll(isNewPark : boolean) : void {
    for (const id in DataStoreID) {
      this.getInstance(DataStoreID[id as keyof typeof DataStoreID]).initialize(isNewPark);
    }
  }

  /**
   * Runs loadData on all data stores
   */
  public loadAllData() : void {
    for (const id in DataStoreID) {
      this.getInstance(DataStoreID[id as keyof typeof DataStoreID]).loadData();
    }
  }

  /**
   * Runs storeData on all data stores
   */
  public storeAllData() : void {
    for (const id in DataStoreID) {
      this.getInstance(DataStoreID[id as keyof typeof DataStoreID]).storeData();
    }
  }
}

export const DataStoreManager : TilemanDataStoreManager = new TilemanDataStoreManager();