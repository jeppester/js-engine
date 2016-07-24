Helpers =
  Mixin: require '../helpers/mixin'

Geometry =
  Polygon: require '../geometry/polygon'

Views =
  Child: require './child'

###
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
module.exports = class Polygon extends Geometry.Polygon
  # Mix in Child
  Helpers.Mixin.mixin @, Views.Child

  constructor: (points, @fillStyle = '#000', @strokeStyle = "#000", @lineWidth = 0) ->
    # "Fake" extend child (to get view.child properties)
    Views.Child::constructor.call @
    @renderType = "polygon"
    @setFromPoints points
    @opacity = 1
    @closed = 1
    @lineDash = []
    return
