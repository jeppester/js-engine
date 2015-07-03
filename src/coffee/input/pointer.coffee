###
Constructor for the Pointer class

@name Input.Pointer
@class A class that eases the use of mouse and touch, by providing functions for checking the current state of both.
###
module.exports = class Pointer
  constructor: ->
    if engine.host.hasTouch

      # Add listeners for touch events
      document.addEventListener "touchstart", (event) =>
        @onTouchStart event
        return
      , false
      document.addEventListener "touchend", (event) =>
        @onTouchEnd event
        return
      , false
      document.addEventListener "touchmove", (event) =>
        @onTouchMove event
        return
      , false
    else

      # Add listeners for mouse events
      document.addEventListener "mousedown", (event) =>
        @onMouseDown event
        return
      , false
      document.addEventListener "mouseup", (event) =>
        @onMouseUp event
        return
      , false
      document.addEventListener "mousemove", (event) =>
        engine.host.hasMouse = true
        @onMouseMove event
        return
      , false

    # Setup mouse device
    @mouse = new Math.Vector()
    @mouse.window = new Math.Vector()
    @mouse.buttons = new Array(11)
    button = 0
    while button < @mouse.buttons.length
      @mouse.buttons[button] = new Math.Vector()
      @mouse.buttons[button].events = new Array(2)
      button++
    @mouse.lastMoved = 0

    # Setup touches
    @touches = new Array(10)
    button = 0
    while button < @touches.length
      @touches[button] = new Math.Vector()
      @touches[button].x = undefined
      @touches[button].y = undefined
      @touches[button].events = new Array(2)
      button++
    return

  ###
  Registers every onmousedown event to the Mouse object.

  @private
  @param {MouseEvent} event Event object passed by the onmousedown event
  ###
  onMouseDown: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev
    @onMouseMove event
    unless @isDown(event.which)
      button = @mouse.buttons[event.which]
      button.events = button.events.slice(0, 1)
      button.events.unshift new Date().getTime()
    return

  ###
  Registers every onmouseup event to the Mouse object.

  @private
  @param {MouseEvent} event Event object passed by the onmouseup event
  ###
  onMouseUp: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev
    button = undefined
    @onMouseMove event
    if @isDown(event.which)
      button = @mouse.buttons[event.which]
      button.events = button.events.slice(0, 1)
      button.events.unshift -new Date().getTime()
    return

  ###
  Registers every onmousemove event to the Mouse object.

  @private
  @param {MouseEvent} event Event object passed by the onmousemove event
  ###
  onMouseMove: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev
    roomPos = undefined
    @mouse.window.set event.pageX, event.pageY
    @mouse.set @mouse.window.x - engine.arena.offsetLeft - engine.canvas.offsetLeft + document.body.scrollLeft, @mouse.window.y - engine.arena.offsetTop - engine.canvas.offsetTop + document.body.scrollTop

    # Find the mouse position relative to the arena
    @mouse.x = @mouse.x / engine.arena.offsetWidth * engine.canvasResX
    @mouse.y = @mouse.y / engine.arena.offsetHeight * engine.canvasResY

    # Convert the position to make it relative to the room
    roomPos = @calculateRoomPosition(@mouse)
    @mouse.x = roomPos.x
    @mouse.y = roomPos.y
    @mouse.buttons.forEach (b) =>
      b.x = @mouse.x
      b.y = @mouse.y
      return

    @mouse.lastMoved = new Date().getTime()
    if @cursor
      @cursor.x = @mouse.x
      @cursor.y = @mouse.y
    return

  ###
  Registers every ontouchstart event to the Mouse object.

  @private
  @param {TouchEvent} event Event object passed by the ontouchstart event
  ###
  onTouchStart: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev

    # Update pressed touches
    for eventTouch in event.changedTouches
      touchNumber = @findTouchNumber()
      pointerTouch = @touches[touchNumber]
      pointerTouch.identifier = eventTouch.identifier
      pointerTouch.events = pointerTouch.events.slice 0, 1
      pointerTouch.events.unshift new Date().getTime()

    # Update all touch positions
    @onTouchMove event
    return

  ###
  Registers every ontouchend event to the Mouse object.

  @private
  @param {TouchEvent} event Event object passed by the ontouchend event
  ###
  onTouchEnd: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev

    # Update unpressed touches
    for eventTouch in event.changedTouches
      pointerTouch = @touches.filter((t) ->
        t.identifier is eventTouch.identifier
      )[0]
      pointerTouch.events = pointerTouch.events.slice(0, 1)
      pointerTouch.events.unshift -new Date().getTime()

    # Update all touch positions
    @onTouchMove event
    return

  ###
  Registers every ontouchmove event to the Mouse object.

  @private
  @param {TouchEvent} event Event object passed by the ontouchmove event
  ###
  onTouchMove: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev

    for eventTouch in event.touches
      pointerTouch = @touches.filter((t) ->
        t.identifier is eventTouch.identifier
      )[0]
      pointerTouch.set eventTouch.pageX - engine.arena.offsetLeft - engine.canvas.offsetLeft + document.body.scrollLeft, eventTouch.pageY - engine.arena.offsetTop - engine.canvas.offsetTop + document.body.scrollTop
      pointerTouch.x = pointerTouch.x / engine.arena.offsetWidth * engine.canvasResX
      pointerTouch.y = pointerTouch.y / engine.arena.offsetHeight * engine.canvasResY

      # Convert the position to make it relative to the room
      roomPos = @calculateRoomPosition(pointerTouch)
      pointerTouch.x = roomPos.x
      pointerTouch.y = roomPos.y
    return

  ###
  Checks if the mouse has been moved between the last and the current frame.

  @return {boolean} True if the pointer has been moved, false if not
  ###
  mouseHasMoved: ->
    engine.last < @mouse.lastMoved

  ###
  Checks if a mouse button or touch is currently down.

  @param {number} button A pointer constant representing the pointer to check
  @return {Object[]|boolean} Returns an array containing the pointers that are currently down, or false if no pointers are down
  ###
  isDown: (button) ->
    throw new Error("Missing argument: button") if button is undefined #dev
    switch @getButtonType(button)
      when "mouse"
        pointers = (if button is MOUSE_ANY then @mouse.buttons else @mouse.buttons[button])
      when "touch"
        pointers = (if button is TOUCH_ANY then @touches else @touches[button - TOUCH_1])
      when "any"
        pointers = @mouse.buttons.concat(@touches)
    @checkPointer pointers, "down"

  ###
  Checks if a mouse button or touch has just been pressed (between the last and the current frame).

  @param {number} button A pointer constant representing the pointer to check
  @return {Object[]|boolean} Returns an array containing the pointers that have just been pressed, or false if no pressed pointers where detected
  ###
  isPressed: (button) ->
    throw new Error("Missing argument: button") if button is undefined #dev
    pointers = undefined
    switch @getButtonType(button)
      when "mouse"
        pointers = (if button is MOUSE_ANY then @mouse.buttons else @mouse.buttons[button])
      when "touch"
        pointers = (if button is TOUCH_ANY then @touches else @touches[button - TOUCH_1])
      when "any"
        pointers = @mouse.buttons.concat(@touches)
    @checkPointer pointers, "pressed"

  ###
  Checks if a mouse button or touch just been released (between the last and the current frame).

  @param {number} button A pointer constant representing the pointer to check
  @return {Object[]|boolean} Returns an array containing the pointers that have just been released, or false if no released pointers where detected
  ###
  isReleased: (button) ->
    throw new Error("Missing argument: button") if button is undefined #dev
    pointers = undefined
    switch @getButtonType(button)
      when "mouse"
        pointers = (if button is MOUSE_ANY then @mouse.buttons else @mouse.buttons[button])
      when "touch"
        pointers = (if button is TOUCH_ANY then @touches else @touches[button - TOUCH_1])
      when "any"
        pointers = @mouse.buttons.concat(@touches)
    @checkPointer pointers, "released"

  ###
  Checks if an area defined by a geometric shape, or its outside, has just been pressed (between the last and the current frame).
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).

  @param {button} button A pointer constant representing the pointers to check
  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {Object[]|boolean} An array containing the pointers that have pressed the shape, or false if no presses inside the shape were detected
  ###
  shapeIsPressed: (button, shape, outside) ->
    button = (if button isnt undefined then button else MOUSE_TOUCH_ANY)
    throw new Error("Missing argument: shape") if shape is undefined #dev
    throw new Error("Argument shape has implement a \"contains\"-function") if typeof shape.contains isnt "function" #dev
    i = undefined
    pointers = undefined
    pointer = undefined
    ret = undefined

    # Narrow possible presses down to the pressed pointers within the selected buttons
    pointers = @isPressed(button)

    # Check each of the pointers to see if they are inside the shape
    ret = []
    for pointer in pointers
      continue if pointer.x is false or pointer.y is false
      if not outside and shape.contains(pointer)
        ret.push pointer
      else
        ret.push pointer if outside and not shape.contains(pointer)

    # Return the pointers which are inside the shape
    ret

  ###
  Checks if an area defined by a geometric shape, or its outside, has just been released (between the last and the current frame).
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).

  @param {button} button A pointer constant representing the pointers to check
  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {Object[]|boolean} An array containing the pointers that have released the shape, or false if no releases inside the shape were detected
  ###
  shapeIsReleased: (button, shape, outside) ->
    button = (if button isnt undefined then button else MOUSE_TOUCH_ANY)
    throw new Error("Missing argument: shape") if shape is undefined #dev
    throw new Error("Argument shape has implement a \"contains\"-function") if typeof shape.contains isnt "function" #dev

    # Narrow possible presses down to the pressed pointers within the selected buttons
    pointers = @isReleased(button)

    # Check each of the pointers to see if they are inside the shape
    ret = []
    for pointer in pointers
      continue if pointer.x is false or pointer.y is false
      if not outside and shape.contains(pointer)
        ret.push pointer
      else
        ret.push pointer if outside and not shape.contains(pointer)

    # Return the pointers which are inside the shape
    ret

  ###
  Checks if an area defined by a geometric shape, or its outside, is down (currently clicked by mouse or touch).
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).

  @param {button} button A pointer constant representing the pointers to check
  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {Object[]|boolean} An array containing the pointers that are currently pressing the shape, or false if no pointers inside the shape were detected
  ###
  shapeIsDown: (button, shape, outside) ->
    button = (if button isnt undefined then button else MOUSE_TOUCH_ANY)
    throw new Error("Missing argument: shape") if shape is undefined #dev
    throw new Error("Argument shape has implement a \"contains\"-function") if typeof shape.contains isnt "function" #dev

    # Narrow possible pointers down to the pointers which are down within the selected buttons
    pointers = @isDown button

    # Check each of the pointers to see if they are inside the shape
    ret = []
    for pointer in pointers
      continue if pointer.x is false or pointer.y is false
      if not outside and shape.contains(pointer)
        ret.push pointer
      else
        ret.push pointer if outside and not shape.contains(pointer)

    # Return the pointers which are inside the shape
    ret

  ###
  Returns a string representing the button type.

  @private
  @param {number} button A pointer button constant representing the button
  @return {string} A string representing the type of button ("mouse", "touch" or "any")
  ###
  getButtonType: (button) ->
    if button >= MOUSE_ANY and button <= MOUSE_10
      "mouse"
    else if button >= TOUCH_ANY and button <= TOUCH_10
      "touch"
    else if button is MOUSE_TOUCH_ANY
      "any"
    else #dev
      throw new Error("Argument button has to be a pointer constant (see jseGlobals.js)") #dev

  ###
  Checks the state of a pointer object

  @private
  @param {Object|Object[]} pointers A pointer object or an array of pointer objects to check the state of
  @param {string} state A state to check for "pressed", "released" or "down"
  @return {boolean} Whether or not the pointer or one of the pointers has the provided state
  ###
  checkPointer: (pointers, state) ->
    throw new Error("Missing argument: pointers") if pointers is "undefined" #dev
    throw new Error("Missing argument: state") if state is "undefined" #dev
    throw new Error("Argument state must be one of the following values: \"pressed\", \"released\" or \"down\"") if ["pressed", "released", "down"].indexOf(state) is -1 #dev

    pointers = [pointers] unless Array::isPrototypeOf(pointers)

    # Check each pointer, to see if it has the correct state
    ret = []
    for pointer in pointers
      switch state
        when "pressed"
          ret.push pointer if pointer.events[0] > engine.last || pointer.events[1] > engine.last
        when "released"
          ret.push pointer if -pointer.events[0] > engine.last || -pointer.events[1] > engine.last
        when "down"
          ret.push pointer if pointer.events[0] > 0
    if ret.length then ret else false

  ###
  Converts a coordinate which is relative to the main canvas to a position in the room (based on the room's cameras)

  @private
  @param {Math.Vector} vector A vector representing a position which is relative to the main canvas
  @return {Math.Vector} vector A vector representing the calculated position relative to the room
  ###
  calculateRoomPosition: (vector) ->
    ret = undefined
    len = undefined
    camera = undefined
    ret = vector.copy()

    # Find the first camera which covers the position
    len = engine.cameras.length
    while len--
      camera = engine.cameras[len]

      # If the position is covered by the camera, or we have reached the last camera, base the calculation on that camera
      if camera.projectionRegion.contains(vector) or len is 0

        # Find the position relative to the projection region
        ret.subtract camera.projectionRegion

        # Transform the position, based on the relation between the capture region and the projection region
        ret.x *= camera.captureRegion.width / camera.projectionRegion.width
        ret.y *= camera.captureRegion.height / camera.projectionRegion.height

        # The position is now relative to the capture region, move it to make it relative to the room
        ret.add camera.captureRegion

        # Return the calculated room position
        return ret
    ret

  ###
  Finds the first available spot in the Pointer.touches-array, used for registering the touches as numbers from 0-9.
  In Google Chrome, each touch's identifier can be used directly since the numbers - starting from 0 - are reused, when the a touch is released.
  In Safari however each touch has a unique id (a humongous number), and a function (this) is therefore needed for identifying the touches as the numbers 0-9, which can be used in the Pointer.touches-array.

  @private
  @return {number|boolean} The first available spot in the Pointer.touches-array where a new touch can be registered. If no spot is available, false is returned
  ###
  findTouchNumber: ->
    for touch, i in @touches
      return i unless touch.events[0] > 0
    false

  ###
  Checks if an area defined by a geometric shape, or its outside, is hovered by the mouse pointer.
  The shape can be any geometric object that has a contains function (Rectangle, Polygon).

  @param {Math.Rectangle|Math.Polygon|Math.Circle} shape A geometric shape defining the area to check
  @param {boolean} outside [Whether or not to check the outside of the specified area]
  @return {boolean} True if the shape if hovered, false if not
  ###
  shapeIsHovered: (shape, outside) ->
    if not outside and (shape.contains(@mouse))
      return true
    else return true if outside and (not shape.contains(@mouse))
    false

  ###
  Releases a button, and thereby prevents the button from being detected as "pressed" by the isPressed function.
  This function is very useful for preventing one button press from having multiple effects inside the game. For instance on buttons that are placed on top of each other.

  @param {number} button The button to release
  @return {boolean} True if the button has now been released, false if the button was not already pressed
  ###
  release: (button) ->
    throw new Error("Missing argument: button") if button is undefined #dev
    i = undefined
    pointers = undefined
    events = undefined
    unpressed = undefined

    # Find pressed pointers that are covered by the given button
    pointers = @isPressed(button)
    return false unless pointers

    # Unpress all of the pointers
    i = 0
    while i < pointers.length
      events = pointers[i].events
      if events[0] > engine.last
        events.shift()
        events.push undefined
        unpressed = true
      if events[1] > engine.last
        events.pop()
        events.push undefined
        unpressed = true
      i++
    unpressed

  ###
  Checks if the mouse pointer is outside the game arena.

  @return {boolean} True if the pointer is outside, false if not
  ###
  outside: ->
    new Math.Rectangle(engine.arena.offsetLeft, engine.arena.offsetTop, engine.arena.offsetWidth, engine.arena.offsetHeight).contains(@mouse.window) is false

  ###
  Resets the mouse cursor, automatically called by the engine before each frame i executed, unless engine.resetCursorOnEachFrame is set to false

  @private
  ###
  resetCursor: ->
    engine.arena.style.cursor = "default"
    return

  ###
  Sets the mouse cursor for the arena.
  By default the mouse cursor will be reset on each frame (this can be changed with the "resetCursorOnEachFrame" engine option)
  Please be aware that not all images can be used as cursor. Not all sizes and formats are supported by all browsers.

  @param {string} A resource string, image path string or css cursor of the cursor
  ###
  setCursor: (cursor) ->
    throw new Error("Missing argument: cursor") if cursor is undefined #dev
    throw new Error("Argument cursor should be of type: string") if typeof cursor isnt "string" #dev
    resource = undefined

    # Check if "cursor" is a resource string
    resource = engine.loader.getImage(cursor)

    # If the cursor string corresponded to a resource, use the resource's src as cursor
    if resource
      cursor = "url('" + resource.src + "') 0 0, auto"

    # Else, if the cursor is not a single word (a css cursor), use the cursor var as direct image path
    else cursor = "url('" + cursor + "') 0 0, auto" unless /^\w*$/.test(cursor)

    # Finally: set the cursor
    engine.arena.style.cursor = cursor
    return
