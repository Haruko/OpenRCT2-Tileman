/// <reference path='../lib/openrct2.d.ts' />

import { Store, store } from 'openrct2-flexui';



/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */

// From openrct2/ride/Ride.h
export enum RideLifecycleFlags {
  RIDE_LIFECYCLE_EVER_BEEN_OPENED = 1 << 12
};

export interface RideDataContainer {
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

export interface RideMap {
  [key : number]: RideDataContainer
};

export interface ParkDataContainer {
  [key : string] : any,
  // Player's total experience points
  totalExp : number,

  // Tiles used by player
  tilesUsed : number,

  /**
   * Collected Park Data
   */
  // Data used to calculate experience
  parkAdmissions : number,

  // Maps ride IDs (numbers) and historical data
  rideMap : RideMap,

  // List of rides that were demolished
  demolishedRides : RideDataContainer[]
};

/**
 * Stores Store<T>
 */
export interface StoreContainer {
  [key : string] : Store<any>
};

/**
 * Stores functions used as generators for data (Such as in ui.ts)
 */
export interface GeneratorContainer {
  [key : string] : Function
};



/**
 * **********
 * Player/Park Data
 * **********
 */

let ParkData = {
  // Player's total experience points
  totalExp: 0,

  // Tiles used by player
  tilesUsed: 0,

  /**
   * Collected Park Data
   */
  // Data used to calculate experience
  parkAdmissions: 0,

  // Maps ride IDs (numbers) and historical data
  rideMap: {} as RideMap,

  // List of rides that were demolished
  demolishedRides: [] as RideDataContainer[]
} as ParkDataContainer;

const ParkDataStores : StoreContainer = {
  totalExp: store<number>(0),
  tilesUsed: store<number>(0),
};

/**
 * Exposes ParkData to other modules
 * @returns ParkData
 */
export function getParkData() : ParkDataContainer {
  return ParkData;
}

/**
 * Exposes ParkDataStores to other modules
 * @returns ParkDataStores
 */
export function getParkDataStores() : StoreContainer {
  return ParkDataStores;
}

/**
 * Loads ParkData from the persistent park-specific storage if it exists
 * @returns true if it's a new park
 */
export function initParkData() : boolean {
  const savedParkData : ParkDataContainer = context.getParkStorage(PluginConfig.pluginName).getAll() as ParkDataContainer;

  if (Object.keys(savedParkData).length === 0) {
    return true;
  } else {
    // Load saved data
    ParkData.parkAdmissions = savedParkData.parkAdmissions;
    ParkData.rideMap = savedParkData.rideMap;
    ParkData.demolishedRides = savedParkData.demolishedRides;

    // Initialize stores
    ParkDataStores.totalExp.set(savedParkData.totalExp);
    ParkDataStores.tilesUsed.set(savedParkData.tilesUsed);

    return false;
  }
}

/**
 * Stores ParkData into the persistent park-specific storage
 */
export function storeParkData() : void {
  // Get park data structure to save new data
  const savedParkData : ParkDataContainer = context.getParkStorage(PluginConfig.pluginName).getAll() as ParkDataContainer;

    // Load saved data
    savedParkData.parkAdmissions = ParkData.parkAdmissions;
    savedParkData.rideMap = ParkData.rideMap;
    savedParkData.demolishedRides = ParkData.demolishedRides;

    // Initialize stores
    savedParkData.totalExp = ParkDataStores.totalExp.get();
    savedParkData.tilesUsed = ParkDataStores.tilesUsed.get();
}

/**
 * Computes number of tiles unlocked based on total experience
 * @returns Number of tiles unlocked
 */
export function computeTilesUnlocked() : number {
  return Math.floor(ParkDataStores.totalExp.get() / getPluginConfig().expPerTile) + getPluginConfig().minTiles;
}

/**
 * Collects metric data used for experience calculations
 */
export function collectMetrics() : void {
  // Get total park admissions
  ParkData.parkAdmissions = park.totalAdmissions;

  // Collect data from each active ride/stall/facility
  const savedParkData = context.getParkStorage(PluginConfig.pluginName).getAll() as ParkDataContainer;
  map.rides.forEach((ride : Ride) : void => {
    if (ride.lifecycleFlags & RideLifecycleFlags.RIDE_LIFECYCLE_EVER_BEEN_OPENED) {
      // Only record rides that have opened
      const rideData : RideDataContainer = {
        name: ride.name,
        classification: ride.classification,
        type: ride.type,
        age: ride.age,
        value: ride.value,
        totalCustomers: ride.totalCustomers,
        totalProfit: ride.totalProfit,
        lifecycleFlags: ride.lifecycleFlags
      };
      
      savedParkData.rideMap[ride.id] = rideData;
    }
  });
}

/**
 * Move ride from ParkData.rideMap to ParkData.demolishedRides
 * @param rideId Index of the ride that was demolished. Won't exist in stored park data, but will exist in our local copy
 */
export function recordDemolishedRide(rideId : number) : void {
  const rideData : RideDataContainer = ParkData.rideMap[rideId];

  if(typeof rideData !== 'undefined') {
    ParkData.demolishedRides.push(rideData);
    delete ParkData.rideMap[rideId];
  }
}

/**
 * Computes total exp from park data and PluginConfig
 */
export function computeTotalExp() : number {
  let totalExp : number = 0;

  // Add park admissions
  totalExp += ParkData.parkAdmissions * PluginConfig.expPerParkAdmission;

  // Iterate over rides
  const activeRideData : RideDataContainer[] = Object.keys(ParkData.rideMap)
    .map((value : string) : RideDataContainer => ParkData.rideMap[+value]);
  const allRideData = [...activeRideData, ...ParkData.demolishedRides];

  totalExp += allRideData.reduce((previousValue : number, ride : RideDataContainer) : number => {
    let rideExp : number = 0;
    
    switch (ride.classification) {
      case 'ride':
        rideExp = ride.totalCustomers * PluginConfig.rideExpPerCustomer;
        break;
      case 'stall':
        rideExp = ride.totalCustomers * PluginConfig.stallExpPerCustomer;
        break;
      case 'facility':
        rideExp = ride.totalCustomers * PluginConfig.facilityExpPerCustomer;
        break;
    }

    return previousValue + rideExp;
  }, 0);

  return totalExp;
}



/**
 * **********
 * Plugin Data
 * **********
 */

const PluginConfig = {
  // Never changed
  winTitle: 'Tileman',
  pluginName: 'Tileman',
  minToolSize: 1,
  maxToolSize: 15,

  // User definable
  ticksPerUpdate: 40, // Ticks per update of data
  expPerTile: 10, // Exp cost per tile
  minTiles: 2, // 1 path + 1 stall minimum

  expPerParkAdmission: 1,

  rideExpPerCustomer: 1,
  stallExpPerCustomer: 1,
  facilityExpPerCustomer: 1,
}

/**
 * Exposes PluginConfig to other modules
 * @returns PluginConfig
 */
export function getPluginConfig() : { [index : string] : any } {
  return PluginConfig;
}

/**
 * Loads predefined plugin config
 * @returns true if there was existing data
 */
export function initPluginConfig() : boolean {
  // TODO: Read from shared storage
  return false;
}