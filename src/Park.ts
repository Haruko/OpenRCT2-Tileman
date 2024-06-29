/// <reference path='../lib/openrct2.d.ts' />

import { WritableStore } from 'openrct2-flexui';
import { LandOwnershipAction } from './tools/types/enums';
import { CoordsXY, isCoordsXY, isInRange } from './types/CoordsXY';
import { MapRange, clampRange, getRangeSize, isMapRange, rangesIntersect } from './types/MapRange';
import { DataStoreID, EntranceType, GameActionResultErrorCodes, GameCommandFlag, LandOwnership, LandRightsResult } from './types/enums';
import { DataStore } from './DataStore';
import { MetricData, PluginData, StoresData } from './types/types';
import { DataStoreManager } from './DataStoreManager';
import { Singleton } from './Singleton';



type ValidTilesResult = {
  coords : CoordsXY[],
  numFree : number, // Number of tiles that won't incur tile costs
};


export class Park extends Singleton {
  private _playableArea? : MapRange;

  /**
   * Initialize the park
   * Only ever called if this is a classic park being made into a tileman park
   */
  public async initialize() : Promise<void> {
    await this.clearPark();

    park.setFlag('open', false);

    await this.setLandOwnership(this.getPlayableArea(), LandOwnership.UNOWNED);
  }



  /**
   * **********
   * Map Bounds
   * **********
   */

  /**
   * Get the play area bounds for the current map
   * @returns MapRange representing map edges
   */
  public getPlayableArea() : MapRange {
    if (typeof this._playableArea === 'undefined') {
      // left/top edge is <1, 1> / <32, 32>
      const leftTop = CoordsXY(64, 64);
  
      // bottom/right edge is <x-2, y-2> / <32(x-2), 32(y-2)>
      // Map size is 2 tiles too big
      const rightBottom = CoordsXY((map.size.x - 3) * 32, (map.size.y - 3) * 32);

      this._playableArea = MapRange(leftTop, rightBottom);
    }

    return this._playableArea;
  }



  /**
   * **********
   * Land Management
   * **********
   */

  /**
   * Attempts to buy the tiles in the area
   * @param area Range to buy
   */
  public async rangeBuy(area : MapRange) : Promise<void> {
    const playableArea : MapRange = this.getPlayableArea();

    if (!rangesIntersect(area, playableArea)) {
      ui.showError(`Can't buy land...`, `Outside of playable area!`);
      return;
    }
    
    const { coords, numFree } : ValidTilesResult = this._getValidTiles(area, LandOwnershipAction.BUY);
    
    if (coords.length > 0) {
      const numCosting : number = coords.length - numFree;

      // Check if player can afford them
      const stores : DataStore<StoresData> = DataStoreManager.instance<DataStoreManager>().getInstance(DataStoreID.STORES);
      if (numCosting <= stores.get('availableTilesStore').get()) {
        const { numSet } : LandRightsResult = await this.setLandOwnership(coords, LandOwnership.OWNED);
        const numSpent : number = numSet - numFree;
        
        // Pay tiles
        const dsManager : DataStoreManager = DataStoreManager.instance();
        const metrics : DataStore<MetricData> = dsManager.getInstance(DataStoreID.METRICS);
        const tilesUsed : WritableStore<number> = metrics.get('tilesUsed');
        tilesUsed.set(tilesUsed.get() + numSpent);
      } else {
        ui.showError(`Can't buy land...`, `Not enough tiles available!`);
      }
    }
  }

  /**
   * Attempts to buy construction rights on the tiles in the area
   * @param area Range to buy
   */
  public async rangeBuyRights(area : MapRange) : Promise<void> {
    const playableArea : MapRange = this.getPlayableArea();

    if (!rangesIntersect(area, playableArea)) {
      ui.showError(`Can't buy rights...`, `Outside of playable area!`);
      return;
    }
    
    const { coords, numFree } : ValidTilesResult = this._getValidTiles(area, LandOwnershipAction.RIGHTS);
    
    if (coords.length > 0) {
      const numCosting : number = coords.length - numFree;

      // Check if player can afford them
      const stores : DataStore<StoresData> = DataStoreManager.instance<DataStoreManager>().getInstance(DataStoreID.STORES);
      if (numCosting <= stores.get('availableTilesStore').get()) {
        const { numSet } : LandRightsResult = await this.setLandOwnership(coords, LandOwnership.CONSTRUCTION_RIGHTS_OWNED);
        const numSpent : number = numSet - numFree;
        
        // Pay tiles
        const dsManager : DataStoreManager = DataStoreManager.instance();
        const metrics : DataStore<MetricData> = dsManager.getInstance(DataStoreID.METRICS);
        const tilesUsed : WritableStore<number> = metrics.get('tilesUsed');
        tilesUsed.set(tilesUsed.get() + numSpent);
      } else {
        ui.showError(`Can't buy rights...`, `Not enough tiles available!`);
      }
    }
  }

  /**
   * Attempts to sell the tiles in the area
   * @param area Range to buy
   */
  public async rangeSell(area : MapRange) : Promise<void> {
    const playableArea : MapRange = this.getPlayableArea();

    if (!rangesIntersect(area, playableArea)) {
      ui.showError(`Can't sell land...`, `Outside of playable area!`);
      return;
    }
    
    const { coords } : ValidTilesResult = this._getValidTiles(area, LandOwnershipAction.SELL);
    
    if (coords.length > 0) {
      const { numSet } : LandRightsResult = await this.setLandOwnership(coords, LandOwnership.UNOWNED);

      const dsManager : DataStoreManager = DataStoreManager.instance();
      const metrics : DataStore<MetricData> = dsManager.getInstance(DataStoreID.METRICS);
      const tilesUsed : WritableStore<number> = metrics.get('tilesUsed');
      tilesUsed.set(tilesUsed.get() - numSet);
    }
  }

  /**
   * Gets an array of valid tile coordinates and a number of free-cost tiles for the given action
   * @param area Area to check
   * @param action Action to check
   * @returns ValidTilesResult with an array of valid tile coordinates and a count of how many tiles will be free to change ownership of
   */
  private _getValidTiles(area : MapRange, action : LandOwnershipAction) : ValidTilesResult {
    // Array of CoordsXY that are valid for this action
    const coords : CoordsXY[] = [];
    // Number of tiles that will not incur a cost if buying
    let numFree : number = 0;

    const clampedArea : MapRange = clampRange(area, this.getPlayableArea());
    for (let x = clampedArea.leftTop.x; x <= clampedArea.rightBottom.x; x += 32) {
      for (let y = clampedArea.leftTop.y; y <= clampedArea.rightBottom.y; y += 32) {
        const tile : Tile = map.getTile(x / 32, y / 32);
        
        if (this._isValidTileAction(tile, action)) {
          coords.push(CoordsXY(x, y));

          const surface : SurfaceElement = this.getElementOfType(tile, 'surface') as SurfaceElement;

          // If either buying land or rights and the ownership is already the existing type, make sure to give it for free
          if ((action === LandOwnershipAction.RIGHTS && surface.ownership === LandOwnership.OWNED)
            || (action === LandOwnershipAction.BUY && surface.ownership === LandOwnership.CONSTRUCTION_RIGHTS_OWNED)) {
            ++numFree;
          }
        }
      }
    }

    return {
      coords,
      numFree
    } as ValidTilesResult;
  }
  
  /**
   * Sets tile ownership for an array of coordinates
   * @overload
   * @param coords Array of CoordsXY of tiles to set ownership for
   * @param ownership LandOwnership enum value
   * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
   */
  public async setLandOwnership(coords : CoordsXY[], ownership : LandOwnership) : Promise<LandRightsResult>;
  
  /**
   * Sets tile ownership in a region
   * @overload
   * @param range Defaults and clamps to <mapEdges.leftTop.x, mapEdges.leftTop.y> - <mapEdges.rightBottom.x, mapEdges.rightBottom.y>
   * @param ownership LandOwnership enum value
   * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
   */
  public async setLandOwnership(range : MapRange, ownership : LandOwnership) : Promise<LandRightsResult>;
  
  /**
   * Sets tile ownership in a region
   * @overload
   * @param rangeOrCoords Either map range or list of coordinates as explained in other overloads
   * @param ownership LandOwnership enum value
   * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
   */
  public async setLandOwnership(rangeOrCoords : MapRange | CoordsXY[], ownership : LandOwnership) : Promise<LandRightsResult> {
    const playableArea : MapRange = this.getPlayableArea();

    if (isMapRange(rangeOrCoords)) {
      const range : MapRange = rangeOrCoords as MapRange;
  
      if (!rangesIntersect(range, this.getPlayableArea())) {
        return Promise.resolve({ numSet: 0, numFailed: getRangeSize(range) });
      }
  
      const clampedRange : MapRange = clampRange(range, playableArea);
  
      // Turn on sandbox mode to fix NotInEditorMode error
      cheats.sandboxMode = true;
  
      const result = await new Promise<LandRightsResult>((resolve : Function, reject : Function) : void => {
        context.executeAction('landsetrights', {
          x1: clampedRange.leftTop.x,
          y1: clampedRange.leftTop.y,
          x2: clampedRange.rightBottom.x,
          y2: clampedRange.rightBottom.y,
          setting: 4, // Set ownership
          ownership: ownership,
          flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY
                | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
                | GameCommandFlag.GAME_COMMAND_FLAG_NO_SPEND
        }, (result : GameActionResult) : void => {
          if (typeof result.error !== 'undefined' && result.error !== GameActionResultErrorCodes.Ok) {
            reject(result.error);
          } else {
            // Assume lack of an error is a success
            resolve({ numSet: getRangeSize(range), numFailed: 0 });
          }
        });
      }).catch((reason : GameActionResultErrorCodes) : LandRightsResult => {
        // Assume that nothing was done if there was an error, otherwise we need to figure out how to undo
        console.log('setLandOwnership error', GameActionResultErrorCodes[reason]);
  
        return { numSet: 0, numFailed: getRangeSize(range) };
      });
  
      cheats.sandboxMode = false;
      return result;
    } else {
      const coords : CoordsXY[] = rangeOrCoords as CoordsXY[];
  
      // Turn on sandbox mode to fix NotInEditorMode error
      cheats.sandboxMode = true;
  
      const promises : Promise<GameActionResultErrorCodes>[] = [];
      coords.forEach((value : CoordsXY) : void => {
        const setRightsPromise = new Promise<GameActionResultErrorCodes>((resolve : Function, reject : Function) : void => {
          if (!isInRange(value, playableArea)) {
            resolve(GameActionResultErrorCodes.InvalidParameters);
          }
          
          context.executeAction('landsetrights', {
            x1: value.x,
            y1: value.y,
            x2: value.x,
            y2: value.y,
            setting: 4, // Set ownership
            ownership: ownership,
            flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY
                  | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
                  | GameCommandFlag.GAME_COMMAND_FLAG_NO_SPEND
          }, (result : GameActionResult) => {
            if (typeof result.error !== 'undefined' && result.error !== GameActionResultErrorCodes.Ok) {
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
   * Checks if a tile can have a certain LandOwnershipAction acted on it
   * @param tile Tile to check
   * @param action LandOwnershipAction to check
   * @returns True if it's a valid action
   */
  private _isValidTileAction(tile : Tile, action : LandOwnershipAction) : boolean {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const bypassPathRestrictions : boolean = plugin.get('bypassPathRestrictions').get();

    // Don't allow selling if there are guests on the tile
    if (action === LandOwnershipAction.SELL) {
      const entities : Guest[] = map.getAllEntitiesOnTile('guest', CoordsXY(tile.x * 32, tile.y * 32));
      if (entities.length > 0) {
        return false;
      }
    }

    // Iterate over elements to see land ownership and what is here
    for(let i = 0; i < tile.numElements; ++i) {
      const element : TileElement = tile.getElement(i);

      switch (action) {
        case LandOwnershipAction.SELL: {
          switch (element.type) {
            case 'surface': {
              // Land is unowned
              if (element.ownership === LandOwnership.UNOWNED) {
                return false;
              }

              break;
            } case 'entrance': {
              // It's a ride entrance/exit
              if (element.object === EntranceType.ENTRANCE_TYPE_RIDE_ENTRANCE
                || element.object === EntranceType.ENTRANCE_TYPE_RIDE_EXIT) {
                  return false;
              }

              break;
            } case 'track': {
              // It's either a track piece or the entire ride depending on type
              return false;
            } case 'footpath': {
              // Land has a path on it
              if (!bypassPathRestrictions) {
                const surface : SurfaceElement = <SurfaceElement>this.getElementOfType(tile, 'surface');
                if (surface.ownership === LandOwnership.OWNED) {
                  // Don't allow selling land with a path on it unless it's construction rights owned
                  return false;
                }
              }

              break;
            }
          }

          break;
        } case LandOwnershipAction.BUY: {
          switch (element.type) {
            case 'surface': {
              // Land is not unowned and ownership type matches buyType
              if (element.ownership === LandOwnership.OWNED) {
                return false;
              }

              break;
            } case 'entrance': {
              // It's the park entrance
              if (element.object === EntranceType.ENTRANCE_TYPE_PARK_ENTRANCE) {
                return false;
              }

              break;
            } case 'footpath': {
              // Land has a path on it
              if (!bypassPathRestrictions) {
                // This prevents players from buying path between the park entrance and the guest spawns
                return false;
              }
            }
          }

          break;
        } case LandOwnershipAction.RIGHTS: {
          switch (element.type) {
            case 'surface': {
              // Land is not unowned and ownership type matches buyType
              if (element.ownership === LandOwnership.CONSTRUCTION_RIGHTS_OWNED) {
                return false;
              }

              break;
            } case 'entrance': {
              // It's the park entrance
              if (element.object === EntranceType.ENTRANCE_TYPE_PARK_ENTRANCE) {
                return false;
              }

              break;
            } case 'footpath': {
              // Land has a path on it
              if (!bypassPathRestrictions) {
                const surface : SurfaceElement = <SurfaceElement>this.getElementOfType(tile, 'surface');
                if (surface.ownership === LandOwnership.OWNED) {
                  // Don't allow buying rights on land with a path on it if it's owned
                  // This would make a park fence there and would potentially soft loft
                  return false;
                }
              }
              
              break;
            }
          }

          break;
        }
      }
    }

    return true;
  }

  /**
   * Gets the TileElement at the given Tile
   * @param tile The Tile
   * @param type Type of element to get
   * @returns The SurfaceElement
   */
  public getElementOfType(tile : Tile, type : TileElementType) : TileElement;

  /**
   * Gets the SurfaceElement at the given coords
   * @param coords The coords
   * @param type Type of element to get
   * @returns The SurfaceElement
   */
  public getElementOfType(coords : CoordsXY, type : TileElementType) : TileElement;

  /**
   * Gets the SurfaceElement at the given coords or Tile
   * @param coords The coords
   * @param type Type of element to get
   * @returns The SurfaceElement
   */
  public getElementOfType(coordsOrTile : CoordsXY | Tile, type : TileElementType) : TileElement | undefined {
    let tile : Tile;

    if (isCoordsXY(coordsOrTile)) {
      tile = map.getTile(coordsOrTile.x, coordsOrTile.y);
    } else {
      tile = coordsOrTile;
    }

    let element : TileElement | undefined;

    // Not sure if surface is always at index 0
    for (let i = 0; i < tile.numElements; ++i) {
      if (tile.elements[i].type === type) {
        element = tile.elements[i];
        break;
      }
    }

    return element;
  }

  /**
   * Deletes the TileElement at the given Tile
   * @param tile The Tile
   * @param type Array of types to delete
   */
  public deleteElementsOfType(tile : Tile, types : TileElementType[]) : void;

  /**
   * Deletes the SurfaceElement at the given coords
   * @param coords The coords
   * @param type Array of types to delete
   */
  public deleteElementsOfType(coords : CoordsXY, types : TileElementType[]) : void;

  /**
   * Deletes the SurfaceElement at the given coords or Tile
   * @param coords The coords
   * @param type Array of types to delete
   */
  public deleteElementsOfType(coordsOrTile : CoordsXY | Tile, types : TileElementType[]) : void {
    let tile : Tile;

    if (isCoordsXY(coordsOrTile)) {
      tile = map.getTile(coordsOrTile.x, coordsOrTile.y);
    } else {
      tile = coordsOrTile;
    }

    // Not sure if surface is always at index 0
    for (let i = 0; i < tile.numElements; ++i) {
      if (types.indexOf(tile.elements[i].type) > -1) {
        tile.removeElement(i);
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
      const tile : Tile = map.getTile(guest.x / 32, guest.y / 32);
      const isInEntrance : boolean = tile.elements.filter((element : TileElement) : boolean => element.type === 'entrance').length === 1;

      if (guest.isInPark || isInEntrance) {
        try {
          guest.remove();
          
        } catch (error) {
          guestsOnRide = true;
        }
      }
    });
  
    if (guestsOnRide) {
      ui.showError('Couldn\'t delete all guests...', 'Delete rides before trying again!');
    }
  }
  
  /**
   * Deletes all rides
   */
  public async deleteRides() : Promise<void> {
    const rideList : Ride[] = map.rides;
  
    let promises : Promise<void>[] = [];
    rideList.forEach((ride : Ride, index : number) : void => {
      // Deleting a ride with people on it ejects them to the queue 
      promises.push(new Promise<void>((resolve, reject) : void => {
        context.executeAction('ridedemolish', {
          flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY
                | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
                | GameCommandFlag.GAME_COMMAND_FLAG_NO_SPEND,
          ride: ride.id,
          modifyType: 0 // 0: demolish, 1: renew
        }, (result : GameActionResult) => {
          resolve();
        });
      }));
    });

    return Promise.all(promises).then(() : void => {
      // Clear orphaned track pieces tile by tile (for LL's Volcania for instance)
      const playableArea : MapRange = this.getPlayableArea();

      const minX : number = playableArea.leftTop.x / 32;
      const minY : number = playableArea.leftTop.y / 32;

      const maxX : number = playableArea.rightBottom.x / 32;
      const maxY : number = playableArea.rightBottom.y / 32;

      for(let x = minX; x < maxX; x += 1) {
        for(let y = minY; y < maxY; y += 1) {
          const tile : Tile = map.getTile(x, y);
          const surface : SurfaceElement = this.getElementOfType(tile, 'surface') as SurfaceElement;

          if (surface.hasOwnership) {
            this.deleteElementsOfType(tile, ['track', 'entrance']);
          }
        }
      }
    });
  }

  /**
   * Deletes all paths inside the park
   */
  public clearPaths() : void {
    const playableArea : MapRange = this.getPlayableArea();

    const minX : number = playableArea.leftTop.x / 32;
    const minY : number = playableArea.leftTop.y / 32;

    const maxX : number = playableArea.rightBottom.x / 32;
    const maxY : number = playableArea.rightBottom.y / 32;

    for(let x = minX; x < maxX; x += 1) {
      for(let y = minY; y < maxY; y += 1) {
        const tile : Tile = map.getTile(x, y);
        const surface : SurfaceElement = this.getElementOfType(tile, 'surface') as SurfaceElement;

        if (surface.hasOwnership) {
          this.deleteElementsOfType(tile, ['footpath']);

          // Clean litter
          const litterList : Litter[] = map.getAllEntitiesOnTile('litter', CoordsXY(x * 32, y * 32));
          litterList.forEach((litter : Litter) : void => {
            litter.remove();
          })
        }
      }
    }
  }

  /**
   * Clears all rides, paths, staff, and guests from park
   */
  public async clearPark() : Promise<void> {
    // Delete rides first, otherwise there will be a bunch of crashes
    // We delete track later for maps like LL's Volcania with abandoned rides
    await this.deleteRides();

    this.clearPaths();

    // Clear the guests and staff after rides are all deleted so they can also be deleted
    this.deleteGuests();
    this.fireStaff();
  }
}