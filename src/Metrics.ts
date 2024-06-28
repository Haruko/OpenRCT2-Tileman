/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore, arrayStore, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { GameCommand, RideLifecycleFlags } from './types/enums';
import { MetricData, RideData } from './types/types';
import { DataStoreID } from './types/enums';
import { objectStore } from '@flexui-ext/createObjectStore';
import { ObjectStore } from '@flexui-ext/ObjectStore';
import { DataStoreManager } from './DataStoreManager';



export class Metrics extends DataStore<MetricData> {
  protected constructor() {
    super('metrics', {
      // Tiles used by player
      tilesUsed : store<number>(0),
      
      // Player actions
      balloonsPopped : store<number>(0),
      bannersPlaced : store<number>(0),
      marketingCampaignsRun : store<number>(0),

      // Guest actions
      parkAdmissions : store<number>(0),
      rideMap : objectStore<RideData>({}),
      demolishedRides : arrayStore<RideData>([]),

      // Staff actions
      lawnsMown : store<number>(0),
      gardensWatered : store<number>(0),
      trashSwept : store<number>(0),
      trashCansEmptied : store<number>(0),

      ridesInspected : store<number>(0),
      ridesFixed : store<number>(0),

      vandalsStopped : store<number>(0),

      // Park data
      parkAwards : store<number>(0),
    });
    
  }

  /**
   * Initialize this DataStore
   * @param isTilemanPark True if this is a tileman park
   */
  public initialize() : void {
    // Subscribe to events
    const dsManager : DataStoreManager = DataStoreManager.instance();
    context.subscribe('interval.tick', () => this._onTick(dsManager.getInstance(DataStoreID.PLUGIN).get('ticksPerUpdate').get()));
    context.subscribe('map.save', () => dsManager.storeAllData());
    context.subscribe('action.execute', (e : GameActionEventArgs) => this._onActionExecute(e));
  }

  

  /**
   * **********
   * Data Handling
   * **********
   */

  /**
   * Collects metric data used for experience calculations
   */
  public collectMetrics() : void {
    this.collectGuestMetrics();
    this.collectStaffMetrics();
    this.collectRideMetrics();
    this.collectParkAwardMetrics();

    const dsManager : DataStoreManager = DataStoreManager.instance();
    dsManager.storeAllData();
  }

  /**
   * Collect guest action data
   */
  public collectGuestMetrics() : void {
    this.data.parkAdmissions.set(park.totalAdmissions);
  }

  /**
   * Collect staff action data
   */
  public collectStaffMetrics() : void {
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
  public collectRideMetrics() : void {
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
   * Collect park award data
   */
  public collectParkAwardMetrics() : void {
    // parkAwards
    // TODO: Implement
  }



  /**
   * **********
   * Event Handling
   * **********
   */

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
   * Handles interval.tick event
   * @param ticksPerUpdate Number of ticks per update as defined in the Plugin data
   */
  private _onTick(ticksPerUpdate : number) : void {
    if (date.ticksElapsed % ticksPerUpdate === 0) {
      this.collectMetrics();
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
    this.data.balloonsPopped.set(this.data.balloonsPopped.get() + 1);
  }

  /**
   * Record banner placed
   * @param e Event data
   */
  private _onBannerPlaced(e : GameActionEventArgs) : void {
    this.data.bannersPlaced.set(this.data.bannersPlaced.get() + 1);
  }

  /**
   * Record banner removed
   * @param e Event data
   */
  private _onBannerRemoved(e : GameActionEventArgs) : void {
    this.data.bannersPlaced.set(Math.max(0, this.data.bannersPlaced.get() - 1));
  }

  /**
   * Record marketing campaign started
   * @param e Event data
   */
  private _onMarketingCampaignStarted(e : GameActionEventArgs) : void {
    this.data.marketingCampaignsRun.set(this.data.marketingCampaignsRun.get() + 1);
  }
}