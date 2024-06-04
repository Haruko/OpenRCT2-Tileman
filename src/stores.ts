/// <reference path='../lib/openrct2.d.ts' />

import { Store, compute } from 'openrct2-flexui';
import { Player } from './Player';
import { Plugin } from './Plugin';
import { Park } from './Park';
import { RideData } from './types/types';



/**
 * Computed total experience earned
 */
export const totalExpStore : Store<number> = compute<number, number, Record<string, RideData>, RideData[], number>(
  Park.get('parkAdmissions'),
  Plugin.get('expPerParkAdmission'),
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  (parkAdmissions : number, expPerParkAdmission : number, rideMap : Record<string, RideData>, demolishedRides : RideData[]) : number => {
    let totalExp : number = 0;

    // Add park admissions
    totalExp += parkAdmissions * expPerParkAdmission;

    // Iterate over rides
    const activeRideData : RideData[] = Object.keys(rideMap)
      .map((value : string) : RideData => rideMap[+value]);
    const allRideData = [...activeRideData, ...demolishedRides];


    totalExp += allRideData.reduce((previousValue : number, ride : RideData) : number => {
      let rideExp : number = 0;
      
      switch (ride.classification) {
        case 'ride':
          rideExp = ride.totalCustomers * Plugin.get('rideExpPerCustomer');
          break;
        case 'stall':
          rideExp = ride.totalCustomers * Plugin.get('stallExpPerCustomer');
          break;
        case 'facility':
          rideExp = ride.totalCustomers * Plugin.get('facilityExpPerCustomer');
          break;
      }
  
      return previousValue + rideExp;
    }, 0);

    console.log(totalExp)
    return totalExp;
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