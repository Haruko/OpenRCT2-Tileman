/// <reference path='../../../lib/openrct2.d.ts' />



/**
 * **********
 * General
 * **********
 */

/**
 * IDs for the data stores
 */

export enum DataStoreID {
  PLUGIN = 'plugin',
  METRICS = 'metrics'
};

/**
 * From openrct2/Game.h
 */
export enum GameCommand {
    SetRideAppearance,
    SetLandHeight,
    TogglePause,
    PlaceTrack,
    RemoveTrack,
    LoadOrQuit,
    CreateRide,
    DemolishRide,
    SetRideStatus,
    SetRideVehicles,
    SetRideName,
    SetRideSetting,
    PlaceRideEntranceOrExit,
    RemoveRideEntranceOrExit,
    RemoveScenery,
    PlaceScenery,
    SetWaterHeight,
    PlacePath,
    PlacePathLayout,
    RemovePath,
    ChangeSurfaceStyle,
    SetRidePrice,
    SetGuestName,
    SetStaffName,
    RaiseLand,
    LowerLand,
    EditLandSmooth,
    RaiseWater,
    LowerWater,
    SetBrakesSpeed,
    HireNewStaffMember,
    SetStaffPatrol,
    FireStaffMember,
    SetStaffOrders,
    SetParkName,
    SetParkOpen,
    BuyLandRights,
    PlaceParkEntrance,
    RemoveParkEntrance,
    SetMazeTrack,
    SetParkEntranceFee,
    SetStaffColour,
    PlaceWall,
    RemoveWall,
    PlaceLargeScenery,
    RemoveLargeScenery,
    SetCurrentLoan,
    SetResearchFunding,
    PlaceTrackDesign,
    StartMarketingCampaign,
    PlaceMazeDesign,
    PlaceBanner,
    RemoveBanner,
    SetSceneryColour,
    SetWallColour,
    SetLargeSceneryColour,
    SetBannerColour,
    SetLandOwnership,
    ClearScenery,
    SetBannerName,
    SetSignName,
    SetBannerStyle,
    SetSignStyle,
    SetPlayerGroup,
    ModifyGroups,
    KickPlayer,
    Cheat,
    PickupGuest,
    PickupStaff,
    BalloonPress,
    ModifyTile,
    EditScenarioOptions,
    PlacePeepSpawn,
    SetClimate,
    SetColourScheme,
    SetStaffCostume,
    PlaceFootpathAddition,
    RemoveFootpathAddition,
    GuestSetFlags,
    SetDate,
    Custom,
    ChangeMapSize,
    FreezeRideRating,
    SetGameSpeed,
    SetRestrictedScenery,
    Count,
};

/**
 * From openrct2/Game.h
 */
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

/**
 * From openrct2/ride/Ride.h
 */
export enum RideLifecycleFlags {
  RIDE_LIFECYCLE_EVER_BEEN_OPENED = 1 << 12
};

/**
 * From openrct2/world/TileElement.h
 */
export enum EntranceType {
  ENTRANCE_TYPE_RIDE_ENTRANCE,
  ENTRANCE_TYPE_RIDE_EXIT,
  ENTRANCE_TYPE_PARK_ENTRANCE
};

/**
 * From openrct2/actions/GameActionResult.h
 */
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
 * Map
 * **********
 */

/**
 * From openrct2/world/Surface.h
 */
export enum LandOwnership {
  UNOWNED = 0,
  CONSTRUCTION_RIGHTS_OWNED = (1 << 4),
  OWNED = (1 << 5),
  CONSTRUCTION_RIGHTS_AVAILABLE = (1 << 6),
  AVAILABLE = (1 << 7)
};

/**
 * Result from Map.setLandOwnership
 */
export type LandRightsResult = {
  numSet : number,
  numFailed : number
};