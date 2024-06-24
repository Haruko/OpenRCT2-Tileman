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
  balloonsPoppedXpValue : WritableStore<number>,
  bannersPlacedXpValue : WritableStore<number>,
  marketingCampaignsRunXpValue : WritableStore<number>,

  // Guest actions
  parkAdmissionXpValue : WritableStore<number>,
  rideAdmissionXpValue : WritableStore<number>,
  stallBuyXpValue : WritableStore<number>,
  facilityUseXpValue : WritableStore<number>,

  // Staff actions
  lawnsMownXpValue : WritableStore<number>,
  gardensWateredXpValue : WritableStore<number>,
  trashSweptXpValue : WritableStore<number>,
  trashCansEmptiedXpValue : WritableStore<number>,

  ridesInspectedXpValue : WritableStore<number>,
  ridesFixedXpValue : WritableStore<number>,

  vandalsStoppedXpValue : WritableStore<number>,

  // Park data
  parkAwardsXpValue : WritableStore<number>,
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
  
      tileXpCost: store<number>(100), // Exp cost per tile
      startingTiles: store<number>(2), // 1 path + 1 stall minimum

      // Player actions
      balloonsPoppedXpValue : store<number>(10),
      bannersPlacedXpValue : store<number>(25),
      marketingCampaignsRunXpValue : store<number>(50),
    
      // Guest actions
      parkAdmissionXpValue: store<number>(1),
      rideAdmissionXpValue: store<number>(1),
      stallBuyXpValue: store<number>(2),
      facilityUseXpValue: store<number>(4),
    
      // Staff actions
      lawnsMownXpValue : store<number>(1),
      gardensWateredXpValue : store<number>(1),
      trashSweptXpValue : store<number>(1),
      trashCansEmptiedXpValue : store<number>(2),
    
      ridesInspectedXpValue : store<number>(2),
      ridesFixedXpValue : store<number>(5),
    
      vandalsStoppedXpValue : store<number>(1),
    
      // Park data
      parkAwardsXpValue : store<number>(25),
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
    this.data.balloonsPoppedXpValue.set(savedData.balloonsPoppedXpValue);
    this.data.bannersPlacedXpValue.set(savedData.bannersPlacedXpValue);
    this.data.marketingCampaignsRunXpValue.set(savedData.marketingCampaignsRunXpValue);

    // Guest actions
    this.data.parkAdmissionXpValue.set(savedData.parkAdmissionXpValue);
    this.data.rideAdmissionXpValue.set(savedData.rideAdmissionXpValue);
    this.data.stallBuyXpValue.set(savedData.stallBuyXpValue);
    this.data.facilityUseXpValue.set(savedData.facilityUseXpValue);
    
    // Staff actions
    this.data.lawnsMownXpValue.set(savedData.lawnsMownXpValue);
    this.data.gardensWateredXpValue.set(savedData.gardensWateredXpValue);
    this.data.trashSweptXpValue.set(savedData.trashSweptXpValue);
    this.data.trashCansEmptiedXpValue.set(savedData.trashCansEmptiedXpValue);

    this.data.ridesInspectedXpValue.set(savedData.ridesInspectedXpValue);
    this.data.ridesFixedXpValue.set(savedData.ridesFixedXpValue);

    this.data.vandalsStoppedXpValue.set(savedData.vandalsStoppedXpValue);

    // Park data
    this.data.parkAwardsXpValue.set(savedData.parkAwardsXpValue);
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
    savedData.balloonsPoppedXpValue = read(savedData.balloonsPoppedXpValue);
    savedData.bannersPlacedXpValue = read(savedData.bannersPlacedXpValue);
    savedData.marketingCampaignsRunXpValue = read(savedData.marketingCampaignsRunXpValue);

    // Guest actions
    savedData.parkAdmissionXpValue = read(this.data.parkAdmissionXpValue);
    savedData.rideAdmissionXpValue = read(this.data.rideAdmissionXpValue);
    savedData.stallBuyXpValue = read(this.data.stallBuyXpValue);
    savedData.facilityUseXpValue = read(this.data.facilityUseXpValue);
    
    // Staff actions
    savedData.lawnsMownXpValue = read(this.data.lawnsMownXpValue);
    savedData.gardensWateredXpValue = read(this.data.gardensWateredXpValue);
    savedData.trashSweptXpValue = read(this.data.trashSweptXpValue);
    savedData.trashCansEmptiedXpValue = read(this.data.trashCansEmptiedXpValue);

    savedData.ridesInspectedXpValue = read(this.data.ridesInspectedXpValue);
    savedData.ridesFixedXpValue = read(this.data.ridesFixedXpValue);

    savedData.vandalsStoppedXpValue = read(this.data.vandalsStoppedXpValue);
    
    // Park data
    savedData.parkAwardsXpValue = read(this.data.parkAwardsXpValue);
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