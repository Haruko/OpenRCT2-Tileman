/// <reference path='../lib/openrct2.d.ts' />

import { getPlayerData, computeTilesUnlocked } from './data';

import { CoordsXY } from './types/CoordsXY';
import { MapRange, isMapRange, computeTilesInRange } from './types/MapRange';



const PlayerData = getPlayerData();



/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */

export type LandRightsResult = { numSet : number, numFailed : number };

// From openrct2/world/Surface.h
export enum LandOwnership {
  UNOWNED = 0,
  CONSTRUCTION_RIGHTS_OWNED = (1 << 4),
  OWNED = (1 << 5),
  CONSTRUCTION_RIGHTS_AVAILABLE = (1 << 6),
  AVAILABLE = (1 << 7)
};

// From openrct2/world/TileElement.h
export enum EntranceType {
  ENTRANCE_TYPE_RIDE_ENTRANCE,
  ENTRANCE_TYPE_RIDE_EXIT,
  ENTRANCE_TYPE_PARK_ENTRANCE
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

// From openrct2/actions/GameActionResult.h
export enum GameActionResultErrorCodes {
  Ok,
  InvalidParameters,
  Disallowed,
  GamePaused,
  InsufficientFunds,
  NotInEditorMode,

  NotOwned,
  TooLow,
  TooHigh,
  NoClearance,
  ItemAlreadyPlaced,

  NotClosed,
  Broken,

  NoFreeElements,

  // Unknown = std::numeric_limits<std::underlying_type_t<Status>>::max(),
}



/**
 * **********
 * Map Bounds
 * **********
 */

/**
 * Get the edges for the current map
 * @returns MapRange representing map edges
 */
export function getMapEdges() : MapRange {
  // left/top edge is <1, 1> / <32, 32>
  const leftTop = CoordsXY(32, 32);

  // bottom/right edge is <x-2, y-2> / <32(x-2), 32(y-2)>
  // Map size is 2 tiles too big
  const rightBottom = CoordsXY((map.size.x - 2) * 32, (map.size.y - 2) * 32);

  return MapRange(leftTop, rightBottom);
}

/**
 * Checks if range is at least partially in playable area
 * @param range Selection range
 * @returns true if range is at least partially in playable area
 */
export function checkInsideMap(range : MapRange) : boolean;

/**
 * Checks if coordinates are inside the playable area
 * @param coords Coordinates to check
 * @returns true if the coordinates are inside the playable area
 */
export function checkInsideMap(coords : CoordsXY) : boolean;

/**
 * Checks if coordinates are inside the playable area
 * @param rangeOrCoords CoordsXY or MapRange
 * @returns true if the coordinates are inside the playable area or range is at least partially in playable area
 */
export function checkInsideMap(rangeOrCoords : CoordsXY | MapRange) : boolean;

export function checkInsideMap(rangeOrCoords : any) : boolean {
  if (isMapRange(rangeOrCoords)) {
    const range = rangeOrCoords as MapRange;

    const xLow : boolean = (range.leftTop.x > getMapEdges().leftTop.x || range.rightBottom.x > getMapEdges().leftTop.x);
    const xHigh : boolean = (range.leftTop.x < getMapEdges().rightBottom.x || range.rightBottom.x < getMapEdges().rightBottom.x);
    const yLow : boolean = (range.leftTop.y > getMapEdges().leftTop.y || range.rightBottom.y > getMapEdges().leftTop.y);
    const yHigh : boolean = (range.leftTop.y < getMapEdges().rightBottom.y || range.rightBottom.y < getMapEdges().rightBottom.y);
  
    return xLow && xHigh && yLow && yHigh;
  } else {
    const coords = rangeOrCoords as CoordsXY;
    
    const x : boolean = coords.x > getMapEdges().leftTop.x && coords.x < getMapEdges().rightBottom.x;
    const y : boolean = coords.y > getMapEdges().leftTop.y && coords.y < getMapEdges().rightBottom.y;
  
    return x && y;
  }
}

/**
 * Returns coordinates clamped to the map bounds
 * @param coords coordinates to clamp
 * @returns clamped coordinates
 */
export function clampCoords(coords : CoordsXY) : CoordsXY {
  let clampedCoords : CoordsXY = CoordsXY(
    Math.min(getMapEdges().rightBottom.x - 32, Math.max(getMapEdges().leftTop.x + 32, coords.x)),
    Math.min(getMapEdges().rightBottom.y - 32, Math.max(getMapEdges().leftTop.y + 32, coords.y))
  );

  return clampedCoords;
}

/**
 * Shorter way to clamp both coordinates in a range
 * @param range Range to clamp
 * @returns Range with clamped corners
 */
export function clampRange(range : MapRange) : MapRange {
  return MapRange(clampCoords(range.leftTop), clampCoords(range.rightBottom));
}



/**
 * **********
 * Land Management
 * **********
 */

/**
 * Sets tile ownership for an array of coordinates
 * @overload
 * @param coords Array of CoordsXY of tiles to set ownership for
 * @param ownership LandOwnership enum value
 * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
 */
export async function setLandOwnership(coords : CoordsXY[], ownership : LandOwnership) : Promise<LandRightsResult>;

/**
 * Sets tile ownership in a region
 * @overload
 * @param range Defaults and clamps to <getMapEdges().leftTop.x, getMapEdges().leftTop.y> -  <getMapEdges().rightBottom.x, getMapEdges().rightBottom.y>
 * @param ownership LandOwnership enum value
 * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
 */
export async function setLandOwnership(range : MapRange, ownership : LandOwnership) : Promise<LandRightsResult>;

/**
 * Sets tile ownership in a region
 * @overload
 * @param rangeOrCoords Either map range or list of coordinates as explained in other overloads
 * @param ownership LandOwnership enum value
 * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
 */
export async function setLandOwnership(rangeOrCoords : MapRange | CoordsXY[], ownership : LandOwnership) : Promise<LandRightsResult>;


export async function setLandOwnership(rangeOrCoords : any, ownership : any) : Promise<LandRightsResult> {
  if (isMapRange(rangeOrCoords)) {
    const range : MapRange = rangeOrCoords as MapRange;

    if (!checkInsideMap(range)) {
      return Promise.resolve({ numSet: 0, numFailed: computeTilesInRange(range) });
    }

    const clampedRange : MapRange = clampRange(range);

    // Turn on sandbox mode to make buying/selling land free and doable to any tile
    cheats.sandboxMode = true;

    const result = await new Promise<LandRightsResult>((resolve : Function, reject : Function) : void => {
      context.executeAction("landsetrights", {
        x1: clampedRange.leftTop.x,
        y1: clampedRange.leftTop.y,
        x2: clampedRange.rightBottom.x,
        y2: clampedRange.rightBottom.y,
        setting: 4, // Set ownership
        ownership: ownership,
        flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
      }, (result : GameActionResult) : void => {
        if (typeof result.error !== 'undefined' && result.error !== GameActionResultErrorCodes.Ok) {
          reject(result.error);
        } else {
          // Assume lack of an error is a success
          resolve({ numSet: computeTilesInRange(range), numFailed: 0 });
        }
      });
    }).catch((reason : GameActionResultErrorCodes) : LandRightsResult => {
      // Assume that nothing was done if there was an error, otherwise we need to figure out how to undo
      console.log('setLandOwnership error', GameActionResultErrorCodes[reason]);

      return { numSet: 0, numFailed: computeTilesInRange(range) };
    });

    cheats.sandboxMode = false;
    return result;
  } else {
    const coords : CoordsXY[] = rangeOrCoords as CoordsXY[];

    // Turn on sandbox mode to make buying/selling land free and doable to any tile
    cheats.sandboxMode = true;

    const promises : Promise<GameActionResultErrorCodes>[] = [];
    coords.forEach((value : CoordsXY) : void => {
      const setRightsPromise = new Promise<GameActionResultErrorCodes>((resolve : Function, reject : Function) : void => {
        if (!checkInsideMap(value)) {
          resolve(GameActionResultErrorCodes.InvalidParameters);
        }
        context.executeAction("landsetrights", {
          x1: value.x,
          y1: value.y,
          x2: value.x,
          y2: value.y,
          setting: 4, // Set ownership
          ownership: ownership,
          flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
        }, (result : GameActionResult) => {
          if (typeof result.error !== 'undefined') {
            resolve(result.error);
          } else {
            // Assume lack of an error is a success
            resolve(GameActionResultErrorCodes.Ok);
          }
        });
      });

      promises.push(setRightsPromise);
    });

    const results : GameActionResultErrorCodes[] = await Promise.all(promises);
    
    let numSet : number = 0;
    let numFailed : number = 0;
    results.forEach((result : GameActionResultErrorCodes) : void => {
      if (result === GameActionResultErrorCodes.Ok) {
        ++numSet;
      } else {
        ++numFailed;
      }
    });

    cheats.sandboxMode = false;
    return { numSet, numFailed };
  }
}

/**
 * Attempts to buy/sell tiles in a region
 * @param range Range of tiles to buy/sell
 * @param setType Which type of ownership we're trying to get
 * @returns true on success
 */
export async function setTiles(range : MapRange, setType : LandOwnership) : Promise<void> {
  const setText : string = setType === LandOwnership.UNOWNED ? 'sell' : 'buy';

  // Make sure selection is inside of playable area
  if (!checkInsideMap(range)) {
    ui.showError(`Can't ${setText} land...`, `Outside of playable area!`);
    return;
  }

  const clampedRange = clampRange(range);

  // Check the settability of all tiles in the range
  const coords : CoordsXY[] = [];
  let numFree : number = 0; // Number of tiles that will not incur a cost if buying

  for (let x = clampedRange.leftTop.x; x <= clampedRange.rightBottom.x; x += 32) {
    for (let y = clampedRange.leftTop.y; y <= clampedRange.rightBottom.y; y += 32) {
      const checkResult = checkTileSettable(map.getTile(x / 32, y / 32), setType);

      // If boolean, assumed to be false
      if (typeof checkResult !== 'boolean') {
        coords.push(CoordsXY(x, y));

        // If ownership type is the opposite owned type (rights vs owned) then don't incur a cost
        // We don't check for selling because numFree is unused for selling
        if (checkResult !== setType && (checkResult === LandOwnership.OWNED || checkResult === LandOwnership.CONSTRUCTION_RIGHTS_OWNED)) {
          ++numFree;
        }
      }
    }
  }

  if (coords.length > 0) {
    if (setType === LandOwnership.UNOWNED) {
      // Selling
      const result : LandRightsResult = await setLandOwnership(coords, LandOwnership.UNOWNED);

      // Refund tiles
      PlayerData.tilesUsed.set(PlayerData.tilesUsed.get() - result.numSet);
    } else {
      // Buying
      // Check if player can afford them
      if (coords.length - numFree <= computeTilesUnlocked() - PlayerData.tilesUsed.get()) {
        const result : LandRightsResult = await setLandOwnership(coords, setType);
        
        // Pay tiles
        PlayerData.tilesUsed.set(PlayerData.tilesUsed.get() + result.numSet - numFree);
      } else {
        ui.showError(`Can't buy land...`, `Not enough tiles available!`);
      }
    }
  }
}

/**
 * Checks if a tile should be settable for given setType
 * @param tile Tile to check
 * @param setType Whether we're attempting LandOwnership.UNOWNED, LandOwnership.OWNED, or LandOwnership.CONSTRUCTION_RIGHTS_OWNED
 * @returns false if the tile is not settable, otherwise the type of ownership the player has on the tile
 */
export function checkTileSettable(tile : Tile, setType : LandOwnership) : false | LandOwnership {
  let settable = true;
  let ownership! : LandOwnership;

  // Iterate over elements to see land ownership and what is here
  for(let i = 0; i < tile.numElements && settable; ++i) {
    let element = tile.getElement(i);

    if (setType === LandOwnership.UNOWNED) {
      // UNOWNED
      switch (element.type) {
        case 'surface':
          // Land is unowned
          ownership = element.ownership;

          if (element.ownership === LandOwnership.UNOWNED) {
            settable = false;
          }
          break;

        case 'entrance':
          // It's a ride entrance/exit
          if (element.object === EntranceType.ENTRANCE_TYPE_RIDE_ENTRANCE
            || element.object === EntranceType.ENTRANCE_TYPE_RIDE_EXIT) {
              settable = false;
          }
          break;

        case 'track':
          // track is either a track piece or the entire ride depending on type
          settable = false;
          break;
      }
    } else {
      // OWNED or CONSTRUCTION_RIGHTS_OWNED
      switch (element.type) {
        case 'surface':
          // Land is not unowned and ownership type matches buyType
          ownership = element.ownership;

          if (element.ownership !== LandOwnership.UNOWNED && element.ownership === setType) {
            settable = false;
          }
          break;

        case 'entrance':
          // It's the park entrance
          if (element.object === EntranceType.ENTRANCE_TYPE_PARK_ENTRANCE) {
            settable = false;
          }
          break;
      }
    }
  }

  if (settable) {
    return ownership;
  } else {
    return false;
  }
}