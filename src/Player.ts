/// <reference path='../lib/openrct2.d.ts' />

import { Store, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';



/**
 * **********
 * Type Definitions
 * **********
 */

export type PlayerData = {
  // Tiles used by player
  tilesUsed : Store<number>,
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
   */
  public initialize() : void {

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
    const savedData : PlayerData = this.getStoredData();

    this.data.tilesUsed = savedData.tilesUsed;
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public storeData() : void {
    const savedData : PlayerData = this.getStoredData();

    savedData.tilesUsed = this.data.tilesUsed;
  }
}

export const Player : TilemanPlayer = new TilemanPlayer();