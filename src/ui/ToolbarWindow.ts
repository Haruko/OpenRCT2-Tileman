/// <reference path='../../lib/openrct2.d.ts' />

import { Colour, Store, WindowTemplate, box, compute, horizontal, label, spinner, vertical, window } from "openrct2-flexui";
import { ButtonID, FlexUIWidget, Sprites, ToggleButtonID, onButtonClick } from "../ui";
import { computeTilesAvailable, getParkDataStores, getPluginConfig } from "../data";
import { ToggleButton } from "./ToggleButton";
import { getToolSize, setToolSize } from "../tool";
import { StatefulButtonGroup } from "./ToggleButtonGroup";
import { progressbar } from "./flexui-extenson";
import { TilemanWindow } from "./TilemanWindow";

const PluginConfig = getPluginConfig();
const ParkDataStores = getParkDataStores();





export class ToolbarWindow extends TilemanWindow {
  private readonly toolButtonGroup : StatefulButtonGroup = new StatefulButtonGroup();

  protected readonly uiElementsMap : Readonly<Record<ButtonID, ToggleButton | FlexUIWidget>> = {
    [ButtonID.BUY_TOOL]: this._createUIElement(ButtonID.BUY_TOOL),
    [ButtonID.RIGHTS_TOOL]: this._createUIElement(ButtonID.RIGHTS_TOOL),
    [ButtonID.SELL_TOOL]: this._createUIElement(ButtonID.SELL_TOOL),
    [ButtonID.VIEW_RIGHTS_BUTTON]: this._createUIElement(ButtonID.VIEW_RIGHTS_BUTTON),
    [ButtonID.OPEN_STATS_BUTTON]: this._createUIElement(ButtonID.OPEN_STATS_BUTTON),
    [ButtonID.TOOL_SIZE_SPINNER]: this._createUIElement(ButtonID.TOOL_SIZE_SPINNER),
  };

  constructor() {
    super(PluginConfig.toolbarWindowTitle);
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
      title: PluginConfig.toolbarWindowTitle,
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
   * Builds panel to store buttons in toolbar window
   */
  private _buildToolbarButtonPanel() : FlexUIWidget {
    return horizontal({
      spacing: 0,
      padding: [0, 3],
      content: [
        this.uiElementsMap[ButtonID.TOOL_SIZE_SPINNER] as FlexUIWidget,
        (this.uiElementsMap[ButtonID.BUY_TOOL] as ToggleButton).widget,
        (this.uiElementsMap[ButtonID.RIGHTS_TOOL] as ToggleButton).widget,
        (this.uiElementsMap[ButtonID.SELL_TOOL] as ToggleButton).widget,
        (this.uiElementsMap[ButtonID.VIEW_RIGHTS_BUTTON] as ToggleButton).widget,
        (this.uiElementsMap[ButtonID.OPEN_STATS_BUTTON] as ToggleButton).widget,
      ]
    });
  }

  /**
   * Builds panel to display statistics in toolbar window
   */
  private _buildToolbarStatsPanel() : FlexUIWidget {
    // Available tiles label
    // TODO: simplify to be based on a computed tilesAvailable number only
    const availableTilesText : Store<string> = compute<number, number, string>(ParkDataStores.totalExp, ParkDataStores.tilesUsed,
      (totalExp : number, tilesUsed : number) : string => {
        const availableTiles : number = computeTilesAvailable();
        const textColor : string = (availableTiles === 0) ? 'RED' : 'BABYBLUE';
  
        return `{${textColor}}${context.formatString('{COMMA16}', availableTiles)}`;
      }
    );

    const availableTilesLabel = horizontal({
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
    const expToNextTileText : Store<string> = compute<number, string>(ParkDataStores.totalExp,
      (totalExp : number) : string => {
          const expToNextTile : number = PluginConfig.expPerTile - (totalExp % PluginConfig.expPerTile);
          return `{WHITE}${context.formatString('{COMMA16}', expToNextTile)}`;
      }
    );
    
    const expToNextTileLabel = horizontal({
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
    const expToNextTilePercent : Store<number> = compute<number, number>(ParkDataStores.totalExp,
      (totalExp : number) : number => {
        const expSinceLastTile : number = totalExp % PluginConfig.expPerTile;
        return expSinceLastTile / PluginConfig.expPerTile;
      }
    );
    
    const expToNextTileBarForeground : Store<Colour> = compute<number, Colour>(ParkDataStores.totalExp,
      (totalExp : number) : Colour => {
        const expSinceLastTile : number = totalExp % PluginConfig.expPerTile;
        const percent : number = expSinceLastTile / PluginConfig.expPerTile;
  
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

    const expToNextTileProgressBar = progressbar({
      width: '1w',
      height: 10,
      background: Colour.Grey,
      foreground: expToNextTileBarForeground,
      percentFilled: expToNextTilePercent
    });
    
    // Unlocked tiles label
    const unlockedTilesText : Store<string> = compute<number, string>(ParkDataStores.tilesUsed,
      (tilesUsed : number) : string => {
        return `{WHITE}${tilesUsed}`;
      }
    );

    const unlockedTilesLabel = horizontal({
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
          expToNextTileProgressBar
        ]
      })
    });
  }

  /**
   * Creates buttons, ToggleButtons, DoubleClickButtons, and other singular UI controls
   * @param buttonId 
   * @returns 
   */
  private _createUIElement(buttonId : ButtonID) : ToggleButton | FlexUIWidget {
    let newElement : ToggleButton | FlexUIWidget;

    switch (buttonId) {
      case ButtonID.BUY_TOOL: {
        newElement = new ToggleButton(ButtonID.BUY_TOOL, {
          image: Sprites.BUY_LAND_RIGHTS,
          tooltip: 'Buy land rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => onButtonClick(ButtonID.BUY_TOOL, pressed),
        }, this.toolButtonGroup);

        this.toolButtonGroup.addButton(newElement);
        break;
      } case ButtonID.RIGHTS_TOOL: {
        newElement = new ToggleButton(ButtonID.RIGHTS_TOOL, {
          image: Sprites.BUY_CONSTRUCTION_RIGHTS,
          tooltip: 'Buy construction rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => onButtonClick(ButtonID.RIGHTS_TOOL, pressed),
        }, this.toolButtonGroup);

        this.toolButtonGroup.addButton(newElement);
        break;
      } case ButtonID.SELL_TOOL: {
        newElement = new ToggleButton(ButtonID.SELL_TOOL, {
          image: Sprites.FINANCE,
          tooltip: 'Sell land and construction rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => onButtonClick(ButtonID.SELL_TOOL, pressed),
        }, this.toolButtonGroup);

        this.toolButtonGroup.addButton(newElement);
        break;
      } case ButtonID.VIEW_RIGHTS_BUTTON: {
        newElement = new ToggleButton(ButtonID.VIEW_RIGHTS_BUTTON, {
          image: Sprites.SEARCH,
          tooltip: 'Show owned construction rights',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => onButtonClick(ButtonID.VIEW_RIGHTS_BUTTON, pressed),
        });

        break;
      } case ButtonID.OPEN_STATS_BUTTON: {
        newElement = new ToggleButton(ButtonID.OPEN_STATS_BUTTON, {
          image: Sprites.GRAPH,
          tooltip: 'Open detailed statistics window',
          width: 24,
          height: 24,
          onChange: (pressed : boolean) => onButtonClick(ButtonID.OPEN_STATS_BUTTON, pressed),
        });

        break;
      } case ButtonID.TOOL_SIZE_SPINNER: {
        newElement = spinner({
          width: 62,
          padding: 5,
          value: getToolSize(),
          minimum: PluginConfig.minToolSize,
          maximum: PluginConfig.maxToolSize + 1,
          step: 1,
          wrapMode: 'clamp',
          onChange: (value: number, adjustment: number) : void => {
            setToolSize(value);
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
  protected onOpen() : void {

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
  protected onClose() : void {
    this.open();
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

  /**
   * Gets a ToggleButton from the UI map
   * @param buttonId ToggleButtonID to get instance of
   * @returns ToggleButton instance
   */
  getToggleButton(buttonId : ToggleButtonID) : ToggleButton {
    return this.uiElementsMap[buttonId] as ToggleButton;
  }
}