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

  expPerTile : WritableStore<number>, // Exp cost per tile
  minTiles : WritableStore<number>, // 1 path + 1 stall minimum

  // Guest actions
  expPerParkAdmission : WritableStore<number>,
  rideExpPerCustomer : WritableStore<number>,
  stallExpPerCustomer : WritableStore<number>,
  facilityExpPerCustomer : WritableStore<number>,
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
  
      expPerTile: store<number>(1000), // Exp cost per tile
      minTiles: store<number>(2), // 1 path + 1 stall minimum

      // Guest actions
      expPerParkAdmission: store<number>(1),
      rideExpPerCustomer: store<number>(1),
      stallExpPerCustomer: store<number>(2),
      facilityExpPerCustomer: store<number>(4),
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

    this.data.expPerTile.set(savedData.expPerTile);
    this.data.minTiles.set(savedData.minTiles);

    this.data.expPerParkAdmission.set(savedData.expPerParkAdmission);

    this.data.rideExpPerCustomer.set(savedData.rideExpPerCustomer);
    this.data.stallExpPerCustomer.set(savedData.stallExpPerCustomer);
    this.data.facilityExpPerCustomer.set(savedData.facilityExpPerCustomer);
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public override storeData() : void {
    const savedData : Storeless<PluginData> = this.getStoredData();

    savedData.ticksPerUpdate = read(this.data.ticksPerUpdate);
    savedData.expPerTile = read(this.data.expPerTile);
    savedData.minTiles = read(this.data.minTiles);
    savedData.expPerParkAdmission = read(this.data.expPerParkAdmission);
    savedData.rideExpPerCustomer = read(this.data.rideExpPerCustomer);
    savedData.stallExpPerCustomer = read(this.data.stallExpPerCustomer);
    savedData.facilityExpPerCustomer = read(this.data.facilityExpPerCustomer);
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