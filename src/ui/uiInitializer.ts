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

  const uiManager : UIManager = UIManager.instance();
  uiManager.registerInstance(WindowID.TOOLBAR, toolbarWindow);
  uiManager.registerInstance(WindowID.STATS, statsWindow);
  uiManager.registerInstance(WindowID.CONFIG, configWindow);

  ui.registerMenuItem('Tileman Toolbar', () => uiManager.getInstance(WindowID.TOOLBAR).open());
  ui.registerMenuItem('Tileman Statistics', () => uiManager.getInstance(WindowID.STATS).open());
  ui.registerMenuItem('Tileman Config', () => uiManager.getInstance(WindowID.CONFIG).open());

  toolbarWindow.open();
}