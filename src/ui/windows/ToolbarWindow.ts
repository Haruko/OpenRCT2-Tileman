/// <reference path='../../../lib/openrct2.d.ts' />

import { Colour, Store, WindowTemplate, box, compute, horizontal, label, spinner, vertical, window } from 'openrct2-flexui';
import { StatefulButtonGroup } from '../elements/StatefulButtonGroup';
import { Sprites, ElementID, WindowID } from '../types/enums';
import { BaseWindow } from './BaseWindow';
import { FlexUIWidget } from '@src/flexui-extension/types/FlexUIWidget';
import { ToggleButton } from '../elements/ToggleButton';
import { UIManager } from '../UIManager';
import { UIElement } from '../types/types';
import { Plugin } from '@src/Plugin';
import { Player } from '@src/Player';
import { availableTilesStore, totalExpStore } from '@src/stores';
import { IWindow } from './IWindow';
import { ToolManager } from '@src/tools/ToolManager';
import { ToolID } from '@src/tools/types/enums';
import { ProgressBar } from '../elements/ProgressBar';





export class ToolbarWindow extends BaseWindow {
  private readonly _toolButtonGroup : StatefulButtonGroup = new StatefulButtonGroup();

  constructor() {
    super(WindowID.TOOLBAR, 'Tileman Toolbar');
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
    const buttonPanel : FlexUIWidget = this._buildToolbarButtonPanel();
    const statsPanel : FlexUIWidget  = this._buildToolbarStatsPanel();

    return window({
      title: this.windowTitle,
      width: 200,
      height: 'auto',
      padding: 1,
      content: [
        vertical({
          spacing: 2,
          padding: 0,
          content: [
            buttonPanel,
            statsPanel
          ]
        })
      ],
      onOpen: this.onOpen.bind(this),
      onUpdate: this.onUpdate.bind(this),
      onClose: this.onClose.bind(this)
    });
  }

  /**
   * Builds panel to store buttons
   */
  private _buildToolbarButtonPanel() : FlexUIWidget {
    this.uiElementMap[ElementID.BUY_TOOL] =  this._createUIElement(ElementID.BUY_TOOL);
    this.uiElementMap[ElementID.RIGHTS_TOOL] =  this._createUIElement(ElementID.RIGHTS_TOOL);
    this.uiElementMap[ElementID.SELL_TOOL] =  this._createUIElement(ElementID.SELL_TOOL);
    this.uiElementMap[ElementID.VIEW_RIGHTS_BUTTON] =  this._createUIElement(ElementID.VIEW_RIGHTS_BUTTON);
    this.uiElementMap[ElementID.OPEN_STATS_BUTTON] =  this._createUIElement(ElementID.OPEN_STATS_BUTTON);
    this.uiElementMap[ElementID.TOOL_SIZE_SPINNER] =  this._createUIElement(ElementID.TOOL_SIZE_SPINNER);

    return horizontal({
      spacing: 0,
      padding: [0, 3],
      content: [
        this.uiElementMap[ElementID.TOOL_SIZE_SPINNER] as FlexUIWidget,
        (this.uiElementMap[ElementID.BUY_TOOL] as ToggleButton).widget,
        (this.uiElementMap[ElementID.RIGHTS_TOOL] as ToggleButton).widget,
        (this.uiElementMap[ElementID.SELL_TOOL] as ToggleButton).widget,
        (this.uiElementMap[ElementID.VIEW_RIGHTS_BUTTON] as ToggleButton).widget,
        (this.uiElementMap[ElementID.OPEN_STATS_BUTTON] as ToggleButton).widget,
      ]
    });
  }

  /**
   * Builds panel to display statistics
   */
  private _buildToolbarStatsPanel() : FlexUIWidget {
    // Available tiles label
    const availableTilesText : Store<string> = compute<number, string>(availableTilesStore,
      (availableTiles : number) : string => {
        const textColor : string = (availableTiles === 0) ? 'RED' : 'BABYBLUE';
  
        return `{${textColor}}${context.formatString('{COMMA16}', availableTiles)}`;
      }
    );

    const availableTilesLabel : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        label({
          text: '  {BLACK}Available Tiles: ',
          width: 90
        }),
        label({
          text: availableTilesText
        })
      ]
    });
    
    // Exp to next tile label
    const expToNextTileText : Store<string> = compute<number, number, string>(totalExpStore, Plugin.get('expPerTile'),
      (totalExp : number, expPerTile : number) : string => {
          const expToNextTile : number = expPerTile - (totalExp % expPerTile);
          return `{WHITE}${context.formatString('{COMMA16}', expToNextTile)}`;
      }
    );
    
    const expToNextTileLabel : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        label({
          text: '{BLACK}XP To Next Tile:',
          width: 90
        }),
        label({
          text: expToNextTileText
        })
      ]
    });
    
    // Exp to next tile progress bar
    const expToNextTilePercent : Store<number> = compute<number, number, number>(totalExpStore, Plugin.get('expPerTile'),
      (totalExp : number, expPerTile : number) : number => {
        const expSinceLastTile : number = totalExp % expPerTile;
        return expSinceLastTile / expPerTile;
      }
    );
    
    const expToNextTileBarForeground : Store<Colour> = compute<number, number, Colour>(totalExpStore, Plugin.get('expPerTile'),
      (totalExp : number, expPerTile : number) : Colour => {
        const expSinceLastTile : number = totalExp % expPerTile;
        const percent : number = expSinceLastTile / expPerTile;
  
        if (percent > 0.80) {
          return Colour.BrightPurple;
        } else if (percent > 0.60) {
          return Colour.LightBlue;
        } else if (percent > 0.40) {
          return Colour.BrightGreen;
        } else if (percent > 0.20) {
          return Colour.BrightYellow;
        } else {
          return Colour.BrightRed;
        }
      }
    );

    const expToNextTileProgressBar : ProgressBar = new ProgressBar(ElementID.EXP_NEXT_PROGRESSBAR, {
      width: '1w',
      height: 10,
      background: Colour.Grey,
      foreground: expToNextTileBarForeground,
      percentFilled: expToNextTilePercent
    });
    
    // Unlocked tiles label
    const unlockedTilesText : Store<string> = compute<number, string>(Player.get('tilesUsed'),
      (tilesUsed : number) : string => {
        return `{WHITE}${tilesUsed}`;
      }
    );

    const unlockedTilesLabel : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        label({
          text: '   {BLACK}Tiles Unlocked:',
          width: 90
        }),
        label({
          text: unlockedTilesText
        })
      ]
    });
    
    return box({
      content: vertical({
        spacing: 0,
        content: [
          availableTilesLabel,
          unlockedTilesLabel,
          expToNextTileLabel,
          expToNextTileProgressBar.widget
        ]
      })
    });
  }

  /**
   * Creates buttons, ToggleButtons, DoubleClickButtons, and other singular UI controls
   * @param id ID of element to create
   * @returns Created element
   */
  private _createUIElement(id : ElementID) : UIElement {
    let newElement : UIElement;

    switch (id) {
      case ElementID.BUY_TOOL: {
        newElement = new ToggleButton(ElementID.BUY_TOOL, {
          image: Sprites.BUY_LAND_RIGHTS,
          tooltip: 'Buy land rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onBuyToolChange(pressed),
        }, this._toolButtonGroup);

        this._toolButtonGroup.addButton(newElement);
        break;
      } case ElementID.RIGHTS_TOOL: {
        newElement = new ToggleButton(ElementID.RIGHTS_TOOL, {
          image: Sprites.BUY_CONSTRUCTION_RIGHTS,
          tooltip: 'Buy construction rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onRightsToolChange(pressed),
        }, this._toolButtonGroup);

        this._toolButtonGroup.addButton(newElement);
        break;
      } case ElementID.SELL_TOOL: {
        newElement = new ToggleButton(ElementID.SELL_TOOL, {
          image: Sprites.FINANCE,
          tooltip: 'Sell land and construction rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onSellToolChange(pressed),
        }, this._toolButtonGroup);

        this._toolButtonGroup.addButton(newElement);
        break;
      } case ElementID.VIEW_RIGHTS_BUTTON: {
        newElement = new ToggleButton(ElementID.VIEW_RIGHTS_BUTTON, {
          image: Sprites.SEARCH,
          tooltip: 'Show owned construction rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onViewRightsChange(pressed),
        });

        break;
      } case ElementID.OPEN_STATS_BUTTON: {
        newElement = new ToggleButton(ElementID.OPEN_STATS_BUTTON, {
          image: Sprites.GRAPH,
          tooltip: 'Open detailed statistics window',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onStatsChange(pressed),
        });

        break;
      } case ElementID.TOOL_SIZE_SPINNER: {
        newElement = spinner({
          width: 62,
          padding: 5,
          value: ToolManager.getToolSizeStore(),
          minimum: Plugin.get('minToolSize'),
          maximum: Plugin.get('maxToolSize') + 1,
          step: 1,
          wrapMode: 'clamp',
          onChange: (value : number, adjustment : number) : void => {
            ToolManager.setToolSize(value);
          },
          format: (value: number) : string => {
            return `${value}x${value}`;
          }
        });
        
        break;
      }
    }

    return newElement!;
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
  }

  /**
   * Handles window update event
   */
  protected override onUpdate() : void {
    super.onUpdate();
  }

  /**
   * Handles window close event
   */
  protected override onClose() : void {
    super.onClose();
    this.open();
  }

  /**
   * Handle onChange for buy tool button
   * @param isPressed true if the button is pressed
   */
  private onBuyToolChange(isPressed : boolean) : void {
    if (isPressed) {
      ToolManager.setActiveTool(ToolID.BUY);
    } else {
      ToolManager.cancelTool();
    }
  }

  /**
   * Handle onChange for rights tool button
   * @param isPressed true if the button is pressed
   */
  private onRightsToolChange(isPressed : boolean) : void {
    if (isPressed) {
      ToolManager.setActiveTool(ToolID.RIGHTS);
    } else {
      ToolManager.cancelTool();
    }
  }

  /**
   * Handle onChange for sell tool button
   * @param isPressed true if the button is pressed
   */
  private onSellToolChange(isPressed : boolean) : void {
    if (isPressed) {
      ToolManager.setActiveTool(ToolID.SELL);
    } else {
      ToolManager.cancelTool();
    }
  }

  /**
   * Handle onChange for view rights toggle button
   * @param isPressed true if the button is pressed
   */
  private onViewRightsChange(isPressed : boolean) : void {
    UIManager.setRightsVisibility(isPressed);
  }

  /**
   * Handle onChange for statistics window button
   * @param isPressed true if the button is pressed
   */
  private onStatsChange(isPressed : boolean) : void {
    const statsWindow : IWindow = UIManager.getInstance(WindowID.STATS);
    
    if (typeof statsWindow !== 'undefined') {
      if (isPressed) {
        statsWindow.open();
      } else {
        statsWindow.close();
      }
    }
  }
  

  
  /**
   * **********
   * State Handling
   * **********
   */

  /**
   * Opens the window
   */
  override open() : void {
    const existingWindow : Window | undefined = this.getWindowInstance();
    
  
    if (typeof existingWindow === 'undefined') {
      // Didn't have the window open yet
      super.open();
    } else {
      // Already had an instance of the window open
      const x : number = existingWindow.x;
      const y : number = existingWindow.y;
      
      // Delay this so we make sure the old window is closed before opening a new one
      context.setTimeout(() : void => {
        super.open();

        const newWindow : Window | undefined = this.getWindowInstance();
        if (typeof newWindow !== 'undefined') {
          newWindow.x = x;
          newWindow.y = y;
        }
      }, 1);
    }
  }
}