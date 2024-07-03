/// <reference path='../../../lib/openrct2.d.ts' />

export enum WindowID {
  STARTUP = 'startup',
  TOOLBAR = 'toolbar',
  CONFIG = 'config',
  STATS = 'stats',
};

export enum ElementID {
  NONE,
  
  // ToolbarWindow
    // Buttons
    BUY_TOOL,
    RIGHTS_TOOL,
    SELL_TOOL,
    VIEW_RIGHTS_BUTTON,
    TOOL_SIZE_SPINNER,

    // Info Elements
    AVAILABLE_TILES,
    UNLOCKED_TILES,
    EXP_TO_NEXT_TILE,
    EXP_NEXT_PROGRESSBAR,

  // ConfigWindow
    // Config Tab
      // Player actions
      EXP_PER_BALLOON_POPPED,
      EXP_PER_BANNER_PLACED,
      EXP_PER_MARKETING_CAMPAIGN_SPENT,

      // Guest actions
      EXP_PER_PARK_ADMISSION,
      EXP_PER_RIDE_ADMISSION,
      EXP_PER_STALL_ADMISSION,
      EXP_PER_FACILITY_ADMISSION,
      
      // Staff actions
        // Handyman
        EXP_PER_LAWN_MOWED,
        EXP_PER_GARDEN_WATERED,
        EXP_PER_TRASH_SWEPT,
        EXP_PER_TRASH_CAN_EMPTIED,
        
        // Mechanic
        EXP_PER_RIDE_INSPECTED,
        EXP_PER_RIDE_FIXED,
        
        // Security
        EXP_PER_VANDAL_STOPPED,
      
      // Park data
        // Awards
        EXP_PER_PARK_AWARD_POSITIVE,
        EXP_PER_PARK_AWARD_NEGATIVE,

        // Disasters
        EXP_PER_VEHICLE_CRASH,
        EXP_PER_VEHICLE_CRASH_GUESTS_KILLED,
        EXP_PER_GUEST_DROWNED,
        EXP_PER_STAFF_DROWNED,

        // Other

      // Other
      EXP_PER_TILE,
      MIN_TILES,
      TICKS_PER_UPDATE,

      // Checkboxes
      KEEP_TOOLBAR_OPEN,
      BYPASS_PATH_RESTRICTIONS,

      // Buttons
      CONFIG_REVERT,
      CONFIG_DEFAULTS,
      CONFIG_SAVE,

    // Debug Tab
      FIRE_STAFF_BUTTON,
      DELETE_GUESTS_BUTTON,
      DELETE_RIDES_BUTTON,
      CLEAR_PATHS_BUTTON,
};

// From openrct2/sprites.h
export enum Sprites {
  RENAME = 5168,
  BUY_LAND_RIGHTS = 5176,
  BUY_CONSTRUCTION_RIGHTS = 5177,
  FLOPPY = 5183,
  FINANCE = 5190,
  SEARCH = 29401,
  GRAPH = 29394,
};

// From openrct2/sprites.h
export const AnimatedSprites = {
  GEARS: {
    frameBase: 5201,
    frameCount: 4,
    frameDuration: 4,
  },
  WRENCH: {
    frameBase: 5205,
    frameCount: 16,
    frameDuration: 4,
  },
  RESEARCH: {
    frameBase: 5327,
    frameCount: 8,
    frameDuration: 2,
  }
};