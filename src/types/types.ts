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

  // Guest actions
  parkAdmissionXpValue : WritableStore<number>,
  rideAdmissionXpValue : WritableStore<number>,
  stallBuyXpValue : WritableStore<number>,
  facilityUseXpValue : WritableStore<number>,

  // Staff actions
  lawnsMownXpValue : WritableStore<number>,
  gardensWateredXpValue : WritableStore<number>,
  litterSweptXpValue : WritableStore<number>,
  binsEmptiedXpValue : WritableStore<number>,

  ridesInspectedXpValue : WritableStore<number>,
  ridesFixedXpValue : WritableStore<number>,

  vandalsStoppedXpValue : WritableStore<number>,

  // Park data
  marketingCampaignsSpentXpValue : WritableStore<number>,
  scenarioCompletedXpValue : WritableStore<number>,
  
  parkAwardsPositiveXpValue : WritableStore<number>,
  parkAwardsNegativeXpValue : WritableStore<number>,

  // Disasters
  guestsDrownedXpValue : WritableStore<number>,
  staffDrownedXpValue : WritableStore<number>,
  vehicleCrashesXpValue : WritableStore<number>,
  vehicleCrashesGuestsKilledXpValue : WritableStore<number>,
};

export type MetricData = DataStoreData & {
  // Tiles used by player
  tilesUsed : WritableStore<number>,

  // Player actions
  balloonsPopped : WritableStore<number>,
  bannersPlaced : WritableStore<number>,

  // Guest actions
  parkAdmissions : WritableStore<number>,
  rideMap : ObjectStore<RideData>,
  demolishedRides : ArrayStore<RideData>,

  // Staff actions
  staffMap : ObjectStore<StaffData>,
  firedStaff: ArrayStore<StaffData>,

  // Park data
  marketingCampaignsSpent : WritableStore<number>,
  scenarioCompleted : WritableStore<boolean>,

  parkAwardsPositive : WritableStore<number>,
  parkAwardsNegative : WritableStore<number>,
  
  // Disasters
  guestsDrowned : WritableStore<number>,
  staffDrowned : WritableStore<number>,
  vehicleCrashes : WritableStore<number>,
  vehicleCrashesGuestsKilled : WritableStore<number>,
};

export type StoresData = DataStoreData & {
  // Player actions
  balloonsPoppedXpStore: Store<number> | null,
  bannersPlacedXpStore: Store<number> | null,

  totalPlayerXpStore: Store<number> | null,
  
  // Guest actions
  parkAdmissionsXpStore: Store<number> | null,

  rideAdmissionsCountStore: Store<number> | null,
  rideXpStore: Store<number> | null,

  stallBuysCountStore: Store<number> | null,
  stallXpStore: Store<number> | null,

  facilityUsesCountStore: Store<number> | null,
  facilityXpStore: Store<number> | null,

  totalGuestXpStore: Store<number> | null,
  
  // Staff actions
  // Handymen
  lawnsMownCountStore: Store<number> | null,
  lawnsMownXpStore: Store<number> | null,

  gardensWateredCountStore: Store<number> | null,
  gardensWateredXpStore: Store<number> | null,

  litterSweptCountStore: Store<number> | null,
  litterSweptXpStore: Store<number> | null,

  binsEmptiedStore: Store<number> | null,
  binsEmptiedXpStore: Store<number> | null,

  totalHandymenXpStore: Store<number> | null,
  
  // Mechanics
  ridesInspectedCountStore: Store<number> | null,
  ridesInspectedXpStore: Store<number> | null,

  ridesFixedCountStore: Store<number> | null,
  ridesFixedXpStore: Store<number> | null,

  totalMechanicXpStore: Store<number> | null,
  
  // Security
  vandalsStoppedCountStore: Store<number> | null,
  vandalsStoppedXpStore: Store<number> | null,

  totalSecurityXpStore: Store<number> | null,
  
  totalStaffXpStore: Store<number> | null,
  
  // Park data
  marketingCampaignsSpentXpStore: Store<number> | null,
  scenarioCompletedXpStore : WritableStore<boolean> | null,
  scenarioStatusStore : WritableStore<string> | null,

  parkAwardsPositiveXpStore: Store<number> | null,
  parkAwardsNegativeXpStore: Store<number> | null,
  totalAwardsXpStore: Store<number> | null,

  totalParkDataXpStore: Store<number> | null,

  // Disasters
  guestsDrownedXpStore: Store<number> | null,
  staffDrownedXpStore: Store<number> | null,
  vehicleCrashesXpStore: Store<number> | null,
  vehicleCrashesGuestsKilledXpStore: Store<number> | null,
  
  totalDisastersXpStore: Store<number> | null,
  
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
 * Staff data for plugin storage
 */
export type StaffData = {
  // Peep.name
  name : string,
  // BaseStaff.staffType ('handyman' | 'mechanic' | 'security' | 'entertainer')
  staffType : StaffType,
  // Handyman
  lawnsMown : number | undefined,
  gardensWatered : number | undefined,
  litterSwept : number | undefined,
  binsEmptied : number | undefined,
  // Mechanic
  ridesFixed : number | undefined,
  ridesInspected : number | undefined,
  // Security
  vandalsStopped : number | undefined,
  // Entertainer
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