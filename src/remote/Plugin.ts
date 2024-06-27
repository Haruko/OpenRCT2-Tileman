/// <reference path='../../lib/openrct2.d.ts' />

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