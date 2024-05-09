/// <reference path='../lib/openrct2.d.ts' />

import { store } from 'openrct2-flexui';



export enum RideLifecycleFlags {
  RIDE_LIFECYCLE_EVER_BEEN_OPENED = 1 << 12
}

/**
 * **********
 * Player/Park Data
 * **********
 */

const ParkData = {
  // Player's total experience points
  totalExp: store<number>(0),

  // Tiles used by player
  tilesUsed: store<number>(0),

  // Park data
  // Data used to calculate experience
  parkAdmissions: 0,

  // Maps ride IDs (numbers) and historical data (Ride.totalCustomers, eventually Ride.totalProfit or something )
  // TODO: Make this keep track of ride stats every interval to account for deleted rides
  rideMap: {} as {
    // key is ride.id
    [key : string] : {
      // ride.id (also key)
      id : number,
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
    }
  }
};

/**
 * Exposes ParkData to other modules
 * @returns ParkData
 */
export function getParkData() : any {
  return ParkData;
}

/**
 * Computes number of tiles unlocked based on total experience
 * @returns Number of tiles unlocked
 */
export function computeTilesUnlocked() : number {
  return Math.floor(getParkData().totalExp.get() / getPluginConfig().expPerTile) + getPluginConfig().minTiles;
}

/**
 * Collects metric data used for experience calculations
 */
export function collectMetrics() : void {
  // TODO: Make it save in persistent storage
  // TODO: difficulty multiplier for ParkFlags?
  // TODO: bonus exp/tiles for completing objective?
  
  // Get total park admissions
  ParkData.parkAdmissions = park.totalAdmissions;

  // Collect data from each active ride/stall/facility
  for (let i = 0; i < map.numRides; ++i) {
    const ride : Ride = map.rides[i];

    if (ride.lifecycleFlags & RideLifecycleFlags.RIDE_LIFECYCLE_EVER_BEEN_OPENED) {
      // If never opened, don't record
      ParkData.rideMap[ride.id.toString()] = {
        id: ride.id,
        name: ride.name,
        classification: ride.classification,
        type: ride.type,
        age: ride.age,
        value: ride.value,
        totalCustomers: ride.totalCustomers,
        totalProfit: ride.totalProfit,
        lifecycleFlags: ride.lifecycleFlags
      };
    }
  }
}

/**
 * Computes total exp from park data and PluginConfig
 */
export function computeTotalExp() : number {
  let totalExp : number = 0;

  // Add park admissions
  totalExp += ParkData.parkAdmissions * PluginConfig.expPerParkAdmission;

  // Add ride data
  const rideIds : string[] = Object.keys(ParkData.rideMap);

  totalExp += rideIds.reduce((previousValue : number, currentValue : string) : number => {
    const ride = ParkData.rideMap[currentValue];

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
  minToolSize: 1,
  maxToolSize: 15,

  // User definable
  // TODO: Allow users to customize in the UI
  expPerTile: 10,
  minTiles: 2, // 1 path + 1 stall minimum

  expPerParkAdmission: 1,

  rideExpPerCustomer: 1,
  stallExpPerCustomer: 1,
  facilityExpPerCustomer: 1
}

/**
 * Exposes PluginConfig to other modules
 * @returns PluginConfig
 */
export function getPluginConfig() : any {
  return PluginConfig;
}