//   /// <reference path="../lib/openrct2.d.ts" />
import * as FlexUI from 'openrct2-flexui';



/*
  Variables
*/

// Data logging
const PlayerData = {
  totalExp: 69420,
  tilesUsed: 0,

  // Maps ride IDs (numbers) and historical data (Ride.totalCustomers, eventually Ride.totalProfit or something )
  // TODO: Make this keep track of ride stats every interval to account for deleted rides
  rideMap: {
    /*
      123: {
        rideType: "ride" | "stall" | "facility"
        totalCustomers: 69
      }
    */
  }
};

// Configs
const PluginConfig = {
  // Never changed
  winTitle: 'Tileman',
  buyToolID: 'TilemanBuyTool',
  sellToolID: 'TilemanSellTool',

  // User definable
  // TODO: Allow users to customize in the UI
  expPerTile: 1000,
  minTiles: 2 // 1 path + 1 stall
}

// Functional
var toolStartCoords : CoordsXY = { x: 0, y: 0 };

// Prevent buying outer range of the map so we don't mess up guests spawning
enum MapBounds {
  minX = 2 * 32,
  minY = 2 * 32,
  maxX = (map.size.x - 3) * 32,
  maxY = (map.size.y - 3) * 32,
};


/*
  UI construction
*/

/*
  Sprite list: openrct2/sprites.h

  Text colors
    black
    grey
    white
    red
    green
    yellow
    topaz
    celadon
    babyblue
    palelavender
    palegold
    lightpink
    pearlaqua
    palesilver
*/

const statsBox = FlexUI.box({
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

const buttonBox = FlexUI.horizontal({
  spacing: 0,
  content: [
    FlexUI.button({
      image: 5176,
      width: '25px',
      height: '25px',
      onClick: () => {
        ui.activateTool({
          id: PluginConfig.buyToolID,
          cursor: 'cross_hair',
          filter: ['terrain', 'water'],

          onStart: () => onToolStart(PluginConfig.buyToolID),
          onDown: (e: ToolEventArgs) => onToolDown(e, PluginConfig.buyToolID),
          onMove: (e: ToolEventArgs) => onToolMove(e, PluginConfig.buyToolID),
          onUp: (e: ToolEventArgs) => onToolUp(e, PluginConfig.buyToolID),
          onFinish: () => onToolFinish(PluginConfig.buyToolID)
        });
      }
    }),
    FlexUI.label({
      text: '{BLACK}Buy tiles',
      width: '75px',
      height: '25px',
      padding: {
        top: '7px',
        bottom: '7px'
      }
    }),
    FlexUI.button({
      image: 5177,
      width: '25px',
      height: '25px',
      onClick: () => {
        ui.activateTool({
          id: PluginConfig.sellToolID,
          cursor: 'cross_hair',
          filter: ['terrain', 'water'],

          onStart: () => onToolStart(PluginConfig.sellToolID),
          onDown: (e: ToolEventArgs) => onToolDown(e, PluginConfig.sellToolID),
          onMove: (e: ToolEventArgs) => onToolMove(e, PluginConfig.sellToolID),
          onUp: (e: ToolEventArgs) => onToolUp(e, PluginConfig.sellToolID),
          onFinish: () => onToolFinish(PluginConfig.sellToolID)
        });
      }
    }),
    FlexUI.label({
      text: '{BLACK}Sell tiles',
      width: '75px',
      height: '25px',
      padding: {
        top: '7px',
        bottom: '7px'
      }
    })
  ]
});

const mainWindow = FlexUI.window({
  title: PluginConfig.winTitle,
	width: 275,
	height: 200,
  content: [
    FlexUI.vertical({
      spacing: 5,
      content: [
        statsBox,
        buttonBox
      ]
  })],
  onClose: cancelTool,
  onUpdate: () => 0
});

function openWindow() : void {
  closeWindow();
  mainWindow.open();
}

// Assumes only one instance of window open
function closeWindow() :void {
  let numWindows = ui.windows;
  for(let i = 0; i < numWindows; ++i) {
    let winTest = ui.getWindow(i);
    if (winTest.title == PluginConfig.winTitle) {
      winTest.close();
      return
    }
  }
}



/*
  Helper Functions
*/

// Computes number of tiles earned based on total experience
function computeTilesAvailable() : number {
  return Math.floor(PlayerData.totalExp / PluginConfig.expPerTile) + PluginConfig.minTiles;
}

/*
  returns coords clamped to the map bounds
*/

function clampCoords(coords : CoordsXY) : CoordsXY {
  let clampedCoords : CoordsXY = { x: 0, y: 0 }

  clampedCoords.x = Math.max(MapBounds.minX, coords.x);
  clampedCoords.x = Math.min(MapBounds.maxX, clampedCoords.x);

  clampedCoords.y = Math.max(MapBounds.minY, coords.y);
  clampedCoords.y = Math.min(MapBounds.maxY, clampedCoords.y);

  return clampedCoords;
}



/*
  Data tracking
*/

function collectData() : void {
  // TODO: Add more metrics
  // TODO: Make it save in persistent storage
  // console.log(park.totalAdmissions);
  // if (map.numRides > 0)
  //   console.log(map.rides[0].totalCustomers);
  // console.log(map.rides[0].totalProfit)
  // console.log(map.rides[0].runningCost * 16)
}



/*
  Land Management
*/

/*
  Sets tile ownership
  corner1 defaults and clamps to <1, 1>
  corner2 defaults and clamps to <xmax, ymax>
  
  ownership: openrct2/world/Surface.h
    OWNERSHIP_UNOWNED = 0,
    OWNERSHIP_CONSTRUCTION_RIGHTS_OWNED = (1 << 4),
    OWNERSHIP_OWNED = (1 << 5),
    OWNERSHIP_CONSTRUCTION_RIGHTS_AVAILABLE = (1 << 6),
    OWNERSHIP_AVAILABLE = (1 << 7)
  
  flags: openrct2/Game.h
    GAME_COMMAND_FLAG_APPLY = (1 << 0),  // If this flag is set, the command is applied, otherwise only the cost is retrieved
    GAME_COMMAND_FLAG_REPLAY = (1 << 1), // Command was issued from replay manager.
    GAME_COMMAND_FLAG_2 = (1 << 2),      // Unused
    GAME_COMMAND_FLAG_ALLOW_DURING_PAUSED = (1 << 3), // Allow while paused
    GAME_COMMAND_FLAG_4 = (1 << 4),                   // Unused
    GAME_COMMAND_FLAG_NO_SPEND = (1 << 5),            // Game command is not networked
    GAME_COMMAND_FLAG_GHOST = (1 << 6),               // Game command is not networked
    GAME_COMMAND_FLAG_TRACK_DESIGN = (1 << 7),
    GAME_COMMAND_FLAG_NETWORKED = (1u << 31) // Game command is coming from network
*/
function setLandOwnership(owned: boolean, corner1: CoordsXY, corner2: CoordsXY) : boolean {
  // Check if a selection is entirely out of bounds (straight line on map edge)
  if ((corner1.x < MapBounds.minX && corner2.x < MapBounds.minX)
    || (corner1.x > MapBounds.maxX && corner2.x > MapBounds.maxX)
    || (corner1.y < MapBounds.minY && corner2.y < MapBounds.minY)
    || (corner1.y > MapBounds.maxY && corner2.y > MapBounds.maxY)) {
      return false;
    }
  
  corner1 = clampCoords(corner1);
  corner2 = clampCoords(corner2);

  // Turn on sandbox mode to make buying/selling land free and doable to any tile
  cheats.sandboxMode = true;

  context.executeAction("landsetrights", {
    // <0,0> is <32,32>
    x1: corner1.x,
    y1: corner1.y,
    // Map size of 128 has 4032 (126*32) as its max coordinate
    x2: corner2.x,
    y2: corner2.y,
    setting: 4,
    ownership: owned ? (1 << 5) : 0,
    flags: (1 << 0) | (1 << 3)
  }, (result: GameActionResult) => {
    if (result.error !== 0) {
      console.log(`Error setting land ownership: ${result.errorMessage}`);
    } else {
      console.log(`Success setting land ownership: ${owned ? 'owned' : 'unowned'}`);
    }
  });

  cheats.sandboxMode = false;

  return true;
}

// Returns true if player can afford it
function buyTiles(corner1: CoordsXY, corner2: CoordsXY) : boolean {
  // TODO: check if player can afford them
  // TODO: decrement # bought tiles

  let buySuccess : boolean = setLandOwnership(true, corner1, corner2);

  if (!buySuccess) {
    ui.showError('Can\'t buy land...', 'Outside of map!');
    return false;
  }

  return true;
}

// Returns true if any tiles were sold
function sellTiles(corner1: CoordsXY, corner2: CoordsXY) : boolean {
  // TODO: iterate over selection and only sell owned tiles (with nothing built on them?)
  // TODO: increment number of sold tiles

  let sellSuccess : boolean = setLandOwnership(false, corner1, corner2);

  if (!sellSuccess) {
    ui.showError('Can\'t sell land...', 'Outside of map!');
    return false;
  }

  return true;
}



/*
  Tools
*/

/*
  interface ToolEventArgs {
    readonly isDown: boolean;
    readonly screenCoords: ScreenCoordsXY;
    readonly mapCoords?: CoordsXYZ;
    readonly tileElementIndex?: number;
    readonly entityId?: number;
  }
*/

function onToolStart(toolID: string) : void {
  // TODO: Implement?
  console.log(`${toolID} start`);
}

function onToolDown(e: ToolEventArgs, toolID: string) : void {
  const mapCoords : CoordsXY = { x: e?.mapCoords?.x ?? 0, y: e?.mapCoords?.y ?? 0 };

  if (mapCoords.x > 0) {
    toolStartCoords = mapCoords;
  } else {
    switch(toolID) {
      case PluginConfig.buyToolID:
        ui.showError('Can\'t buy land...', 'Outside of map!');
        break;
      case PluginConfig.sellToolID:
        ui.showError('Can\'t sell land...', 'Outside of map!');
        break;
    }
  }
}

function onToolMove(e: ToolEventArgs, toolID: string) : void {
  // TODO: Implement
  // console.log(`${toolID} move`);
  // console.log(e);
}

function onToolUp(e: ToolEventArgs, toolID: string) : void {
  if (toolStartCoords.x > 0) {
    const mapCoords : CoordsXY = { x: e?.mapCoords?.x ?? 0, y: e?.mapCoords?.y ?? 0 };

    if (mapCoords.x > 0) {
      switch(toolID) {
        case PluginConfig.buyToolID:
          buyTiles(toolStartCoords, mapCoords);
          break;
        case PluginConfig.sellToolID:
          sellTiles(toolStartCoords, mapCoords);
          break;
      }
    } else {
      switch(toolID) {
        case PluginConfig.buyToolID:
          ui.showError('Can\'t buy land...', 'Outside of map!');
          break;
        case PluginConfig.sellToolID:
          ui.showError('Can\'t sell land...', 'Outside of map!');
          break;
      }
    }
  }
  
  toolStartCoords = { x: 0, y: 0 };
}

function onToolFinish(toolID: string) : void {
  // TODO: Implement?
  console.log(`${toolID} finish`);
}

function cancelTool() : void {
  ui.tool?.cancel();
}













function main() {
  console.log('Initializing Tileman Plugin...');

  // Make sure it's a client
  if (typeof ui !== 'undefined') {
    // Register option in menu under Map icon in toolbar
    ui.registerMenuItem('Tileman', function() { openWindow(); });

    openWindow();

    // Setup map and data for game mode
    park.landPrice = 0;
    setLandOwnership(false, { x: MapBounds.minX, y: MapBounds.minY }, { x: MapBounds.maxX, y: MapBounds.maxY });

    // Days are about 13.2 seconds at 1x speed
    context.subscribe('interval.day', collectData);
  }
}

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




  interface Tool {
    id: string;
    cursor: CursorType;
    cancel: () => void;
  }




  subscribe(hook: "action.query", callback: (e: GameActionEventArgs) => void): IDisposable;
  subscribe(hook: "action.execute", callback: (e: GameActionEventArgs) => void): IDisposable;
  subscribe(hook: "interval.tick", callback: () => void): IDisposable;
  subscribe(hook: "interval.day", callback: () => void): IDisposable;
  subscribe(hook: "network.authenticate", callback: (e: NetworkAuthenticateEventArgs) => void): IDisposable;
  subscribe(hook: "network.join", callback: (e: NetworkEventArgs) => void): IDisposable;
  subscribe(hook: "network.leave", callback: (e: NetworkEventArgs) => void): IDisposable;
  subscribe(hook: "action.location", callback: (e: ActionLocationArgs) => void): IDisposable;
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
 * @param text The menu item text.
 * @param callback The function to call when the menu item is clicked.
 */
// ui.registerToolboxMenuItem(text: string, callback: () => void): void;

/*
  Give EXP based on:
    - Guest riding
    - Guest buying
    - Popping balloons
*/