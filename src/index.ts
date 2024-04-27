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

  // User definable
  // TODO: Allow users to customize in the UI
  expPerTile: 1000,
  minTiles: 2 // 1 path + 1 stall
}



/*
  UI construction
*/

// Sprite list: openrct2/sprites.h

const statsBox = FlexUI.box({
  content: FlexUI.vertical({
    spacing: 5,
    content: [
      FlexUI.horizontal({
        spacing: 20,
        content: [
          FlexUI.label({
            text: "{BLACK}Total Exp:"
          }),
          FlexUI.label({
            text: `{BABYBLUE}${context.formatString('{COMMA16}', PlayerData.totalExp)}`,
          })
        ]
      }),
      FlexUI.horizontal({
        spacing: 20,
        content: [
          FlexUI.label({
            text: "{BLACK}Tiles Unlocked/Used/Available: "
          }),
          FlexUI.label({
            text: `{BABYBLUE}${context.formatString('{COMMA16}', computeTilesAvailable())}` +
              `{BLACK}/{RED}${context.formatString('{COMMA16}', PlayerData.tilesUsed)}` +
              `{BLACK}/{GREEN}${context.formatString('{COMMA16}', computeTilesAvailable() - PlayerData.tilesUsed)}`,
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
        console.log('clicked buy tiles')
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
        console.log('clicked sell tiles')
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
	width: 400,
	height: 200,
  content: [
    FlexUI.vertical({
      spacing: 5,
      content: [
        statsBox,
        buttonBox
      ]
  })] // window - main container
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
  Sets tiles to unowned
  corner1 defaults to <0, 0>
  corner2 defaults to <xmax - 1, ymax - 1>
  
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
function setLandOwnership(owned: boolean, corner1?: CoordsXY, corner2?: CoordsXY) : void {
  cheats.sandboxMode = true;
  context.executeAction("landsetrights", {
    x1: (corner1?.x ?? 0) * 32,
    y1: (corner1?.y ?? 0) * 32,
    x2: (corner2?.x ?? (map.size.x - 1)) * 32,
    y2: (corner2?.y ?? (map.size.y - 1)) * 32,
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
}

// Returns true if player can afford it
function buyTiles(corner1: CoordsXY, corner2: CoordsXY) : boolean {
  // TODO: check if player can afford them
  // TODO: decrement # bought tiles
  return false;
}

// Returns true if any tiles were sold
function sellTiles(corner1: CoordsXY, corner2: CoordsXY) : boolean {
  // TODO: iterate over selection and only sell owned tiles (with nothing built on them?)
  // TODO: increment number of sold tiles
  return false;
}

/**
 * Begins a new tool session. The cursor will change to the style specified by the
 * given tool descriptor and cursor events will be provided.
 * @param tool The properties and event handlers for the tool.
 */
// ui.activateTool(tool: ToolDesc): void;

/**
 * Registers a new item in the toolbox menu on the title screen.
 * Only available to intransient plugins.
 * @param text The menu item text.
 * @param callback The function to call when the menu item is clicked.
 */
// ui.registerToolboxMenuItem(text: string, callback: () => void): void;


// interface Tool {
//   id: string;
//   cursor: CursorType;

//   cancel: () => void;
// }

// interface ToolEventArgs {
//   readonly isDown: boolean;
//   readonly screenCoords: ScreenCoordsXY;
//   readonly mapCoords?: CoordsXYZ;
//   readonly tileElementIndex?: number;
//   readonly entityId?: number;
// }

// // Describes the properties and event handlers for a custom tool.
// interface ToolDesc {
//   id: string;
//   cursor?: CursorType;


  
//   // What types of object in the game can be selected with the tool.
//   // E.g. only specify terrain if you only want a tile selection.
//   filter?: ToolFilter[];

//   onStart?: () => void;
//   onDown?: (e: ToolEventArgs) => void;
//   onMove?: (e: ToolEventArgs) => void;
//   onUp?: (e: ToolEventArgs) => void;
//   onFinish?: () => void;
// }

// type CursorType =
//   "arrow" |
//   "bench_down" |
//   "bin_down" |
//   "blank" |
//   "cross_hair" |
//   "diagonal_arrows" |
//   "dig_down" |
//   "entrance_down" |
//   "fence_down" |
//   "flower_down" |
//   "fountain_down" |
//   "hand_closed" |
//   "hand_open" |
//   "hand_point" |
//   "house_down" |
//   "lamppost_down" |
//   "paint_down" |
//   "path_down" |
//   "picker" |
//   "statue_down" |
//   "tree_down" |
//   "up_arrow" |
//   "up_down_arrow" |
//   "volcano_down" |
//   "walk_down" |
//   "water_down" |
//   "zzz";

// type ToolFilter =
//   "terrain" |
//   "entity" |
//   "ride" |
//   "water" |
//   "scenery" |
//   "footpath" |
//   "footpath_item" |
//   "park_entrance" |
//   "wall" |
//   "large_scenery" |
//   "label" |
//   "banner";

// interface ShortcutDesc {
//   /**
//    * The unique identifier for the shortcut.
//    * If the identifier already exists, the shortcut will not be registered.
//    * Use full stops to group shortcuts together, e.g. `yourplugin.somewindow.apply`.
//    */
//   id: string;

//   /**
//    * The display text for the shortcut.
//    */
//   text: string;

//   /**
//    * Default bindings for the shortcut.
//    * E.g. `["CTRL+SHIFT+L", "MOUSE 3"]`
//    */
//   bindings?: string[];

//   /**
//    * Function to call when the shortcut is invoked.
//    */
//   callback: () => void;
// }

// ui.registerShortcut(desc: ShortcutDesc): void;








function main() {
  console.log('Initializing Tileman Plugin...');

  // Make sure it's a client
  if (typeof ui !== 'undefined') {
    // Register option in menu under Map icon in toolbar
    ui.registerMenuItem('Tileman', function() { openWindow(); });

    openWindow();

    // Setup map and data for game mode
    park.landPrice = 0;
    setLandOwnership(false);

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
  
  

  activateTool
  getParkStorage







  subscribe(hook: "action.query", callback: (e: GameActionEventArgs) => void): IDisposable;
  subscribe(hook: "action.execute", callback: (e: GameActionEventArgs) => void): IDisposable;
  subscribe(hook: "interval.tick", callback: () => void): IDisposable;
  subscribe(hook: "interval.day", callback: () => void): IDisposable;
  subscribe(hook: "network.chat", callback: (e: NetworkChatEventArgs) => void): IDisposable;
  subscribe(hook: "network.authenticate", callback: (e: NetworkAuthenticateEventArgs) => void): IDisposable;
  subscribe(hook: "network.join", callback: (e: NetworkEventArgs) => void): IDisposable;
  subscribe(hook: "network.leave", callback: (e: NetworkEventArgs) => void): IDisposable;
  subscribe(hook: "ride.ratings.calculate", callback: (e: RideRatingsCalculateArgs) => void): IDisposable;
  subscribe(hook: "action.location", callback: (e: ActionLocationArgs) => void): IDisposable;
  subscribe(hook: "guest.generation", callback: (e: GuestGenerationArgs) => void): IDisposable;
  subscribe(hook: "vehicle.crash", callback: (e: VehicleCrashArgs) => void): IDisposable;
  subscribe(hook: "map.save", callback: () => void): IDisposable;
  subscribe(hook: "map.change", callback: () => void): IDisposable;




  enum textcolors
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


  Icons/Images
  arrow_down
  arrow_up
  chat
  cheats
  copy
  empty
  eyedropper
  fast_forward
  game_speed_indicator
  game_speed_indicator_double
  glassy_recolourable
  hide_full
  hide_partial
  hide_scenery
  hide_supports
  hide_vegetation
  hide_vehicles
  large_scenery
  legacy_paths
  link_chain
  logo
  logo_text
  map_east
  map_east_pressed
  map_gen_land
  map_gen_noise
  map_gen_trees
  map_north
  map_north_pressed
  map_south
  map_south_pressed
  map_west
  map_west_pressed
  mountain_tool_even
  mountain_tool_odd
  multiplayer
  multiplayer_desync
  multiplayer_sync
  multiplayer_toolbar
  multiplayer_toolbar_pressed
  mute
  mute_pressed
  news_messages
  normal_selection_6x6
  paste
  path_railings
  path_surfaces
  paths
  placeholder
  rct1_close_off
  rct1_close_off_pressed
  rct1_close_on
  rct1_close_on_pressed
  rct1_open_off
  rct1_open_off_pressed
  rct1_open_on
  rct1_open_on_pressed
  rct1_simulate_off
  rct1_simulate_off_pressed
  rct1_simulate_on
  rct1_simulate_on_pressed
  rct1_test_off
  rct1_test_off_pressed
  rct1_test_on
  rct1_test_on_pressed
  reload
  ride_stations
  scenery_scatter_high
  scenery_scatter_low
  scenery_scatter_medium
  search
  selection_edge_ne
  selection_edge_nw
  selection_edge_se
  selection_edge_sw
  server_password
  sideways_tab
  sideways_tab_active
  simulate
  small_scenery
  sort
  terrain_edges
  title_play
  title_restart
  title_skip
  title_stop
  unmute
  unmute_pressed
  view
  zoom_in
  zoom_in_background
  zoom_out
  zoom_out_background



  TODO: Make an enum of which types are rides vs stalls vs facilities for different scoring

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








/*
  Give EXP based on:
    - Guest riding
    - Guest buying
    - Popping balloons
*/