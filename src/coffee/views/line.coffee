Helpers =
  Mixin: require '../helpers/mixin'

Geometry =
  Line: require '../geometry/line'

Views =
  Child: require './child'

###
Constructor for the Line class. Uses setFromVectors to create the line's start and end points

@name View.Line
@class A class which is used for handling lines
@augments View.Child
@augments Mixin.Animatable

@property {View.Vector} a The line's starting point
@property {View.Vector} b The line's ending point
@property {string} strokeStyle The line's color if added to a view (css color string)
@property {string} lineWidth The line's width if added to a view (in px)
@property {string} lineCap The line's cap style if added to a view

@param {View.Vector} startVector A Vector representing the start point of the line
@param {View.Vector} endVector A Vector representing the end point of the line
@param {string} [strokeStyle="#000"] The line's color if added to a view (css color string)
@param {number} [lineWidth=1] The line's width if added to a view (in px)
@param {string} [lineCap='butt'] The line's cap style if added to a view
###
module.exports = class Line extends Geometry.Line
  # Mix in Child
  Helpers.Mixin.mixin @, Views.Child

  constructor: (startVector, endVector, strokeStyle, lineWidth, lineCap) ->
    Views.Child::constructor.call this
    @renderType = "line"
    @strokeStyle = strokeStyle or "#000"
    @lineWidth = lineWidth or 1
    @lineCap = lineCap or "butt"
    @setFromVectors startVector or new Geometry.Vector(), endVector or new Geometry.Vector()
    return

  ###
  Calculates the region which the object will fill out when redrawn.

  @private
  @return {Math.Rectangle} The bounding rectangle of the redraw
  ###
  getRedrawRegion: ->
    box = @getPolygon()
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
    ln = Math.ceil(@lineWidth / 2)
    box.x = Math.floor(box.x - ln)
    box.y = Math.floor(box.y - ln)
    box.width = Math.ceil(box.width + ln * 2 + 1)
    box.height = Math.ceil(box.height + ln * 2 + 1)
    box #


  ###
  Override View.Child's isVisible-function, making the line invisible if its points share the same coordinates
  Above is how canvas does by default (but other renderers should do this by default as well)

  @return {Boolean} Whether or not the line is "visible" (if not, renderers will not try to draw it)
  ###
  isVisible: ->
    Views.Child::isVisible.call(@) and (@a.x isnt @b.x or @a.y isnt @b.y)

Geometry.Vector = require '../geometry/vector'
