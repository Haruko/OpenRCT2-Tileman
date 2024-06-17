/// <reference path='../lib/openrct2.d.ts' />

import { ArrayStore, WritableStore, arrayStore, read, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { GameCommandFlag, RideLifecycleFlags } from './types/enums';
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
  // Data used to calculate experience
  parkAdmissions : WritableStore<number>,
  // Maps ride IDs (numbers) and historical data
  rideMap : ObjectStore<RideData>,
  // List of rides that were demolished
  demolishedRides : ArrayStore<RideData>
};



class TilemanPark extends DataStore<ParkData> {
  constructor() {
    super('park', {
      // Data used to calculate experience
      parkAdmissions : store<number>(0),
      // Maps ride IDs (numbers) and historical data
      rideMap : objectStore<RideData>({}),
      // List of rides that were demolished
      demolishedRides : arrayStore<RideData>([])
    });
    
  }

  /**
   * Initialize this DataStore
   * @param isNewPark True if this is a new park
   */
  public initialize(isNewPark : boolean) : void {
    // Subscribe to events
    const PluginDataStore : DataStore<any> = DataStoreManager.getInstance(DataStoreID.PLUGIN);
    context.subscribe('interval.tick', () => Park.onTick(PluginDataStore.get('ticksPerUpdate')));
    context.subscribe('map.save', () => DataStoreManager.storeAllData());
    context.subscribe('action.execute', (e : GameActionEventArgs) => Park.onActionExecute(e));

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
      this.data.parkAdmissions.set(savedData.parkAdmissions);
      this.data.rideMap.set(savedData.rideMap as Record<string, RideData>);
      this.data.demolishedRides.set(savedData.demolishedRides as RideData[]);
    }
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public override storeData() : void {
    const savedData : Storeless<ParkData> = this.getStoredData();

    savedData.parkAdmissions = read(this.data.parkAdmissions);
    savedData.rideMap = read(this.data.rideMap);
    savedData.demolishedRides = read(this.data.demolishedRides);
  }

  /**
   * Collects metric data used for experience calculations
   */
  public collectMetrics() : void {
    // Get total park admissions
    this.data.parkAdmissions.set(park.totalAdmissions);
  
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

    DataStoreManager.storeAllData();
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
  public onActionExecute(e : GameActionEventArgs) : void {
    if (e.action === 'ridedemolish') {
      this._onRideDemolish(e);
    }
  }

  /**
   * Handles interval.tick event
   * @param ticksPerUpdate Number of ticks per update as defined in the Plugin data
   */
  public onTick(ticksPerUpdate : number) : void {
    if (date.ticksElapsed % ticksPerUpdate === 0) {
      this.collectMetrics();
    }
  }

  /**
   * Move ride from rideMap to demolishedRides
   * @param e Event data
   */
  public _onRideDemolish(e : GameActionEventArgs) : void {
    // Every time a ride is deleted, remove it from the current rides and add it to the list of deleted rides
    // This action is raised if we cancel building something, but in that case the cost is 0
    if (e.result.cost !== 0) {
      const rideId : number = (e.args as { ride : number }).ride;
      const rideData : RideData | undefined = this.data.rideMap.getValue(rideId);
    
      if(typeof rideData !== 'undefined') {
        this.data.demolishedRides.push(rideData);
        this.data.rideMap.set(rideId, undefined);

        // Only store data of this data store because it doesn't change exp calculation
        this.storeData();
      }
    }
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