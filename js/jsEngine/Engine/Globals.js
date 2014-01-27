/**
 * jseGlobals.js:
 * This file contains global JsEngine variables.
 * The purpose of the global variables is to be used as readable alternatives to "magic numbers".
 */

// Keyboard keys
/**
 * The left arrow key
 */
KEY_LEFT		= 37;
/**
 * The up arrow key
 */
KEY_UP			= 38;
/**
 * The right arrow key
 */
KEY_RIGHT		= 39;
/**
 * The down arrow key
 */
KEY_DOWN		= 40;
/**
 * The space key
 */
KEY_SPACE		= 32;

/**
 * The backspace key
 */
KEY_BACKSPACE	= 8;
/**
 * The tab key
 */
KEY_TAB			= 9;
/**
 * The enter key
 */
KEY_ENTER		= 13;
/**
 * The shift key
 */
KEY_SHIFT		= 16;
/**
 * The control key
 */
KEY_CONTROL		= 17;
/**
 * The left alt key
 * @type {Number}
 */
KEY_ALT_LEFT	= 18;
/**
 * The caps lock key
 */
KEY_CAPSLOCK	= 20;
/**
 * The escape key
 */
KEY_ESCAPE		= 27;
/**
 * The right alt key
 */
KEY_ALT_RIGHT	= 0;

/**
 * The F1 key
 */
KEY_F1			= 112;
/**
 * The F2 key
 */
KEY_F2			= 113;
/**
 * The F3 key
 */
KEY_F3			= 114;
/**
 * The F4 key
 */
KEY_F4			= 115;
/**
 * The F5 key
 */
KEY_F5			= 116;
/**
 * The F6 key
 */
KEY_F6			= 117;
/**
 * The F7 key
 */
KEY_F7			= 118;
/**
 * The F8 key
 */
KEY_F8			= 119;
/**
 * The F9 key
 */
KEY_F9			= 120;
/**
 * The F10 key
 */
KEY_F10			= 121;
/**
 * The F11 key
 */
KEY_F11			= 122;
/**
 * The F12 key
 */
KEY_F12			= 123;

// Pointers
/**
 * Any mouse button
 */
MOUSE_ANY		= 0;
/**
 * Mouse button 1
 */
MOUSE_1			= 1;
/**
 * Mouse button 2
 */
MOUSE_2			= 2;
/**
 * Mouse button 3
 */
MOUSE_3			= 3;
/**
 * Mouse button 4
 */
MOUSE_4			= 4;
/**
 * Mouse button 5
 */
MOUSE_5			= 5;
/**
 * Mouse button 6
 */
MOUSE_6			= 6;
/**
 * Mouse button 7
 */
MOUSE_7			= 7;
/**
 * Mouse button 8
 */
MOUSE_8			= 8;
/**
 * Mouse button 9
 */
MOUSE_9			= 9;
/**
 * Mouse button 10
 */
MOUSE_10		= 10;

/**
 * Any touch (on touch device)
 */
TOUCH_ANY		= 20;
/**
 * Touch 1
 * @type {Number}
 */
TOUCH_1			= 21;
/**
 * Touch 2
 * @type {Number}
 */
TOUCH_2			= 22;
/**
 * Touch 3
 * @type {Number}
 */
TOUCH_3			= 23;
/**
 * Touch 4
 * @type {Number}
 */
TOUCH_4			= 24;
/**
 * Touch 5
 * @type {Number}
 */
TOUCH_5			= 25;
/**
 * Touch 6
 * @type {Number}
 */
TOUCH_6			= 26;
/**
 * Touch 7
 * @type {Number}
 */
TOUCH_7			= 27;
/**
 * Touch 8
 * @type {Number}
 */
TOUCH_8			= 28;
/**
 * Touch 9
 * @type {Number}
 */
TOUCH_9			= 29;
/**
 * Touch 10
 * @type {Number}
 */
TOUCH_10		= 30;

/**
 * Any mouse button or touch
 */
MOUSE_TOUCH_ANY = 100;

// Speed units
/**
 * Pixels per second unit
 */
SPEED_PIXELS_PER_SECOND		= 1;
/**
 * Pixels per frame unit
 */
SPEED_PIXELS_PER_FRAME		= 2;

// Offset options
/**
 * Top left offset
 * @type {String}
 */
OFFSET_TOP_LEFT 			= 'tl';
/**
 * Top center offset
 * @type {String}
 */
OFFSET_TOP_CENTER			= 'tc';
/**
 * Top right offset
 * @type {String}
 */
OFFSET_TOP_RIGHT			= 'tr';
/**
 * Middle left offset
 * @type {String}
 */
OFFSET_MIDDLE_LEFT			= 'ml';
/**
 * Middle center offset
 * @type {String}
 */
OFFSET_MIDDLE_CENTER		= 'mc';
/**
 * Middle right offset
 * @type {String}
 */
OFFSET_MIDDLE_RIGHT			= 'mr';
/**
 * Bottom left offset
 * @type {String}
 */
OFFSET_BOTTOM_LEFT			= 'bl';
/**
 * Bottom center offset
 * @type {String}
 */
OFFSET_BOTTOM_CENTER		= 'bc';
/**
 * Bottom right offset
 * @type {String}
 */
OFFSET_BOTTOM_RIGHT			= 'br';

// Alignment options
/**
 * Left text alignment
 */
ALIGNMENT_LEFT				= 'left';
/**
 * Center text alignment
 */
ALIGNMENT_CENTER			= 'center';
/**
 * Right text alignment
 */
ALIGNMENT_RIGHT				= 'right';