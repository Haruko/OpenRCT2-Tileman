/// <reference path='../lib/openrct2.d.ts' />

import { Map } from './Map';
import { Park } from './Park';
import { Plugin } from './Plugin';
import { initializeTools } from './tools/toolInitializer';
import { initializeUI } from './ui/uiInitializer';

/**
 * Initializes everything
 */
export async function initialize() : Promise<void> {
  Plugin.initialize();
  Park.initialize();
  await Map.initialize();
  initializeUI();
  initializeTools();
}