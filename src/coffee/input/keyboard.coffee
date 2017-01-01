###
Constructor for the Keyboard class

@name Input.Keyboard
@class A class that eases checking of the current state of all keys.
###
module.exports = class Keyboard
  constructor: ({ @preventDefaultKeyboard })->
    document.addEventListener "keydown", (event) =>
      @onKeyDown event
      event.preventDefault() if @preventDefaultKeyboard
      return
    , false
    document.addEventListener "keyup", (event) =>
      @onKeyUp event
      event.preventDefault() if @preventDefaultKeyboard
      return
    , false

    # Create key array
    @keys = new Array(400)
    key = 0
    while key < @keys.length
      @keys[key] = events: []
      key++
    return

  updateLastTick: (@lastTick)->

  ###
  Registers every onkeydown event to the Keyboard object.

  @private
  @param {KeyboardEvent} event Event object passed by the onkeydown event
  ###
  onKeyDown: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev
    unless @isDown(event.keyCode)
      key = @keys[event.keyCode]
      key.events = key.events.slice(0, 1)
      key.events.unshift new Date().getTime()
    return


  ###
  Registers every onkeyup event to the Keyboard object.

  @private
  @param {KeyboardEvent} event Event object passed by the onkeyup event
  ###
  onKeyUp: (event) ->
    throw new Error("Missing argument: event") if event is undefined #dev
    if @isDown(event.keyCode)
      key = @keys[event.keyCode]
      key.events = key.events.slice(0, 1)
      key.events.unshift -new Date().getTime()
    return


  ###
  Checks if a given key is down.

  @param {number|string} key A charcode or a string representing the key
  @return {boolean} True if the key is down, false if not
  ###
  isDown: (key) ->
    throw new Error("Missing argument: key") if key is undefined #dev
    key = key.toUpperCase().charCodeAt(0) if typeof key is "string"
    @keys[key].events.length and @keys[key].events[0] > 0


  ###
  Checks if a given key has been pressed (between last and current frame).

  @param {number|string} key A charcode or a string representing the key
  @return {boolean} True if the key has been pressed, false if not
  ###
  isPressed: (key) ->
    throw new Error("Missing argument: key") if key is undefined #dev
    key = key.toUpperCase().charCodeAt(0) if typeof key is "string"
    @keys[key].events.length and @keys[key].events[0] > @lastTick


  ###
  Checks if a given key has been released (between last and current frame).

  @param {number|string} key A charcode or a string representing the key
  @return {boolean} True if the key has been pressed, false if not
  ###
  isReleased: (key) ->
    throw new Error("Missing argument: key") if key is undefined #dev
    key = key.toUpperCase().charCodeAt(0) if typeof key is "string"
    @keys[key].events.length and -@keys[key].events[0] > @lastTick
