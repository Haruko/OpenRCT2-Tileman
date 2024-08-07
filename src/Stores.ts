/// <reference path='../lib/openrct2.d.ts' />

import { compute, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { MetricData, PluginData, RideData, StoresData } from './types/types';
import { DataStoreManager } from './DataStoreManager';
import { DataStoreID } from './types/enums';

export class Stores extends DataStore<StoresData> {
  protected constructor() {
    super(null, {
      // Player actions
      balloonsPoppedXpStore: null,
      bannersPlacedXpStore: null,
      totalPlayerXpStore: null,
      
      // Guest actions
      parkAdmissionsXpStore: null,
      rideXpStore: null,
      stallXpStore: null,
      facilityXpStore: null,
      totalGuestXpStore: null,
      
      // Staff actions
      lawnsMownXpStore: null,
      gardensWateredXpStore: null,
      trashSweptXpStore: null,
      trashCansEmptiedXpStore: null,
      totalHandymenXpStore: null,
      
      ridesInspectedXpStore: null,
      ridesFixedXpStore: null,
      totalMechanicXpStore: null,
      
      vandalsStoppedXpStore: null,
      totalSecurityXpStore: null,
      
      totalStaffXpStore: null,
      
      // Park data
      marketingCampaignsSpentXpStore: null,
      scenarioCompletedXpStore: null,
      scenarioStatusStore: store<string>(scenario.status),

      parkAwardsPositiveXpStore: null,
      parkAwardsNegativeXpStore: null,
      totalAwardsXpStore: null,

      guestsDrownedXpStore: null,
      staffDrownedXpStore: null,
      vehicleCrashesXpStore: null,
      vehicleCrashesGuestsKilledXpStore: null,
      totalDisastersXpStore: null,

      totalParkDataXpStore: null,
      
      // Other
      totalXpStore: null,
      tilesEarnedStore: null,
      availableTilesStore: null,
    });
  }

  /**
   * Initialize this DataStore
   */
  public initialize() : void {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const metrics : DataStore<MetricData> = dsManager.getInstance(DataStoreID.METRICS);

    this._initializePlayerActionStores(plugin, metrics);
    this._initializeGuestActionStores(plugin, metrics);
    this._initializeStaffActionStores(plugin, metrics);
    this._initializeParkDataStores(plugin, metrics);
    this._initializeDisasterStores(plugin, metrics);
    this._initializeOtherStores(plugin, metrics);
  }

  /**
   * Loads data from the persistent park-specific storage
   */
  public override loadData() : void {
    // Do nothing
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public override storeData() : void {
    // Do nothing
  }

  /**
   * Initialize the player action stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializePlayerActionStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience from the player popping balloons
    this.set('balloonsPoppedXpStore', compute<number, number, number>(
      metrics.get('balloonsPopped'),
      plugin.get('balloonsPoppedXpValue'),
      (balloonsPopped : number, balloonsPoppedXpValue : number) : number => {
        return balloonsPopped * balloonsPoppedXpValue;
      }
    ));

    // Computed total experience from the player placing signs
    this.set('bannersPlacedXpStore', compute<number, number, number>(
      metrics.get('bannersPlaced'),
      plugin.get('bannersPlacedXpValue'),
      (bannersPlaced : number, bannersPlacedXpValue : number) : number => {
        return bannersPlaced * bannersPlacedXpValue;
      }
    ));

    // Total
    this.set('totalPlayerXpStore', compute<number, number, number>(
      this.get('balloonsPoppedXpStore'),
      this.get('bannersPlacedXpStore'),
      (balloonsPoppedXp : number, bannersPlacedXp : number) : number => {
        return balloonsPoppedXp + bannersPlacedXp;
      }
    ));
  }

  /**
   * Initialize the guest action stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeGuestActionStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience from park admissions
    this.set('parkAdmissionsXpStore', compute<number, number, number>(
      metrics.get('parkAdmissions'),
      plugin.get('parkAdmissionXpValue'),
      (parkAdmissions : number, parkAdmissionXpValue : number) : number => {
        return parkAdmissions * parkAdmissionXpValue;
      }
    ));

    // Computed total experience from rides
    this.set('rideXpStore', compute<Record<string, RideData>, RideData[], number, number>(
      metrics.get('rideMap'),
      metrics.get('demolishedRides'),
      plugin.get('rideAdmissionXpValue'),
      (rideMap : Record<string, RideData>, demolishedRides : RideData[], rideAdmissionXpValue : number) : number => {
        return this._getGuestCountByRideType(rideMap, demolishedRides, 'ride') * rideAdmissionXpValue;
      }
    ));
    
    // Computed total experience from stalls
    this.set('stallXpStore', compute<Record<string, RideData>, RideData[], number, number>(
      metrics.get('rideMap'),
      metrics.get('demolishedRides'),
      plugin.get('stallBuyXpValue'),
      (rideMap : Record<string, RideData>, demolishedRides : RideData[], stallBuyXpValue : number) : number => {
        return this._getGuestCountByRideType(rideMap, demolishedRides, 'stall') * stallBuyXpValue;
      }
    ));
    
    // Computed total experience from facilities
    this.set('facilityXpStore', compute<Record<string, RideData>, RideData[], number, number>(
      metrics.get('rideMap'),
      metrics.get('demolishedRides'),
      plugin.get('facilityUseXpValue'),
      (rideMap : Record<string, RideData>, demolishedRides : RideData[], facilityUseXpValue : number) : number => {
        return this._getGuestCountByRideType(rideMap, demolishedRides, 'facility') * facilityUseXpValue;
      }
    ));
    
    // Total
    this.set('totalGuestXpStore', compute<number, number, number, number, number>(
      this.get('parkAdmissionsXpStore'),
      this.get('rideXpStore'),
      this.get('stallXpStore'),
      this.get('facilityXpStore'),
      (parkAdmissionsXp : number, rideXp : number, stallXp : number, facilityXp : number) : number => {
        return parkAdmissionsXp + rideXp + stallXp + facilityXp;
      }
    ));
  }

  /**
   * Initialize the handyman action stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeHandymanActionStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience from handymen mowing lawns
    this.set('lawnsMownXpStore', compute<number, number, number>(
      metrics.get('lawnsMown'),
      plugin.get('lawnsMownXpValue'),
      (lawnsMown : number, lawnsMownXpValue : number) : number => {
        return lawnsMown * lawnsMownXpValue;
      }
    ));
    
    // Computed total experience from handymen watering gardens
    this.set('gardensWateredXpStore', compute<number, number, number>(
      metrics.get('gardensWatered'),
      plugin.get('gardensWateredXpValue'),
      (gardensWatered : number, gardensWateredXpValue : number) : number => {
        return gardensWatered * gardensWateredXpValue;
      }
    ));
    
    // Computed total experience from handymen sweeping trash
    this.set('trashSweptXpStore', compute<number, number, number>(
      metrics.get('trashSwept'),
      plugin.get('trashSweptXpValue'),
      (trashSwept : number, trashSweptXpValue : number) : number => {
        return trashSwept * trashSweptXpValue;
      }
    ));
    
    // Computed total experience from handymen emptying trash cans
    this.set('trashCansEmptiedXpStore', compute<number, number, number>(
      metrics.get('trashCansEmptied'),
      plugin.get('trashCansEmptiedXpValue'),
      (trashCansEmptied : number, trashCansEmptiedXpValue : number) : number => {
        return trashCansEmptied * trashCansEmptiedXpValue;
      }
    ));
    
    // Total
    this.set('totalHandymenXpStore', compute<number, number, number, number, number>(
      this.get('lawnsMownXpStore'),
      this.get('gardensWateredXpStore'),
      this.get('trashSweptXpStore'),
      this.get('trashCansEmptiedXpStore'),
      (lawnsMownXp : number, gardensWateredXp : number, trashSweptXp : number, trashCansEmptiedXp : number) : number => {
        return lawnsMownXp + gardensWateredXp + trashSweptXp + trashCansEmptiedXp;
      }
    ));
  }

  /**
   * Initialize the mechanic action stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeMechanicActionStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience from mechanics inspecting rides
    this.set('ridesInspectedXpStore', compute<number, number, number>(
      metrics.get('ridesInspected'),
      plugin.get('ridesInspectedXpValue'),
      (ridesInspected : number, ridesInspectedXpValue : number) : number => {
        return ridesInspected * ridesInspectedXpValue;
      }
    ));
    
    // Computed total experience from mechanics fixing rides
    this.set('ridesFixedXpStore', compute<number, number, number>(
      metrics.get('ridesFixed'),
      plugin.get('ridesFixedXpValue'),
      (ridesFixed : number, ridesFixedXpValue : number) : number => {
        return ridesFixed * ridesFixedXpValue;
      }
    ));
    
    // Total
    this.set('totalMechanicXpStore', compute<number, number, number>(
      this.get('ridesInspectedXpStore'),
      this.get('ridesFixedXpStore'),
      (ridesInspectedXp : number, ridesFixedXp : number) : number => {
        return ridesInspectedXp + ridesFixedXp;
      }
    ));
  }

  /**
   * Initialize the security action stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeSecurityActionStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience from security stopping vandals
    this.set('vandalsStoppedXpStore', compute<number, number, number>(
      metrics.get('vandalsStopped'),
      plugin.get('vandalsStoppedXpValue'),
      (vandalsStopped : number, vandalsStoppedXpValue : number) : number => {
        return vandalsStopped * vandalsStoppedXpValue;
      }
    ));
    
    // Total
    this.set('totalSecurityXpStore', compute<number, number>(
      this.get('vandalsStoppedXpStore'),
      (vandalsStoppedXp : number) : number => {
        return vandalsStoppedXp;
      }
    ));
  }

  /**
   * Initialize the staff action stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeStaffActionStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    this._initializeHandymanActionStores(plugin, metrics);
    this._initializeMechanicActionStores(plugin, metrics);
    this._initializeSecurityActionStores(plugin, metrics);
    
    // Total
    this.set('totalStaffXpStore', compute<number, number, number, number>(
      this.get('totalHandymenXpStore'),
      this.get('totalMechanicXpStore'),
      this.get('totalSecurityXpStore'),
      (totalHandymenXp : number, totalMechanicXp : number, totalSecurityXp : number) : number => {
        return totalHandymenXp + totalMechanicXp + totalSecurityXp;
      }
    ));
  }

  /**
   * Initialize the award stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeAwardStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience from positive park awards
    this.set('parkAwardsPositiveXpStore', compute<number, number, number>(
      metrics.get('parkAwardsPositive'),
      plugin.get('parkAwardsPositiveXpValue'),
      (parkAwardsPositive : number, parkAwardsPositiveXpValue : number) : number => {
        return parkAwardsPositive * parkAwardsPositiveXpValue;
      }
    ));

    // Computed total experience from positive park awards
    this.set('parkAwardsNegativeXpStore', compute<number, number, number>(
      metrics.get('parkAwardsNegative'),
      plugin.get('parkAwardsNegativeXpValue'),
      (parkAwardsNegative : number, parkAwardsNegativeXpValue : number) : number => {
        return parkAwardsNegative * parkAwardsNegativeXpValue;
      }
    ));
    
    // Total
    this.set('totalAwardsXpStore', compute<number, number, number>(
      this.get('parkAwardsPositiveXpStore'),
      this.get('parkAwardsNegativeXpStore'),
      (parkAwardsPositiveXp : number, parkAwardsNegativeXp : number) : number => {
        return parkAwardsPositiveXp + parkAwardsNegativeXp;
      }
    ));
  }

  /**
   * Initialize the disaster stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeDisasterStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience from drowning guests
    this.set('guestsDrownedXpStore', compute<number, number, number>(
      metrics.get('guestsDrowned'),
      plugin.get('guestsDrownedXpValue'),
      (guestsDrowned : number, guestsDrownedXpValue : number) : number => {
        return guestsDrowned * guestsDrownedXpValue;
      }
    ));
    
    // Computed total experience from drowning staff
    this.set('staffDrownedXpStore', compute<number, number, number>(
      metrics.get('staffDrowned'),
      plugin.get('staffDrownedXpValue'),
      (staffDrowned : number, staffDrownedXpValue : number) : number => {
        return staffDrowned * staffDrownedXpValue;
      }
    ));
    
    // Computed total experience from vehicle crashes
    this.set('vehicleCrashesXpStore', compute<number, number, number>(
      metrics.get('vehicleCrashes'),
      plugin.get('vehicleCrashesXpValue'),
      (vehicleCrashes : number, vehicleCrashesXpValue : number) : number => {
        return vehicleCrashes * vehicleCrashesXpValue;
      }
    ));
    
    // Computed total experience from vehicle crashes
    this.set('vehicleCrashesGuestsKilledXpStore', compute<number, number, number>(
      metrics.get('vehicleCrashesGuestsKilled'),
      plugin.get('vehicleCrashesGuestsKilledXpValue'),
      (vehicleCrashesGuestsKilled : number, vehicleCrashesGuestsKilledXpValue : number) : number => {
        return vehicleCrashesGuestsKilled * vehicleCrashesGuestsKilledXpValue;
      }
    ));
    
    // Total
    this.set('totalDisastersXpStore', compute<number, number, number, number, number>(
      this.get('guestsDrownedXpStore'),
      this.get('staffDrownedXpStore'),
      this.get('vehicleCrashesXpStore'),
      this.get('vehicleCrashesGuestsKilledXpStore'),
      (
        guestsDrownedXp : number,
        staffDrownedXp : number,
        vehicleCrashesXp : number,
        vehicleCrashesGuestsKilledXpStore : number
      ) : number => {
        return guestsDrownedXp + staffDrownedXp + vehicleCrashesXp + vehicleCrashesGuestsKilledXpStore;
      }
    ));
  }

  /**
   * Initialize the park data stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeParkDataStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    this._initializeAwardStores(plugin, metrics);

    // Computed total experience from the player running marketing campaigns
    this.set('marketingCampaignsSpentXpStore', compute<number, number, number>(
      metrics.get('marketingCampaignsSpent'),
      plugin.get('marketingCampaignsSpentXpValue'),
      (marketingCampaignsSpent : number, marketingCampaignsSpentXpValue : number) : number => {
        return marketingCampaignsSpentXpValue * marketingCampaignsSpent / 500;
      }
    ));

    // Computed experience from completing the scenario
    this.set('scenarioCompletedXpStore', compute<boolean, number, number>(
      metrics.get('scenarioCompleted'),
      plugin.get('scenarioCompletedXpValue'),
      (scenarioCompleted : boolean, scenarioCompletedXpValue : number) : number => {
        return scenarioCompleted ? scenarioCompletedXpValue : 0;
      }
    ));
    
    // Total
    this.set('totalParkDataXpStore', compute<number, number, number>(
      this.get('totalAwardsXpStore'),
      this.get('marketingCampaignsSpentXpStore'),
      (totalAwardsXp : number, marketingCampaignsSpentXp : number,) : number => {
        return totalAwardsXp + marketingCampaignsSpentXp;
      }
    ));
  }

  /**
   * Initialize the other stores
   * @param plugin Copy of Plugin
   * @param metrics Copy of Metrics
   */
  private _initializeOtherStores(plugin : DataStore<PluginData>, metrics : DataStore<MetricData>) : void {
    // Computed total experience earned
    this.set('totalXpStore', compute<number, number, number, number, number, number>(
      this.get('totalPlayerXpStore'),
      this.get('totalGuestXpStore'),
      this.get('totalStaffXpStore'),
      this.get('totalParkDataXpStore'),
      this.get('totalDisastersXpStore'),
      (totalPlayerXp : number, totalGuestXp : number, totalStaffXp : number, totalParkDataXp : number, totalDisastersXp : number) : number => {
        return totalPlayerXp + totalGuestXp + totalStaffXp + totalParkDataXp + totalDisastersXp;
      }
    ));
    
    // Computed number of tiles earned
    this.set('tilesEarnedStore', compute<number, number, number>(
      this.get('totalXpStore'),
      plugin.get('tileXpCost'),
      (totalXp : number, tileXpCost : number) : number => {
        if (tileXpCost === 0) {
          return Infinity;
        } else {
          return Math.floor(totalXp / tileXpCost);
        }
      }
    ));
    
    // Computed total available tiles (earned - used + min)
    this.set('availableTilesStore', compute<number, number, number, number>(
      this.get('tilesEarnedStore'),
      metrics.get('tilesUsed'),
      plugin.get('startingTiles'),
      (tilesEarned : number, tilesUsed : number, startingTiles : number) : number => {
        return tilesEarned + startingTiles - tilesUsed;
      }
    ));
  }

  /**
   * Gets the total count of guests from both active and demolished rides for a specific classification
   * @param rideMap Active rides
   * @param demolishedRides Demolished rides
   * @param classification 'ride' | 'stall' | 'facility'
   * @returns Total guest count
   */
  private _getGuestCountByRideType(rideMap : Record<string, RideData>, demolishedRides : RideData[], classification : RideClassification) : number {
    const activeRideData : RideData[] = Object.keys(rideMap)
      .map((value : string) : RideData => rideMap[+value]);
    const allRideData = [...activeRideData, ...demolishedRides];
  
    return allRideData.filter((value : RideData) : boolean => {
      return value.classification === classification;
    }).reduce((previousValue : number, ride : RideData) : number => {
      return previousValue + ride.totalCustomers;
    }, 0);
  }
}