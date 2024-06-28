/// <reference path='../../../lib/openrct2.d.ts' />

import { button, horizontal, vertical, window, WindowTemplate } from 'openrct2-flexui';
import { ElementID, WindowID } from '../types/enums';
import { BaseWindow } from './BaseWindow';
import { FlexUIWidget } from '../types/types';
import { AlignedLabel } from '../elements/AlignedLabel';
import { setTilemanMode } from '@src/pluginInitializer';



export class StartupWindow extends BaseWindow {
  protected constructor() {
    super(WindowID.STARTUP, 'Tileman Startup');

    this.template = this._buildWindowTemplate();
  }
  


  /**
   * **********
   * Template Construction
   * **********
   */

  /**
   * Builds the window template for initialization
   * @returns WindowTemplate
   */

  protected _buildWindowTemplate() : WindowTemplate {
    const explanationLabel1 : AlignedLabel = new AlignedLabel(ElementID.NONE, {
      height: 12,
      textAlignment: {
        horizontal: 'center',
        vertical: 'center'
      },
      text: 'Please choose which park',
    });

    const explanationLabel2 : AlignedLabel = new AlignedLabel(ElementID.NONE, {
      height: 12,
      textAlignment: {
        horizontal: 'center',
        vertical: 'center'
      },
      text: 'mode you\'d like to play below.',
    });

    const explanationLabel3 : AlignedLabel = new AlignedLabel(ElementID.NONE, {
      height: 14,
      textAlignment: {
        horizontal: 'center',
        vertical: 'center'
      },
      text: '{RED}This will wipe your park!',
    });

    const tilemanButton : FlexUIWidget = button({
      height: 50,
      text: 'Tileman Park',
      onClick: this._onTilemanParkButtonClick.bind(this),
    });

    const classicParkButton : FlexUIWidget = button({
      height: 50,
      text: 'Classic Park',
      onClick: this._onClassicParkButtonClick.bind(this),
    });

    return window({
      title: this.windowTitle,
      width: 175,
      height: 'auto',
      content: [
        vertical({
          spacing: 2,
          padding: 0,
          content: [
            explanationLabel1.widget,
            explanationLabel2.widget,
            explanationLabel3.widget,
            horizontal({
              spacing: 2,
              padding: 0,
              content: [
                tilemanButton,
                classicParkButton,
              ]
            })
          ]
      })],
      onOpen: this.onOpen.bind(this),
      onUpdate: this.onUpdate.bind(this),
      onClose: this.onClose.bind(this)
    });
  }



  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles onOpen event
   */
  protected override onOpen() : void {
    super.onOpen();
    this._centerWindow();
  }

  /**
   * Handles window update event
   */
  protected override onUpdate() : void {
    super.onUpdate();
    this._centerWindow();
  }

  /**
   * Handles window close event
   */
  protected override onClose() : void {
    super.onClose();

    const tilemanEnabled : boolean | undefined = context.getParkStorage().get('tilemanEnabled');
    // Undefined if we pressed the X
    if (typeof tilemanEnabled === 'undefined') {
      setTilemanMode(false);
    }
  }
  
  /**
   * Handle clicks on the Tileman Park button
   */
  private _onTilemanParkButtonClick() : void {
    setTilemanMode(true);
    this.close();
  }
  
  /**
   * Handle clicks on the Classic Park button
   */
  private _onClassicParkButtonClick() : void {
    setTilemanMode(false);
    this.close();
  }


  
  /**
   * **********
   * Other
   * **********
   */

  /**
   * Centers the window on the screen
   */
  private _centerWindow() : void {
    const foundWindow : Window | undefined = this.getWindowInstance();
    if (typeof foundWindow !== 'undefined') {
      foundWindow.x = (ui.width - foundWindow.width) / 2;
      foundWindow.y = (ui.height - foundWindow.height) / 2;
    }
  }
}
