/// <reference path='../../../lib/openrct2.d.ts' />

import { ProgressBar } from '../elements/ProgressBar';
import { ToggleButton } from '../elements/ToggleButton';
import { FlexiblePosition, Parsed, WidgetCreator } from "openrct2-flexui";

/**
 * Shorthand for my custom elements and FlexUI elements
 */
export type UIElement = ToggleButton | ProgressBar | FlexUIWidget;

/**
 * Shorthand for all widget usage
 */
export type FlexUIWidget = WidgetCreator<FlexiblePosition, Parsed<FlexiblePosition>>;

/**
 * Alignment options
 */
export type HorizontalAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'center' | 'bottom';