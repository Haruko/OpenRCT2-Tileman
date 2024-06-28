/// <reference path='../lib/openrct2.d.ts' />

import { Park } from './Park';
import { Metrics } from './Metrics';
import { Plugin } from './Plugin';
import { initializeTools } from './tools/toolInitializer';
import { DataStoreID } from './types/enums';
import { UIManager } from './ui/UIManager';
import { WindowID } from './ui/types/enums';
import { initializeUI } from './ui/uiInitializer';
import { DataStoreManager } from './DataStoreManager';
import { Stores } from './Stores';



const activateMenuItemCreated : boolean = false;

/**
 * Makes menu option in map menu dropdown to activate tileman mode
 */
export function createActivateMenuItem() {
  if (!activateMenuItemCreated) {
    park.postMessage({
      type: 'blank',
      text: '{BABYBLUE}To switch this park to Tileman mode, use the \'Activate Tileman Mode\' option from the map dropdown menu.',
    });

    ui.registerMenuItem('Activate Tileman Mode', () : void => setTilemanMode(true));
  }
}

/**
 * Restores tileman mode on a loaded park
 * @param isTilemanPark True if the park uses tileman mode
 */
export function loadPark(isTilemanPark : boolean) : void {
  if (isTilemanPark) {
    initialize();
  } else {
    createActivateMenuItem();
  }
}

/**
 * Activates or deactivates tileman mode from a UI element.
 * This means that this is never called on loading a saved park unless the mod is new to that park.
 * @param enable Whether we're enabling it or not
 */
export function setTilemanMode(enable : boolean) : void {
  const previousState : boolean | undefined = context.getParkStorage().get('tilemanEnabled') === true;
  context.getParkStorage().set('tilemanEnabled', enable);

  if (enable) {
    if (previousState) {
      ui.showError('Tileman mode already enabled!', '(This menu option clears on park load)');
    } else {
      // Enabling the park from either the startup window or the menu option
      Park.instance<Park>()
        .initialize()
        .then(() : void => {
          initialize();
        });
    }
  } else {
    createActivateMenuItem();
  }
}



/**
 * Initializes everything
 */
export function initialize() : void {
  const dataStoreManager : DataStoreManager = DataStoreManager.instance();

  dataStoreManager.registerInstance(DataStoreID.PLUGIN, Plugin.instance());
  dataStoreManager.registerInstance(DataStoreID.METRICS, Metrics.instance());

  // Make sure this happens after registering plugin and metrics
  dataStoreManager.registerInstance(DataStoreID.STORES, Stores.instance());
  
  dataStoreManager.initializeAll();
  
  initializeUI();
  initializeTools();

  if (__environment === 'development') {
    const uiManager : UIManager = UIManager.instance();
    uiManager.getInstance(WindowID.CONFIG).open();
    uiManager.getInstance(WindowID.STATS).open();
  }
}