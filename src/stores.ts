/// <reference path='../lib/openrct2.d.ts' />

import { Store, compute } from 'openrct2-flexui';
import { Player } from './Player';
import { Plugin } from './Plugin';
import { Park } from './Park';
import { RideData } from './types/types';





/**
 * Computed total experience from park admissions
 */
export const parkAdmissionsExpStore : Store<number> = compute<number, number, number>(
  Park.get('parkAdmissions'),
  Plugin.get('expPerParkAdmission'),
  (parkAdmissions : number, expPerAdmission : number) : number => {
    return parkAdmissions * expPerAdmission;
  }
);

function getExpByType(rideMap : Record<string, RideData>, demolishedRides : RideData[], classification : RideClassification, expPerCustomer : number) : number {
  const activeRideData : RideData[] = Object.keys(rideMap)
    .map((value : string) : RideData => rideMap[+value]);
  const allRideData = [...activeRideData, ...demolishedRides];

  return allRideData.filter((value : RideData) : boolean => {
    return value.classification === classification;
  }).reduce((previousValue : number, ride : RideData) : number => {
    return previousValue + ride.totalCustomers * expPerCustomer;
  }, 0);
}

/**
 * Computed total experience from rides
 */
export const rideExpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  Plugin.get('rideExpPerCustomer'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], expPerCustomer : number) : number => {
    return getExpByType(rideMap, demolishedRides, 'ride', expPerCustomer);
  }
);

/**
 * Computed total experience from stalls
 */
export const stallExpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  Plugin.get('stallExpPerCustomer'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], expPerCustomer : number) : number => {
    return getExpByType(rideMap, demolishedRides, 'stall', expPerCustomer);
  }
);

/**
 * Computed total experience from facilities
 */
export const facilityExpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  Plugin.get('facilityExpPerCustomer'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], expPerCustomer : number) : number => {
    return getExpByType(rideMap, demolishedRides, 'facility', expPerCustomer);
  }
);

/**
 * Computed total experience earned
 */
export const totalExpStore : Store<number> = compute<number, number, number, number, number>(
  parkAdmissionsExpStore,
  rideExpStore,
  stallExpStore,
  facilityExpStore,
  (parkAdmissionsExp : number, rideExp : number, stallExp : number, facilityExp : number) : number => {
    return parkAdmissionsExp + rideExp + stallExp + facilityExp;
  }
);

/**
 * Computed number of tiles earned
 */
export const tilesEarnedStore : Store<number> = compute<number, number, number>(
  totalExpStore,
  Plugin.get('expPerTile'),
  (totalExp : number, expPerTile : number) : number => {
    return Math.floor(totalExp / expPerTile);
  }
);

/**
 * Computed total available tiles (earned - used + min)
 */
export const availableTilesStore : Store<number> = compute<number, number, number, number>(
  tilesEarnedStore,
  Player.get('tilesUsed'),
  Plugin.get('minTiles'),
  (tilesEarned : number, tilesUsed : number, minTiles : number) : number => {
    console.log(tilesEarned)
    return tilesEarned + minTiles - tilesUsed;
  }
);