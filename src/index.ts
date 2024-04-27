// import {window, box, label, Colour, 
  // button, colourPicker, dropdown, dropdownSpinner, spinner, toggle, viewport} from 'openrct2-flexui';
// import * as FlexUI from 'openrct2-flexui';
import * as FlexUI from 'openrct2-flexui';

/*
  Variables
*/
// Data logging
var totalExp = 69420;
var tilesUsed = 0;

// Configs
var expPerTile = 1000;


// Don't change
const winTitle = 'Tileman';

// Globalish references
const win = FlexUI.window({
  title: winTitle,
	width: 300,
	height: 200,
  content: [
		FlexUI.box({
			content: FlexUI.vertical({
        spacing: 5,
        content: [
          FlexUI.horizontal({
            spacing: 20,
            content: [FlexUI.label({
              text: "{BLACK}Total Exp: "
            }),
            FlexUI.label({
              text: `{BABYBLUE}${totalExp}`,
            })]
          }),
          FlexUI.horizontal({
            spacing: 20,
            content: [FlexUI.label({
              text: "{BLACK}Tiles Unlocked/Used: "
            }),
            FlexUI.label({
              text: `{BABYBLUE}${computeTilesAvailable()}{BLACK}/{RED}${tilesUsed}`,
            })]
          })]
      })
		})
  ]
});

function computeTilesAvailable() : Number {
  return Math.floor(totalExp / expPerTile);
}

function showWindow() {
  // Close other instance of this window if it exists
  let numWindows = ui.windows;
  for(let i = 0; i < numWindows; ++i) {
    let winTest = ui.getWindow(i);
    if (winTest.title == winTitle) {
      winTest.close();
      break;
    }
  }

  win.open();
}

function main() {
  console.log('Initializing Tileman Plugin...');

  if (typeof ui !== 'undefined') {
    // Register option in menu under Map icon in toolbar
    ui.registerMenuItem('Tileman', function() { showWindow(); });

    showWindow();
  }
}

registerPlugin({
  name: 'Tileman',
  version: '0.0.1',
  authors: ['Isoitiro'],
  type: 'remote',
  licence: 'GNU GPLv3',
  targetApiVersion: 68,
  main: main
});

/*
  park.landPrice: 300 = 30.00


  LandSetRightsArgs
  activateTool






  black
  grey
  white
  red
  green
  yellow
  topaz
  celadon
  babyblue
  palelavender
  palegold
  lightpink
  pearlaqua
  palesilver
*/








/*
  Give EXP based on:
    - Guest riding
    - Guest buying
    - Popping balloons
*/