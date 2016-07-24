Helpers =
  Mixin: require '../helpers/mixin'

Geometry =
  Circle: require '../geometry/circle'

Views =
  Child: require './child'

###
Constructor for Circle class, uses the set function, to set the properties of the circle.

@name View.Circle
@class A class which is used for handling circles
@augments Math.Circle
@augments View.Child

@property {number} x The circle's horizontal position
@property {number} y The circle's vertical position
@property {number} radius The circle's radius
@property {string} strokeStyle The circle's color if added to a view (css color string)
@property {number} lineWidth The circle's width if added to a view (in px)
@property {string} fillStyle The circle's fill color if added to a view (css color string)

@param {number} x The x-coordinate for the center of the circle
@param {number} y The y-coordinate for the center of the circle
@param {number} radius The radius for the circle
@param {string} [fillStyle = "#000"] The circle's fill color if added to a view (css color string)
@param {string} [strokeStyle = "#000"] The circle's color if added to a view (css color string)
@param {number} [lineWidth = 1] The circle's width if added to a view (in px)
###
module.exports = class Circle extends Geometry.Circle
  # Mix in Child
  Helpers.Mixin.mixin @, Views.Child

  constructor: (x, y, radius, @fillStyle = "#000", @strokeStyle = "#000", @lineWidth = 0)->
    Views.Child::constructor.call this

    @renderType = "circle"
    @set x, y, radius
    return

Geometry.Rectangle = require '../geometry/rectangle'
