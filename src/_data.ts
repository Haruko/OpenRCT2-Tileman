/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore, store } from 'openrct2-flexui';



/**
 * **********
 * Variables
 * **********
 */

export const ParkDataStores : Record<string, WritableStore<any>> = {
  totalExp: store<number>(0),
  tilesUsed: store<number>(0),
};



/**
 * **********
 * Player/Park Data
 * **********
 */



/**
 * Computes number of tiles available based on total experience
 * @returns Number of tiles available
 */
// export function computeTilesAvailable() : number {
//   const totalExp : number = ParkDataStores.totalExp.get();
//   const expPerTile : number = TilemanPlugin.getValue('expPerTile');
//   const minTiles : number = TilemanPlugin.getValue('minTiles');
//   const tilesUsed : number = ParkDataStores.tilesUsed.get();

//   return Math.floor(totalExp / expPerTile) + minTiles - tilesUsed;
// }

/**
 * Collects metric data used for experience calculations
 */
// export function collectMetrics() : void {
//   // Get total park admissions
//   TilemanPark.setValue('parkAdmissions', park.totalAdmissions);

//   // Collect data from each active ride/stall/facility
//   const rideMap = TilemanPark.getValue('rideMap');
//   map.rides.forEach((ride : Ride) : void => {
//     if (ride.lifecycleFlags & RideLifecycleFlags.RIDE_LIFECYCLE_EVER_BEEN_OPENED) {
//       // Only record rides that have opened
//       const rideData : RideData = {
//         name: ride.name,
//         classification: ride.classification,
//         type: ride.type,
//         age: ride.age,
//         value: ride.value,
//         totalCustomers: ride.totalCustomers,
//         totalProfit: ride.totalProfit,
//         lifecycleFlags: ride.lifecycleFlags
//       };
      
//       rideMap[ride.id] = rideData;
//     }
//   });
// }

/**
 * Computes total exp from park data and PluginConfig
 */
// export function computeTotalExp() : number {
//   let totalExp : number = 0;

//   // Add park admissions
//   totalExp += TilemanPark.getValue('parkAdmissions') * TilemanPlugin.getValue('expPerParkAdmission');

//   // Iterate over rides
//   const activeRideData : RideData[] = Object.keys(ParkData.rideMap)
//     .map((value : string) : RideData => ParkData.rideMap[+value]);
//   const allRideData = [...activeRideData, ...ParkData.demolishedRides];

//   totalExp += allRideData.reduce((previousValue : number, ride : RideData) : number => {
//     let rideExp : number = 0;
    
//     switch (ride.classification) {
//       case 'ride':
//         rideExp = ride.totalCustomers * PluginConfig.rideExpPerCustomer;
//         break;
//       case 'stall':
//         rideExp = ride.totalCustomers * PluginConfig.stallExpPerCustomer;
//         break;
//       case 'facility':
//         rideExp = ride.totalCustomers * PluginConfig.facilityExpPerCustomer;
//         break;
//     }

//     return previousValue + rideExp;
//   }, 0);

//   return totalExp;
// }