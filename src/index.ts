//   /// <reference path="../lib/openrct2.d.ts" />
import * as FlexUI from 'openrct2-flexui';

/**
 * TODO: I want to make the tool work like the land tool, with a + and - button to change size.
 *    This will make handling large areas less laggy since it's slowed down by the user needing to paint the area.
 *    Check out https://github.com/OpenRCT2/OpenRCT2/blob/17920b60390aa0c4afc84c09aa897a596f41705a/src/openrct2-ui/windows/Land.cpp#L43
 * TODO: Show selection area over where construction rights are owned
 */



/**
 * **********
 * Variables
 * **********
 */

/**
 * Player/Park data
 */
const PlayerData = {
  totalExp: 0,
  tilesUsed: 0,

  // Maps ride IDs (numbers) and historical data (Ride.totalCustomers, eventually Ride.totalProfit or something )
  // TODO: Make this keep track of ride stats every interval to account for deleted rides
  /**
   * TODO:
   * declare function compute<T, U>(store: Store<T>, callback: (value: T) => U): Store<U>;
   * const buyButtonPressed : FlexUI.Store<boolean> = FlexUI.store<boolean>(false);
   */
  rideMap: {
    /*
      123: {
        rideType: "ride" | "stall" | "facility"
        totalCustomers: 69
      }
    */
  }
};

/**
 * Configs
 */
const PluginConfig = {
  // Never changed
  winTitle: 'Tileman',
  minToolSize: 1,
  maxToolSize: 15,

  // User definable
  // TODO: Allow users to customize in the UI
  expPerTile: 1000,
  minTiles: 2 // 1 path + 1 stall minimum
}

/**
 * Functional
 */
let toolSize = PluginConfig.minToolSize;

// var toolStartCoords : CoordsXY = CoordsXY(0, 0);
// var lastHoveredCoords : CoordsXY = CoordsXY(0, 0);

// Prevent buying outer range of the map so we don't mess up guests spawning
const MapEdges : MapRange = MapRange(
  // left/top edge is <1, 1> / <32, 32>
  CoordsXY(32, 32),
  // bottom/right edge is <x-2, y-2> / <32(x-2), 32(y-2)>
  // Map size is 2 tiles too big
  CoordsXY((map.size.x - 2) * 32, (map.size.y - 2) * 32)
);



/**
 * **********
 * Type / Interface / Enum definitions
 * **********
 */

enum ToolID {
  BUY_TOOL = 'TilemanBuyTool',
  RIGHTS_TOOL = 'TilemanBuildRightsTool',
  SELL_TOOL = 'TilemanSellTool',
};

// From openrct2/world/Surface.h
enum LandOwnership {
  UNOWNED = 0,
  CONSTRUCTION_RIGHTS_OWNED = (1 << 4),
  OWNED = (1 << 5),
  CONSTRUCTION_RIGHTS_AVAILABLE = (1 << 6),
  AVAILABLE = (1 << 7)
};

// From openrct2/world/TileElement.h
enum EntranceType {
  ENTRANCE_TYPE_RIDE_ENTRANCE,
  ENTRANCE_TYPE_RIDE_EXIT,
  ENTRANCE_TYPE_PARK_ENTRANCE
};

// From openrct2/Game.h
enum GameCommandFlag {
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

// From openrct2/sprites.h
enum Sprites {
  SPR_BUY_LAND_RIGHTS = 5176,
  SPR_BUY_CONSTRUCTION_RIGHTS = 5177,
  SPR_FINANCE = 5190
};


/**
 * **********
 * Function Constructors and Type Guards
 * **********
 */

/**
 * Makes a CoordsXY <0, 0>
 * @overload
 */
function CoordsXY() : CoordsXY;

/**
 * Makes a CoordsXY from x and y values
 * @overload
 * @param x 
 * @param y 
 * @returns CoordsXY
 */
function CoordsXY(x : number, y : number) : CoordsXY;

function CoordsXY(x? : any, y? : any) : CoordsXY {
  if (typeof x === 'number') {
    return { x, y } as CoordsXY;
  } else {
    return { x: 0, y: 0 } as CoordsXY;
  }
}

/**
 * Checks if an object is instance of CoordsXY interface
 * @param obj object to check
 * @returns true if obj is an instance of CoordsXY interface
 */
function isCoordsXY(obj : any) : obj is CoordsXY {
  const objAsCoordsXY = obj as CoordsXY;
  return typeof obj !== 'undefined'
    && typeof objAsCoordsXY.x !== 'undefined'
    && typeof objAsCoordsXY.y !== 'undefined' ;
}

/**
 * Makes a MapRange from two <x, y> coordinates, using the bounds of the rectangle they create to determine proper corners to define
 * @overload
 * @param c1 first corner
 * @param c2 second corner
 * @returns MapRange with leftTop and rightBottom built from minimums of coordinates
 */
function MapRange(c1 : CoordsXY, c2 : CoordsXY) : MapRange;

/**
 * Makes a MapRange from two <x, y> coordinates, using the bounds of the rectangle they create to determine proper corners to define
 * @overload
 * @param x1 first corner x coordinate
 * @param y1 first corner y coordinate
 * @param x2 second corner x coordinate
 * @param y2 second corner y coordinate
 * @returns MapRange with leftTop and rightBottom built from minimums of coordinates
 */
function MapRange(x1 : number, y1: number, x2 : number, y2 : number) : MapRange;

function MapRange(a : any, b : any, x? : any, y? : any) : MapRange {
  if (typeof a === 'number' && typeof b === 'number') {
    return {
      leftTop: CoordsXY(Math.min(a, x), Math.min(b, y)),
      rightBottom: CoordsXY(Math.max(a, x), Math.max(b, y))
    } as MapRange;
  } else {
    return MapRange(a.x, a.y, b.x, b.y);
  }
}

/**
 * Checks if an object is instance of MapRange interface
 * @param obj object to check
 * @returns true if obj is an instance of MapRange interface
 */
function isMapRange(obj : any) : obj is MapRange {
  const objAsMapRange = obj as MapRange;
  return typeof obj !== 'undefined'
    && (typeof objAsMapRange.leftTop !== 'undefined' && isCoordsXY(objAsMapRange.leftTop))
    && (typeof objAsMapRange.rightBottom !== 'undefined' && isCoordsXY(objAsMapRange.rightBottom));
}



/**
 * **********
 * UI construction
 * **********
 */

/**
 * Sprite list: openrct2/sprites.h
 * 
 * Text colors
 *   black
 *   grey
 *   white
 *   red
 *   green
 *   yellow
 *   topaz
 *   celadon
 *   babyblue
 *   palelavender
 *   palegold
 *   lightpink
 *   pearlaqua
 *   palesilver
 */

/**
 * Box to display statistics in primary window
 */
const statsPanel = FlexUI.box({
  content: FlexUI.vertical({
    spacing: 5,
    content: [
      FlexUI.horizontal({
        spacing: 0,
        content: [
          FlexUI.label({
            text: "{BLACK}Total Exp:",
            width: '175px'
          }),
          FlexUI.label({
            text: `{BABYBLUE}${context.formatString('{COMMA16}', PlayerData.totalExp)}`
          })
        ]
      }),
      FlexUI.horizontal({
        spacing: 0,
        content: [
          FlexUI.label({
            text: "{BLACK}Tiles Unlocked/Used/Available: ",
            width: '175px'
          }),
          FlexUI.label({
            text: `{BABYBLUE}${context.formatString('{COMMA16}', computeTilesAvailable())}` +
              `{BLACK}/{RED}${context.formatString('{COMMA16}', PlayerData.tilesUsed)}` +
              `{BLACK}/{GREEN}${context.formatString('{COMMA16}', computeTilesAvailable() - PlayerData.tilesUsed)}`
          })
        ]
      })
    ]
  })
});

/**
 * Box to display buttons in primary window
 */
const buyButtonPressed : FlexUI.Store<boolean> = FlexUI.store<boolean>(false);
const rightsButtonPressed : FlexUI.Store<boolean> = FlexUI.store<boolean>(false);
const sellButtonPressed : FlexUI.Store<boolean> = FlexUI.store<boolean>(false);

const buyButton = FlexUI.button({
  image: Sprites.SPR_BUY_LAND_RIGHTS,
  tooltip: 'Buy land rights',
  width: '24px',
  height: '24px',
  onClick: () => onToolButtonPress(ToolID.BUY_TOOL),
  isPressed: buyButtonPressed
});

const rightsbutton = FlexUI.button({
  image: Sprites.SPR_BUY_CONSTRUCTION_RIGHTS,
  tooltip: 'Buy construction rights',
  width: '24px',
  height: '24px',
  onClick: () => onToolButtonPress(ToolID.RIGHTS_TOOL),
  isPressed: rightsButtonPressed
});

const sellButton = FlexUI.button({
  image: Sprites.SPR_FINANCE,
  tooltip: 'Sell land and construction rights',
  width: '24px',
  height: '24px',
  onClick: () => onToolButtonPress(ToolID.SELL_TOOL),
  isPressed: sellButtonPressed
});

const toolSizeSpinner = FlexUI.spinner({
  width: '62px',
  padding: ['5px', '5px'],
  value: toolSize,
  minimum: PluginConfig.minToolSize,
  maximum: PluginConfig.maxToolSize + 1,
  step: 1,
  wrapMode: 'clamp',
  onChange: (value: number, adjustment: number) : void => {
    toolSize = value;
  },
  format: (value: number) : string => {
    // Add spaces to center the text :) I am bigly smart
    return `${value}x${value}`;
  }
});

const buttonPanel = FlexUI.vertical({
  spacing: 0,
  content: [
    FlexUI.horizontal({
      spacing: 0,
      content: [
        buyButton,
        rightsbutton,
        sellButton,
        toolSizeSpinner
      ]
    })
  ]
});

/**
 * Primary window
 */
const mainWindow = FlexUI.window({
  title: PluginConfig.winTitle,
	width: 275,
	height: 200,
  content: [
    FlexUI.vertical({
      spacing: 5,
      content: [
        statsPanel,
        buttonPanel
      ]
  })],
  onOpen: onWindowOpen,
  onUpdate: onWindowUpdate,
  onClose: onWindowClose
});

/**
 * Handles tool window's onOpen event
 */
function onWindowOpen() : void {
  ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags | FlexUI.ViewportFlags.ConstructionRights;
}

/**
 * Handles tool window's onUpdate event
 */
function onWindowUpdate() : void {
  return;
}

/**
 * Handles tool window's onClose event
 */
function onWindowClose() : void {
  cancelTool();
  ui.mainViewport.visibilityFlags = ui.mainViewport.visibilityFlags ^ FlexUI.ViewportFlags.ConstructionRights;
}

/**
 * Handles clicks on tool buttons
 * @param toolID Tool ID for the button
 */
function onToolButtonPress(toolID : string) : void {
  let buttonPressed : boolean = false;;

  switch(toolID) {
    case ToolID.BUY_TOOL:
      buttonPressed = !buyButtonPressed.get();

      buyButtonPressed.set(buttonPressed);
      rightsButtonPressed.set(false);
      sellButtonPressed.set(false);
      break;
    case ToolID.RIGHTS_TOOL:
      buttonPressed = !rightsButtonPressed.get();

      buyButtonPressed.set(false);
      rightsButtonPressed.set(buttonPressed);
      sellButtonPressed.set(false);
      break;
    case ToolID.SELL_TOOL:
      buttonPressed = !sellButtonPressed.get();

      buyButtonPressed.set(false);
      rightsButtonPressed.set(false);
      sellButtonPressed.set(buttonPressed);
      break;
  }

  // If the button is pressed, start a tool
  if(buttonPressed) {
    ui.activateTool({
      id: toolID,
      cursor: 'dig_down',
      filter: ['terrain', 'water'],
  
      onStart: () => onToolStart(toolID),
      onDown: (e: ToolEventArgs) => onToolDown(e, toolID),
      onMove: (e: ToolEventArgs) => onToolMove(e, toolID),
      onUp: (e: ToolEventArgs) => onToolUp(e, toolID),
      onFinish: () => onToolFinish(toolID)
    });
  } else {
    cancelTool();
  }
}

/**
 * Opens the primary window
 */
function openWindow() : void {
  closeWindowInstances();
  toolSize = PluginConfig.minToolSize;
  mainWindow.open();
}

/**
 * Closes all matching windows
 */
function closeWindowInstances() : void {
  const numWindows = ui.windows;
  for(let i = numWindows - 1; i > 0; --i) {
    const win = ui.getWindow(i);
    if (win.title === PluginConfig.winTitle) {
      win.close();
    }
  }
}



/**
 * **********
 * Helper Functions
 * **********
 */

/**
 * Computes number of tiles earned based on total experience
 */
function computeTilesAvailable() : number {
  return Math.floor(PlayerData.totalExp / PluginConfig.expPerTile) + PluginConfig.minTiles;
}

/**
 * Returns coordinates clamped to the map bounds
 * @param coords coordinates to clamp
 * @returns clamped coordinates
 */
function clampCoords(coords : CoordsXY) : CoordsXY {
  let clampedCoords : CoordsXY = CoordsXY(
    Math.min(MapEdges.rightBottom.x - 32, Math.max(MapEdges.leftTop.x + 32, coords.x)),
    Math.min(MapEdges.rightBottom.y - 32, Math.max(MapEdges.leftTop.y + 32, coords.y))
  );

  return clampedCoords;
}

/**
 * Shorter way to clamp both coordinates in a range
 * @param range Range to clamp
 * @returns Range with clamped corners
 */
function clampRange(range : MapRange) : MapRange {
  return MapRange(clampCoords(range.leftTop), clampCoords(range.rightBottom));
}

/**
 * Checks if coordinates are inside the playable area
 * @param coords Coordinates to check
 * @returns true if the coordinates are inside the playable area
 */
function checkCoordsXYInsideBounds(coords : CoordsXY) : boolean {
  const x : boolean = coords.x > MapEdges.leftTop.x && coords.x < MapEdges.rightBottom.x;
  const y : boolean = coords.y > MapEdges.leftTop.y && coords.y < MapEdges.rightBottom.y;

  return x && y;
}

/**
 * Checks if part of the selection is inside the playable area
 * @param range Selection range
 * @returns true if some of the selection is inside the playable area
 */
function checkSelectionInsideBounds(range : MapRange) : boolean {
  const xLow : boolean = (range.leftTop.x > MapEdges.leftTop.x || range.rightBottom.x > MapEdges.leftTop.x);
  const xHigh : boolean = (range.leftTop.x < MapEdges.rightBottom.x || range.rightBottom.x < MapEdges.rightBottom.x);
  const yLow : boolean = (range.leftTop.y > MapEdges.leftTop.y || range.rightBottom.y > MapEdges.leftTop.y);
  const yHigh : boolean = (range.leftTop.y < MapEdges.rightBottom.y || range.rightBottom.y < MapEdges.rightBottom.y);

  return xLow && xHigh && yLow && yHigh;
}



/**
 * **********
 * Data tracking
 * **********
 */

function collectData() : void {
  // TODO: Add more metrics
  // TODO: Make it save in persistent storage
  // consolelog(park.totalAdmissions);
  // if (map.numRides > 0)
  //   consolelog(map.rides[0].totalCustomers);
  // consolelog(map.rides[0].totalProfit)
  // consolelog(map.rides[0].runningCost * 16)
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
function setLandOwnership(coords : CoordsXY[], ownership : LandOwnership) : number;

/**
 * Sets tile ownership in a region
 * @overload
 * @param range Defaults and clamps to <MapEdges.leftTop.x, MapEdges.leftTop.y> -  <MapEdges.rightBottom.x, MapEdges.rightBottom.y>
 * @param ownership LandOwnership enum value
 * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
 */
function setLandOwnership(range : MapRange, ownership : LandOwnership) : number;

/**
 * Sets tile ownership in a region
 * @overload
 * @param rangeOrCoords Either map range or list of coordinates as explained in other overloads
 * @param ownership LandOwnership enum value
 * @returns number of tiles successfully set, -1 if the tiles are entirely outside of map boundaries
 */
function setLandOwnership(rangeOrCoords : MapRange | CoordsXY[], ownership : LandOwnership) : number;


function setLandOwnership(rangeOrCoords : any, ownership : any) : number {
  if (isMapRange(rangeOrCoords)) {
    const range : MapRange = rangeOrCoords as MapRange;

    if (!checkSelectionInsideBounds(range)) {
      return -1;
    }
  
    const clampedRange : MapRange = clampRange(range);
  
    // Turn on sandbox mode to make buying/selling land free and doable to any tile
    cheats.sandboxMode = true;
  
    // TODO: Turn into Promise to remove consolelog here and get results
    context.executeAction("landsetrights", {
      // <1, 1> is <32, 32>
      x1: clampedRange.leftTop.x,
      y1: clampedRange.leftTop.y,
      // Map size of 128 has 4032 (126*32) as its max coordinate
      x2: clampedRange.rightBottom.x,
      y2: clampedRange.rightBottom.y,
      setting: 4, // Set ownership
      ownership: ownership,
      flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
    }, (result : GameActionResult) => {
      // const successType = result.error !== 0 ? 'Error' : 'Success';
      // const resultData = result.error !== 0 ? result.errorMessage : LandOwnership[ownership];
      // consolelog(`${successType} setting land ownership: ${resultData}`);
    });
  
    cheats.sandboxMode = false;
  
    return (Math.abs(clampedRange.rightBottom.x - clampedRange.leftTop.x) / 32 + 1)
      * (Math.abs(clampedRange.rightBottom.y - clampedRange.leftTop.y) / 32 + 1);
  } else {
    const coords : Array<CoordsXY>= rangeOrCoords as Array<CoordsXY>;

    // Turn on sandbox mode to make buying/selling land free and doable to any tile
    cheats.sandboxMode = true;

    let numSet = 0;
    let numOutsideMapBounds = 0;
    coords.forEach((value : CoordsXY) : void => {
      if (!checkCoordsXYInsideBounds(value)) {
        ++numOutsideMapBounds;
        return;
      }

      // TODO: Turn into Promise to wait for all to finish
      context.executeAction("landsetrights", {
        x1: value.x,
        y1: value.y,
        x2: value.x,
        y2: value.y,
        setting: 4, // Set ownership
        ownership: ownership,
        flags: GameCommandFlag.GAME_COMMAND_FLAG_APPLY | GameCommandFlag.GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED
      }, (result : GameActionResult) => {
        if (result.error === 0) {
          ++numSet;
        }
      });
    });
  
    cheats.sandboxMode = false;

    return (numOutsideMapBounds > 0 && numOutsideMapBounds === coords.length) ? -1 : numSet;
  }
}

/**
 * Attempts to buy tiles in a region
 * @param range Range of tiles to buy
 * @param buyType Which type of ownership we're trying to get
 * @returns true on success
 */
function buyTiles(range : MapRange, buyType : LandOwnership) : boolean {
  // TODO: check if player can afford them
  // TODO: decrement # bought tiles

  // TODO: Count number of buyable tiles in area (check if <0, 0>)

  const numBought : number = setLandOwnership(range, buyType);

  if (numBought === 0) {
    ui.showError('Can\'t buy land...', 'Outside of map bounds!');
    return false;
  }

  return true;
}

/**
 * Checks if a tile should be buyable
 * @param tile Tile to check
 * @param buyType Whether we're attempting LandOwnership.OWNED or LandOwnership.CONSTRUCTION_RIGHTS_OWNED
 * @returns true if the tile is buyable
 */
function checkTileBuyable(tile : Tile, buyType : LandOwnership) : boolean {
  let buyable = true;

  // Iterate over elements to see land ownership and what is here
  for(let i = 0; i < tile.numElements && buyable; ++i) {
    let element = tile.getElement(i);

    switch (element.type) {
      case 'surface':
        // Land is not unowned and ownership type matches buyType
        if (element.ownership !== LandOwnership.UNOWNED && element.ownership === buyType) {
          buyable = false;
        }
        break;

      case 'entrance':
        // It's the park entrance
        if (element.object === EntranceType.ENTRANCE_TYPE_PARK_ENTRANCE) {
          buyable = false;
        }
        break;
    }
  }

  return buyable;
}

/**
 * Attempts to sell tiles in a region
 * @param range range of tiles to sell
 * @returns true on success
 */
function sellTiles(range : MapRange) : boolean {
  // TODO: increment number of available tiles

  const clampedRange = clampRange(range);


  // Check the sellability of all tiles in the range
  const coords : CoordsXY[] = [];
  for (let x = clampedRange.leftTop.x; x <= clampedRange.rightBottom.x; x += 32) {
    for (let y = clampedRange.leftTop.y; y <= clampedRange.rightBottom.y; y += 32) {
      if (checkTileSellable(map.getTile(x / 32, y / 32))) {
        coords.push(CoordsXY(x, y));
      }
    }
  }

  // If the number of tiles to add is the same as the number of tiles in the area, just do a range
  const areaSize : number = (Math.abs(clampedRange.rightBottom.x - clampedRange.leftTop.x) / 32 + 1)
    * (Math.abs(clampedRange.rightBottom.y - clampedRange.leftTop.y) / 32 + 1);

  const area = coords.length === areaSize ? clampedRange : coords;
  const numSold : number = setLandOwnership(area, LandOwnership.UNOWNED);

  if (numSold === -1) {
    ui.showError('Can\'t sell land...', 'Outside of map bounds!');
    return false;
  } else if (numSold === 0) {
    ui.showError('Can\'t sell land...', 'Land is unsellable!');
    return false;
  }

  return true;
}

/**
 * Checks if a tile should be sellable or not
 * @param tile Tile to check
 * @returns true if the tile is sellable
 */
function checkTileSellable(tile : Tile) : boolean {
  let sellable = true;

  // Iterate over elements to see land ownership and what is here
  for(let i = 0; i < tile.numElements && sellable; ++i) {
    let element = tile.getElement(i);

    switch (element.type) {
      case 'surface':
        // Land is unowned
        if (element.ownership === LandOwnership.UNOWNED) {
          sellable = false;
        }
        break;

      case 'entrance':
        // It's a ride entrance/exit
        if (element.object === EntranceType.ENTRANCE_TYPE_RIDE_ENTRANCE
          || element.object === EntranceType.ENTRANCE_TYPE_RIDE_EXIT) {
          sellable = false;
        }
        break;

      case 'track':
        // track is either a track piece or the entire ride depending on type
        sellable = false;
        break;
    }
  }

  return sellable;
}



/**
 * **********
 * Tools
 * **********
 */

/**
 * Called when user starts using a tool
 * @param toolID ID for the tool being used
 */
function onToolStart(toolID : string) : void {
  return;
}

/**
 * Called when the user holds left mouse button while using a tool
 * @param e event args
 * @param toolID ID for the tool being used
 */
function onToolDown(e : ToolEventArgs, toolID : string) : void {
  return;
}

/**
 * Called when the user moves the mouse while using a tool
 * @param e event args
 * @param toolID ID for the tool being used
 */
function onToolMove(e : ToolEventArgs, toolID : string) : void {
  if (e.mapCoords && e.mapCoords.x > 0) {
    const toolArea = getToolArea(e.mapCoords);
    ui.tileSelection.range = toolArea;

    if (e.isDown) {
      switch(toolID) {
        case ToolID.BUY_TOOL:
          buyTiles(toolArea, LandOwnership.OWNED);
          break;
        case ToolID.RIGHTS_TOOL:
          buyTiles(toolArea, LandOwnership.CONSTRUCTION_RIGHTS_OWNED);
          break;
        case ToolID.SELL_TOOL:
          sellTiles(toolArea);
          break;
      }
    }
  } else {
    ui.tileSelection.range = null;
  }

  // TODO: if button held down, paint tile ownership
}

/**
 * Called when the user stops holding left mouse button while using a tool
 * @param e event args
 * @param toolID ID for the tool being used
 */
function onToolUp(e : ToolEventArgs, toolID : string) : void {
  ui.tileSelection.range = null;
}

/**
 * Called when the user stops using a tool
 * @param toolID ID for the tool being used
 */
function onToolFinish(toolID : string) : void {
  ui.tileSelection.range = null;
}

/**
 * Cancels a tool being used
 */
function cancelTool() : void {
  ui.tool?.cancel();
}

/**
 * Calculates the area around the tool that is affected by the tool
 * @param center Center point for the tool's usage
 * @returns MapRange for the affected area
 */
function getToolArea(center : CoordsXY) : MapRange {
  const left   = Math.floor((center.x / 32) - ((toolSize - 1) / 2)) * 32;
  const top    = Math.floor((center.y / 32) - ((toolSize - 1) / 2)) * 32;
  const right  = Math.floor((center.x / 32) + ((toolSize - 1) / 2)) * 32;
  const bottom = Math.floor((center.y / 32) + ((toolSize - 1) / 2)) * 32;

  return MapRange(CoordsXY(left, top), CoordsXY(right, bottom));
}

/**
 * Entry point
 */
function main() : void {
  console.log('Initializing Tileman Plugin...');

  // Make sure it's a client
  if (typeof ui !== 'undefined') {
    // Register option in menu under Map icon in toolbar
    ui.registerMenuItem('Tileman', function() { openWindow(); });

    openWindow();

    // Setup map and data for game mode
    park.landPrice = 0;
    setLandOwnership(MapEdges, LandOwnership.UNOWNED);

    // Days are about 13.2 seconds at 1x speed
    context.subscribe('interval.day', collectData);
  }
}

/**
 * Registers plugin info
 */
registerPlugin({
  name: 'Tileman',
  version: '0.0.1',
  authors: ['Isoitiro'],
  type: 'remote',
  licence: 'GNU GPLv3',
  targetApiVersion: 70,
  minApiVersion: 68,
  main: main
});

// TODO: cheats for testing
context.subscribe('interval.day', function() {
  park.cash += 1000000;
});













/*
  getParkStorage
  park.parkSize = count how many tiles are owned
  


  subscribe(hook: "action.query", callback: (e: GameActionEventArgs) => void): IDisposable;
  subscribe(hook: "action.execute", callback: (e: GameActionEventArgs) => void): IDisposable;
  subscribe(hook: "action.location", callback: (e: ActionLocationArgs) => void): IDisposable;

  subscribe(hook: "interval.tick", callback: () => void): IDisposable;
  subscribe(hook: "interval.day", callback: () => void): IDisposable;

  subscribe(hook: "network.authenticate", callback: (e: NetworkAuthenticateEventArgs) => void): IDisposable;
  subscribe(hook: "network.join", callback: (e: NetworkEventArgs) => void): IDisposable;
  subscribe(hook: "network.leave", callback: (e: NetworkEventArgs) => void): IDisposable;

  subscribe(hook: "map.save", callback: () => void): IDisposable;
  subscribe(hook: "map.change", callback: () => void): IDisposable;
  


  interface ShortcutDesc {
    **
    * The unique identifier for the shortcut.
    * If the identifier already exists, the shortcut will not be registered.
    * Use full stops to group shortcuts together, e.g. `yourplugin.somewindow.apply`.
    *
    id: string;

    **
    * The display text for the shortcut.
    *
    text: string;

    **
    * Default bindings for the shortcut.
    * E.g. `["CTRL+SHIFT+L", "MOUSE 3"]`
    *
    bindings?: string[];

    **
    * Function to call when the shortcut is invoked.
    *
    callback: () => void;
  }



  ui.registerShortcut(desc: ShortcutDesc): void;
  


  Search github for these: Ride, ShopOrStall, KioskOrFacility

  Ride.rideType
  Ride.type = ' = "ride" | "stall" | "facility"

  enum ridetype
  RIDE_TYPE_SPIRAL_ROLLER_COASTER = 0,
  RIDE_TYPE_STAND_UP_ROLLER_COASTER,
  RIDE_TYPE_SUSPENDED_SWINGING_COASTER,
  RIDE_TYPE_INVERTED_ROLLER_COASTER,
  RIDE_TYPE_JUNIOR_ROLLER_COASTER,
  RIDE_TYPE_MINIATURE_RAILWAY,
  RIDE_TYPE_MONORAIL,
  RIDE_TYPE_MINI_SUSPENDED_COASTER,
  RIDE_TYPE_BOAT_HIRE,
  RIDE_TYPE_WOODEN_WILD_MOUSE,
  RIDE_TYPE_STEEPLECHASE = 10,
  RIDE_TYPE_CAR_RIDE,
  RIDE_TYPE_LAUNCHED_FREEFALL,
  RIDE_TYPE_BOBSLEIGH_COASTER,
  RIDE_TYPE_OBSERVATION_TOWER,
  RIDE_TYPE_LOOPING_ROLLER_COASTER,
  RIDE_TYPE_DINGHY_SLIDE,
  RIDE_TYPE_MINE_TRAIN_COASTER,
  RIDE_TYPE_CHAIRLIFT,
  RIDE_TYPE_CORKSCREW_ROLLER_COASTER,
  RIDE_TYPE_MAZE = 20,
  RIDE_TYPE_SPIRAL_SLIDE,
  RIDE_TYPE_GO_KARTS,
  RIDE_TYPE_LOG_FLUME,
  RIDE_TYPE_RIVER_RAPIDS,
  RIDE_TYPE_DODGEMS,
  RIDE_TYPE_SWINGING_SHIP,
  RIDE_TYPE_SWINGING_INVERTER_SHIP,
  RIDE_TYPE_FOOD_STALL,
  RIDE_TYPE_1D,
  RIDE_TYPE_DRINK_STALL = 30,
  RIDE_TYPE_1F,
  RIDE_TYPE_SHOP,
  RIDE_TYPE_MERRY_GO_ROUND,
  RIDE_TYPE_22,
  RIDE_TYPE_INFORMATION_KIOSK,
  RIDE_TYPE_TOILETS,
  RIDE_TYPE_FERRIS_WHEEL,
  RIDE_TYPE_MOTION_SIMULATOR,
  RIDE_TYPE_3D_CINEMA,
  RIDE_TYPE_TOP_SPIN = 40,
  RIDE_TYPE_SPACE_RINGS,
  RIDE_TYPE_REVERSE_FREEFALL_COASTER,
  RIDE_TYPE_LIFT,
  RIDE_TYPE_VERTICAL_DROP_ROLLER_COASTER,
  RIDE_TYPE_CASH_MACHINE,
  RIDE_TYPE_TWIST,
  RIDE_TYPE_HAUNTED_HOUSE,
  RIDE_TYPE_FIRST_AID,
  RIDE_TYPE_CIRCUS,
  RIDE_TYPE_GHOST_TRAIN = 50,
  RIDE_TYPE_TWISTER_ROLLER_COASTER,
  RIDE_TYPE_WOODEN_ROLLER_COASTER,
  RIDE_TYPE_SIDE_FRICTION_ROLLER_COASTER,
  RIDE_TYPE_STEEL_WILD_MOUSE,
  RIDE_TYPE_MULTI_DIMENSION_ROLLER_COASTER,
  RIDE_TYPE_MULTI_DIMENSION_ROLLER_COASTER_ALT,
  RIDE_TYPE_FLYING_ROLLER_COASTER,
  RIDE_TYPE_FLYING_ROLLER_COASTER_ALT,
  RIDE_TYPE_VIRGINIA_REEL,
  RIDE_TYPE_SPLASH_BOATS = 60,
  RIDE_TYPE_MINI_HELICOPTERS,
  RIDE_TYPE_LAY_DOWN_ROLLER_COASTER,
  RIDE_TYPE_SUSPENDED_MONORAIL,
  RIDE_TYPE_LAY_DOWN_ROLLER_COASTER_ALT,
  RIDE_TYPE_REVERSER_ROLLER_COASTER,
  RIDE_TYPE_HEARTLINE_TWISTER_COASTER,
  RIDE_TYPE_MINI_GOLF,
  RIDE_TYPE_GIGA_COASTER,
  RIDE_TYPE_ROTO_DROP,
  RIDE_TYPE_FLYING_SAUCERS = 70,
  RIDE_TYPE_CROOKED_HOUSE,
  RIDE_TYPE_MONORAIL_CYCLES,
  RIDE_TYPE_COMPACT_INVERTED_COASTER,
  RIDE_TYPE_WATER_COASTER,
  RIDE_TYPE_AIR_POWERED_VERTICAL_COASTER,
  RIDE_TYPE_INVERTED_HAIRPIN_COASTER,
  RIDE_TYPE_MAGIC_CARPET,
  RIDE_TYPE_SUBMARINE_RIDE,
  RIDE_TYPE_RIVER_RAFTS,
  RIDE_TYPE_50 = 80,
  RIDE_TYPE_ENTERPRISE,
  RIDE_TYPE_52,
  RIDE_TYPE_53,
  RIDE_TYPE_54,
  RIDE_TYPE_55,
  RIDE_TYPE_INVERTED_IMPULSE_COASTER,
  RIDE_TYPE_MINI_ROLLER_COASTER,
  RIDE_TYPE_MINE_RIDE,
  RIDE_TYPE_59,
  RIDE_TYPE_LIM_LAUNCHED_ROLLER_COASTER = 90,
  RIDE_TYPE_HYPERCOASTER,
  RIDE_TYPE_HYPER_TWISTER,
  RIDE_TYPE_MONSTER_TRUCKS,
  RIDE_TYPE_SPINNING_WILD_MOUSE,
  RIDE_TYPE_CLASSIC_MINI_ROLLER_COASTER,
  RIDE_TYPE_HYBRID_COASTER,
  RIDE_TYPE_SINGLE_RAIL_ROLLER_COASTER,
  RIDE_TYPE_ALPINE_COASTER,
  RIDE_TYPE_CLASSIC_WOODEN_ROLLER_COASTER,
  RIDE_TYPE_CLASSIC_STAND_UP_ROLLER_COASTER,

  RIDE_TYPE_COUNT
*/


/**
 * Registers a new item in the toolbox menu on the title screen.
 * Only available to intransient plugins.
 * @param text the menu item text.
 * @param callback the function to call when the menu item is clicked.
 */
// ui.registerToolboxMenuItem(text: string, callback: () => void): void;

/*
  Give EXP based on:
    - Guest riding
    - Guest buying
    - Popping balloons
*/