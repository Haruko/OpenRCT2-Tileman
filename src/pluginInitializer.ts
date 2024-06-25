/// <reference path='../lib/openrct2.d.ts' />

import { DataStoreManager } from './DataStoreManager';
import { Park } from './Park';
import { Metrics } from './Metrics';
import { Plugin } from './Plugin';
import { initializeTools } from './tools/toolInitializer';
import { DataStoreID } from './types/enums';
import { UIManager } from './ui/UIManager';
import { WindowID } from './ui/types/enums';
import { initializeUI } from './ui/uiInitializer';

const isNewPark : boolean = Object.keys(context.getParkStorage().getAll()).length === 0;

/**
 * Initializes everything
 */
export function initialize() : void {
  DataStoreManager.registerInstance(DataStoreID.PLUGIN, Plugin);
  DataStoreManager.registerInstance(DataStoreID.METRICS, Metrics);
  
  DataStoreManager.initializeAll(isNewPark);
  Park.initialize(isNewPark).then(() : void => {
    initializeUI();
    initializeTools();
  
    if (__environment === 'development') {
      UIManager.getInstance(WindowID.CONFIG).open();
      UIManager.getInstance(WindowID.STATS).open();
    }
  });
}