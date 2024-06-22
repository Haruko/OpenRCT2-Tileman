/// <reference path='../../../lib/openrct2.d.ts' />

import { Colour, Store, WindowTemplate, box, compute, horizontal, spinner, vertical, window } from 'openrct2-flexui';
import { StatefulButtonGroup } from '../elements/StatefulButtonGroup';
import { Sprites, ElementID, WindowID } from '../types/enums';
import { BaseWindow } from './BaseWindow';
import { FlexUIWidget, HorizontalAlignment } from '../types/types';
import { ToggleButton } from '../elements/ToggleButton';
import { UIManager } from '../UIManager';
import { Plugin } from '@src/Plugin';
import { Player } from '@src/Player';
import { availableTilesStore, totalExpStore } from '@src/stores';
import { IWindow } from './IWindow';
import { ToolManager } from '@src/tools/ToolManager';
import { ToolID } from '@src/tools/types/enums';
import { ProgressBar } from '../elements/ProgressBar';
import { AlignedLabel } from '../elements/AlignedLabel';





export class ToolbarWindow extends BaseWindow {
  private readonly _toolButtonGroup : StatefulButtonGroup = new StatefulButtonGroup();

  constructor() {
    super(WindowID.TOOLBAR, 'Tileman');
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
      width: 211,
      height: 'auto',
      padding: { top: 0, right: 1, bottom: 1, left: 1 },
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
    const buyToolButton : ToggleButton = this._createToolbarButton(ElementID.BUY_TOOL);
    const rightsToolButton : ToggleButton = this._createToolbarButton(ElementID.RIGHTS_TOOL);
    const sellToolButton : ToggleButton = this._createToolbarButton(ElementID.SELL_TOOL);
    const viewRightsButton : ToggleButton = this._createToolbarButton(ElementID.VIEW_RIGHTS_BUTTON);
    const openStatsButton : ToggleButton = this._createToolbarButton(ElementID.OPEN_STATS_BUTTON);
    const openConfigButton : ToggleButton = this._createToolbarButton(ElementID.OPEN_CONFIG_BUTTON);

    const toolSizeSpinner : FlexUIWidget = spinner({
      width: 62,
      padding: [5, 1],
      value: ToolManager.getToolSizeStore(),
      minimum: Plugin.get('minToolSize'),
      maximum: Plugin.get('maxToolSize'),
      step: 1,
      wrapMode: 'clamp',
      onChange: (value : number, adjustment : number) : void => {
        ToolManager.setToolSize(value);
      },
      format: (value: number) : string => {
        return `${value}x${value}`;
      }
    });

    this.registerElement(ElementID.TOOL_SIZE_SPINNER, toolSizeSpinner);

    return horizontal({
      spacing: 0,
      padding: [0, 0],
      content: [
        toolSizeSpinner,
        buyToolButton.widget,
        rightsToolButton.widget,
        sellToolButton.widget,
        viewRightsButton.widget,
        openStatsButton.widget,
        openConfigButton.widget
      ]
    });
  }

  /**
   * Creates buttons for toolbar button panel
   * @param id ElementID of element to make
   * @returns The element
   */
  private _createToolbarButton(id : ElementID) : ToggleButton {
    let newElement! : ToggleButton;

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
        this.registerElement(ElementID.BUY_TOOL, newElement);
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
        this.registerElement(ElementID.RIGHTS_TOOL, newElement);
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
        this.registerElement(ElementID.SELL_TOOL, newElement);
        break;
      } case ElementID.VIEW_RIGHTS_BUTTON: {
        newElement = new ToggleButton(ElementID.VIEW_RIGHTS_BUTTON, {
          image: Sprites.SEARCH,
          tooltip: 'Show owned construction rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onViewRightsChange(pressed),
        });

        this._toolButtonGroup.addButton(newElement);
        this.registerElement(ElementID.VIEW_RIGHTS_BUTTON, newElement);
        break;
      } case ElementID.OPEN_CONFIG_BUTTON: {
        newElement = new ToggleButton(ElementID.OPEN_CONFIG_BUTTON, {
          image: Sprites.FLOPPY,
          tooltip: 'Open configuration window',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onConfigChange(pressed),
        });

        this.registerElement(ElementID.OPEN_CONFIG_BUTTON, newElement);
        break;
      } case ElementID.OPEN_STATS_BUTTON: {
        newElement = new ToggleButton(ElementID.OPEN_STATS_BUTTON, {
          image: Sprites.GRAPH,
          tooltip: 'Open detailed statistics window',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => this.onStatsChange(pressed),
        });

        this.registerElement(ElementID.OPEN_STATS_BUTTON, newElement);
        break;
      }
    }

    return newElement;
  }

  /**
   * Builds panel to display statistics
   */
  private _buildToolbarStatsPanel() : FlexUIWidget {
    // Available tiles label
    const availableTilesLabel : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        new AlignedLabel(ElementID.NONE, {
          text: '{BLACK}Available Tiles : ',
          width: 90,
          height: 14,
          textAlignment: {
            horizontal: 'right',
          },
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          text: this._createStatsLabelStore(ElementID.AVAILABLE_TILES),
          height: 14,
        }).widget,
      ],
    });
    
    // Unlocked tiles label
    const unlockedTilesLabel : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        new AlignedLabel(ElementID.NONE, {
          text: '{BLACK}Tiles Spent : ',
          width: 90,
          height: 14,
          textAlignment: {
            horizontal: 'right',
          },
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          text: this._createStatsLabelStore(ElementID.UNLOCKED_TILES),
          height: 14,
        }).widget,
      ],
    });
    
    // Exp to next tile progress bar
    const expToNextTilePercent : Store<number> = compute<number, number, number>(totalExpStore, Plugin.get('tileXpCost'),
      (totalExp : number, tileXpCost : number) : number => {
        const expSinceLastTile : number = totalExp % tileXpCost;
        return expSinceLastTile / tileXpCost;
      }
    );

    const expToNextTileProgressBar : ProgressBar = new ProgressBar(ElementID.EXP_NEXT_PROGRESSBAR, {
      width: '1w',
      height: 16,
      background: Colour.Grey,
      foreground: Colour.LightBlue,
      text: this._createStatsLabelStore(ElementID.EXP_NEXT_PROGRESSBAR),
      textAlignment: {
        horizontal: compute<number, HorizontalAlignment>(Plugin.get('tileXpCost'), (tileXpCost : number) : HorizontalAlignment => {
          return tileXpCost === 0 ? 'center' : 'left';
        }),
        vertical: 'center'
      },
      percentFilled: expToNextTilePercent
    });
    
    return box({
      padding: { top: 0, right: 1, bottom: 1, left: 1 },
      content: vertical({
        spacing: 0,
        padding: { top: 0, right: 1, bottom: 2, left: 0 },
        content: [
          expToNextTileProgressBar.widget,
          availableTilesLabel,
          unlockedTilesLabel,
        ],
      }),
    });
  }

  private _createStatsLabelStore(id : ElementID) : Store<string> {
    let newStore! : Store<string>;

    switch (id) {
      case ElementID.AVAILABLE_TILES: {
        newStore = compute<number, string>(availableTilesStore,
          (availableTiles : number) : string => {
            if (availableTiles === Infinity) {
              return '{GREEN}Yes';
            } else {
              const textColor : string = (availableTiles === 0) ? 'RED' : 'BABYBLUE';
        
              return `{${textColor}}${context.formatString('{COMMA16}', availableTiles)}`;
            }
          }
        );
        break;
      } case ElementID.UNLOCKED_TILES: {
        newStore = compute<number, string>(Player.get('tilesUsed'),
          (tilesUsed : number) : string => {
            return `{WHITE}${tilesUsed}`;
          }
        );
        break;
      } case ElementID.EXP_TO_NEXT_TILE: {
        newStore = compute<number, number, string>(totalExpStore, Plugin.get('tileXpCost'),
          (totalExp : number, tileXpCost : number) : string => {
              const expToNextTile : number = tileXpCost - (totalExp % tileXpCost);
              return `{WHITE}${context.formatString('{COMMA16}', expToNextTile)}`;
          }
        );
        break;
      } case ElementID.EXP_NEXT_PROGRESSBAR: {
        newStore = compute<number, number, string>(totalExpStore, Plugin.get('tileXpCost'),
          (totalExp : number, tileXpCost : number) : string => {
            if (tileXpCost === 0) {
              return `  {RED}I want to get off Mr. Bone's Wild Ride!`;
            } else {
              const expToNextTile : number = tileXpCost - (totalExp % tileXpCost);
              return `  {WHITE}${context.formatString('{COMMA16}', expToNextTile)} {BLACK}xp to next`;
            }
          }
        );
        break;
      }
    }

    return newStore;
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
   * Handle onChange for configuration window button
   * @param isPressed true if the button is pressed
   */
  private onConfigChange(isPressed : boolean) : void {
    const configWindow : IWindow = UIManager.getInstance(WindowID.CONFIG);
    
    if (typeof configWindow !== 'undefined') {
      if (isPressed) {
        configWindow.open();
      } else {
        configWindow.close();
      }
    }
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