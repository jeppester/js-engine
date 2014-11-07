nameSpace "View"

###*
The constructor for the Polygon class. Uses the setFromPoints-function to set the points of the polygon.

@name View.Polygon
@class A class which is used for handling polygons
@augments Math.Polygon
@augments View.Child

@property {Vector[]} points An array of the polygon's points. Each point is connect to the previous- and next points, and the first and last points are connected
@property {string} strokeStyle The polygon's color if added to a view (css color string)
@property {number} lineWidth The polygon's width if added to a view (in px)
@property {string} fillStyle The polygon's fill color if added to a view (css color string)

@param {Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
@param {string} [fillStyle = "#000"] The polygon's fill color if added to a view (css color string)
@param {string} [strokeStyle = "#000"] The polygon's color if added to a view (css color string)
@param {number} [lineWidth = 1] The polygon's width if added to a view (in px)
###
View.Polygon = (points, fillStyle, strokeStyle, lineWidth) ->
  View.Child.call this
  @renderType = "polygon"
  @setFromPoints points
  @fillStyle = fillStyle or "#000"
  @strokeStyle = strokeStyle or "#000"
  @lineWidth = lineWidth or 1
  @opacity = 1
  @closed = 1
  @lineDash = []
  return

View.Polygon:: = Object.create(Math.Polygon::)
View.Polygon::import View.Child::
###*
@lends View.Polygon.prototype
###

###*
Calculates the region which the object will fill out when redrawn.

@private
@return {Rectangle} The bounding rectangle of the redraw
###
View.Polygon::import getRedrawRegion: ->
  ln = undefined
  
  # Get bounding rectangle
  rect = @getBoundingRectangle()
  
  # line width
  ln = Math.ceil(@lineWidth / 2)
  rect.x -= ln
  rect.y -= ln
  rect.width += ln * 2
  rect.height += ln * 2
  rect.add @parent.getRoomPosition()

