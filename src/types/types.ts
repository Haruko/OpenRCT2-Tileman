/// <reference path='../../lib/openrct2.d.ts' />

import { ObjectStore } from '@src/flexui-extension/ObjectStore';
import { ArrayStore, Store, WritableStore } from 'openrct2-flexui';




/**
 * **********
 * Data Store Definitions
 * **********
 */

export type DataStoreData = Record<string, any>;

export type PluginData = DataStoreData & {
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


export type MetricData = DataStoreData & {
  // Tiles used by player
  tilesUsed : WritableStore<number>,

  // Player actions
  balloonsPopped : WritableStore<number>,
  bannersPlaced : WritableStore<number>,
  marketingCampaignsRun : WritableStore<number>,

  // Guest actions
  parkAdmissions : WritableStore<number>,
  rideMap : ObjectStore<RideData>,
  demolishedRides : ArrayStore<RideData>,

  // Staff actions
  lawnsMown : WritableStore<number>,
  gardensWatered : WritableStore<number>,
  trashSwept : WritableStore<number>,
  trashCansEmptied : WritableStore<number>,

  ridesInspected : WritableStore<number>,
  ridesFixed : WritableStore<number>,

  vandalsStopped : WritableStore<number>,

  // Park data
  parkAwards : WritableStore<number>,
};

/**
 * Ride data for plugin storage
 */
export type RideData = {
  // ride.name
  name : string,
  // ride.classification ('ride' | 'stall' | 'facility')
  classification : RideClassification,
  // ride.type (RideType enum)
  type : number,
  // ride.age
  age : number,
  // ride.value
  value : number,
  // ride.totalCustomers
  totalCustomers : number,
  // ride.totalProfit
  totalProfit : number,
  // ride.lifecycleFlags
  lifecycleFlags : number
};



/**
 * **********
 * Utilities
 * **********
 */

/**
 * Maps properties of one type to another type
 */
export type Mapped<Source, OrigType, DestType> = {
  [Property in keyof Source] : Source[Property] extends OrigType ? DestType : Source[Property];
};

/**
 * Maps all Store<T> to T
 */
export type Storeless<Source> = {
  [Property in keyof Source] : Source[Property] extends Store<infer T> ? T : Source[Property];
};