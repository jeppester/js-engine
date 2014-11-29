nameSpace "View"

###
@name View.Child
@class If a class inherits Child it can be added to the view list. Therefore all objects which can be drawn inherits this class
###
class View.Child
  # Mix in animatable
  Object::import.call @::, Mixin.Animatable

  constructor: ->
    @renderType = ""
    @initWithoutRedrawRegions()
    engine.registerObject this
    return

  initWithoutRedrawRegions: ->
    @x = 0
    @y = 0
    @opacity = 1
    @direction = 0
    @size = 1
    @widthScale = 1
    @heightScale = 1
    hidden = offset: new Math.Vector()

    Object.defineProperty @, "offset",
      get: ->
        hidden.offset

      set: (value) ->
        if typeof value is "string"
          @offsetGlobal = value
          hidden.offset = @parseOffsetGlobal(value)
        else
          @offsetGlobal = false
          hidden.offset = value
        value
    return

  initWithRedrawRegions: ->
    @hasChanged = false

    # Define hidden vars
    hidden = undefined
    hidden =
      x: 0
      y: 0
      opacity: 1
      direction: 0
      size: 1
      widthScale: 1
      heightScale: 1
      offset: undefined
      parentObject: this

    # Define getter/setters for hidden vars
    Object.defineProperty this, "x",
      get: ->
        hidden.x

      set: (value) ->
        if hidden.x isnt value
          hidden.x = value
          @onAfterChange()
        return

    Object.defineProperty this, "y",
      get: ->
        hidden.y

      set: (value) ->
        if hidden.y isnt value
          hidden.y = value
          @onAfterChange()
        return

    Object.defineProperty this, "opacity",
      get: ->
        hidden.opacity

      set: (value) ->
        if hidden.opacity isnt value
          hidden.opacity = value
          @onAfterChange()
        return

    Object.defineProperty this, "direction",
      get: ->
        hidden.direction

      set: (value) ->
        if hidden.direction isnt value
          hidden.direction = value
          @onAfterChange()
        return

    Object.defineProperty this, "size",
      get: ->
        hidden.size

      set: (value) ->
        if hidden.size isnt value
          hidden.size = value
          @onAfterChange()
        return

    Object.defineProperty this, "widthScale",
      get: ->
        hidden.widthScale

      set: (value) ->
        if hidden.widthScale isnt value
          hidden.widthScale = value
          @onAfterChange()
        return

    Object.defineProperty this, "heightScale",
      get: ->
        hidden.heightScale

      set: (value) ->
        if hidden.heightScale isnt value
          hidden.heightScale = value
          @onAfterChange()
        return

    Object.defineProperty this, "offset",
      get: ->
        hidden.offset

      set: (value) ->
        if hidden.offset isnt value
          hidden.offset = value
          off_ =
            x: value.x
            y: value.y


          # Put getters and setters on points values
          Object.defineProperty hidden.offset, "x",
            get: ->
              off_.x

            set: (value) ->
              if off_.x isnt value
                off_.x = value
                hidden.parentObject.onAfterChange()
              return


          # Put getters and setters on points values
          Object.defineProperty hidden.offset, "y",
            get: ->
              off_.y

            set: (value) ->
              if off_.y isnt value
                off_.y = value
                hidden.parentObject.onAfterChange()
              return

          @onAfterChange()
        return

    @offset = new Math.Vector()
    return

  onAfterChange: ->
    if not @hasChanged and @isDrawn()
      @lastRedrawRegion = @currentRedrawRegion
      @currentRedrawRegion = (if @getCombinedRedrawRegion then @getCombinedRedrawRegion() else @getRedrawRegion())
      if @currentRedrawRegion
        engine.redrawObjects.push this
        @hasChanged = true
    return

  ###
  Parses an offset global into an actual Math.Vector offset
  (this function is only here for convenience and should be replaced by any class that inherits the child class)

  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Math.Vector} A parsed version of the offset global
  ###
  parseOffsetGlobal: (offset) ->
    new Math.Vector()

  ###
  Checks if the child object is inside a room that is currently visible

  @return {Boolean} Whether or not the child object is currently in a visible room
  ###
  isInVisibleRoom: ->
    p = undefined
    p = @getParents().pop()
    p is engine.currentRoom or p is engine.masterRoom

  ###
  Checks if the child object is in a state where it will get drawn.
  For this function to return true, the child object has to be both visible and placed in a visible room.

  @return {Boolean} Whether or not the child object is in a state where it will get drawn
  ###
  isDrawn: ->
    @isVisible() and @isInVisibleRoom()

  ###
  Fetches the position of the child inside the room

  @return {Math.Vector|Boolean} The objects position in its room, or false if the object is not placed in any room.
  ###
  getRoomPosition: ->
    pos = undefined
    parents = undefined
    parent = undefined
    i = undefined
    parents = @getParents()
    if parents.length and parents[parents.length - 1] instanceof Engine.Room
      pos = new Math.Vector(@x, @y)
      i = 0
      while i < parents.length
        parent = parents[i]
        pos.scale parent.widthScale * parent.size, parent.heightScale * parent.size
        pos.rotate parent.direction
        pos.move parent.x, parent.y
        i++
      pos
    else
      false

  ###
  Creates and returns and array of all the child's parents (from closest to farthest)

  @return {View.Container[]} A list of all the child's parents
  ###
  getParents: ->
    parent = undefined
    parents = undefined
    parents = []
    parent = this
    parents.push parent  while (parent = parent.parent) isnt undefined
    parents

  ###
  Finds the room to which the object is currently added

  @return {View.Room|Boolean} The room to which the object is currently added, or false if the object is not added to a room
  ###
  getRoom: ->
    parents = undefined
    ancestor = undefined
    parents = @getParents()
    return false  if parents.length is 0
    ancestor = parents[parents.length - 1]
    (if ancestor instanceof Engine.Room then ancestor else false)

  ###
  Sets the position of the object relative to its parent

  @param {number} x The horisontal position
  @param {number} y The vertical position
  ###
  moveTo: (x, y) ->
    @x = x or 0
    @y = y or 0
    return

  ###
  Calculates the distance to another child (the distance between the object's positions)
  @param  {View.Child} child The object to calculate the distance to
  @return {number} The distance in pixels
  ###
  getDistanceTo: (child) ->
    @getRoomPosition().subtract(child.getRoomPosition()).getLength()

  ###
  Calculates the direction to another child
  @param  {View.Child} child The object to calculate the direction to
  @return {number} The direction in radians
  ###
  getDirectionTo: (child) ->
    child.getRoomPosition().subtract(@getRoomPosition()).getDirection()

  ###
  Checks if the objects is visible. This function runs before each draw to ensure that it is necessary
  @return {boolean} Whether or not the object is visible (based on its size and opacity vars)
  ###
  isVisible: ->

    # If sprites size has been modified to zero, do nothing
    not (@size is 0 or @widthScale is 0 or @heightScale is 0)
