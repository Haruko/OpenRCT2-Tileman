/// <reference path='../lib/openrct2.d.ts' />

import { ArrayStore, WritableStore, arrayStore, read, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { GameCommand, GameCommandFlag, RideLifecycleFlags } from './types/enums';
import { DataStoreID, RideData, Storeless } from './types/types';
import { objectStore } from './flexui-extension/createObjectStore';
import { ObjectStore } from './flexui-extension/ObjectStore';
import { DataStoreManager } from './DataStoreManager';



/**
 * **********
 * Type Definitions
 * **********
 */

export type ParkData = {
  // Player actions
  balloonsPopped : WritableStore<number>,
  bannersPlaced : WritableStore<number>,
  marketingCampaignsRun : WritableStore<number>,

  // Guest actions
  parkAdmissions : WritableStore<number>,
  rideMap : ObjectStore<RideData>,
  demolishedRides : ArrayStore<RideData>,

  // Staff actions
  lawnsMown : WritableStore<number>,
  gardensWatered : WritableStore<number>,
  trashSwept : WritableStore<number>,
  trashCansEmptied : WritableStore<number>,

  ridesInspected : WritableStore<number>,
  ridesFixed : WritableStore<number>,

  vandalsStopped : WritableStore<number>,

  // Park data
  parkAwards : WritableStore<number>,
};



class TilemanPark extends DataStore<ParkData> {
  constructor() {
    super('park', {
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
   * @param isNewPark True if this is a new park
   */
  public initialize(isNewPark : boolean) : void {
    if (!isNewPark) {
      this.loadData();
    }

    // Subscribe to events
    const PluginDataStore : DataStore<any> = DataStoreManager.getInstance(DataStoreID.PLUGIN);
    context.subscribe('interval.tick', () => this._onTick(PluginDataStore.get('ticksPerUpdate').get()));
    context.subscribe('map.save', () => DataStoreManager.storeAllData());
    context.subscribe('action.execute', (e : GameActionEventArgs) => this._onActionExecute(e));

    if (isNewPark) {
      this.deleteRides();
      this.deleteGuests();
      this.fireStaff();
      
      this.loadDefaults();
      DataStoreManager.storeAllData();
    }
  }

  

  /**
   * **********
   * Data Handling
   * **********
   */

  /**
   * Loads data from the persistent park-specific storage
   */
  public loadData() : void {
    let savedData : Storeless<ParkData> = this.getStoredData();

    if (typeof savedData !== 'undefined') {
      // Guest actions
      this.data.parkAdmissions.set(savedData.parkAdmissions);

      // Player actions
      this.data.balloonsPopped.set(savedData.balloonsPopped);
      this.data.bannersPlaced.set(savedData.bannersPlaced);
      this.data.marketingCampaignsRun.set(savedData.marketingCampaignsRun);

      // Staff actions
      this.data.lawnsMown.set(savedData.lawnsMown);
      this.data.gardensWatered.set(savedData.gardensWatered);
      this.data.trashSwept.set(savedData.trashSwept);
      this.data.trashCansEmptied.set(savedData.trashCansEmptied);

      this.data.ridesInspected.set(savedData.ridesInspected);
      this.data.ridesFixed.set(savedData.ridesFixed);

      this.data.vandalsStopped.set(savedData.vandalsStopped);

      // Park data
      this.data.rideMap.set(savedData.rideMap);
      this.data.demolishedRides.set(savedData.demolishedRides);
      this.data.parkAwards.set(savedData.parkAwards);
    }
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public override storeData() : void {
    const savedData : Storeless<ParkData> = this.getStoredData();

    // Guest actions
    savedData.parkAdmissions = read(this.data.parkAdmissions);

    // Player actions
    savedData.balloonsPopped = read(this.data.balloonsPopped);
    savedData.bannersPlaced = read(this.data.bannersPlaced);
    savedData.marketingCampaignsRun = read(this.data.marketingCampaignsRun);

    // Staff actions
    savedData.lawnsMown = read(this.data.lawnsMown);
    savedData.gardensWatered = read(this.data.gardensWatered);
    savedData.trashSwept = read(this.data.trashSwept);
    savedData.trashCansEmptied = read(this.data.trashCansEmptied);

    savedData.ridesInspected = read(this.data.ridesInspected);
    savedData.ridesFixed = read(this.data.ridesFixed);

    savedData.vandalsStopped = read(this.data.vandalsStopped);

    // Park data
    savedData.rideMap = read(this.data.rideMap);
    savedData.demolishedRides = read(this.data.demolishedRides);
    savedData.parkAwards = read(this.data.parkAwards);
  }

  /**
   * Collects metric data used for experience calculations
   */
  public collectMetrics() : void {
    this.collectGuestMetrics();
    this.collectStaffMetrics();
    this.collectRideMetrics();
    this.collectParkAwardMetrics();

    DataStoreManager.storeAllData();
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

    this.data.lawnsMown.set(totals.lawnsMown);
    this.data.gardensWatered.set(totals.gardensWatered);
    this.data.trashSwept.set(totals.trashSwept);
    this.data.trashCansEmptied.set(totals.trashCansEmptied);
    this.data.ridesInspected.set(totals.ridesInspected);
    this.data.ridesFixed.set(totals.ridesFixed);
    this.data.vandalsStopped.set(totals.vandalsStopped);
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
      console.log('!== undefined')
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
  


  /**
   * **********
   * Other
   * **********
   */

  /**
   * Fires all staff
   */
  public fireStaff() : void {
    const staffList : Staff[] = map.getAllEntities('staff');
  
    staffList.forEach((staff : Staff) : void => {
      // Removing a mechanic that is currently fixing a ride doesn't break anything
      staff.remove();
    });
  }
  
  /**
   * Deletes all guests
   */
  public deleteGuests() : void {
    const guestList : Guest[] = map.getAllEntities('guest');
  
    let guestsOnRide = false;
  
    guestList.forEach((guest : Guest) : void => {
      try {
        guest.remove();
      } catch (error) {
        guestsOnRide = true;
      }
    });
  
    if (guestsOnRide) {
      ui.showError("Couldn't delete all guests...", "Delete rides before trying again!")
    }
  }
  
  /**
   * Deletes all rides
   */
  public deleteRides() : void {
    const rideList : Ride[] = map.rides;
  
    let promiseChain = Promise.resolve();
  
    rideList.forEach((ride : Ride) : void => {
      // Deleting a ride with people on it ejects them to the queue 
      promiseChain = promiseChain.then(() : void => {
        context.executeAction('ridedemolish', {
          flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY
                | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
                | GameCommandFlag.GAME_COMMAND_FLAG_NO_SPEND,
          ride: ride.id,
          modifyType: 0 // 0: demolish, 1: renew
        }, (result : GameActionResult) => {
  
        });
      });
    });
  }
}

export const Park : TilemanPark = new TilemanPark();