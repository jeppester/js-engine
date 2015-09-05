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
  # @type {String}
  OFFSET_TOP_LEFT: "tl"

  # Top center offset
  # @type {String}
  OFFSET_TOP_CENTER: "tc"

  # Top right offset
  # @type {String}
  OFFSET_TOP_RIGHT: "tr"

  # Middle left offset
  # @type {String}
  OFFSET_MIDDLE_LEFT: "ml"

  # Middle center offset
  # @type {String}
  OFFSET_MIDDLE_CENTER: "mc"

  # Middle right offset
  # @type {String}
  OFFSET_MIDDLE_RIGHT: "mr"

  # Bottom left offset
  # @type {String}
  OFFSET_BOTTOM_LEFT: "bl"

  # Bottom center offset
  # @type {String}
  OFFSET_BOTTOM_CENTER: "bc"

  # Bottom right offset
  # @type {String}
  OFFSET_BOTTOM_RIGHT: "br"

  # Alignment options
  # Left text alignment
  ALIGNMENT_LEFT: "left"

  # Center text alignment
  ALIGNMENT_CENTER: "center"

  # Right text alignment
  ALIGNMENT_RIGHT: "right"

  ###
  Room transition global for entering a new room with no transition (this is default)

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  ROOM_TRANSITION_NONE: (oldRoom, newRoom, options, callback) ->
    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      camera.room = newRoom if camera.room is oldRoom
      i++
    callback()
    return

  ###
  Room transition global for entering a new room by sliding the current room to the left

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  ROOM_TRANSITION_SLIDE_SLIDE: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        Helpers.RoomTransition.slideOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    newCams.forEach (c) ->
      Helpers.RoomTransition.slideIn c, options.from, animOptions
      return

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
      return
    ), animOptions.duration
    return

  ###
  Room transition global for entering a new room by squeezing the old room out and sliding the new room in

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  ROOM_TRANSITION_SQUEEZE_SLIDE: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        Helpers.RoomTransition.squeezeOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    newCams.forEach (c) ->
      Helpers.RoomTransition.slideIn c, options.from, animOptions
      return

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
      return
    ), animOptions.duration
    return

  ###
  Room transition global for squeezing the old room out and squeezing the new room in

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  ROOM_TRANSITION_SQUEEZE_SQUEEZE: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    console.log options.from
    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        Helpers.RoomTransition.squeezeOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    newCams.forEach (c) ->
      Helpers.RoomTransition.squeezeIn c, options.from, animOptions
      return

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
      return
    ), animOptions.duration
    return

  ###
  Room transition global for sliding the old room out and squeezing the new room in

  @global
  @param {Room} oldRoom The room that is left
  @param {Room} newRoom The room that is entered
  ###
  ROOM_TRANSITION_SLIDE_SQUEEZE: (oldRoom, newRoom, options, callback) ->
    newCams = []
    oldRoom.pause()
    options = options or {}
    options.from = options.from or "right"
    animOptions =
      easing: options.easing or @EASING_QUAD_IN_OUT
      duration: options.duration or 2000
      loop: engine.masterRoom.loops.eachFrame

    i = 0
    while i < engine.cameras.length
      camera = engine.cameras[i]
      if camera.room is oldRoom
        Helpers.RoomTransition.slideOut camera, options.from, animOptions
        newCam = new Camera(camera.captureRegion.copy(), camera.projectionRegion.copy(), newRoom)
        newCams.push newCam
      i++
    engine.cameras.push.apply engine.cameras, newCams
    newCams.forEach (c) ->
      Helpers.RoomTransition.squeezeIn c, options.from, animOptions
      return

    engine.masterRoom.loops.eachFrame.schedule oldRoom, (->
      @play()
      engine.cameras = engine.cameras.filter((camera) ->
        newCams.indexOf(camera) isnt -1
      )
      callback()
      return
    ), animOptions.duration
    return

  # EASING FUNCTIONS
  ###
    @param {number} t The current time (of the animation)
    @param {number} b The start value
    @param {number} c The end value
    @param {number} d The animation time
    @{number} The current value (at the given time in the animation)
  ###
  EASING_LINEAR: (t, b, c, d) ->
    t /= d
    b + c * t

  EASING_QUAD_IN: (t, b, c, d) ->
    t /= d
    b + c * t * t

  EASING_QUAD_OUT: (t, b, c, d) ->
    t /= d
    b - c * t * (t - 2)

  EASING_QUAD_IN_OUT: (t, b, c, d) ->
    t = t / d * 2
    if t < 1
      b + c * t * t / 2
    else
      t--
      b + c * (1 - t * (t - 2)) / 2

  EASING_POWER_IN: (t, b, c, d) ->
    t /= d

    # a determines if c is positive or negative
    a = c / Math.abs(c)
    b + a * Math.pow(Math.abs(c), t)

  EASING_POWER_OUT: (t, b, c, d) ->
    t /= d

    # a determines if c is positive or negative
    a = c / Math.abs(c)
    b + c - a * Math.pow(Math.abs(c), 1 - t)

  EASING_POWER_IN_OUT: (t, b, c, d) ->
    t = t / d * 2

    # a determines if c is positive or negative
    a = c / Math.abs(c)
    if t < 1
      b + a * Math.pow(Math.abs(c), t) / 2
    else
      t--
      b + c - a * Math.pow(Math.abs(c), 1 - t) / 2

  EASING_SINUS_IN_OUT: (t, b, c, d) ->
    t /= d
    b + c * (1 + Math.cos(Math.PI * (1 + t))) / 2

Camera = require './camera'

Helpers =
  RoomTransition: require '../helpers/room-transition'
