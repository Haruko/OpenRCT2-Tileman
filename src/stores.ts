/// <reference path='../lib/openrct2.d.ts' />

import { Store, compute } from 'openrct2-flexui';
import { Player } from './Player';
import { Plugin } from './Plugin';
import { Park } from './Park';
import { RideData } from './types/types';



const rideExpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number, number, number>(
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  Plugin.get('rideExpPerCustomer'),
  Plugin.get('stallExpPerCustomer'),
  Plugin.get('facilityExpPerCustomer'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], rideExpPerCustomer : number, stallExpPerCustomer : number, facilityExpPerCustomer : number) : number => {
    // Iterate over rides
    const activeRideData : RideData[] = Object.keys(rideMap)
      .map((value : string) : RideData => rideMap[+value]);
    const allRideData = [...activeRideData, ...demolishedRides];
    
    return allRideData.reduce((previousValue : number, ride : RideData) : number => {
      let rideExp : number = 0;
      
      switch (ride.classification) {
        case 'ride':
          rideExp = ride.totalCustomers * rideExpPerCustomer;
          break;
        case 'stall':
          rideExp = ride.totalCustomers * stallExpPerCustomer;
          break;
        case 'facility':
          rideExp = ride.totalCustomers * facilityExpPerCustomer;
          break;
      }
  
      return previousValue + rideExp;
    }, 0);
  }
);

/**
 * Computed total experience earned
 */
export const totalExpStore : Store<number> = compute<number, number, number, number>(
  Park.get('parkAdmissions'),
  Plugin.get('expPerParkAdmission'),
  rideExpStore,
  (parkAdmissions : number, expPerParkAdmission : number, rideExp : number) : number => {
    const admissionsExp : number = parkAdmissions * expPerParkAdmission;
    return admissionsExp + rideExp;
  }
);

/**
 * Computed total available tiles (earned - used + min)
 */
export const availableTilesStore : Store<number> = compute<number, number, number, number, number>(
  totalExpStore,
  Player.get('tilesUsed'),
  Plugin.get('expPerTile'),
  Plugin.get('minTiles'),
  (totalExp : number, tilesUsed : number, expPerTile : number, minTiles : number) : number => {
    return Math.floor(totalExp / expPerTile) + minTiles - tilesUsed;
  }
);