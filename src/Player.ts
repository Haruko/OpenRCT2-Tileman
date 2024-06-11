/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore, read, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { Storeless } from './types/types';



/**
 * **********
 * Type Definitions
 * **********
 */

export type PlayerData = {
  // Tiles used by player
  tilesUsed : WritableStore<number>,
};



class TilemanPlayer extends DataStore<PlayerData> {
  constructor() {
    super('player', {
      // Tiles used by player
      tilesUsed: store<number>(0),
    });
  }

  /**
   * Initialize this DataStore
   * @param isNewPark True if this is a new park
   */
  public initialize(isNewPark : boolean) : void {

  }



  /**
   * **********
   * Data Handling
   * **********
   */

  /**
   * Loads data from the persistent park-specific storage
   */
  public loadData() : void {
    const savedData : Storeless<PlayerData> = this.getStoredData();

    this.data.tilesUsed.set(savedData.tilesUsed);
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public override storeData() : void {
    const savedData : Storeless<PlayerData> = this.getStoredData();

    savedData.tilesUsed = read(this.data.tilesUsed);
  }
}

export const Player : TilemanPlayer = new TilemanPlayer();