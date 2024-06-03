import { ToggleButton } from '@ui/elements/ToggleButton';
import { ButtonID } from './TilemanWindow';
import { FlexUIWidget } from '@src/flexui-extension/FlexUIWidget';

export interface IWindow {
  readonly windowTitle : string;

  /**
   * Opens the window
   */
  open() : void;
  
  /**
   * Closes the window
   */
  close() : void;
  
  /**
   * Gets a UI element from the UI map
   * @param buttonId ButtonID to get instance of
   * @returns Button instance
   */
  getUIElement(buttonId : ButtonID) : ToggleButton | FlexUIWidget | undefined;
}