/// <reference path='../lib/openrct2.d.ts' />

import { Store, compute } from 'openrct2-flexui';
import { Plugin } from './Plugin';
import { Metrics } from './Metrics';
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
  Metrics.get('balloonsPopped'),
  Plugin.get('balloonsPoppedXpValue'),
  (balloonsPopped : number, balloonsPoppedXpValue : number) : number => {
    return balloonsPopped * balloonsPoppedXpValue;
  }
);

/**
 * Computed total experience from the player placing signs
 */
export const bannersPlacedXpStore : Store<number> = compute<number, number, number>(
  Metrics.get('bannersPlaced'),
  Plugin.get('bannersPlacedXpValue'),
  (bannersPlaced : number, bannersPlacedXpValue : number) : number => {
    return bannersPlaced * bannersPlacedXpValue;
  }
);

/**
 * Computed total experience from the player running marketing campaigns
 */
export const marketingCampaignsRunXpStore : Store<number> = compute<number, number, number>(
  Metrics.get('marketingCampaignsRun'),
  Plugin.get('marketingCampaignsRunXpValue'),
  (marketingCampaignsRun : number, marketingCampaignsRunXpValue : number) : number => {
    return marketingCampaignsRun * marketingCampaignsRunXpValue;
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
  Metrics.get('parkAdmissions'),
  Plugin.get('parkAdmissionXpValue'),
  (parkAdmissions : number, parkAdmissionXpValue : number) : number => {
    return parkAdmissions * parkAdmissionXpValue;
  }
);

function getGuestCountByRideType(rideMap : Record<string, RideData>, demolishedRides : RideData[], classification : RideClassification) : number {
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
  Metrics.get('rideMap'),
  Metrics.get('demolishedRides'),
  Plugin.get('rideAdmissionXpValue'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], rideAdmissionXpValue : number) : number => {
    return getGuestCountByRideType(rideMap, demolishedRides, 'ride') * rideAdmissionXpValue;
  }
);

/**
 * Computed total experience from stalls
 */
export const stallXpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Metrics.get('rideMap'),
  Metrics.get('demolishedRides'),
  Plugin.get('stallBuyXpValue'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], stallBuyXpValue : number) : number => {
    return getGuestCountByRideType(rideMap, demolishedRides, 'stall') * stallBuyXpValue;
  }
);

/**
 * Computed total experience from facilities
 */
export const facilityXpStore : Store<number> = compute<Record<string, RideData>, RideData[], number, number>(
  Metrics.get('rideMap'),
  Metrics.get('demolishedRides'),
  Plugin.get('facilityUseXpValue'),
  (rideMap : Record<string, RideData>, demolishedRides : RideData[], facilityUseXpValue : number) : number => {
    return getGuestCountByRideType(rideMap, demolishedRides, 'facility') * facilityUseXpValue;
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
  Metrics.get('lawnsMown'),
  Plugin.get('lawnsMownXpValue'),
  (lawnsMown : number, lawnsMownXpValue : number) : number => {
    return lawnsMown * lawnsMownXpValue;
  }
);

/**
 * Computed total experience from handymen watering gardens
 */
export const gardensWateredXpStore : Store<number> = compute<number, number, number>(
  Metrics.get('gardensWatered'),
  Plugin.get('gardensWateredXpValue'),
  (gardensWatered : number, gardensWateredXpValue : number) : number => {
    return gardensWatered * gardensWateredXpValue;
  }
);

/**
 * Computed total experience from handymen sweeping trash
 */
export const trashSweptXpStore : Store<number> = compute<number, number, number>(
  Metrics.get('trashSwept'),
  Plugin.get('trashSweptXpValue'),
  (trashSwept : number, trashSweptXpValue : number) : number => {
    return trashSwept * trashSweptXpValue;
  }
);

/**
 * Computed total experience from handymen emptying trash cans
 */
export const trashCansEmptiedXpStore : Store<number> = compute<number, number, number>(
  Metrics.get('trashCansEmptied'),
  Plugin.get('trashCansEmptiedXpValue'),
  (trashCansEmptied : number, trashCansEmptiedXpValue : number) : number => {
    return trashCansEmptied * trashCansEmptiedXpValue;
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
  Metrics.get('ridesInspected'),
  Plugin.get('ridesInspectedXpValue'),
  (ridesInspected : number, ridesInspectedXpValue : number) : number => {
    return ridesInspected * ridesInspectedXpValue;
  }
);

/**
 * Computed total experience from mechanics fixing rides
 */
export const ridesFixedXpStore : Store<number> = compute<number, number, number>(
  Metrics.get('ridesFixed'),
  Plugin.get('ridesFixedXpValue'),
  (ridesFixed : number, ridesFixedXpValue : number) : number => {
    return ridesFixed * ridesFixedXpValue;
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
  Metrics.get('vandalsStopped'),
  Plugin.get('vandalsStoppedXpValue'),
  (vandalsStopped : number, vandalsStoppedXpValue : number) : number => {
    return vandalsStopped * vandalsStoppedXpValue;
  }
);

export const totalSecurityXpStore : Store<number> = compute<number, number>(
  vandalsStoppedXpStore,
  (vandalsStoppedXp : number) : number => {
    return vandalsStoppedXp;
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
  Metrics.get('parkAwards'),
  Plugin.get('parkAwardsXpValue'),
  (parkAwards : number, parkAwardsXpValue : number) : number => {
    return parkAwards * parkAwardsXpValue;
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
  Metrics.get('tilesUsed'),
  Plugin.get('startingTiles'),
  (tilesEarned : number, tilesUsed : number, startingTiles : number) : number => {
    return tilesEarned + startingTiles - tilesUsed;
  }
);