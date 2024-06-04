/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore, read, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { Storeless } from './types/types';
import { Park } from './Park';



/**
 * **********
 * Type Definitions
 * **********
 */

type PluginData = {
  /**
   * Static data
   */
  readonly pluginName: 'Tileman',
  
  // Tools
  readonly minToolSize : number,
  readonly maxToolSize : number,

  /**
   * User definable
   */

  ticksPerUpdate : number, // Ticks per update of data

  expPerTile : WritableStore<number>, // Exp cost per tile
  minTiles : WritableStore<number>, // 1 path + 1 stall minimum

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
      
      // Tools
      minToolSize: 1,
      maxToolSize: 15,
  
      /**
       * User definable
       */
      ticksPerUpdate: 40, // Ticks per update of data
  
      expPerTile: store<number>(10), // Exp cost per tile
      minTiles: store<number>(2), // 1 path + 1 stall minimum
  
      expPerParkAdmission: store<number>(1),
  
      rideExpPerCustomer: store<number>(1),
      stallExpPerCustomer: store<number>(1),
      facilityExpPerCustomer: store<number>(1),
    });
  }

  /**
   * Initialize this DataStore
   */
  public initialize() : void {
    // Subscribe to events
    context.subscribe('interval.tick', () => Park.onTick(this.data.ticksPerUpdate));
    context.subscribe('action.execute', (e : GameActionEventArgs) => Park.onActionExecute(e));
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

    this.data.ticksPerUpdate = savedData.ticksPerUpdate;

    // Stores
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