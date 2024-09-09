/// <reference path='../lib/openrct2.d.ts' />

import { Plugin } from './Plugin';
import { loadPark } from './pluginInitializer';
import { StartupWindow } from './ui/windows/StartupWindow';





// HIGH PRIORITY
  //TODO: XP BALANCING:
    // Scale XP cost so new tiles are easier at the start and harder later on
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
  //TODO: Detailed Stats Window - Create window with various stats including historical data about rides done in a list view

// UNSURE
  //TODO: Config Window - Add reset park data button
  //TODO: Persistent Storage - context.sharedStorage for plugin config with profiles?
  //TODO: XP Sources - Make a baseline for each scenario type and multiple xp value by how much over the baseline it is (200 vs 400 guests = 2x)
  //TODO: Options - Difficulty multiplier for ParkFlags?
  //TODO: Startup Behavior - 

// Integrations
  // Abandoned Park - Don't clear rides (but still clear guests and staff) if Abandoned Park plugin is detected
    // https://openrct2plugins.org/plugin/MDEwOlJlcG9zaXRvcnkzNDM0NTI2NjY=/openrct2-abandonedpark
  // Animated Vandalism Repairing - Add path element repairs as an XP Source
    // https://github.com/jpknen/openrct2-animated-vandalism-repairing





async function main() : Promise<void> {
  const plugin : Plugin = Plugin.instance();
  if (plugin.isValidRunConfig()) {
    console.log(`Initializing Tileman Plugin in ${__environment} mode...`);
    console.log(`Minimum API v${__required_api_version} - Found API v${context.apiVersion}`);

    const tilemanEnabled : boolean | undefined = context.getParkStorage().get('tilemanEnabled');
    if (typeof tilemanEnabled === 'boolean') {
      // User was already asked and the mode was set to true or false, load it
      loadPark(tilemanEnabled);
    } else {
      // Undefined, so ask the user if they want to play tileman mode

      if (!context.paused) {
        await new Promise<void>((resolve, reject) : void => {
          context.executeAction('pausetoggle', {}, (result : GameActionResult) : void => {
            resolve();
          });
        })
      }

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
  targetApiVersion: __required_api_version,
  minApiVersion: __required_api_version,
  main: main
});