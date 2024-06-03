/// <reference path='../lib/openrct2.d.ts' />

import { DataStore } from './DataStore';
import { TilemanPark } from './Park';



/**
 * **********
 * Type Definitions
 * **********
 */

type PluginData = {
  /**
   * Static data
   */
  pluginName: 'Tileman',
  
  // Tools
  readonly minToolSize : number,
  readonly maxToolSize : number,

  // UI
  readonly doubleClickLength : number,

  /**
   * User definable
   */

  ticksPerUpdate : number, // Ticks per update of data

  expPerTile : number, // Exp cost per tile
  minTiles : number, // 1 path + 1 stall minimum

  expPerParkAdmission : number,

  rideExpPerCustomer : number,
  stallExpPerCustomer : number,
  facilityExpPerCustomer : number,
};



export class Plugin extends DataStore<PluginData> {
  // Only access functions through instance
  public static readonly instance : Plugin = new Plugin();

  private constructor() {
    super('plugin', {
      /**
       * Static data
       */
      pluginName: 'Tileman',
      
      // Tools
      minToolSize: 1,
      maxToolSize: 15,
  
      // UI
      doubleClickLength: 2000,
  
      /**
       * User definable
       */
      ticksPerUpdate: 40, // Ticks per update of data
  
      expPerTile: 50, // Exp cost per tile
      minTiles: 2, // 1 path + 1 stall minimum
  
      expPerParkAdmission: 1,
  
      rideExpPerCustomer: 1,
      stallExpPerCustomer: 1,
      facilityExpPerCustomer: 1,
    });
  }

  /**
   * Set up initial plugin state
   */
  public initialize() : void {
    this._registerEventHandlers();

    const newPark : boolean = TilemanPark.initialize();
    if (newPark) {
      TilemanPark.clearPark();
      //TODO await setLandOwnership(getMapEdges(), LandOwnership.UNOWNED);
    }

    // Register menu items in toolbars
    //TODO ui.registerMenuItem('Tileman Toolbar', () => toolbarWindow.open());
    //TODO ui.registerMenuItem('Tileman Statistics', () => statsWindow.open());
    //TODO ui.registerMenuItem('Tileman Config', () => configWindow.open());

    //TODO toolbarWindow.open();
    //TODO configWindow.open();
    //TODO statsWindow.open();
  }



  /**
   * **********
   * Event Handling
   * **********
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
      //TODO collectMetrics();
      //TODO const totalExp : number = computeTotalExp();
      //TODO ParkDataStores.totalExp.set(totalExp);
      //TODO storeParkData();
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
        TilemanPark.recordDemolishedRide(rideId);
      }
    }
  }



  /**
   * **********
   * Static Members
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

export const TilemanPlugin = Plugin.instance;