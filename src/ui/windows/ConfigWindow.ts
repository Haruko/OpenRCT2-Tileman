/// <reference path='../../../lib/openrct2.d.ts' />

import { Store, TabCreator, WindowTemplate, WritableStore, button, checkbox, compute, horizontal, label, read, store, tab, tabwindow, textbox, vertical, widget } from 'openrct2-flexui';
import { StatefulButtonGroup } from '../elements/StatefulButtonGroup';
import { BaseWindow } from './BaseWindow';
import { AnimatedSprites, ElementID, WindowID } from '../types/enums';
import { FlexUIWidget } from '../types/types';
import { DoubleClickButton } from '../elements/DoubleClickButton';
import { AlignedLabel } from '../elements/AlignedLabel';
import { PluginData, StoresData } from '@src/types/types';
import { DataStoreID } from '@src/types/enums';
import { DataStore } from '@src/DataStore';
import { DataStoreManager } from '@src/DataStoreManager';
import { Park } from '@src/Park';



export class ConfigWindow extends BaseWindow {
  private readonly _debugButtonGroup : StatefulButtonGroup = new StatefulButtonGroup();
  private readonly _settingsStores : Partial<Record<keyof PluginData, WritableStore<any>>> = {};
  
  protected constructor() {
    super(WindowID.CONFIG, 'Tileman Config');

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
    const configTab : TabCreator = this._buildConfigTab();
    const debugTab : TabCreator = this._buildDebugTab();
  
    return tabwindow({
      title: this.windowTitle,
      width: 380,
      height: 'auto',
      padding: { top: 3, right: 6, bottom: 0, left: 6 },
      startingTab: 0,
      tabs: [
        configTab,
        debugTab,
      ],
      onOpen: this.onOpen.bind(this),
      onUpdate: this.onUpdate.bind(this),
      onClose: this.onClose.bind(this)
    });
  }

  /**
   * Builds the config tab
   */
  private _buildConfigTab() : TabCreator {
    return tab({
      image: AnimatedSprites.RESEARCH,
      content: [
        vertical({
          content: [
            this._buildConfigSettingPanel(),
            this._buildConfigOtherPanel(),
            this._buildConfigButtonPanel(),
            widget({
              type: 'label',
              text: `v${__version} ◀▶ Created by Isoitiro`,
              height: 14,
              textAlign: 'centred',
              disabled: true,
            }),
          ]
        }),
      ]
    });
  }

  /**
   * Makes a panel of other settings that are not in the big list
   */
  private _buildConfigOtherPanel() : FlexUIWidget {
    const keepToolbarOpenCheckbox : FlexUIWidget = this._createConfigCheckbox(ElementID.KEEP_TOOLBAR_OPEN);
    const bypassPathRestrictionCheckbox : FlexUIWidget = this._createConfigCheckbox(ElementID.BYPASS_PATH_RESTRICTIONS);

    return horizontal({
      spacing: 3,
      padding: 0,
      content: [
        keepToolbarOpenCheckbox,
        bypassPathRestrictionCheckbox,
      ],
    });
  }

  /**
   * Creates a checkbox for the config panel
   */
  private _createConfigCheckbox(id : ElementID) : FlexUIWidget {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);

    let element! : FlexUIWidget;

    switch (id) {
      case ElementID.KEEP_TOOLBAR_OPEN: {
        const checkboxStore : WritableStore<boolean> = store(plugin.get('keepToolbarOpen').get());
        const text = 'Keep toolbar open';

        element = checkbox({
          isChecked: { twoway: checkboxStore },
          tooltip: 'Uncheck this box to let the toolbar be closed.',
          text: compute<boolean, boolean, string>(plugin.get('keepToolbarOpen'), checkboxStore,
            (pluginValue : boolean, checkboxValue : boolean) : string => {
              const isChanged : boolean = pluginValue !== checkboxValue;
      
              if (isChanged) {
                return `{TOPAZ}* ${text} *`;
              } else {
                return text;
              }
            }),
        });

        this._settingsStores['keepToolbarOpen'] = checkboxStore;
        this.registerElement(ElementID.KEEP_TOOLBAR_OPEN, element);
        break;
      } case ElementID.BYPASS_PATH_RESTRICTIONS: {
        const checkboxStore : WritableStore<boolean> = store(plugin.get('bypassPathRestrictions').get());
        const text = 'Bypass path restrictions';

        element = checkbox({
          isChecked: { twoway: checkboxStore },
          tooltip: 'Check this to bypass the restrictions on buying and sell land with paths on it.\n{RED}BE CAREFUL!',
          text: compute<boolean, boolean, string>(plugin.get('bypassPathRestrictions'), checkboxStore,
            (pluginValue : boolean, checkboxValue : boolean) : string => {
              const isChanged : boolean = pluginValue !== checkboxValue;
      
              if (isChanged) {
                return `{TOPAZ}* ${text} *`;
              } else {
                return text;
              }
            }),
        });

        this._settingsStores['bypassPathRestrictions'] = checkboxStore;
        this.registerElement(ElementID.BYPASS_PATH_RESTRICTIONS, element);
        break;
      }
    }

    return element;
  }

  /**
   * Makes the list of config option controls for the config tab of the config window
   */
  private _buildConfigSettingPanel() : FlexUIWidget {
    const stores : DataStore<StoresData> = DataStoreManager.instance<DataStoreManager>().getInstance(DataStoreID.STORES);
    
    const shortLineSpacer : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        new AlignedLabel(ElementID.NONE, {
          text: 'E E E E E',
          width: '50%',
          height: 3,
          textAlignment: {
            vertical: 'top',
            horizontal: 'left',
          },
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          text: 'E E E E E',
          width: '25%',
          height: 3,
          textAlignment: {
            vertical: 'top',
            horizontal: 'center',
          },
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          text: 'E E E E E',
          width: '25%',
          height: 3,
          textAlignment: {
            vertical: 'top',
            horizontal: 'right',
          },
        }).widget,
      ]
    });

    const invisibleSpacer : FlexUIWidget = new AlignedLabel(ElementID.NONE, {
      text: '',
      height: 3,
      textAlignment: {
        vertical: 'top',
        horizontal: 'left',
      },
    }).widget;



    // ---XP settings---
    const xpHeaderRow : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        label({
          text: '{BABYBLUE}XP Source',
          width: '50%',
        }),
        label({
          text: '{BABYBLUE}XP Value',
          alignment: 'centred',
          width: '25%',
        }),
        new AlignedLabel(ElementID.NONE, {
          text: '{BABYBLUE}Total',
          width: '25%',
          height: 14,
          padding: { right: 1 },
          textAlignment: {
            horizontal: 'right',
            vertical: 'center'
          },
        }).widget,
      ]
    });

    // Player actions
    const playerActionXpRows : FlexUIWidget[] = [
      this._createConfigRow(ElementID.EXP_PER_BALLOON_POPPED, 'balloonsPoppedXpValue',
        'Balloon popped', 'How much XP earned per balloon popped...\nYou monster...',
        this._createTotalLabelStore(ElementID.EXP_PER_BALLOON_POPPED, stores.get('balloonsPoppedXpStore'))),
      this._createConfigRow(ElementID.EXP_PER_BANNER_PLACED, 'bannersPlacedXpValue',
        'Banner placed', 'How much XP earned per banner placed.\nYes, it\'s deducted when you delete it...',
        this._createTotalLabelStore(ElementID.EXP_PER_BANNER_PLACED, stores.get('bannersPlacedXpStore'))),
    ];

    // Guest actions
    const guestActionXpRows : FlexUIWidget[] = [
      this._createConfigRow(ElementID.EXP_PER_PARK_ADMISSION, 'parkAdmissionXpValue',
        'Park admission', 'How much XP earned per park admission.',
        this._createTotalLabelStore(ElementID.EXP_PER_PARK_ADMISSION, stores.get('parkAdmissionsXpStore'))),
      this._createConfigRow(ElementID.EXP_PER_RIDE_ADMISSION, 'rideAdmissionXpValue',
        'Ride admission', 'How much XP earned per ride admission.',
        this._createTotalLabelStore(ElementID.EXP_PER_RIDE_ADMISSION, stores.get('rideXpStore'))),
      this._createConfigRow(ElementID.EXP_PER_STALL_ADMISSION, 'stallBuyXpValue',
        'Stall purchase', 'How much XP gained per stall purchase.',
        this._createTotalLabelStore(ElementID.EXP_PER_STALL_ADMISSION, stores.get('stallXpStore'))),
      this._createConfigRow(ElementID.EXP_PER_FACILITY_ADMISSION, 'facilityUseXpValue',
        'Facility usage', 'How much XP gained per facility usage.\nIncludes: Toilets, Information Kiosk, Cash Machine, and First Aid.',
        this._createTotalLabelStore(ElementID.EXP_PER_FACILITY_ADMISSION, stores.get('facilityXpStore'))),
    ];
    
    // Staff actions
    const staffActionXpRows : FlexUIWidget[] = [
      // // Handyman
      // this._createConfigRow(ElementID.EXP_PER_LAWN_MOWED, 'lawnsMownXpValue',
      //   'Lawn mowed', 'How much XP earned per lawn tile mowed by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_LAWN_MOWED, lawnsMownXpStore)),
      // this._createConfigRow(ElementID.EXP_PER_GARDEN_WATERED, 'gardensWateredXpValue',
      //   'Garden watered', 'How much XP earned per garden watered by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_GARDEN_WATERED, gardensWateredXpStore)),
      // this._createConfigRow(ElementID.EXP_PER_TRASH_SWEPT, 'trashSweptXpValue',
      //   'Trash swept', 'How much XP earned per piece of trash swept up by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_TRASH_SWEPT, trashSweptXpStore)),
      // this._createConfigRow(ElementID.EXP_PER_TRASH_CAN_EMPTIED, 'trashCansEmptiedXpValue',
      //   'Trash can emptied', 'How much XP earned per trash can emptied by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_TRASH_CAN_EMPTIED, trashCansEmptiedXpStore)),
      // spacer,
  
      // // Mechanic
      // this._createConfigRow(ElementID.EXP_PER_RIDE_INSPECTED, 'ridesInspectedXpValue',
      //   'Ride inspected', 'How much XP earned per ride inspected by mechanics.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_RIDE_INSPECTED, ridesInspectedXpStore)),
      // this._createConfigRow(ElementID.EXP_PER_RIDE_FIXED, 'ridesFixedXpValue',
      //   'Ride fixed', 'How much XP earned per ride fixed by mechanics.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_RIDE_FIXED, ridesFixedXpStore)),
      // spacer,
      
      // // Security
      // this._createConfigRow(ElementID.EXP_PER_VANDAL_STOPPED, 'vandalsStoppedXpValue',
      //   'Vandal stopped', 'How much XP earned per vandal stopped by security.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_VANDAL_STOPPED, vandalsStoppedXpStore)),
      // shortLineSpacer,
    ];

    // Park data
    const parkDataXpRows : FlexUIWidget[] = [
      // this._createConfigRow(ElementID.EXP_PER_PARK_AWARD, 'parkAwardsXpValue',
      //   'Park award', 'How much XP earned per park award earned.\nThis is historical. If you lose an award, it will still count.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_PARK_AWARD, parkAwardsXpStore)),
      // this._createConfigRow(ElementID.EXP_PER_MARKETING_CAMPAIGN, 'marketingCampaignsRunXpValue',
      //   context.formatString('Marketing campaign (per {CURRENCY})', 500),
      //   context.formatString('How much XP earned per marketing campaign run per week.\n{CURRENCY} is 4 times and {CURRENCY} is 7 times this value.', 2000, 3500),
      //   this._createTotalLabelStore(ElementID.EXP_PER_MARKETING_CAMPAIGN, marketingCampaignsRunXpStore)),
    ];

    const totalXpRow : FlexUIWidget = horizontal({
      spacing: 0,
      content: [
        label({
          text: '',
          width: '50%',
        }),
        new AlignedLabel(ElementID.NONE, {
          text: '{BLACK}Total XP Earned',
          width: '25%',
          height: 14,
          textAlignment: {
            horizontal: 'right',
            vertical: 'center'
          },
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          text: compute<number, string>(stores.get('totalXpStore'), (totalXp : number) : string => context.formatString('{COMMA16} {BLACK}xp', totalXp)),
          width: '25%',
          height: 14,
          padding: { right: 1 },
          textAlignment: {
            horizontal: 'right',
            vertical: 'center'
          },
        }).widget,
      ]
    });

    const xpRows : FlexUIWidget[] = [
      xpHeaderRow,
      ...playerActionXpRows,
      shortLineSpacer,
      ...guestActionXpRows,
      // shortLineSpacer,
      ...staffActionXpRows,
      // shortLineSpacer,
      ...parkDataXpRows,
      totalXpRow,
    ];



    // ---Other settings---
    const otherRows : FlexUIWidget[] = [
      this._createConfigRow(ElementID.EXP_PER_TILE, 'tileXpCost',
        'Tile XP cost', 'How much XP each tile costs.',
        this._createTotalLabelStore(ElementID.EXP_PER_TILE, stores.get('availableTilesStore'))),
      this._createConfigRow(ElementID.MIN_TILES, 'startingTiles',
        'Starting tiles', 'How many free tiles you start with.'),
      shortLineSpacer,
      
      this._createConfigRow(ElementID.TICKS_PER_UPDATE, 'ticksPerUpdate',
        'Game ticks per update', 'How frequently the plugin updates statistics.\nIncrease this if large parks start to lag.'),
    ];

    return vertical({
      content: [
        ...xpRows,
        invisibleSpacer,
        ...otherRows,
      ],
    });
  }

  /**
   * Creates a label store for totals in a row
   * @param id ID for element we're making a label store for
   * @param valueStore A store that gives how much total should be displayed
   */
  private _createTotalLabelStore(id : ElementID, valueStore : Store<number>) : Store<string> {
    switch (id) {
      case ElementID.EXP_PER_TILE: {
        return compute<number, string>(valueStore,
          (tilesEarned : number) : string => {
            if (tilesEarned === Infinity) {
              return '{RED}rosebud;!;!;!;!;!...';
            } else {
              return context.formatString('{COMMA16} {BLACK}tiles', tilesEarned);
            }
          }
        );
      } default: {
        return compute<number, string>(valueStore,
          (value : number) : string => {
            return context.formatString('{COMMA16} {BLACK}xp', value);
          }
        );
      }
    }
  }
  
  /**
   * Creates row for config options with a text label and a textbox
   * @param id ElementID of row to make
   * @param key Key for Plugin.get()
   * @param labelText String to show in the label
   * @param tooltip Tooltip for hovering over
   * @param totalLabelText A Store<string> to compute the total XP label
   * @returns The row
   */
  private _createConfigRow(id : ElementID, key : keyof PluginData, labelText : string, tooltip : string, totalLabelText? : Store<string>) : FlexUIWidget {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const pluginStore = dsManager.getInstance(DataStoreID.PLUGIN).get(key);

    // Make the textbox
    const defaultValue : string = read(pluginStore) + '';
    const textStore : WritableStore<string> = store<string>(defaultValue);

    this._settingsStores[key] = textStore;
    
    const newTextbox : FlexUIWidget = textbox({
      width: '25%',
      padding: 0,
      text: { twoway : textStore },
      tooltip: tooltip,
      maxLength: 9,
      onChange: (text : string) : void => {
        // Filter out non-numbers and remove leading zeroes
        let value : number = Number(text.replace(/[^\d]+/g, ''))
        
        // Minimum of 1 tick per update
        if (id === ElementID.TICKS_PER_UPDATE) {
          value = Math.max(value, 1);
        }
        
        // Update the store if the value is different
        if (value.toString() !== text) {
          textStore.set(value.toString());
        }
      },
    });

    this.registerElement(id, newTextbox);

    // Make the labels
    const rowLabel : FlexUIWidget = label({
      text: compute<number, string, string>(pluginStore, textStore, (pluginValue : number, textboxValue : string) : string => {
        const isChanged : boolean = pluginValue !== Number(textboxValue);

        if (isChanged) {
          return `{TOPAZ}* ${labelText} *`;
        } else {
          return labelText;
        }
      }),
      tooltip: tooltip,
      width: '50%',
    });

    const totalLabel : AlignedLabel = new AlignedLabel(id, {
        text: totalLabelText ?? '',
        width: '25%',
        height: 14,
        padding: { right: 1 },
        textAlignment: {
          horizontal: 'right',
          vertical: 'center'
        },
    });

    return horizontal({
      spacing: 0,
      content: [
        rowLabel,
        newTextbox,
        totalLabel.widget,
      ]
    });
  }

  /**
   * Adds buttons to bottom of the config panel
   */
  private _buildConfigButtonPanel() : FlexUIWidget {
    const defaultsButton : FlexUIWidget = button({
      text: 'Defaults',
      width: '25%',
      height: 14,
      padding: { right: '25%' },
      onClick: this.onDefaultsButtonClick.bind(this),
    });
    this.registerElement(ElementID.CONFIG_DEFAULTS, defaultsButton);

    const revertButton : FlexUIWidget = button({
      text: 'Revert',
      width: '25%',
      height: 14,
      onClick: this.onRevertButtonClick.bind(this),
    });
    this.registerElement(ElementID.CONFIG_REVERT, revertButton);

    const saveButton : FlexUIWidget = button({
      text: 'Save',
      width: '25%',
      height: 14,
      onClick: this.onSaveButtonClick.bind(this),
    });
    this.registerElement(ElementID.CONFIG_SAVE, saveButton);

    return vertical({
      content: [
        label({
          text: '{BABYBLUE}Changes are only permanent after saving the map!',
          alignment: 'centred',
        }),
        horizontal({
          content: [
            defaultsButton,
            revertButton,
            saveButton,
          ],
        }),
      ],
    });
  }

  /**
   * Creates element for config options
   * @returns The element
   */
  
  /**
   * Builds the debug tab
   */
  private _buildDebugTab() : TabCreator {
    const buttonPanel = this._buildDebugButtonPanel();
  
    return tab({
      image: AnimatedSprites.WRENCH,
      content: [
        vertical({
          spacing: 2,
          padding: 0,
          content: [
            label({
              text: '{WHITE}Debug',
              height: 14,
              alignment: 'centred',
            }),
            buttonPanel
          ]
        })
      ]
    });
  }

  /**
   * Builds debug button panel
   */
  private _buildDebugButtonPanel() : FlexUIWidget {
    const fireStaffButton : DoubleClickButton = this._createDebugButton(ElementID.FIRE_STAFF_BUTTON);
    const deleteGuestsButton : DoubleClickButton = this._createDebugButton(ElementID.DELETE_GUESTS_BUTTON);
    const deleteRidesButton : DoubleClickButton = this._createDebugButton(ElementID.DELETE_RIDES_BUTTON);
    const clearPathsButton : DoubleClickButton = this._createDebugButton(ElementID.CLEAR_PATHS_BUTTON);

    const instructionLabel = label({
      text: '{WHITE}Double click to use buttons',
      alignment: 'centred',
      height: 14
    });
  
    return vertical({
      spacing: 2,
      padding: 0,
      content: [
        horizontal({
          spacing: 3,
          padding: 0,
          content: [
            fireStaffButton.widget,
            deleteGuestsButton.widget,
            deleteRidesButton.widget,
          ]
        }),
        horizontal({
          spacing: 3,
          padding: 0,
          content: [
            clearPathsButton.widget,
          ]
        }),
        instructionLabel
      ]
    });
  }

  /**
   * Creates buttons for debug button panel
   * @param id ElementID of element to make
   * @returns The element
   */
  private _createDebugButton(id : ElementID) : DoubleClickButton {
    let newElement! : DoubleClickButton;

    switch (id) {
      case ElementID.FIRE_STAFF_BUTTON: {
        newElement = new DoubleClickButton(ElementID.FIRE_STAFF_BUTTON, {
          text: 'Fire Staff',
          tooltip: 'Fires all staff',
          width: '33%',
          height: 14,
          onChange: this.onFireStaffChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.FIRE_STAFF_BUTTON, newElement);
        break;
      } case ElementID.DELETE_GUESTS_BUTTON: {
        newElement = new DoubleClickButton(ElementID.DELETE_GUESTS_BUTTON, {
          text: 'Delete Guests',
          tooltip: 'Deletes the guests inside the park',
          width: '33%',
          height: 14,
          onChange: this.onDeleteGuestsChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.DELETE_GUESTS_BUTTON, newElement);
        break;
      } case ElementID.DELETE_RIDES_BUTTON: {
        newElement = new DoubleClickButton(ElementID.DELETE_RIDES_BUTTON, {
          text: 'Delete Rides',
          tooltip: 'Deletes all rides from the park and removes their stats from exp calculation',
          width: '33%',
          height: 14,
          onChange: this.onDeleteRidesChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.DELETE_RIDES_BUTTON, newElement);
        break;
      } case ElementID.CLEAR_PATHS_BUTTON: {
        newElement = new DoubleClickButton(ElementID.CLEAR_PATHS_BUTTON, {
          text: 'Delete Paths',
          tooltip: 'Deletes all paths inside the park',
          width: '33%',
          height: 14,
          onChange: this.onClearPathsChange.bind(this)
        }, this._debugButtonGroup);

        this._debugButtonGroup.addButton(newElement);
        this.registerElement(ElementID.CLEAR_PATHS_BUTTON, newElement);
        break;
      }
    }

    return newElement;
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
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  private onFireStaffChange(isPressed : boolean) : void {
    Park.instance<Park>().fireStaff();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  private onDeleteGuestsChange(isPressed : boolean) : void {
    Park.instance<Park>().deleteGuests();
  }

  /**
   * Handles clicks on fire staff button
   * @param isPressed whether the button is pressed or not
   */
  private onDeleteRidesChange(isPressed : boolean) : void {
    Park.instance<Park>().deleteRides();
  }

  /**
   * Handles clicks on clear paths button
   * @param isPressed whether the button is pressed or not
   */
  private onClearPathsChange(isPressed : boolean) : void {
    Park.instance<Park>().clearPaths();
  }

  /**
   * Handles clicks on config defaults button
   */
  private onDefaultsButtonClick() : void {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const keys : (keyof PluginData)[] = Object.keys(this._settingsStores);

    // Reset Plugin values to defaults
    plugin.loadDefaults();

    // Set all settings back to default values
    keys.forEach((key : keyof PluginData) : void => {
      const pluginStore : WritableStore<any> = plugin.get(key);
      const pluginValue : any = pluginStore.get();

      const fieldStore : WritableStore<any> = <WritableStore<any>>this._settingsStores[key];
      if (typeof pluginValue === 'number') {
        fieldStore.set(pluginValue + '');
      } else {
        fieldStore.set(pluginValue);
      }
    });
    
    // Store data after
    plugin.storeData();
  }

  /**
   * Handles clicks on config revert button
   */
  private onRevertButtonClick() : void {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const keys : (keyof PluginData)[] = Object.keys(this._settingsStores);

    // Set all settings back to Plugin.get() value
    keys.forEach((key : keyof PluginData) : void => {
      const pluginStore : WritableStore<any> = plugin.get(key);
      const pluginValue : any = pluginStore.get();

      const fieldStore : WritableStore<any> = <WritableStore<any>>this._settingsStores[key];
      if (typeof pluginValue === 'number') {
        fieldStore.set(pluginValue + '');
      } else {
        fieldStore.set(pluginValue);
      }
    });
  }

  /**
   * Handles clicks on config save button
   */
  private onSaveButtonClick() : void {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const keys : (keyof PluginData)[] = Object.keys(this._settingsStores);
    
    // Save all settings with Plugin.set
    keys.forEach((key : keyof PluginData) : void => {
      const pluginStore : WritableStore<any> = plugin.get(key);
      const pluginValue : any = pluginStore.get();

      const fieldValue : any = read(this._settingsStores[key]);
      if (typeof pluginValue === 'number') {
        pluginStore.set(Number(fieldValue));
      } else {
        pluginStore.set(fieldValue);
      }
    });
    
    // Store data after
    plugin.storeData();
  }
}