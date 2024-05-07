/// <reference path='../lib/openrct2.d.ts' />

import { store } from 'openrct2-flexui';

// Stores PlayerData, PluginConfig, and MapEdges

/**
 * **********
 * Player/Park Data
 * **********
 */

const PlayerData = {
  totalExp: store<number>(0),
  tilesUsed: store<number>(0),

  // Maps ride IDs (numbers) and historical data (Ride.totalCustomers, eventually Ride.totalProfit or something )
  // TODO: Make this keep track of ride stats every interval to account for deleted rides
  rideMap: {
    /*
      123: {
        rideType: "ride" | "stall" | "facility"
        totalCustomers: 69
      }
    */
  }
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