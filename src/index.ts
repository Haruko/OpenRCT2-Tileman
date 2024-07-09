/// <reference path='../lib/openrct2.d.ts' />

import { Plugin } from './Plugin';
import { loadPark } from './pluginInitializer';
import { StartupWindow } from './ui/windows/StartupWindow';


/*

* A lot of background stuff you won't see, but causes previous saves to break (sorry)
* Updated initial XP values (Can be changed in config window)
* Added XP sources:
  - Balloons popped
  - Banners placed
    - XP is removed when banner is removed
  - Park awards
    - Positive
    - Negative
  - Marketing campaigns
    - Per $50 spent
  - Scenario completion
  - Vehicle crashes
    - Per car exploded
    - Per guest killed
  - Guests and staff drowning
* New restrictions on tile ownership changes:
  * Guests - Selling - No longer allowed to sell tiles with guests on them.
  * Paths - Buying - No longer allowed to buy tiles with paths on them. (Can be bypassed in config window)
  * Paths - Rights - No longer allowed to switch between owned and construction rights owned. Construction rights CAN be bought on land that is unowned. (Can be bypassed in config window)
  * Paths - Selling - No longer allowed to sell tiles with paths on them.
* New startup process:
  * Added popup window on load and now pause the game to ask if you want to play tileman or not.
  * All paths within the park are now cleared.
  * Guest clearing is limited to within the park.
* Toolbar Window:
  * Made toolbar smaller by removing config and stats buttons. These are both accessible from the map dropdown menu.
* Config Window:
  * Made it look nicer.
  * Added count of instances for each XP source.
  * Added tooltips to config window and cleaned it up a bit.
  * Added bypass for path restrictions in config.
  * Added button to delete all owned paths (and clean up litter on them).
  * Added tooltips to buttons in config and debug tabs to tell people to double click.










*/





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
  //TODO: Config Window - Add reset park data button
  //TODO: Detailed Stats Window - Create window with various stats including historical data about rides done in a list view

// UNSURE
  //TODO: Persistent Storage - context.sharedStorage for plugin config with profiles?
  //TODO: XP Sources - Make a baseline for each scenario type and multiple xp value by how much over the baseline it is (200 vs 400 guests = 2x)
  //TODO: Options - Difficulty multiplier for ParkFlags?
  //TODO: Startup Behavior - Don't clear rides (but still clear guests and staff) if Abandoned Park plugin is detected
    // https://openrct2plugins.org/plugin/MDEwOlJlcG9zaXRvcnkzNDM0NTI2NjY=/openrct2-abandonedpark





async function main() : Promise<void> {
  const plugin : Plugin = Plugin.instance();
  if (plugin.isValidRunConfig()) {
    console.log(`Initializing Tileman Plugin in ${__environment} mode...`);

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
  targetApiVersion: 70,
  minApiVersion: 68,
  main: main
});