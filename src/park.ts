/// <reference path='../lib/openrct2.d.ts' />

import { ArrayStore, WritableStore, arrayStore, read, store } from 'openrct2-flexui';
import { DataStore } from './DataStore';
import { GameCommandFlag, RideLifecycleFlags } from './types/enums';
import { RideData, Storeless } from './types/types';
import { objectStore } from './flexui-extension/createObjectStore';
import { ObjectStore } from './flexui-extension/ObjectStore';



/**
 * **********
 * Type Definitions
 * **********
 */

type ParkData = {
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
      parkAdmissions : store(0),
      // Maps ride IDs (numbers) and historical data
      rideMap : objectStore({}),
      // List of rides that were demolished
      demolishedRides : arrayStore<RideData>([])
    });
  }

  /**
   * Initialize this DataStore
   */
  public initialize() : void {
    if (this.isNewPark()) {
      this.clearPark();
    } else {
      this.loadData();
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
    const savedData : Storeless<ParkData> = this.getStoredData();

    this.data.parkAdmissions.set(savedData.parkAdmissions);
    this.data.rideMap.set(savedData.rideMap as Record<string, RideData>);
    this.data.demolishedRides.set(savedData.demolishedRides as RideData[]);
    //TODO Make sure this is working
  }

  /**
   * Stores data into the persistent park-specific storage
   */
  public storeData() : void {
    const savedData : Storeless<ParkData> = this.getStoredData();

    savedData.parkAdmissions = read(this.data.parkAdmissions);
    savedData.rideMap = read(this.data.rideMap);
    savedData.demolishedRides = read(this.data.demolishedRides);
  }

  /**
   * Move ride from ParkData.rideMap to ParkData.demolishedRides
   * @param rideId Index of the ride that was demolished. Won't exist in stored park data, but will exist in our local copy
   */
  public recordDemolishedRide(rideId : number | string) : void {
    const rideData : RideData | undefined = this.data.rideMap.getValue(rideId);
  
    if(typeof rideData !== 'undefined') {
      this.data.demolishedRides.push(rideData);
      this.data.rideMap.set(rideId, undefined);
    }
  }

  /**
   * Collects metric data used for experience calculations
   */
  public collectMetrics() : void {
    // Get total park admissions
    console.log('admins', park.totalAdmissions)
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
  }
  


  /**
   * **********
   * Other
   * **********
   */

  /**
   * Checks if the park is new based on whether it has stored data
   * @returns True if this is a brand new park
   */
  public isNewPark() : boolean {
    return Object.keys(this.getStoredData()).length === 0;
  }

  /**
   * Demolishes all rides, deletes all guests, fires all staff
   */
  public clearPark() : void {
    this.deleteRides();
    this.deleteGuests();
    this.fireStaff();

    //TODO await setLandOwnership(getMapEdges(), LandOwnership.UNOWNED);
    
    this._restoreDataDefaults();
    this.storeData();
  }

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