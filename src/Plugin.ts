/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore, read, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { Storeless } from './types/types';



/**
 * **********
 * Type Definitions
 * **********
 */

export type PluginData = {
  /**
   * Static data
   */
  readonly pluginName: 'Tileman',

  readonly doubleClickLength : number,
  
  // Tools
  readonly minToolSize : number,
  readonly maxToolSize : number,

  /**
   * User definable
   */

  ticksPerUpdate : WritableStore<number>, // Ticks per update of data

  tileXpCost : WritableStore<number>, // Exp cost per tile
  startingTiles : WritableStore<number>, // 1 path + 1 stall minimum

  // Guest actions
  parkAdmissionXp : WritableStore<number>,
  rideAdmissionXp : WritableStore<number>,
  stallBuyXp : WritableStore<number>,
  facilityUseXp : WritableStore<number>,
};



class TilemanPlugin extends DataStore<PluginData> {
  constructor() {
    super('plugin', {
      /**
       * Static data
       */
      pluginName: 'Tileman',

      doubleClickLength: 2000, //ms
      
      // Tools
      minToolSize: 1,
      maxToolSize: 15,
  
      /**
       * User definable
       */
      ticksPerUpdate: store<number>(40), // Ticks per update of data
  
      tileXpCost: store<number>(1000), // Exp cost per tile
      startingTiles: store<number>(2), // 1 path + 1 stall minimum

      // Guest actions
      parkAdmissionXp: store<number>(1),
      rideAdmissionXp: store<number>(1),
      stallBuyXp: store<number>(2),
      facilityUseXp: store<number>(4),
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
    const savedData : Storeless<PluginData> = this.getStoredData();

    this.data.ticksPerUpdate.set(savedData.ticksPerUpdate);

    this.data.tileXpCost.set(savedData.tileXpCost);
    this.data.startingTiles.set(savedData.startingTiles);

    this.data.parkAdmissionXp.set(savedData.parkAdmissionXp);

    this.data.rideAdmissionXp.set(savedData.rideAdmissionXp);
    this.data.stallBuyXp.set(savedData.stallBuyXp);
    this.data.facilityUseXp.set(savedData.facilityUseXp);
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public override storeData() : void {
    const savedData : Storeless<PluginData> = this.getStoredData();

    savedData.ticksPerUpdate = read(this.data.ticksPerUpdate);
    savedData.tileXpCost = read(this.data.tileXpCost);
    savedData.startingTiles = read(this.data.startingTiles);
    savedData.parkAdmissionXp = read(this.data.parkAdmissionXp);
    savedData.rideAdmissionXp = read(this.data.rideAdmissionXp);
    savedData.stallBuyXp = read(this.data.stallBuyXp);
    savedData.facilityUseXp = read(this.data.facilityUseXp);
  }



  /**
   * **********
   * Other
   * **********
   */

  /**
   * Checks if OpenRCT2 is running in client mode and is in a normal game (not editor)
   * @returns true if running in a valid config for this plugin
   */
  public isValidRunConfig() : boolean {
    return typeof ui !== 'undefined' && context.mode === 'normal';
  }
}

export const Plugin : TilemanPlugin = new TilemanPlugin();