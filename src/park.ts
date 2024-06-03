/// <reference path='../lib/openrct2.d.ts' />

import { DataStore } from './DataStore';



/**
 * **********
 * Type Definitions
 * **********
 */

type ParkData = {
  // Data used to calculate experience
  parkAdmissions : number,
  // Maps ride IDs (numbers) and historical data
  rideMap : Record<number, RideData>,
  // List of rides that were demolished
  demolishedRides : RideData[]
};

type RideData = {
  // ride.name
  name : string,
  // ride.classification ('ride' | 'stall' | 'facility')
  classification : RideClassification,
  // ride.type (RideType enum)
  type : number,
  // ride.age
  age : number,
  // ride.value
  value : number,
  // ride.totalCustomers
  totalCustomers : number,
  // ride.totalProfit
  totalProfit : number,
  // ride.lifecycleFlags
  lifecycleFlags : number
};



/**
 * **********
 * Enum Definitions
 * **********
 */

// From openrct2/ride/Ride.h
export enum RideLifecycleFlags {
  RIDE_LIFECYCLE_EVER_BEEN_OPENED = 1 << 12
};

// From openrct2/Game.h
export enum GameCommandFlag {
  GAME_COMMAND_FLAG_APPLY = (1 << 0),               // If this flag is set, the command is applied, otherwise only the cost is retrieved
  GAME_COMMAND_FLAG_REPLAY = (1 << 1),              // Command was issued from replay manager.
  GAME_COMMAND_FLAG_2 = (1 << 2),                   // Unused
  GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED = (1 << 3), // Allow while paused
  GAME_COMMAND_FLAG_4 = (1 << 4),                   // Unused
  GAME_COMMAND_FLAG_NO_SPEND = (1 << 5),            // Game command is not networked
  GAME_COMMAND_FLAG_GHOST = (1 << 6),               // Game command is not networked
  GAME_COMMAND_FLAG_TRACK_DESIGN = (1 << 7),
  // GAME_COMMAND_FLAG_NETWORKED = (1u << 31)          // Game command is coming from network (Doesn't have equivalent in TS?)
};



export class Park extends DataStore<ParkData> {
  // Only access functions through instance
  public static readonly instance : Park = new Park();

  private constructor() {
    super('park', {
      // Data used to calculate experience
      parkAdmissions : 0,
      // Maps ride IDs (numbers) and historical data
      rideMap : {},
      // List of rides that were demolished
      demolishedRides : []
    });
  }
  


  /**
   * **********
   * Data Access
   * **********
   */

  /**
   * Re-initializes park data to defaults
   * @param forceClear True if we want to forcibly clear the park data. Defaults to false
   * @returns True if it's a new park
   */
  public initialize() : boolean {
    const savedData : ParkData = this.getStoredData();

    if (Object.keys(savedData).length === 0) {
      // Initialize keys
      this._restoreDataDefaults();

      return true; // New park
    } else {
      // Load saved data
      const parkData : ParkData = {
        parkAdmissions: savedData.parkAdmissions,
        rideMap: savedData.rideMap,
        demolishedRides: savedData.demolishedRides,
      };

      this.deepCopy(parkData, this.data);

      // Initialize stores
      //TODO ParkDataStores.totalExp.set(savedParkData.totalExp);
      //TODO ParkDataStores.tilesUsed.set(savedParkData.tilesUsed);

      return false; // Loaded park
    }
  }

  /**
   * Stores ParkData into the persistent park-specific storage
   */
  public storeParkData() : void {
    // Get park data structure to save new data
    const savedData : ParkData = this.getStoredData();
  
    // Load saved data
    savedData.parkAdmissions = this.data.parkAdmissions;
    savedData.rideMap = this.data.rideMap;
    savedData.demolishedRides = this.data.demolishedRides;
  
    // Initialize stores
    //TODO savedData.totalExp = ParkDataStores.totalExp.get();
    //TODO savedData.tilesUsed = ParkDataStores.tilesUsed.get();
  }

  /**
   * Move ride from ParkData.rideMap to ParkData.demolishedRides
   * @param rideId Index of the ride that was demolished. Won't exist in stored park data, but will exist in our local copy
   */
  public recordDemolishedRide(rideId : number) : void {
    const rideData : RideData = this.data.rideMap[rideId];
  
    if(typeof rideData !== 'undefined') {
      this.data.demolishedRides.push(rideData);
      delete this.data.rideMap[rideId];
    }
  }
  


  /**
   * **********
   * Actions
   * **********
   */

  /**
   * Demolishes all rides, deletes all guests, fires all staff
   */
  public clearPark() : void {
    this.deleteRides();
    this.deleteGuests();
    this.fireStaff();
    
    this._restoreDataDefaults();
    this.storeParkData();
  }

  /**
   * Fires all staff
   */
  fireStaff() : void {
    const staffList : Staff[] = map.getAllEntities('staff');
  
    staffList.forEach((staff : Staff) : void => {
      // Removing a mechanic that is currently fixing a ride doesn't break anything
      staff.remove();
    });
  }
  
  /**
   * Deletes all guests
   */
  deleteGuests() : void {
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
  deleteRides() : void {
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

export const TilemanPark = Park.instance;