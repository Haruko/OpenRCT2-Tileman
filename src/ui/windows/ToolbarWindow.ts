/// <reference path='../../../lib/openrct2.d.ts' />

import { Colour, Store, WindowTemplate, box, compute, horizontal, spinner, vertical, window } from 'openrct2-flexui';
import { StatefulButtonGroup } from '../elements/StatefulButtonGroup';
import { Sprites, ElementID, WindowID } from '../types/enums';
import { BaseWindow } from './BaseWindow';
import { FlexUIWidget, HorizontalAlignment } from '../types/types';
import { ToggleButton } from '../elements/ToggleButton';
import { UIManager } from '../UIManager';
import { ToolManager } from '@src/tools/ToolManager';
import { ToolID } from '@src/tools/types/enums';
import { ProgressBar } from '../elements/ProgressBar';
import { AlignedLabel } from '../elements/AlignedLabel';
import { DataStoreID } from '@src/types/enums';
import { DataStore } from '@src/DataStore';
import { PluginData, StoresData } from '@src/types/types';
import { DataStoreManager } from '@src/DataStoreManager';





export class ToolbarWindow extends BaseWindow {
  private readonly _toolButtonGroup : StatefulButtonGroup = new StatefulButtonGroup();

  protected constructor() {
    super(WindowID.TOOLBAR, 'Tileman', 163, undefined);
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
      padding: { top: 0, rest: 1 },
      width: this.getContentWidth()!,
      height: 'auto',
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

    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const toolManager : ToolManager = ToolManager.instance();

    const toolSizeSpinner : FlexUIWidget = spinner({
      padding: { top: 5, bottom: 5, rest: 1},
      width: 62,
      value: toolManager.getToolSizeStore(),
      minimum: plugin.get('minToolSize'),
      maximum: plugin.get('maxToolSize'),
      step: 1,
      wrapMode: 'clamp',
      onChange: (value : number, adjustment : number) : void => {
        toolManager.setToolSize(value);
      },
      format: (value: number) : string => {
        return `${value}x${value}`;
      }
    });

    this.registerElement(ElementID.TOOL_SIZE_SPINNER, toolSizeSpinner);

    return horizontal({
      spacing: 0,
      padding: 0,
      content: [
        toolSizeSpinner,
        buyToolButton.widget,
        rightsToolButton.widget,
        sellToolButton.widget,
        viewRightsButton.widget,
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
          padding: 0,
          width: 24,
          height: 24,
          image: Sprites.BUY_LAND_RIGHTS,
          tooltip: 'Buy land rights',
          onChange: (pressed : boolean) => this.onBuyToolChange(pressed),
        }, this._toolButtonGroup);

        this._toolButtonGroup.addButton(newElement);
        this.registerElement(ElementID.BUY_TOOL, newElement);
        break;
      } case ElementID.RIGHTS_TOOL: {
        newElement = new ToggleButton(ElementID.RIGHTS_TOOL, {
          padding: 0,
          width: 24,
          height: 24,
          image: Sprites.BUY_CONSTRUCTION_RIGHTS,
          tooltip: 'Buy construction rights',
          onChange: (pressed : boolean) => this.onRightsToolChange(pressed),
        }, this._toolButtonGroup);

        this._toolButtonGroup.addButton(newElement);
        this.registerElement(ElementID.RIGHTS_TOOL, newElement);
        break;
      } case ElementID.SELL_TOOL: {
        newElement = new ToggleButton(ElementID.SELL_TOOL, {
          padding: 0,
          width: 24,
          height: 24,
          image: Sprites.FINANCE,
          tooltip: 'Sell land and construction rights',
          onChange: (pressed : boolean) => this.onSellToolChange(pressed),
        }, this._toolButtonGroup);

        this._toolButtonGroup.addButton(newElement);
        this.registerElement(ElementID.SELL_TOOL, newElement);
        break;
      } case ElementID.VIEW_RIGHTS_BUTTON: {
        newElement = new ToggleButton(ElementID.VIEW_RIGHTS_BUTTON, {
          padding: 0,
          width: 24,
          height: 24,
          image: Sprites.SEARCH,
          tooltip: 'Show owned construction rights',
          onChange: (pressed : boolean) => this.onViewRightsChange(pressed),
        });

        this._toolButtonGroup.addButton(newElement);
        this.registerElement(ElementID.VIEW_RIGHTS_BUTTON, newElement);
        break;
      }
    }

    return newElement;
  }

  /**
   * Builds panel to display statistics
   */
  private _buildToolbarStatsPanel() : FlexUIWidget {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const stores : DataStore<StoresData> = dsManager.getInstance(DataStoreID.STORES);

    // Available tiles label
    const availableTilesRow : FlexUIWidget = horizontal({
      spacing: 0,
      padding: 0,
      content: [
        new AlignedLabel(ElementID.NONE, {
          width: 90,
          textAlignment: { horizontal: 'right', vertical: 'center' },
          text: '{BLACK}Available Tiles : ',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          textAlignment: { horizontal: 'left', vertical: 'center' },
          text: this._createStatsLabelStore(ElementID.AVAILABLE_TILES),
        }).widget,
      ],
    });
    
    // Unlocked tiles label
    const spentTilesRow : FlexUIWidget = horizontal({
      spacing: 0,
      padding: 0,
      content: [
        new AlignedLabel(ElementID.NONE, {
          width: 90,
          textAlignment: { horizontal: 'right', vertical: 'center' },
          text: '{BLACK}Tiles Spent : ',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          textAlignment: { horizontal: 'left', vertical: 'center' },
          text: this._createStatsLabelStore(ElementID.UNLOCKED_TILES),
        }).widget,
      ],
    });
    
    // Xp to next tile progress bar
    const xpToNextTileProgressBar : ProgressBar = new ProgressBar(ElementID.EXP_NEXT_PROGRESSBAR, {
      padding: 0,
      height: 16,
      background: Colour.Grey,
      foreground: Colour.LightBlue,
      textAlignment: {
        horizontal: compute<number, HorizontalAlignment>(
          plugin.get('tileXpCost'),
          (tileXpCost : number) : HorizontalAlignment => {
            return tileXpCost === 0 ? 'center' : 'left';
          }
        ),
        vertical: 'center'
      },
      text: this._createStatsLabelStore(ElementID.EXP_NEXT_PROGRESSBAR),
      percentFilled: compute<number, number, number>(
        stores.get('totalXpStore'),
        plugin.get('tileXpCost'),
        (totalXp : number, tileXpCost : number) : number => {
          const xpSinceLastTile : number = totalXp % tileXpCost;
          return xpSinceLastTile / tileXpCost;
      }),
    });
    
    return box({
      padding: { top: 0, rest: 1 },
      content: vertical({
        spacing: 0,
        padding: { right: 1, bottom: 2, rest: 0 },
        content: [
          xpToNextTileProgressBar.widget,
          availableTilesRow,
          spentTilesRow,
        ],
      }),
    });
  }

  /**
   * Create Stores for statistics labels
   * @param id ElementID of element to create Dtore for
   * @returns the Store
   */
  private _createStatsLabelStore(id : ElementID) : Store<string> {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const metrics : DataStore<PluginData> = dsManager.getInstance(DataStoreID.METRICS);
    const stores : DataStore<StoresData> = dsManager.getInstance(DataStoreID.STORES);
    
    let newStore! : Store<string>;

    switch (id) {
      case ElementID.AVAILABLE_TILES: {
        newStore = compute<number, string>(
          stores.get('availableTilesStore'),
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
        newStore = compute<number, string>(
          metrics.get('tilesUsed'),
          (tilesUsed : number) : string => {
            return `{WHITE}${tilesUsed}`;
          }
        );
        break;
      } case ElementID.EXP_TO_NEXT_TILE: {
        newStore = compute<number, number, string>(
          stores.get('totalXpStore'),
          plugin.get('tileXpCost'),
          (totalXp : number, tileXpCost : number) : string => {
              const xpToNextTile : number = tileXpCost - (totalXp % tileXpCost);
              return `{WHITE}${context.formatString('{COMMA16}', xpToNextTile)}`;
          }
        );
        break;
      } case ElementID.EXP_NEXT_PROGRESSBAR: {
        newStore = compute<number, number, string>(
          stores.get('totalXpStore'),
          plugin.get('tileXpCost'),
          (totalXp : number, tileXpCost : number) : string => {
            if (tileXpCost === 0) {
              return `  {RED}I want to get off Mr. Bone's Wild Ride!`;
            } else {
              const xpToNextTile : number = tileXpCost - (totalXp % tileXpCost);
              return `  {WHITE}${context.formatString('{COMMA16}', xpToNextTile)} {BLACK}xp to next`;
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

    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    if (plugin.getValue('keepToolbarOpen')) {
      this.open();
    }
  }

  /**
   * Handle onChange for buy tool button
   * @param isPressed true if the button is pressed
   */
  private onBuyToolChange(isPressed : boolean) : void {
    const toolManager : ToolManager = ToolManager.instance();
    if (isPressed) {
      toolManager.setActiveTool(ToolID.BUY);
    } else {
      toolManager.cancelTool();
    }
  }

  /**
   * Handle onChange for rights tool button
   * @param isPressed true if the button is pressed
   */
  private onRightsToolChange(isPressed : boolean) : void {
    const toolManager : ToolManager = ToolManager.instance();
    if (isPressed) {
      toolManager.setActiveTool(ToolID.RIGHTS);
    } else {
      toolManager.cancelTool();
    }
  }

  /**
   * Handle onChange for sell tool button
   * @param isPressed true if the button is pressed
   */
  private onSellToolChange(isPressed : boolean) : void {
    const toolManager : ToolManager = ToolManager.instance();
    if (isPressed) {
      toolManager.setActiveTool(ToolID.SELL);
    } else {
      toolManager.cancelTool();
    }
  }

  /**
   * Handle onChange for view rights toggle button
   * @param isPressed true if the button is pressed
   */
  private onViewRightsChange(isPressed : boolean) : void {
    const uiManager : UIManager = UIManager.instance();
    uiManager.setRightsVisibility(isPressed);
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