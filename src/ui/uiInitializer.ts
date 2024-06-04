/// <reference path='../../lib/openrct2.d.ts' />

import { UIManager } from './UIManager';
import { WindowID } from './types/enums';
import { ConfigWindow } from './windows/ConfigWindow';
import { StatsWindow } from './windows/StatsWindow';
import { ToolbarWindow } from './windows/ToolbarWindow';

export function initializeUI() : void {
  const toolbarWindow : ToolbarWindow = new ToolbarWindow();
  UIManager.registerWindow(WindowID.TOOLBAR, toolbarWindow);
  UIManager.registerWindow(WindowID.STATS, new StatsWindow());
  UIManager.registerWindow(WindowID.CONFIG, new ConfigWindow());

  toolbarWindow.open();

  //TODO Remove when done developing
  UIManager.getWindow(WindowID.STATS).open();
  UIManager.getWindow(WindowID.CONFIG).open();
}