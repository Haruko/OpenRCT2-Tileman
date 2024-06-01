/// <reference path='../lib/openrct2.d.ts' />

import { GameCommandFlag, initParkData } from "@src/data";





/**
 * **********
 * Clearing/Init
 * **********
 */

/**
 * Demolishes all rides, deletes all guests, fires all staff
 */
export function clearPark() : void {
  deleteRides();
  deleteGuests();
  fireStaff();

  initParkData(true);
}


/**
 * Fires all staff
 */
export function fireStaff() : void {
  const staffList : Staff[] = map.getAllEntities('staff');

  staffList.forEach((staff : Staff) : void => {
    // Removing a mechanic that is currently fixing a ride doesn't break anything
    staff.remove();
  });
}

/**
 * Deletes all guests
 */
export function deleteGuests() : void {
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
export function deleteRides() : void {
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