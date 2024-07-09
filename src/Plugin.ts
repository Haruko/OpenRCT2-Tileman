/// <reference path='../lib/openrct2.d.ts' />

import { store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { PluginData } from './types/types';



export class Plugin extends DataStore<PluginData> {
  protected constructor() {
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
      keepToolbarOpen: store<boolean>(true),
      bypassPathRestrictions: store<boolean>(false),
  
      tileXpCost: store<number>(1000), // Exp cost per tile
      startingTiles: store<number>(2), // 1 path + 1 stall minimum

      // Player actions
      balloonsPoppedXpValue: store<number>(100),
      bannersPlacedXpValue: store<number>(250),
    
      // Guest actions
      parkAdmissionXpValue: store<number>(50),
      rideAdmissionXpValue: store<number>(20),
      stallBuyXpValue: store<number>(20),
      facilityUseXpValue: store<number>(20),
    
      // Staff actions
      lawnsMownXpValue: store<number>(0),
      gardensWateredXpValue: store<number>(0),
      trashSweptXpValue: store<number>(0),
      trashCansEmptiedXpValue: store<number>(0),
    
      ridesInspectedXpValue: store<number>(0),
      ridesFixedXpValue: store<number>(0),
    
      vandalsStoppedXpValue: store<number>(0),
    
      // Park data
      marketingCampaignsSpentXpValue: store<number>(100),
      scenarioCompletedXpValue: store<number>(10000),

      parkAwardsPositiveXpValue: store<number>(1000),
      parkAwardsNegativeXpValue: store<number>(250),

      guestsDrownedXpValue: store<number>(50),
      staffDrownedXpValue: store<number>(200),
      vehicleCrashesXpValue: store<number>(100),
      vehicleCrashesGuestsKilledXpValue: store<number>(100),
    });
  }

  /**
   * Initialize this DataStore
   * @param isTilemanPark True if this is a tileman park
   */
  public initialize() : void {

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