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

  // Player actions
  balloonsPoppedXp : WritableStore<number>,
  bannersPlacedXp : WritableStore<number>,
  marketingCampaignsRunXp : WritableStore<number>,

  // Guest actions
  parkAdmissionXp : WritableStore<number>,
  rideAdmissionXp : WritableStore<number>,
  stallBuyXp : WritableStore<number>,
  facilityUseXp : WritableStore<number>,

  // Staff actions
  lawnsMownXp : WritableStore<number>,
  gardensWateredXp : WritableStore<number>,
  trashSweptXp : WritableStore<number>,
  trashCansEmptiedXp : WritableStore<number>,

  ridesInspectedXp : WritableStore<number>,
  ridesFixedXp : WritableStore<number>,

  vandalsStoppedXp : WritableStore<number>,

  // Park data
  parkAwardsXp : WritableStore<number>,
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

      // Player actions
      balloonsPoppedXp : store<number>(10),
      bannersPlacedXp : store<number>(25),
      marketingCampaignsRunXp : store<number>(50),
    
      // Guest actions
      parkAdmissionXp: store<number>(1),
      rideAdmissionXp: store<number>(1),
      stallBuyXp: store<number>(2),
      facilityUseXp: store<number>(4),
    
      // Staff actions
      lawnsMownXp : store<number>(1),
      gardensWateredXp : store<number>(1),
      trashSweptXp : store<number>(1),
      trashCansEmptiedXp : store<number>(2),
    
      ridesInspectedXp : store<number>(2),
      ridesFixedXp : store<number>(5),
    
      vandalsStoppedXp : store<number>(1),
    
      // Park data
      parkAwardsXp : store<number>(25),
    });
  }

  /**
   * Initialize this DataStore
   * @param isNewPark True if this is a new park
   */
  public initialize(isNewPark : boolean) : void {
    if (!isNewPark) {
      this.loadData();
    }
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

    // Player actions
    this.data.balloonsPoppedXp.set(savedData.balloonsPoppedXp);
    this.data.bannersPlacedXp.set(savedData.bannersPlacedXp);
    this.data.marketingCampaignsRunXp.set(savedData.marketingCampaignsRunXp);

    // Guest actions
    this.data.parkAdmissionXp.set(savedData.parkAdmissionXp);
    this.data.rideAdmissionXp.set(savedData.rideAdmissionXp);
    this.data.stallBuyXp.set(savedData.stallBuyXp);
    this.data.facilityUseXp.set(savedData.facilityUseXp);
    
    // Staff actions
    this.data.lawnsMownXp.set(savedData.lawnsMownXp);
    this.data.gardensWateredXp.set(savedData.gardensWateredXp);
    this.data.trashSweptXp.set(savedData.trashSweptXp);
    this.data.trashCansEmptiedXp.set(savedData.trashCansEmptiedXp);

    this.data.ridesInspectedXp.set(savedData.ridesInspectedXp);
    this.data.ridesFixedXp.set(savedData.ridesFixedXp);

    this.data.vandalsStoppedXp.set(savedData.vandalsStoppedXp);

    // Park data
    this.data.parkAwardsXp.set(savedData.parkAwardsXp);
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public override storeData() : void {
    const savedData : Storeless<PluginData> = this.getStoredData();

    savedData.ticksPerUpdate = read(this.data.ticksPerUpdate);

    savedData.tileXpCost = read(this.data.tileXpCost);
    savedData.startingTiles = read(this.data.startingTiles);

    // Player actions
    savedData.balloonsPoppedXp = read(savedData.balloonsPoppedXp);
    savedData.bannersPlacedXp = read(savedData.bannersPlacedXp);
    savedData.marketingCampaignsRunXp = read(savedData.marketingCampaignsRunXp);

    // Guest actions
    savedData.parkAdmissionXp = read(this.data.parkAdmissionXp);
    savedData.rideAdmissionXp = read(this.data.rideAdmissionXp);
    savedData.stallBuyXp = read(this.data.stallBuyXp);
    savedData.facilityUseXp = read(this.data.facilityUseXp);
    
    // Staff actions
    savedData.lawnsMownXp = read(this.data.lawnsMownXp);
    savedData.gardensWateredXp = read(this.data.gardensWateredXp);
    savedData.trashSweptXp = read(this.data.trashSweptXp);
    savedData.trashCansEmptiedXp = read(this.data.trashCansEmptiedXp);

    savedData.ridesInspectedXp = read(this.data.ridesInspectedXp);
    savedData.ridesFixedXp = read(this.data.ridesFixedXp);

    savedData.vandalsStoppedXp = read(this.data.vandalsStoppedXp);
    
    // Park data
    savedData.parkAwardsXp = read(this.data.parkAwardsXp);
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