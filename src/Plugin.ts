/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore, read, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { Park } from './Park';
import { Storeless } from './types/types';
import { Player } from './Player';



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
  
      expPerTile: store<number>(50), // Exp cost per tile
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
    this._registerEventHandlers();

    Park.initialize();
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
  public storeData() : void {
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
   * Event Handling
   * **********
   */

  /**
   * Register event handlers
   */
  private _registerEventHandlers() : void {
    // Subscribe to events
    context.subscribe('interval.tick', this._onTick.bind(this));
    context.subscribe('action.execute', this._onActionExecute.bind(this));
  }

  /**
   * Handles interval.tick event
   * @param tickCount 
   */
  private _onTick() : void {
    if (date.ticksElapsed % this.data.ticksPerUpdate === 0) {
      Park.collectMetrics();
      Park.storeData();
      Player.storeData();
    }
  }

  /**
   * Handles action.execute event
   * @param e Event data
   */
  private _onActionExecute(e : GameActionEventArgs) : void {
    if (e.action === 'ridedemolish') {
      // Every time a ride is deleted, remove it from the current rides and add it to the list of deleted rides
      // This action is raised if we cancel building something, but in that case the cost is 0
      if (e.result.cost !== 0) {
        const rideId : number = (e.args as { ride : number }).ride;
        Park.recordDemolishedRide(rideId);
      }
    }
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