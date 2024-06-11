/// <reference path='../lib/openrct2.d.ts' />

import { DataStoreManager } from './DataStoreManager';
import { Map } from './Map';
import { Park } from './Park';
import { Player } from './Player';
import { Plugin } from './Plugin';
import { initializeTools } from './tools/toolInitializer';
import { DataStoreID } from './types/types';
import { initializeUI } from './ui/uiInitializer';

const isNewPark : boolean = Object.keys(context.getParkStorage().getAll()).length === 0;

/**
 * Initializes everything
 */
export async function initialize() : Promise<void> {
  DataStoreManager.registerInstance(DataStoreID.PLUGIN, Plugin);
  DataStoreManager.registerInstance(DataStoreID.PLAYER, Player);
  DataStoreManager.registerInstance(DataStoreID.PARK, Park);

  if (isNewPark) {
    DataStoreManager.loadAllData();
  }

  DataStoreManager.initializeAll(isNewPark);
  await Map.initialize(isNewPark);

  initializeUI();
  initializeTools();
}