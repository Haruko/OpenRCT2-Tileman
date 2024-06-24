/// <reference path='../../lib/openrct2.d.ts' />

import { UIManager } from './UIManager';
import { WindowID } from './types/enums';
import { ConfigWindow } from './windows/ConfigWindow';
import { StatsWindow } from './windows/StatsWindow';
import { ToolbarWindow } from './windows/ToolbarWindow';

export function initializeUI() : void {
  const toolbarWindow : ToolbarWindow = new ToolbarWindow();
  const statsWindow : StatsWindow = new StatsWindow();
  const configWindow : ConfigWindow = new ConfigWindow();

  UIManager.registerInstance(WindowID.TOOLBAR, toolbarWindow);
  UIManager.registerInstance(WindowID.STATS, statsWindow);
  UIManager.registerInstance(WindowID.CONFIG, configWindow);

  ui.registerMenuItem('Tileman Toolbar', () => UIManager.getInstance(WindowID.TOOLBAR)?.open());
  ui.registerMenuItem('Tileman Statistics', () => UIManager.getInstance(WindowID.STATS)?.open());
  ui.registerMenuItem('Tileman Config', () => UIManager.getInstance(WindowID.CONFIG)?.open());

  toolbarWindow.open();
}