/// <reference path='../lib/openrct2.d.ts' />

import { store } from 'openrct2-flexui';



/**
 * **********
 * Player/Park Data
 * **********
 */

const PlayerData = {
  // Player's total experience points
  totalExp: store<number>(0),

  // Tiles used by player
  tilesUsed: store<number>(0),

  // Data used to calculate experience
  parkAdmissions: 0,

  // Maps ride IDs (numbers) and historical data (Ride.totalCustomers, eventually Ride.totalProfit or something )
  // TODO: Make this keep track of ride stats every interval to account for deleted rides
  rideMap: {} as { [key : number] : any }
  /*
    123: {
      rideType: "ride" | "stall" | "facility"
      totalCustomers: 69
    }
  */
};

/**
 * Exposes PlayerData to other modules
 * @returns PlayerData
 */
export function getPlayerData() : any {
  return PlayerData;
}

/**
 * Computes number of tiles unlocked based on total experience
 * @returns Number of tiles unlocked
 */
export function computeTilesUnlocked() : number {
  return Math.floor(getPlayerData().totalExp.get() / getPluginConfig().expPerTile) + getPluginConfig().minTiles;
}

/**
 * Collects metric data used for experience calculations
 */
export function collectMetrics() : void {
  // TODO: Collect metric data
  // TODO: Make it save in persistent storage
  // TODO: difficulty multiplier for ParkFlags?
  // TODO: bonus exp/tiles for completing objective?

  // if (map.numRides > 0)
  //   consolelog(map.rides[0].totalCustomers);
  // consolelog(map.rides[0].totalProfit)
  // consolelog(map.rides[0].runningCost * 16)
  

  // Get total park admissions
  PlayerData.parkAdmissions = park.totalAdmissions;

  // Collect data from each active ride/stall/facility
  for (let i = 0; i < map.numRides; ++i) {
    const ride : Ride = map.rides[i];

    switch (ride.classification) {
      case 'ride':
        PlayerData.rideMap[ride.id] = {
          classification: ride.classification,
          // ride.excitement
          // ride.intensity
          // ride.lifecycleFlags
          // ride.name
          // ride.nausea
          // ride.object
          // ride.price
          // ride.runningCost
          // ride.status
          // ride.totalCustomers
          // ride.totalProfit
          // ride.type
          // ride.value
        };
        break;
      case 'stall':
        break;
      case 'facility':
        break;
    }
  }
}

/**
 * Computes total exp from park data and PluginConfig
 */
export function computeTotalExp() : void {
  const rideList : string[] = Object.keys(PlayerData.rideMap);
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
  expPerTile: 1,
  minTiles: 2 // 1 path + 1 stall minimum
}

/**
 * Exposes PluginConfig to other modules
 * @returns PluginConfig
 */
export function getPluginConfig() : any {
  return PluginConfig;
}