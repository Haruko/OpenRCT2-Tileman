/// <reference path='../../lib/openrct2.d.ts' />

import { Park } from './Park';
import { Metrics } from './Metrics';
import { Plugin } from './Plugin';
import { initializeTools } from './tools/toolInitializer';
import { DataStoreID } from './types/enums';
import { UIManager } from './ui/UIManager';
import { WindowID } from './ui/types/enums';
import { initializeUI } from './ui/uiInitializer';
import { DataStoreManager } from './DataStoreManager';

const isNewPark : boolean = Object.keys(context.getParkStorage().getAll()).length === 0;

/**
 * Initializes everything
 */
export function initialize() : void {
  const dataStoreManager : DataStoreManager = DataStoreManager.instance();

  dataStoreManager.registerInstance(DataStoreID.PLUGIN, Plugin.instance());
  dataStoreManager.registerInstance(DataStoreID.METRICS, Metrics.instance());
  
  dataStoreManager.initializeAll(isNewPark);

  if (isNewPark) {
    dataStoreManager.storeAllData();
  }
  
  const tilemanPark : Park = Park.instance();
  tilemanPark.initialize(isNewPark)
    .then(() : void => {
      initializeUI();
      initializeTools();
    
      if (__environment === 'development') {
        const uiManager : UIManager = UIManager.instance();
        uiManager.getInstance(WindowID.CONFIG).open();
        uiManager.getInstance(WindowID.STATS).open();
      }
    });
}