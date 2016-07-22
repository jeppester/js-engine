###
jseGlobals.js:
This file contains global JsEngine variables.
The purpose of the global variables is to be used as readable alternatives to magic numbers or strings.
###
module.exports =
  # Keyboard keys
  # The left arrow key
  KEY_LEFT: 37

  # The up arrow key
  KEY_UP: 38

  # The right arrow key
  KEY_RIGHT: 39

  # The down arrow key
  KEY_DOWN: 40

  # The space key
  KEY_SPACE: 32

  # The backspace key
  KEY_BACKSPACE: 8

  # The tab key
  KEY_TAB: 9

  # The enter key
  KEY_ENTER: 13

  # The shift key
  KEY_SHIFT: 16

  # The control key
  KEY_CONTROL: 17

  # The left alt key
  KEY_ALT_LEFT: 18

  # The caps lock key
  KEY_CAPSLOCK: 20

  # The escape key
  KEY_ESCAPE: 27

  # The right alt key
  KEY_ALT_RIGHT: 0

  # The F1 key
  KEY_F1: 112

  # The F2 key
  KEY_F2: 113

  # The F3 key
  KEY_F3: 114

  # The F4 key
  KEY_F4: 115

  # The F5 key
  KEY_F5: 116

  # The F6 key
  KEY_F6: 117

  # The F7 key
  KEY_F7: 118

  # The F8 key
  KEY_F8: 119

  # The F9 key
  KEY_F9: 120

  # The F10 key
  KEY_F10: 121

  # The F11 key
  KEY_F11: 122

  # The F12 key
  KEY_F12: 123

  # Pointers
  # Any mouse button
  MOUSE_ANY: 0

  # Mouse button 1
  MOUSE_1: 1

  # Mouse button 2
  MOUSE_2: 2

  # Mouse button 3
  MOUSE_3: 3

  # Mouse button 4
  MOUSE_4: 4

  # Mouse button 5
  MOUSE_5: 5

  # Mouse button 6
  MOUSE_6: 6

  # Mouse button 7
  MOUSE_7: 7

  # Mouse button 8
  MOUSE_8: 8

  # Mouse button 9
  MOUSE_9: 9

  # Mouse button 10
  MOUSE_10: 10

  # Any touch (on touch device)
  TOUCH_ANY: 20

  # Touch 1
  # @type {Number}
  TOUCH_1: 21

  # Touch 2
  # @type {Number}
  TOUCH_2: 22

  # Touch 3
  # @type {Number}
  TOUCH_3: 23

  # Touch 4
  # @type {Number}
  TOUCH_4: 24

  # Touch 5
  # @type {Number}
  TOUCH_5: 25

  # Touch 6
  # @type {Number}
  TOUCH_6: 26

  # Touch 7
  # @type {Number}
  TOUCH_7: 27

  # Touch 8
  # @type {Number}
  TOUCH_8: 28

  # Touch 9
  # @type {Number}
  TOUCH_9: 29

  # Touch 10
  # @type {Number}
  TOUCH_10: 30

  # Any mouse button or touch
  MOUSE_TOUCH_ANY: 100

  # Speed units
  # Pixels per second unit
  SPEED_PIXELS_PER_SECOND: 1

  # Pixels per frame unit
  SPEED_PIXELS_PER_FRAME: 2

  # Offset options

  # Top left offset
  # @type {Integer}
  OFFSET_TOP_LEFT: 0b100000000

  # Top center offset
  # @type {Integer}
  OFFSET_TOP_CENTER: 0b010000000

  # Top right offset
  # @type {Integer}
  OFFSET_TOP_RIGHT: 0b001000000

  # Middle left offset
  # @type {Integer}
  OFFSET_MIDDLE_LEFT: 0b000100000

  # Middle center offset
  # @type {Integer}
  OFFSET_MIDDLE_CENTER: 0b000010000

  # Middle right offset
  # @type {Integer}
  OFFSET_MIDDLE_RIGHT: 0b000001000

  # Bottom left offset
  # @type {Integer}
  OFFSET_BOTTOM_LEFT: 0b000000100

  # Bottom center offset
  # @type {Integer}
  OFFSET_BOTTOM_CENTER: 0b000000010

  # Bottom right offset
  # @type {Integer}
  OFFSET_BOTTOM_RIGHT: 0b000000001

  # Alignment options
  # Left text alignment
  ALIGNMENT_LEFT: "left"

  # Center text alignment
  ALIGNMENT_CENTER: "center"

  # Right text alignment
  ALIGNMENT_RIGHT: "right"

  ROOM_TRANSITION_NONE: 'roomTransitionNone'
  ROOM_TRANSITION_SLIDE_SLIDE: 'roomTransitionSlideSlide'
  ROOM_TRANSITION_SQUEEZE_SLIDE: 'roomTransitionSqueezeSlide'
  ROOM_TRANSITION_SQUEEZE_SQUEEZE: 'roomTransitionSqueezeSqueeze'
  ROOM_TRANSITION_SLIDE_SQUEEZE: 'roomTransitionSlideSqueeze'

  EASING_LINEAR: 'linear'
  EASING_QUAD_IN: 'quadIn'
  EASING_QUAD_OUT: 'quadOut'
  EASING_QUAD_IN_OUT: 'quadInOut'
  EASING_POWER_IN: 'powerIn'
  EASING_POWER_OUT: 'powerOut'
  EASING_POWER_IN_OUT: 'powerInOut'
  EASING_SINUS_IN_OUT: 'sinusInOut'
