module.exports = -> module.exports::constructor.apply @, arguments

# Mixins and parent class at top
Geometry =
  Vector: require '../geometry/vector'

###
@name View.Child
@class If a class inherits Child it can be added to the view list. Therefore all objects which can be drawn inherits this class
###
c = class Child
  renderType: null
  constructor: ->
    @x = 0
    @y = 0
    @opacity = 1
    @direction = 0
    @size = 1
    @widthScale = 1
    @heightScale = 1
    @offset = new Geometry.Vector()
    engine.registerObject this
    return

  offsetFromGlobal: (offset)->
    @offsetGlobal = offset
    @offset = @parseOffsetGlobal offset

  ###
  Parses an offset global into an actual Vector offset
  (this function is only here for convenience and should be replaced by any class that inherits the child class)

  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Vector} A parsed version of the offset global
  ###
  parseOffsetGlobal: (offset) ->
    throw new Error 'Offset globals are not supported for this class'

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

  @return {Vector|Boolean} The objects position in its room, or false if the object is not placed in any room.
  ###
  getRoomPosition: ->
    parents = @getParents()
    if parents.length and parents[parents.length - 1] instanceof Room
      pos = new Vector(@x, @y)
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
    parents.push parent while (parent = parent.parent) isnt undefined
    parents

  ###
  Finds the room to which the object is currently added

  @return {View.Room|Boolean} The room to which the object is currently added, or false if the object is not added to a room
  ###
  getRoom: ->
    parents = @getParents()
    return false if parents.length is 0
    ancestor = parents[parents.length - 1]
    (if ancestor instanceof Room then ancestor else false)

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

module.exports:: = Object.create c::
module.exports::constructor = c

# Classes used in class functions at bottom
Room = require '../engine/room'
