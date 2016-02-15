module.exports = -> module.exports::constructor.apply @, arguments

c = class Texture
  ###
  Parses an offset global into an actual Math.Vector offset that fits the object's texture

  @param  {number} offset Offset global (OFFSET_TOP_LEFT, etc.)
  @return {Math.Vector} The offset vector the offset global corresponds to for the object
  ###
  parseOffsetGlobal: (offset) ->
    ret = new Geometry.Vector()

    # calculate horizontal offset
    left = Globals.OFFSET_TOP_LEFT | Globals.OFFSET_MIDDLE_LEFT | Globals.OFFSET_BOTTOM_LEFT
    center = Globals.OFFSET_TOP_CENTER | Globals.OFFSET_MIDDLE_CENTER | Globals.OFFSET_BOTTOM_CENTER
    right = Globals.OFFSET_TOP_RIGHT | Globals.OFFSET_MIDDLE_RIGHT | Globals.OFFSET_BOTTOM_RIGHT
    if offset & left
      ret.x = 0
    else if offset & center
      ret.x = @clipWidth / 2
    else if offset & right
      ret.x = @clipWidth

    # calculate vertical offset
    top = Globals.OFFSET_TOP_LEFT | Globals.OFFSET_TOP_CENTER | Globals.OFFSET_TOP_RIGHT
    middle = Globals.OFFSET_MIDDLE_LEFT | Globals.OFFSET_MIDDLE_CENTER | Globals.OFFSET_MIDDLE_RIGHT
    bottom = Globals.OFFSET_BOTTOM_LEFT | Globals.OFFSET_BOTTOM_CENTER | Globals.OFFSET_BOTTOM_RIGHT
    if offset & top
      ret.y = 0
    else if offset & middle
      ret.y = @clipHeight / 2
    else if offset & bottom
      ret.y = @clipHeight
    ret

  ###
  Calculates the region which the object will fill out when redrawn.

  @private
  @return {Rectangle} The bounding rectangle of the object
  ###
  getRedrawRegion: ->
    box = new Geometry.Rectangle(-@offset.x, -@offset.y, @clipWidth, @clipHeight).getPolygon()
    parents = @getParents()
    parents.unshift this
    i = 0
    while i < parents.length
      parent = parents[i]
      box.scale parent.size * parent.widthScale, parent.size * parent.heightScale
      box.rotate parent.direction
      box.move parent.x, parent.y
      i++
    box = box.getBoundingRectangle()
    box.x = Math.floor(box.x)
    box.y = Math.floor(box.y)
    box.width = Math.ceil(box.width + 1)
    box.height = Math.ceil(box.height + 1)
    box

module.exports:: = Object.create c::
module.exports::constructor = c

Geometry =
  Vector: require '../geometry/vector'
  Rectangle: require '../geometry/rectangle'

Globals = require '../engine/globals'
