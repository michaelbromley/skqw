/**
 * Electron ipc message channels.
 */
export const SAMPLE = 'SAMPLE';
export const START_ANALYZER = 'START_ANALYZER';
export const STOP_ANALYZER = 'STOP_ANALYZER';
export const REQUEST_DEVICE_LIST = 'REQUEST_DEVICE_LIST';
export const RECEIVE_DEVICE_LIST = 'RECEIVE_DEVICE_LIST';
export const SET_INPUT_DEVICE_ID = 'SET_INPUT_DEVICE_ID';
export const SET_GAIN = 'SET_GAIN';
export const SET_SAMPLE_RATE = 'SET_SAMPLE_RATE';
export const TOGGLE_NORMALIZATION = 'TOGGLE_NORMALIZATION';
export const TOGGLE_FULLSCREEN = 'TOGGLE_FULLSCREEN';
export const TOGGLE_DEVTOOLS = 'TOGGLE_DEVTOOLS';

/**
 * App settings
 */
export const MAX_GAIN = 500;
export const MIN_GAIN = 0;
export const MIN_SAMPLE_RATE = 10;
export const MAX_SAMPLE_RATE = 60;
export const SKQW_UTILS_MODULE_NAME = 'skqw-utils';
export const SKQW_CORE_MODULE_NAME = 'skqw-core';

/**
 * Keycodes
 */
export const KEYCODE_RIGHT_ARROW = 39;
export const KEYCODE_LEFT_ARROW = 37;
export const KEYCODE_UP_ARROW = 38;
export const KEYCODE_DOWN_ARROW = 40;
