import { Store, TabCreator, WritableStore, button, checkbox, compute, horizontal, isStore, label, read, store, tab, textbox, vertical } from 'openrct2-flexui';
import { BaseTab } from './BaseTab';
import { IWindow } from '../IWindow';
import { AnimatedSprites, ElementID } from '@src/ui/types/enums';
import { FlexUIWidget } from '@src/ui/types/types';
import { AlignedLabel } from '@src/ui/elements/AlignedLabel';
import { DataStoreManager } from '@src/DataStoreManager';
import { DataStoreID } from '@src/types/enums';
import { MetricData, PluginData, StoresData } from '@src/types/types';
import { DataStore } from '@src/DataStore';
import { DoubleClickButton } from '@src/ui/elements/DoubleClickButton';
import { Separator } from '@src/ui/elements/Separator';

export class ConfigTab extends BaseTab {
  // Base value for ConfigWindow contentWidth (460)
  private readonly columnWidths : number[] = [
    175, // Row label
    100, // Count
     85, // Textbox
    100, // Total
  ];

  // Add 3x to ConfigWindow contentWidth (460+6)
  private readonly columnSpacing : number = 2;

  private _settingsStores! : Partial<Record<keyof PluginData, WritableStore<any>>>;

  private get settingsStores() : Partial<Record<keyof PluginData, WritableStore<any>>> {
    return this._settingsStores;
  }

  private set settingsStores(stores : Partial<Record<keyof PluginData, WritableStore<any>>>) {
    if (typeof this._settingsStores === 'undefined') {
      this._settingsStores = stores;
    } else {
      throw 'Reassigning readonly value.';
    }
  }

  constructor(parent : IWindow) {
    super(parent);

    this.template = this._buildTemplate();
  }
  
  /**
   * **********
   * Template Construction
   * **********
   */

  /**
   * Builds the template for initialization
   * @returns Template of type TabCreator
   */
  protected _buildTemplate() : TabCreator {
    this.settingsStores = {};
    
    return tab({
      padding: 0,
      image: AnimatedSprites.RESEARCH,
      content: [
        vertical({
          spacing: 5,
          padding: 0,
          width: this.parent.getContentWidth()!,
          content: [
            this._buildConfigSettingPanel(),
            this._buildConfigOtherPanel(),
            label({
              padding: 0,
              alignment: 'centred',
              text: '{BABYBLUE}Changes are only permanent after saving the map!',
            }),
            this._buildConfigButtonPanel(),
            label({
              padding: 0,
              width: this.parent.getContentWidth()!,
              disabled: true,
              alignment: 'centred',
              text: `v${__version} ◀▶ Created by Isoitiro`,
            }),
          ]
        }),
      ]
    });
  }

  /**
   * Makes the list of config option controls for the config tab of the config window
   */
  private _buildConfigSettingPanel() : FlexUIWidget {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const stores : DataStore<StoresData> = dsManager.getInstance(DataStoreID.STORES);
    const plugin : DataStore<MetricData> = dsManager.getInstance(DataStoreID.PLUGIN);
    
    const separator : FlexUIWidget = horizontal({
      width: this.parent.getContentWidth()!,
      height: 5,
      spacing: this.columnSpacing,
      padding: 0,
      content: [
        new Separator({
          padding: 0,
          width: this.columnWidths[0],
          height: 5,

          alignment: { horizontal: 'left', vertical: 'center' },
          separatorStyle: 'dashed',
          lineStyle: 'flat',
          lineLength: this.columnWidths[0] * 0.75,
          lineThickness: 1,
          dashLength: 5,
          dashSpacing: 5,
        }).widget,
        new Separator({
          padding: 0,
          width: this.columnWidths[1],
          height: 5,

          alignment: { horizontal: 'right', vertical: 'center' },
          separatorStyle: 'dashed',
          lineStyle: 'flat',
          lineLength: this.columnWidths[1] * 0.75,
          lineThickness: 1,
          dashLength: 5,
          dashSpacing: 5,
        }).widget,
        new Separator({
          padding: 0,
          width: this.columnWidths[2],
          height: 5,

          alignment: { horizontal: 'center', vertical: 'center' },
          separatorStyle: 'dashed',
          lineStyle: 'flat',
          lineLength: this.columnWidths[2] * 0.65,
          lineThickness: 1,
          dashLength: 5,
          dashSpacing: 5,
        }).widget,
        new Separator({
          padding: 0,
          width: this.columnWidths[3],
          height: 5,

          alignment: { horizontal: 'right', vertical: 'center' },
          separatorStyle: 'dashed',
          lineStyle: 'flat',
          lineLength: this.columnWidths[3] * 0.75,
          lineThickness: 1,
          dashLength: 5,
          dashSpacing: 5,
        }).widget,
      ]
    });

    // ---XP settings---
    const headerRow : FlexUIWidget = horizontal({
      width: this.parent.getContentWidth()!,
      spacing: this.columnSpacing,
      padding: 0,
      content: [
        new AlignedLabel(ElementID.NONE, {
          padding: 0,
          width: this.columnWidths[0],
          text: '{BABYBLUE}XP Source',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          padding: 0,
          width: this.columnWidths[1],
          textAlignment: { horizontal: 'right', vertical: 'center' },
          text: '{BABYBLUE}Count',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          padding: 0,
          width: this.columnWidths[2],
          textAlignment: { horizontal: 'center', vertical: 'center' },
          text: '{BABYBLUE}XP Value',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          padding: { top: 0, bottom: 0, left: 0, right: 1 },
          width: this.columnWidths[3],
          textAlignment: { horizontal: 'right', vertical: 'center' },
          text: '{BABYBLUE}Total',
        }).widget,
      ]
    });

    // Player actions
    const playerActionXpRows : FlexUIWidget[] = [
      this._createConfigRow(ElementID.EXP_PER_BALLOON_POPPED,
        'balloonsPoppedXpValue',
        'Balloon popped',
        'How much XP earned per balloon popped...\nYou monster...',
        this._createTotalLabelStore(ElementID.EXP_PER_BALLOON_POPPED, stores.get('balloonsPoppedXpStore')),
        'balloonsPopped'
      ),

      this._createConfigRow(ElementID.EXP_PER_BANNER_PLACED,
        'bannersPlacedXpValue',
        'Banner placed',
        'How much XP earned per banner placed.\nYes, it\'s deducted when you delete it...',
        this._createTotalLabelStore(ElementID.EXP_PER_BANNER_PLACED, stores.get('bannersPlacedXpStore')),
        'bannersPlaced'
      ),
    ];

    // Guest actions
    const guestActionXpRows : FlexUIWidget[] = [
      separator,

      this._createConfigRow(ElementID.EXP_PER_PARK_ADMISSION,
        'parkAdmissionXpValue',
        'Park admission',
        'How much XP earned per park admission.',
        this._createTotalLabelStore(ElementID.EXP_PER_PARK_ADMISSION, stores.get('parkAdmissionsXpStore')),
        'parkAdmissions'
      ),
      
      this._createConfigRow(ElementID.EXP_PER_RIDE_ADMISSION,
        'rideAdmissionXpValue',
        'Ride admission',
        'How much XP earned per ride admission.',
        this._createTotalLabelStore(ElementID.EXP_PER_RIDE_ADMISSION, stores.get('rideXpStore')),
        compute<number, number, number>(
          plugin.get('rideAdmissionXpValue'),
          stores.get('rideXpStore'),
          (rideAdmissionXpValue : number, rideXp : number) : number => {
            return rideXp / rideAdmissionXpValue;
          }
        )
      ),

      this._createConfigRow(ElementID.EXP_PER_STALL_ADMISSION,
        'stallBuyXpValue',
        'Stall purchase',
        'How much XP gained per stall purchase.',
        this._createTotalLabelStore(ElementID.EXP_PER_STALL_ADMISSION, stores.get('stallXpStore')),
        compute<number, number, number>(
          plugin.get('stallBuyXpValue'),
          stores.get('stallXpStore'),
          (stallBuyXpValue : number, stallXp : number) : number => {
            return stallXp / stallBuyXpValue;
          }
        )
      ),

      this._createConfigRow(ElementID.EXP_PER_FACILITY_ADMISSION,
        'facilityUseXpValue',
        'Facility usage',
        'How much XP gained per facility usage.\nIncludes: Toilets, Information Kiosk, Cash Machine, and First Aid.',
        this._createTotalLabelStore(ElementID.EXP_PER_FACILITY_ADMISSION, stores.get('facilityXpStore')),
        compute<number, number, number>(
          plugin.get('facilityUseXpValue'),
          stores.get('facilityXpStore'),
          (facilityUseXpValue : number, facilityXp : number) : number => {
            return facilityXp / facilityUseXpValue;
          }
        )
      ),
    ];
    
    // Staff actions
    const staffActionXpRows : FlexUIWidget[] = [
      // shortLineSeparator,

      // // Handyman
      // this._createConfigRow(ElementID.EXP_PER_LAWN_MOWED,
      //   'lawnsMownXpValue',
      //   'Lawn mowed',
      //   'How much XP earned per lawn tile mowed by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_LAWN_MOWED, stores.get('lawnsMownXpStore'))
      // ),

      // this._createConfigRow(ElementID.EXP_PER_GARDEN_WATERED,
      //   'gardensWateredXpValue',
      //   'Garden watered',
      //   'How much XP earned per garden watered by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_GARDEN_WATERED, stores.get('gardensWateredXpStore'))
      // ),

      // this._createConfigRow(ElementID.EXP_PER_TRASH_SWEPT,
      //   'trashSweptXpValue',
      //   'Trash swept',
      //   'How much XP earned per piece of trash swept up by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_TRASH_SWEPT, stores.get('trashSweptXpStore'))
      // ),

      // this._createConfigRow(ElementID.EXP_PER_TRASH_CAN_EMPTIED,
      //   'trashCansEmptiedXpValue',
      //   'Trash can emptied',
      //   'How much XP earned per trash can emptied by handymen.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_TRASH_CAN_EMPTIED, stores.get('trashCansEmptiedXpStore'))
      // ),

      // // Mechanic
      // shortLineSeparator,

      // this._createConfigRow(ElementID.EXP_PER_RIDE_INSPECTED,
      //   'ridesInspectedXpValue',
      //   'Ride inspected',
      //   'How much XP earned per ride inspected by mechanics.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_RIDE_INSPECTED, stores.get('ridesInspectedXpStore'))
      // ),

      // this._createConfigRow(ElementID.EXP_PER_RIDE_FIXED,
      //   'ridesFixedXpValue',
      //   'Ride fixed',
      //   'How much XP earned per ride fixed by mechanics.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_RIDE_FIXED, stores.get('ridesFixedXpStore'))
      // ),

      // // Security
      // shortLineSeparator,

      // this._createConfigRow(ElementID.EXP_PER_VANDAL_STOPPED,
      //   'vandalsStoppedXpValue',
      //   'Vandal stopped',
      //   'How much XP earned per vandal stopped by security.',
      //   this._createTotalLabelStore(ElementID.EXP_PER_VANDAL_STOPPED, stores.get('vandalsStoppedXpStore'))
      // ),
    ];

    // Park data
    const parkDataXpRows : FlexUIWidget[] = [
      separator,
      // Awards
      this._createConfigRow(ElementID.EXP_PER_PARK_AWARD_POSITIVE,
        'parkAwardsPositiveXpValue',
        'Park award - {GREEN}Positive',
        'How much XP earned per positive park award earned.',
        this._createTotalLabelStore(ElementID.EXP_PER_PARK_AWARD_POSITIVE, stores.get('parkAwardsPositiveXpStore')),
        'parkAwardsPositive'
      ),
      
      this._createConfigRow(ElementID.EXP_PER_PARK_AWARD_NEGATIVE,
        'parkAwardsNegativeXpValue',
        'Park award - {RED}Negative',
        'How much XP earned per negative park award earned.',
        this._createTotalLabelStore(ElementID.EXP_PER_PARK_AWARD_NEGATIVE, stores.get('parkAwardsNegativeXpStore')),
        'parkAwardsNegative'
      ),

      // Disasters
      this._createConfigRow(ElementID.EXP_PER_GUEST_DROWNED,
        'guestsDrownedXpValue',
        'Guest drowned',
        'How much XP earned for each drowned guest.',
        this._createTotalLabelStore(ElementID.EXP_PER_GUEST_DROWNED, stores.get('guestsDrownedXpStore')),
        'guestsDrowned'
      ),
      
      this._createConfigRow(ElementID.EXP_PER_STAFF_DROWNED,
        'staffDrownedXpValue',
        'Staff drowned',
        'How much XP earned for each drowned staff.',
        this._createTotalLabelStore(ElementID.EXP_PER_STAFF_DROWNED, stores.get('staffDrownedXpStore')),
        'staffDrowned'
      ),

      this._createConfigRow(ElementID.EXP_PER_VEHICLE_CRASH,
        'vehicleCrashesXpValue',
        'Vehicle crash {BABYBLUE}(per car)',
        'How much XP earned for vehicle crashes.\nA vehicle with 5 cars gives 5 crashes.',
        this._createTotalLabelStore(ElementID.EXP_PER_VEHICLE_CRASH, stores.get('vehicleCrashesXpStore')),
        'vehicleCrashes'
      ),

      // Other
      this._createConfigRow(ElementID.EXP_PER_MARKETING_CAMPAIGN_SPENT,
        'marketingCampaignsSpentXpValue',
        context.formatString('Marketing campaign {BABYBLUE}(per {CURRENCY})', 500),
        context.formatString('How much XP earned per {CURRENCY} spent on marketing campaigns.', 500),
        this._createTotalLabelStore(ElementID.EXP_PER_MARKETING_CAMPAIGN_SPENT, stores.get('marketingCampaignsSpentXpStore'))
      ),
    ];

    const totalXpRow : FlexUIWidget = horizontal({
      width: this.parent.getContentWidth()!,
      spacing: this.columnSpacing,
      padding: 0,
      content: [
        new AlignedLabel(ElementID.NONE, {
          padding: 0,
          width: this.columnWidths[0],
          textAlignment: { horizontal: 'left', vertical: 'center' },
          text: '',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          padding: 0,
          width: this.columnWidths[1],
          textAlignment: { horizontal: 'right', vertical: 'center' },
          text: '',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          padding: 0,
          width: this.columnWidths[2],
          textAlignment: { horizontal: 'right', vertical: 'center' },
          text: '{BLACK}Total XP Earned',
        }).widget,
        new AlignedLabel(ElementID.NONE, {
          padding: 0,
          width: this.columnWidths[3],
          textAlignment: { horizontal: 'right', vertical: 'center' },
          text: compute<number, string>(
            stores.get('totalXpStore'),
            (totalXp : number) : string => context.formatString('{COMMA16} {BLACK}xp', totalXp)
          ),
        }).widget,
      ]
    });

    const xpRows : FlexUIWidget[] = [
      headerRow,
      ...playerActionXpRows,
      ...guestActionXpRows,
      ...staffActionXpRows,
      ...parkDataXpRows,
      totalXpRow,
    ];



    // ---Other settings---
    const otherRows : FlexUIWidget[] = [
      this._createConfigRow(ElementID.EXP_PER_TILE,
        'tileXpCost',
        'Tile XP cost',
        'How much XP each tile costs.',
        this._createTotalLabelStore(ElementID.EXP_PER_TILE, stores.get('tilesEarnedStore'))
      ),

      this._createConfigRow(ElementID.MIN_TILES,
        'startingTiles',
        'Starting tiles',
        'How many free tiles you start with.',
        '{BLACK}tiles'
      ),
      
      separator,
      this._createConfigRow(ElementID.TICKS_PER_UPDATE,
        'ticksPerUpdate',
        'Game ticks per update',
        'How frequently the plugin updates statistics.\nIncrease this if large parks start to lag.',
        '{BLACK}ticks'
      ),
    ];

    return vertical({
      spacing: 1,
      padding: 0,
      content: [
        ...xpRows,
        ...otherRows,
      ],
    });
  }
  
  /**
   * Creates row for config options with a text label and a textbox
   * @param id ElementID of row to make
   * @param key Key for Plugin.get()
   * @param labelText String to show in the label
   * @param tooltip Tooltip for hovering over
   * @param totalLabelText A Store<string> or string to compute the total XP label
   * @param countKeyOrStore Key in Metrics for the number of instances of an XP source OR a Store<number> of that value OR a Store<string> for text to use
   * @returns The row
   */
  private _createConfigRow(
    id : ElementID,
    key : keyof PluginData,
    labelText : string,
    tooltip : string,
    totalLabelText : Store<string> | string,
    countKeyOrStore? : keyof MetricData | Store<number> | Store<string>
  ) : FlexUIWidget {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const pluginStore : Store<number> = dsManager.getInstance(DataStoreID.PLUGIN).get(key);
    const countStore : Store<number> | Store<string> | undefined = isStore(countKeyOrStore) ? countKeyOrStore :
      countKeyOrStore ? dsManager.getInstance(DataStoreID.METRICS).get(countKeyOrStore) : undefined;

    // Make the textbox
    const defaultValue : string = read(pluginStore) + '';
    const textStore : WritableStore<string> = store<string>(defaultValue);
    this.settingsStores[key] = textStore;

    // Row label
    const rowLabel : FlexUIWidget = label({
      padding: 0,
      width: this.columnWidths[0],
      tooltip: tooltip,
      text: compute<number, string, string>(pluginStore, textStore, (pluginValue : number, textboxValue : string) : string => {
        const isChanged : boolean = pluginValue !== Number(textboxValue);

        if (isChanged) {
          return `{TOPAZ}* ${labelText} *`;
        } else {
          return labelText;
        }
      }),
    });

    // Count label
    const countLabel : AlignedLabel = new AlignedLabel(ElementID.NONE, {
      padding: 0,
      width: this.columnWidths[1],
      textAlignment: { horizontal: 'right', vertical: 'center' },
      text: countStore ? 
        typeof countStore.get() === 'string' ? 
          countStore as Store<string> : 
          compute<number, string>(countStore as Store<number>,
          (count : number) : string => {
            return context.formatString('{COMMA16} {BLACK}x', count);
          }
      ) : '',
    });
    
    // Textbox
    const newTextbox : FlexUIWidget = textbox({
      padding: 0,
      width: this.columnWidths[2],
      tooltip: tooltip,
      text: { twoway : textStore },
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

    // Total label
    const totalLabel : AlignedLabel = new AlignedLabel(id, {
        padding: 0,
        width: this.columnWidths[3],
        textAlignment: { horizontal: 'right', vertical: 'center' },
        text: totalLabelText ?? '',
    });

    return horizontal({
      spacing: this.columnSpacing,
      padding: 0,
      content: [
        rowLabel,
        countLabel.widget,
        newTextbox,
        totalLabel.widget,
      ]
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
   * Makes a panel of other settings that are not in the big list
   */
  private _buildConfigOtherPanel() : FlexUIWidget {
    const keepToolbarOpenCheckbox : FlexUIWidget = this._createConfigCheckbox(ElementID.KEEP_TOOLBAR_OPEN);
    const bypassPathRestrictionCheckbox : FlexUIWidget = this._createConfigCheckbox(ElementID.BYPASS_PATH_RESTRICTIONS);

    return horizontal({
      spacing: this.columnSpacing,
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
        const checkboxStore : WritableStore<boolean> = store(plugin.getValue('keepToolbarOpen'));
        const text = 'Keep toolbar open';

        element = checkbox({
          padding: 0,
          width: '50%',
          isChecked: { twoway: checkboxStore },
          tooltip: 'Uncheck this box to let the toolbar be closed.',
          text: compute<boolean, boolean, string>(
            plugin.get('keepToolbarOpen'),
            checkboxStore,
            (pluginValue : boolean, checkboxValue : boolean) : string => {
              const isChanged : boolean = pluginValue !== checkboxValue;
      
              if (isChanged) {
                return `{TOPAZ}* ${text} *`;
              } else {
                return text;
              }
            }),
        });

        this.settingsStores['keepToolbarOpen'] = checkboxStore;
        this.registerElement(ElementID.KEEP_TOOLBAR_OPEN, element);
        break;
      } case ElementID.BYPASS_PATH_RESTRICTIONS: {
        const checkboxStore : WritableStore<boolean> = store(plugin.getValue('bypassPathRestrictions'));
        const text = 'Bypass path restrictions';

        element = checkbox({
          padding: 0,
          width: '50%',
          isChecked: { twoway: checkboxStore },
          tooltip: 'Check this to bypass the restrictions on buying and sell land with paths on it.\n{RED}BE CAREFUL!',
          text: compute<boolean, boolean, string>(
            plugin.get('bypassPathRestrictions'),
            checkboxStore,
            (pluginValue : boolean, checkboxValue : boolean) : string => {
              const isChanged : boolean = pluginValue !== checkboxValue;
      
              if (isChanged) {
                return `{TOPAZ}* ${text} *`;
              } else {
                return text;
              }
            }),
        });

        this.settingsStores['bypassPathRestrictions'] = checkboxStore;
        this.registerElement(ElementID.BYPASS_PATH_RESTRICTIONS, element);
        break;
      }
    }

    return element;
  }

  /**
   * Adds buttons to bottom of the config panel
   */
  private _buildConfigButtonPanel() : FlexUIWidget {
    const defaultsButton : DoubleClickButton = new DoubleClickButton(ElementID.NONE, {
      padding: 0,
      width: '25%',
      height: 14,
      tooltip: 'Double click to reset settings to defaults',
      text: 'Defaults',
      onChange: this.onDefaultsButtonClick.bind(this),
    });
    this.registerElement(ElementID.CONFIG_DEFAULTS, defaultsButton);

    const revertButton : DoubleClickButton = new DoubleClickButton(ElementID.NONE, {
      padding: { right: '25%', rest: 0 },
      width: '25%',
      height: 14,
      tooltip: 'Double click to revert to previously used settings',
      text: 'Revert',
      onChange: this.onRevertButtonClick.bind(this),
    });
    this.registerElement(ElementID.CONFIG_REVERT, revertButton);

    const saveButton : FlexUIWidget = button({
      padding: 0,
      width: '25%',
      height: 14,
      tooltip: 'Double click to save settings',
      text: 'Save',
      onClick: this.onSaveButtonClick.bind(this),
    });
    this.registerElement(ElementID.CONFIG_SAVE, saveButton);

    return horizontal({
      spacing: this.columnSpacing,
      padding: { top: 5, rest: 0 },
      content: [
        defaultsButton.widget,
        revertButton.widget,
        saveButton,
      ],
    });
  }



  /**
   * **********
   * Event Handling
   * **********
   */

  /**
   * Handles clicks on config defaults button
   */
  private onDefaultsButtonClick() : void {
    const dsManager : DataStoreManager = DataStoreManager.instance();
    const plugin : DataStore<PluginData> = dsManager.getInstance(DataStoreID.PLUGIN);
    const keys : (keyof PluginData)[] = Object.keys(this.settingsStores);

    // Reset Plugin values to defaults
    plugin.loadDefaults();

    // Set all settings back to default values
    keys.forEach((key : keyof PluginData) : void => {
      const pluginValue : any = plugin.getValue(key);

      const fieldStore : WritableStore<any> = <WritableStore<any>>this.settingsStores[key];
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
    const keys : (keyof PluginData)[] = Object.keys(this.settingsStores);

    // Set all settings back to Plugin.get() value
    keys.forEach((key : keyof PluginData) : void => {
      const pluginValue : any = plugin.getValue(key);

      const fieldStore : WritableStore<any> = <WritableStore<any>>this.settingsStores[key];
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
    const keys : (keyof PluginData)[] = Object.keys(this.settingsStores);
    
    // Save all settings with Plugin.set
    keys.forEach((key : keyof PluginData) : void => {
      const pluginStore : WritableStore<any> = plugin.get(key);
      const pluginValue : any = pluginStore.get();

      const fieldValue : any = read(this.settingsStores[key]);
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