/// <reference path='../lib/openrct2.d.ts' />

import { Store, compute } from 'openrct2-flexui';
import { Player } from './Player';
import { Plugin } from './Plugin';
import { Park } from './Park';
import { RideData } from './types/types';



/**
 * **********
 * Player Actions
 * **********
 */

/**
 * Computed total experience from the player popping balloons
 */
export const balloonsPoppedXpStore : Store<number> = compute<number, number, number>(
  Park.get('balloonsPopped'),
  Plugin.get('balloonsPoppedXp'),
  (balloonsPopped : number, balloonsPoppedXp : number) : number => {
    return balloonsPopped * balloonsPoppedXp;
  }
);

/**
 * Computed total experience from the player placing signs
 */
export const bannersPlacedXpStore : Store<number> = compute<number, number, number>(
  Park.get('bannersPlaced'),
  Plugin.get('bannersPlacedXp'),
  (bannersPlaced : number, bannersPlacedXp : number) : number => {
    return bannersPlaced * bannersPlacedXp;
  }
);

/**
 * Computed total experience from the player running marketing campaigns
 */
export const marketingCampaignsRunXpStore : Store<number> = compute<number, number, number>(
  Park.get('marketingCampaignsRun'),
  Plugin.get('marketingCampaignsRunXp'),
  (marketingCampaignsRun : number, marketingCampaignsRunXp : number) : number => {
    return marketingCampaignsRun * marketingCampaignsRunXp;
  }
);

// Total

export const totalPlayerXpStore : Store<number> = compute<number, number, number, number>(
  balloonsPoppedXpStore,
  bannersPlacedXpStore,
  marketingCampaignsRunXpStore,
  (balloonsPoppedXp : number, bannersPlacedXp : number, marketingCampaignsRunXp : number) : number => {
    return balloonsPoppedXp + bannersPlacedXp + marketingCampaignsRunXp;
  }
);

/**
 * **********
 * Guest Actions
 * **********
 */

/**
 * Computed total experience from park admissions
 */
export const parkAdmissionsXpStore : Store<number> = compute<number, number, number>(
  Park.get('parkAdmissions'),
  Plugin.get('parkAdmissionXp'),
  (parkAdmissions : number, parkAdmissionXp : number) : number => {
    return parkAdmissions * parkAdmissionXp;
  }
);

function getGuestCountByType(rideMap : Record<string, RideData>, demolishedRides : RideData[], classification : RideClassification) : number {
  const activeRideData : RideData[] = Object.keys(rideMap)
    .map((value : string) : RideData => rideMap[+value]);
  const allRideData = [...activeRideData, ...demolishedRides];

  return allRideData.filter((value : RideData) : boolean => {
    return value.classification === classification;
  }).reduce((previousValue : number, ride : RideData) : number => {
    return previousValue + ride.totalCustomers;
  }, 0);
}

/**
 * Computed total experience from rides
 */
export const rideXpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  Plugin.get('rideAdmissionXp'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], rideAdmissionXp : number) : number => {
    return getGuestCountByType(rideMap, demolishedRides, 'ride') * rideAdmissionXp;
  }
);

/**
 * Computed total experience from stalls
 */
export const stallXpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  Plugin.get('stallBuyXp'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], stallBuyXp : number) : number => {
    return getGuestCountByType(rideMap, demolishedRides, 'stall') * stallBuyXp;
  }
);

/**
 * Computed total experience from facilities
 */
export const facilityXpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Park.get('rideMap'),
  Park.get('demolishedRides'),
  Plugin.get('facilityUseXp'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], facilityUseXp : number) : number => {
    return getGuestCountByType(rideMap, demolishedRides, 'facility') * facilityUseXp;
  }
);

// Total

export const totalGuestXpStore : Store<number> = compute<number, number, number, number, number>(
  parkAdmissionsXpStore,
  rideXpStore,
  stallXpStore,
  facilityXpStore,
  (parkAdmissionsXp : number, rideXp : number, stallXp : number, facilityXp : number) : number => {
    return parkAdmissionsXp + rideXp + stallXp + facilityXp;
  }
);



/**
 * **********
 * Staff Actions
 * **********
 */

// Handymen

/**
 * Computed total experience from handymen mowing lawns
 */
export const lawnsMownXpStore : Store<number> = compute<number, number, number>(
  Park.get('lawnsMown'),
  Plugin.get('lawnsMownXp'),
  (lawnsMown : number, lawnsMownXp : number) : number => {
    return lawnsMown * lawnsMownXp;
  }
);

/**
 * Computed total experience from handymen watering gardens
 */
export const gardensWateredXpStore : Store<number> = compute<number, number, number>(
  Park.get('gardensWatered'),
  Plugin.get('gardensWateredXp'),
  (gardensWatered : number, gardensWateredXp : number) : number => {
    return gardensWatered * gardensWateredXp;
  }
);

/**
 * Computed total experience from handymen sweeping trash
 */
export const trashSweptXpStore : Store<number> = compute<number, number, number>(
  Park.get('trashSwept'),
  Plugin.get('trashSweptXp'),
  (trashSwept : number, trashSweptXp : number) : number => {
    return trashSwept * trashSweptXp;
  }
);

/**
 * Computed total experience from handymen emptying trash cans
 */
export const trashCansEmptiedXpStore : Store<number> = compute<number, number, number>(
  Park.get('trashCansEmptied'),
  Plugin.get('trashCansEmptiedXp'),
  (trashCansEmptied : number, trashCansEmptiedXp : number) : number => {
    return trashCansEmptied * trashCansEmptiedXp;
  }
);

export const totalHandymenXpStore : Store<number> = compute<number, number, number, number, number>(
  lawnsMownXpStore,
  gardensWateredXpStore,
  trashSweptXpStore,
  trashCansEmptiedXpStore,
  (lawnsMownXp : number, gardensWateredXp : number, trashSweptXp : number, trashCansEmptiedXp : number) : number => {
    return lawnsMownXp + gardensWateredXp + trashSweptXp + trashCansEmptiedXp;
  }
);

// Mechanics

/**
 * Computed total experience from mechanics inspecting rides
 */
export const ridesInspectedXpStore : Store<number> = compute<number, number, number>(
  Park.get('ridesInspected'),
  Plugin.get('ridesInspectedXp'),
  (ridesInspected : number, ridesInspectedXp : number) : number => {
    return ridesInspected * ridesInspectedXp;
  }
);

/**
 * Computed total experience from mechanics fixing rides
 */
export const ridesFixedXpStore : Store<number> = compute<number, number, number>(
  Park.get('ridesFixed'),
  Plugin.get('ridesFixedXp'),
  (ridesFixed : number, ridesFixedXp : number) : number => {
    return ridesFixed * ridesFixedXp;
  }
);

export const totalMechanicXpStore : Store<number> = compute<number, number, number>(
  ridesInspectedXpStore,
  ridesFixedXpStore,
  (ridesInspectedXp : number, ridesFixedXp : number) : number => {
    return ridesInspectedXp + ridesFixedXp;
  }
);

// Security

/**
 * Computed total experience from mechanics fixing rides
 */
export const vandalsStoppedXpStore : Store<number> = compute<number, number, number>(
  Park.get('vandalsStopped'),
  Plugin.get('vandalsStoppedXp'),
  (vandalsStopped : number, vandalsStoppedXp : number) : number => {
    return vandalsStopped * vandalsStoppedXp;
  }
);

export const totalSecurityXpStore : Store<number> = compute<number, number>(
  vandalsStoppedXpStore,
  (vandalsStoppedXpStore : number) : number => {
    return vandalsStoppedXpStore;
  }
);

// Total

export const totalStaffXpStore : Store<number> = compute<number, number, number, number>(
  totalHandymenXpStore,
  totalMechanicXpStore,
  totalSecurityXpStore,
  (totalHandymenXp : number, totalMechanicXp : number, totalSecurityXp : number) : number => {
    return totalHandymenXp + totalMechanicXp + totalSecurityXp;
  }
);



/**
 * **********
 * Park Data
 * **********
 */

/**
 * Computed total experience from park awards
 */
export const parkAwardsXpStore : Store<number> = compute<number, number, number>(
  Park.get('parkAwards'),
  Plugin.get('parkAwardsXp'),
  (parkAwards : number, parkAwardsXp : number) : number => {
    return parkAwards * parkAwardsXp;
  }
);

// Total

export const totalParkDataXpStore : Store<number> = compute<number, number>(
  parkAwardsXpStore,
  (parkAwardsXp : number) : number => {
    return parkAwardsXp;
  }
);



/**
 * **********
 * Other
 * **********
 */

/**
 * Computed total experience earned
 */
export const totalXpStore : Store<number> = compute<number, number, number, number, number>(
  totalPlayerXpStore,
  totalGuestXpStore,
  totalStaffXpStore,
  totalParkDataXpStore,
  (totalPlayerXp : number, totalGuestXp : number, totalStaffXp : number, totalParkDataXp : number) : number => {
    return totalPlayerXp + totalGuestXp + totalStaffXp + totalParkDataXp;
  }
);

/**
 * Computed number of tiles earned
 */
export const tilesEarnedStore : Store<number> = compute<number, number, number>(
  totalXpStore,
  Plugin.get('tileXpCost'),
  (totalXp : number, tileXpCost : number) : number => {
    if (tileXpCost === 0) {
      return Infinity;
    } else {
      return Math.floor(totalXp / tileXpCost);
    }
  }
);

/**
 * Computed total available tiles (earned - used + min)
 */
export const availableTilesStore : Store<number> = compute<number, number, number, number>(
  tilesEarnedStore,
  Player.get('tilesUsed'),
  Plugin.get('startingTiles'),
  (tilesEarned : number, tilesUsed : number, startingTiles : number) : number => {
    return tilesEarned + startingTiles - tilesUsed;
  }
);