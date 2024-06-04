/// <reference path='../lib/openrct2.d.ts' />

import { Plugin } from './Plugin';
import { initializeUI } from './ui/uiInitializer';

//TODO Make tool.ts a class
//TODO Make some stores into computed
//TODO Config Window - Display spinners for each exp type
//TODO Config Window - Display totals for each exp type
//TODO Detailed Stats Window - Create window with various stats including historical data about rides done in a list view
//TODO Persistent Storage - context.sharedStorage for pluginconfig

//TODO MAYBE: Data - Initialize data for constructed rides?
//TODO MAYBE: Options - Difficulty multiplier for ParkFlags?
//TODO MAYBE: Options - Bonus exp/tiles for completing objective?
//TODO MAYBE: Toolbar Window - Add label over progress bar
//TODO MAYBE: Toolbar Window - Update the tool UI to be like the land editing tool
//TODO   Check out https://github.com/OpenRCT2/OpenRCT2/blob/17920b60390aa0c4afc84c09aa897a596f41705a/src/openrct2-ui/windows/Land.cpp#L43





function main() : void {
  if (Plugin.isValidRunConfig()) {
    console.log('Initializing Tileman Plugin...');

    Plugin.initialize();
    initializeUI();
  }
}

/**
 * Registers plugin info
 */
registerPlugin({
  name: 'Tileman',
  version: '0.1.0',
  authors: ['Isoitiro'],
  type: 'remote',
  licence: 'GNU GPLv3',
  targetApiVersion: 70,
  minApiVersion: 68,
  main: main
});