/// <reference path='../lib/openrct2.d.ts' />

import { Plugin } from './Plugin';
import { loadPark } from './pluginInitializer';
import { StartupWindow } from './ui/windows/StartupWindow';


/*

enum
{
    ADVERTISING_CAMPAIGN_PARK_ENTRY_FREE,
    ADVERTISING_CAMPAIGN_RIDE_FREE,
    ADVERTISING_CAMPAIGN_PARK_ENTRY_HALF_PRICE,
    ADVERTISING_CAMPAIGN_FOOD_OR_DRINK_FREE,
    ADVERTISING_CAMPAIGN_PARK, // $350
    ADVERTISING_CAMPAIGN_RIDE, // $200
    ADVERTISING_CAMPAIGN_COUNT
};





// Player actions
marketingCampaignsRunXp : WritableStore<number>,

// Park data
parkAwardsXp : WritableStore<number>,
// Need to check messages and record dates for each award, plus whether it's positive or negative








* A lot of background stuff you won't see, but causes previous saves to break (sorry)
* Added new metrics:
  - Balloons popped
  - Banners placed
* Added tooltips to config window and cleaned it up a bit.
* Disabled statistics window button until it's implemented.









*/





// HIGH PRIORITY
  // Things that came up in Marcel's stream
    //TODO: Startup - Way to turn off the plugin in the main menu
    //TODO: Startup - Have it delete all paths inside the park before selling all the land on a new park
    //TODO: Config Window - Checkbox "Keep toolbar open"
    //TODO: Config Window - Checkbox "Show config button on toolbar"
    //TODO: Scale XP cost so they're easier at the start and harder later on
    //TODO: Don't allow buying or selling land with guests on it

  //TODO: XP Source - Implement marketing (per $50, per week)
  //TODO: XP Source - Implement park awards
  //TODO: XP Source - Crashes
  //TODO: XP Source - Drowning staff/guest

  //TODO: See if there's a way to check if you're loading a save vs starting a scenario (map.change(d)?)

  //TODO: XP BALANCING:
    // Mining:
    //     5   Clay, Rune Essence (min)
    //    17.5 Copper, Tin
    //    35   Iron
    //    40   Silver
    //    50   Coal
    //    65   Gold
    //    80   Mithril
    //   125   Runite
    //   240   Amethyst (max)

    // Woodcutting:
    //    25   Tree (min)
    //    37.5 Oak
    //    67.5 Willow
    //   100   Maple
    //   175   Yew
    //   380   Redwood (max)

    // Combat:
    //   1 damage = 4 attack xp + 1.33 hp xp = 5.33xp/damage
    //   XP Values:
    //       10.66 [2] Rat, Spider (min)
    //       15.99 [3] Chicken, Duck
    //       26.65 [5] Goblin, Monk
    //       37.31 [7] Man
    //       42.64 [8] Imp, Cow

// LOW PRIORITY
  //TODO: Startup Behavior - Don't clear rides (but still clear guests and staff) if Abandoned Park plugin is detected
    // https://openrct2plugins.org/plugin/MDEwOlJlcG9zaXRvcnkzNDM0NTI2NjY=/openrct2-abandonedpark
  //TODO: Config Window - Add reset park data button
  //TODO: Trace path between park entrance and guest spawns. Only let people buy rights there unless a checkbox is checked in config
  //TODO: Detailed Stats Window - Create window with various stats including historical data about rides done in a list view
  //TODO: Config Window - Add delete all rides with refund button

// UNSURE
  //TODO: Persistent Storage - context.sharedStorage for pluginconfig with profiles?
  //TODO: Options - Difficulty multiplier for ParkFlags?
  //TODO: Options - Bonus exp/tiles for completing objective?





function main() : void {
  const plugin : Plugin = Plugin.instance();
  if (plugin.isValidRunConfig()) {
    console.log(`Initializing Tileman Plugin in ${__environment} mode...`);

    const tilemanEnabled : boolean | undefined = context.getParkStorage().get('tilemanEnabled');
    if (typeof tilemanEnabled === 'boolean') {
      // User was already asked and the mode was set to true or false, load it
      loadPark(tilemanEnabled);
    } else {
      // Undefined, so ask the user if they want to play tileman mode
      const startupWindow : StartupWindow = StartupWindow.instance();
      startupWindow.open();
    }
  }
}

/**
 * Registers plugin info
 */
registerPlugin({
  name: 'Tileman',
  version: __version,
  authors: ['Isoitiro'],
  type: 'local',
  licence: 'GNU GPLv3',
  targetApiVersion: 70,
  minApiVersion: 68,
  main: main
});