/// <reference path='../../../lib/openrct2.d.ts' />

export enum WindowID {
  TOOLBAR,
  CONFIG,
  STATS,
};

export enum ElementID {
  NONE,
  
  // ToolbarWindow
    // Buttons
    BUY_TOOL,
    RIGHTS_TOOL,
    SELL_TOOL,
    VIEW_RIGHTS_BUTTON,
    OPEN_CONFIG_BUTTON,
    OPEN_STATS_BUTTON,
    TOOL_SIZE_SPINNER,

    // Info Elements
    AVAILABLE_TILES,
    UNLOCKED_TILES,
    EXP_TO_NEXT_TILE,
    EXP_NEXT_PROGRESSBAR,

  // ConfigWindow
    // Config Tab
    TICKS_PER_UPDATE,
    EXP_PER_TILE,
    MIN_TILES,
    EXP_PER_PARK_ADMISSION,
    EXP_PER_RIDE_ADMISSION,
    EXP_PER_STALL_ADMISSION,
    EXP_PER_FACILITY_ADMISSION,

    CONFIG_REVERT,
    CONFIG_DEFAULTS,
    CONFIG_SAVE,

    // Debug Tab
    FIRE_STAFF_BUTTON,
    DELETE_GUESTS_BUTTON,
    DELETE_RIDES_BUTTON,
    CLEAR_PARK_BUTTON,
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