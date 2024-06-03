/// <reference path='../lib/openrct2.d.ts' />

import { DataStore } from './DataStore';



/**
 * **********
 * Type Definitions
 * **********
 */

export type PlayerData = {
  // Player's total experience points
  totalExp : number,
  // Tiles used by player
  tilesUsed : number,
};



export class Player extends DataStore<PlayerData> {
  // Only access functions through instance
  public static readonly instance : Player = new Player();

  private constructor() {
    super('player', {
      // Player's total experience points
      totalExp: 0,
      // Tiles used by player
      tilesUsed: 0,
    });
  }
}

export const TilemanPlayer = Player.instance;