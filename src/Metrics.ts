/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore, arrayStore, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { GameCommand, RideLifecycleFlags } from './types/enums';
import { MetricData, RideData } from './types/types';
import { DataStoreID } from './types/enums';
import { objectStore } from '@flexui-ext/createObjectStore';
import { ObjectStore } from '@flexui-ext/ObjectStore';
import { DataStoreManager } from './DataStoreManager';
import { Park } from './Park';



export class Metrics extends DataStore<MetricData> {
  private _previousAwardDates : number[] = [];
  private _firstSessionMonth : number | undefined;

  protected constructor() {
    super('metrics', {
      // Tiles used by player
      tilesUsed: store<number>(0),
      
      // Player actions
      balloonsPopped: store<number>(0),
      bannersPlaced: store<number>(0),

      // Guest actions
      parkAdmissions: store<number>(0),
      rideMap: objectStore<RideData>({}),
      demolishedRides: arrayStore<RideData>([]),

      // Staff actions
      lawnsMown: store<number>(0),
      gardensWatered: store<number>(0),
      trashSwept: store<number>(0),
      trashCansEmptied: store<number>(0),

      ridesInspected: store<number>(0),
      ridesFixed: store<number>(0),

      vandalsStopped: store<number>(0),

      // Park data
      marketingCampaignsSpent: store<number>(0),
      scenarioCompleted: store<boolean>(false),

      parkAwardsPositive: store<number>(0),
      parkAwardsNegative: store<number>(0),
      
      guestsDrowned: store<number>(0),
      staffDrowned: store<number>(0),
      vehicleCrashes: store<number>(0),
      vehicleCrashesGuestsKilled: store<number>(0),
    });
    
  }

  /**
   * Initialize this DataStore
   * @param isTilemanPark True if this is a tileman park
   */
  public initialize() : void {
    // Subscribe to events
    const dsManager : DataStoreManager = DataStoreManager.instance();
    context.subscribe('interval.tick', () : void  => this._onTick(dsManager.getInstance(DataStoreID.PLUGIN).getValue('ticksPerUpdate')));
    context.subscribe('map.save', () : void  => dsManager.storeAllData());
    context.subscribe('action.execute', (e : GameActionEventArgs) : void => this._onActionExecute(e));

    context.subscribe('vehicle.crash', (e : VehicleCrashArgs) : void => this._onVehicleCrashed(e));
  }

  

  /**
   * **********
   * Data Handling
   * **********
   */

  /**
   * Collects metric data used for experience calculations
   * @param ticksPerUpdate Number of ticks between updates
   */
  private _collectMetrics(ticksPerUpdate : number) : void {
    this._collectGuestMetrics();
    this._collectStaffMetrics();
    this._collectRideMetrics();
    this._collectParkMetrics();

    const dsManager : DataStoreManager = DataStoreManager.instance();
    dsManager.storeAllData();
  }

  /**
   * Collect guest action data
   */
  private _collectGuestMetrics() : void {
    this.data.parkAdmissions.set(park.totalAdmissions);
  }

  /**
   * Collect staff action data
   */
  private _collectStaffMetrics() : void {
    type StaffStats = {
      lawnsMown : number
      gardensWatered : number
      trashSwept : number
      trashCansEmptied : number

      ridesInspected : number
      ridesFixed : number

      vandalsStopped : number
    };

    const totals : StaffStats = map.getAllEntities('staff').reduce<StaffStats>((totals : StaffStats, current : Staff) : StaffStats => {
      switch (current.staffType) {
        case 'handyman': {
          // TODO: When this data is exposed in the API
          break;
        } case 'mechanic': {
          // TODO: When this data is exposed in the API
          break;
        } case 'security': {
          // TODO: When this data is exposed in the API
          break;
        }
      }

      return totals;
    }, {
      lawnsMown: 0,
      gardensWatered: 0,
      trashSwept: 0,
      trashCansEmptied: 0,

      ridesInspected: 0,
      ridesFixed: 0,

      vandalsStopped: 0,
    } as StaffStats);

    Object.keys(totals).forEach((key : string) : void => {
      (this.data[key as keyof MetricData] as WritableStore<number>).set(totals[key as keyof StaffStats]);
    });
  }

  /**
   * Collect ride data
   */
  private _collectRideMetrics() : void {
    // Collect data from each active ride/stall/facility
    const rideMap : ObjectStore<RideData> = this.data.rideMap;
    map.rides.forEach((ride : Ride) : void => {
      if (ride.lifecycleFlags & RideLifecycleFlags.RIDE_LIFECYCLE_EVER_BEEN_OPENED) {
        // Only record rides that have opened
        const rideData : RideData = {
          name: ride.name,
          classification: ride.classification,
          type: ride.type,
          age: ride.age,
          value: ride.value,
          totalCustomers: ride.totalCustomers,
          totalProfit: ride.totalProfit,
          lifecycleFlags: ride.lifecycleFlags
        };

        rideMap.set(ride.id, rideData);
      }
    });
  }

  /**
   * Collect park data
   */
  private _collectParkMetrics() : void {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const stores : DataStore<MetricData> = dsManager.getInstance(DataStoreID.STORES);

    // Store the scenario completion for experience
    if (!this.getValue('scenarioCompleted') && scenario.status === 'completed') {
      this.get('scenarioCompleted').set(true);
    }

    // Store the scenario status for labels
    if (stores.getValue('scenarioStatusStore') !== scenario.status) {
      stores.get('scenarioStatusStore').set(scenario.status);
    }

    this._collectParkAwardMetrics();
  }

    /**
     * Collect park award data
     */
  private _collectParkAwardMetrics() : void {
    // STR_2831    :{TOPAZ}Your park has received an award for being ‘The most untidy park in the country’!
    // STR_2836    :{TOPAZ}Your park has received an award for being ‘The worst value park in the country’!
    // STR_2840    :{TOPAZ}Your park has received an award for being ‘The park with the worst food in the country’!
    // STR_2842    :{TOPAZ}Your park has received an award for being ‘The most disappointing park in the country’!
    // STR_2846    :{TOPAZ}Your park has received an award for being ‘The park with the most confusing layout’!

    // STR_2832    :{TOPAZ}Your park has received an award for being ‘The tidiest park in the country’!
    // STR_2833    :{TOPAZ}Your park has received an award for being ‘The park with the best roller coasters’!
    // STR_2834    :{TOPAZ}Your park has received an award for being ‘The best value park in the country’!
    // STR_2835    :{TOPAZ}Your park has received an award for being ‘The most beautiful park in the country’!
    // STR_2837    :{TOPAZ}Your park has received an award for being ‘The safest park in the country’!
    // STR_2838    :{TOPAZ}Your park has received an award for being ‘The park with the best staff’!
    // STR_2839    :{TOPAZ}Your park has received an award for being ‘The park with the best food in the country’!
    // STR_2841    :{TOPAZ}Your park has received an award for being ‘The park with the best toilet facilities in the country’!
    // STR_2843    :{TOPAZ}Your park has received an award for being ‘The park with the best water rides in the country’!
    // STR_2844    :{TOPAZ}Your park has received an award for being ‘The park with the best custom-designed rides’!
    // STR_2845    :{TOPAZ}Your park has received an award for being ‘The park with the most dazzling choice of colour schemes’!
    // STR_2847    :{TOPAZ}Your park has received an award for being ‘The park with the best gentle rides’!

    // NEGATIVE, // AwardType::MostUntidy
    // NEGATIVE, // AwardType::WorstValue
    // NEGATIVE, // AwardType::WorstFood
    // NEGATIVE, // AwardType::MostDisappointing
    // NEGATIVE, // AwardType::MostConfusingLayout

    // POSITIVE, // AwardType::MostTidy
    // POSITIVE, // AwardType::BestRollerCoasters
    // POSITIVE, // AwardType::BestValue
    // POSITIVE, // AwardType::MostBeautiful
    // POSITIVE, // AwardType::Safest
    // POSITIVE, // AwardType::BestStaff
    // POSITIVE, // AwardType::BestFood
    // POSITIVE, // AwardType::BestToilets
    // POSITIVE, // AwardType::BestWaterRides
    // POSITIVE, // AwardType::BestCustomDesignedRides
    // POSITIVE, // AwardType::MostDazzlingRideColours
    // POSITIVE, // AwardType::BestGentleRides

    const messages : ParkMessage[] = park.messages;

    const negativeAwards : string[] = [
      'The most untidy park in the country',
      'The worst value park in the country',
      'The park with the worst food in the country',
      'The most disappointing park in the country',
      'The park with the most confusing layout',
    ];
    
    const negativeAwardsRegex : RegExp = RegExp(negativeAwards.join('|'));

    messages.filter((message : ParkMessage) : boolean => 
      message.type === 'award'
      && message.month > (this._firstSessionMonth ?? 0)
      && this._previousAwardDates.indexOf(message.month) === -1)
      .forEach((message : ParkMessage) : void => {
        const isNegative : boolean = negativeAwardsRegex.test(message.text);

        if (isNegative) {
          this.get('parkAwardsNegative').set(this.getValue('parkAwardsNegative') + 1);
        } else {
          this.get('parkAwardsPositive').set(this.getValue('parkAwardsPositive') + 1);
        }
      });
    
      this._previousAwardDates = messages.map((message : ParkMessage) : number => message.month);
  }



  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles interval.tick event
   * @param ticksPerUpdate Number of ticks per update as defined in the Plugin data
   */
  private _onTick(ticksPerUpdate : number) : void {

    // If this is an update tick
    if (date.ticksElapsed % ticksPerUpdate === 0) {
  
      // Store the month this session started on for park message parsing
      if (typeof this._firstSessionMonth === 'undefined') {
        this._firstSessionMonth = date.monthsElapsed;
      }

      this._killDrowningAndRecord();
      this._collectMetrics(ticksPerUpdate);
    }
  }

  /**
   * Handles action.execute event
   * @param e Event data
   */
  private _onActionExecute(e : GameActionEventArgs) : void {
    if (!e.isClientOnly) {
      switch (e.type) {
        case GameCommand.DemolishRide: {
          this._onRideDemolished(e);
          break;
        } case GameCommand.BalloonPress: {
          this._onBalloonPressed(e);
          break;
        } case GameCommand.PlaceBanner: {
          this._onBannerPlaced(e);
          break;
        } case GameCommand.RemoveBanner: {
          this._onBannerRemoved(e);
          break;
        } case GameCommand.StartMarketingCampaign: {
          this._onMarketingCampaignStarted(e);
          break;
        }
      }
    }
  }

  /**
   * Moves ride from rideMap to demolishedRides
   * @param e Event data
   */
  private _onRideDemolished(e : GameActionEventArgs) : void {
    const rideId : number = (e.args as { ride : number }).ride;
    const rideData : RideData | undefined = this.data.rideMap.getValue(rideId);
  
    if(typeof rideData !== 'undefined') {
      this.data.demolishedRides.push(rideData);
      this.data.rideMap.set(rideId, undefined);

      // Only store data of this data store because it doesn't change exp calculation
      this.storeData();
    }
  }

  /**
   * Record balloon popped
   * @param e Event data
   */
  private _onBalloonPressed(e : GameActionEventArgs) : void {
    this.data.balloonsPopped.set(this.getValue('balloonsPopped') + 1);
  }

  /**
   * Record banner placed
   * @param e Event data
   */
  private _onBannerPlaced(e : GameActionEventArgs) : void {
    this.data.bannersPlaced.set(this.getValue('bannersPlaced') + 1);
  }

  /**
   * Record banner removed
   * @param e Event data
   */
  private _onBannerRemoved(e : GameActionEventArgs) : void {
    this.data.bannersPlaced.set(Math.max(0, this.getValue('bannersPlaced') - 1));
  }

  /**
   * Record marketing campaign started
   * @param e Event data
   */
  private _onMarketingCampaignStarted(e : GameActionEventArgs) : void {
    this.data.marketingCampaignsSpent.set(this.getValue('marketingCampaignsSpent') + e.result.cost!);
  }

  /**
   * Record vehicle crash
   * @param e Event data
   */
  private _onVehicleCrashed(e : VehicleCrashArgs) : void {
    this.data.vehicleCrashes.set(this.getValue('vehicleCrashes') + 1);

    // Record guests killed
    map.getAllEntities('car')
      .filter((car : Car) : boolean => car.id === e.id)
      .forEach((car : Car) : void => {
        const numGuests : number = car.guests.filter((id : number | null) : boolean => 
          typeof id === 'number').length;
        this.data.vehicleCrashesGuestsKilled.set(this.getValue('vehicleCrashesGuestsKilled') + numGuests);
      });
  }



  /**
   * **********
   * Other
   * **********
   */
  
  /**
   * Calls Park.killDrowning and records the results
   */
  private _killDrowningAndRecord() : void {
    const { numStaff, numGuests } = Park.instance<Park>().killDrowning();

    this.get('staffDrowned').set(this.getValue('staffDrowned') + numStaff);
    this.get('guestsDrowned').set(this.getValue('guestsDrowned') + numGuests);
  }
}