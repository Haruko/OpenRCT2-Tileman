/// <reference path='../../lib/openrct2.d.ts' />

import { ObjectStore } from '@flexui-ext/ObjectStore';
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
  keepToolbarOpen: WritableStore<boolean>,
  bypassPathRestrictions: WritableStore<boolean>,

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
  vehicleCrashesXpValue : WritableStore<number>,
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
  vehicleCrashes : WritableStore<number>,
};

export type StoresData = DataStoreData & {
  // Player actions
  balloonsPoppedXpStore: Store<number> | null,
  bannersPlacedXpStore: Store<number> | null,
  marketingCampaignsRunXpStore: Store<number> | null,
  totalPlayerXpStore: Store<number> | null,
  
  // Guest actions
  parkAdmissionsXpStore: Store<number> | null,
  rideXpStore: Store<number> | null,
  stallXpStore: Store<number> | null,
  facilityXpStore: Store<number> | null,
  totalGuestXpStore: Store<number> | null,
  
  // Staff actions
  lawnsMownXpStore: Store<number> | null,
  gardensWateredXpStore: Store<number> | null,
  trashSweptXpStore: Store<number> | null,
  trashCansEmptiedXpStore: Store<number> | null,
  totalHandymenXpStore: Store<number> | null,
  
  ridesInspectedXpStore: Store<number> | null,
  ridesFixedXpStore: Store<number> | null,
  totalMechanicXpStore: Store<number> | null,
  
  vandalsStoppedXpStore: Store<number> | null,
  totalSecurityXpStore: Store<number> | null,
  
  totalStaffXpStore: Store<number> | null,
  
  // Park data
  parkAwardsXpStore: Store<number> | null,
  vehicleCrashesXpStore: Store<number> | null,
  totalParkDataXpStore: Store<number> | null,
  
  // Other
  totalXpStore: Store<number> | null,
  tilesEarnedStore: Store<number> | null,
  availableTilesStore: Store<number> | null,
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