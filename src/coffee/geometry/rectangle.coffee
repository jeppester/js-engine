Engine = require '../engine'

###
The constructor for the Rectangle class. Uses the set-function to set the properties of the rectangle.

@name Engine.Geometry.Rectangle
@class A rectangle class which is used for handling non-rotated rectangles
@augments Vector

@property {number} x The top left corner's x-coordinate
@property {number} y The top left corner's y-coordinate
@property {number} width The width of the rectangle
@property {number} height The height of the rectangle

@param {number} x The x-coordinate for the rectangle's top left corner
@param {number} y The y-coordinate for the rectangle's top left corner
@param {number} width The width of the rectangle
@param {number} height The height of the rectangle
###
module.exports = class Rectangle extends Engine.Geometry.Vector
  # Mix in animatable
  Engine.Helpers.Mixin.mixin @, Engine.Mixins.Animatable

  constructor: (x, y, width, height, fillStyle, strokeStyle, lineWidth) ->
    @set x, y, width, height

  ###
  Sets the properties of the rectangle.

  @param {number} x The x-coordinate for the rectangle's top left corner
  @param {number} y The y-coordinate for the rectangle's top left corner
  @param {number} width The width of the rectangle
  @param {number} height The height of the rectangle
  @return {Engine.Geometry.Rectangle} The resulting Rectangle object (itself)
  ###
  set: (x, y, width, height) ->
    @x = (if x isnt undefined then x else 0)
    @y = (if y isnt undefined then y else 0)
    @width = (if width isnt undefined then width else 0)
    @height = (if height isnt undefined then height else 0)
    this

  ###
  Sets the properties of the rectangle from two vectors: one representing the position of the top left corner, another representing the width and height of the rectangle.

  @param {Engine.Geometry.Vector} position A Vector representing the position of the top left corner to set for the Rectangle
  @param {Engine.Geometry.Vector} size A Vector representing the size (width and height) to set for the Rectangle
  @return {Engine.Geometry.Rectangle} The resulting Rectangle object (itself)
  ###
  setFromVectors: (position, size) ->
    position = (if position isnt undefined then position else new Engine.Geometry.Vector())
    size = (if size isnt undefined then size else new Engine.Geometry.Vector())
    @x = position.x
    @y = position.y
    @width = size.x
    @height = size.y
    this

  ###
  Copies the Rectangle object

  @return {Engine.Geometry.Rectangle} A copy of the Rectangle object (which can be modified without changing the original object)
  ###
  copy: ->
    new @constructor(@x, @y, @width, @height)

  ###
  Moves the Rectangle by adding a value to its x-coordinate and another value to its y-coordinate.

  @param {number} x The value to add to the x-coordinate (can be negative)
  @param {number} y The value to add to the y-coordinate (can be negative)
  @return {Engine.Geometry.Rectangle} The resulting Rectangle object (itself)
  ###
  move: (x, y) ->
    throw new Error("Argument x should be of type: Number") if typeof x isnt "number" #dev
    throw new Error("Argument y should be of type: Number") if typeof y isnt "number" #dev
    @x += x
    @y += y
    this

  ###
  Moves the Rectangle to a fixed position by setting its x- and y-coordinates.

  @param {number} x The x-coordinate of the position to move the Rectangle to
  @param {number} y The y-coordinate of the position to move the Rectangle to
  @return {Engine.Geometry.Rectangle} The resulting Rectangle object (itself)
  ###
  moveTo: (x, y) ->
    throw new Error("Argument x should be of type: Number") if typeof x isnt "number" #dev
    throw new Error("Argument y should be of type: Number") if typeof y isnt "number" #dev
    @x = x
    @y = y
    this

  ###
  Calculates the overlapping area of the rectangle and another rectangle
  @param  {Engine.Geometry.Rectangle} rectangle The rectangle to use for the operation
  @return {Engine.Geometry.Rectangle|boolean} The overlapping rectangle, or false if there is no overlap
  ###
  getOverlap: (rectangle) ->
    x2 = undefined
    y2 = undefined
    rx2 = undefined
    ry2 = undefined
    crop = undefined
    x2 = @x + @width
    y2 = @y + @height
    rx2 = rectangle.x + rectangle.width
    ry2 = rectangle.y + rectangle.height
    crop = new Engine.Geometry.Rectangle()
    crop.x = (if rectangle.x > @x then rectangle.x else @x)
    crop.y = (if rectangle.y > @y then rectangle.y else @y)
    x2 = (if rx2 > x2 then x2 else rx2)
    y2 = (if ry2 > y2 then y2 else ry2)
    crop.width = x2 - crop.x
    crop.height = y2 - crop.y
    (if crop.width <= 0 or crop.height <= 0 then false else crop)

  ###
  Scales the Rectangle by multiplying the width and height values.
  Please notice that, opposed to the Polygon and Line objects, the position of the Rectangle will not be changed by scaling it, since the position of the top left corner will not be scaled.

  @param {number} scaleH A factor with which to scale the Rectangle horizontally. If scaleH is undefined, both width and height will be scaled after this factor
  @param {number} scaleV A factor with which to scale the Rectangle vertically
  @return {Engine.Geometry.Rectangle} The resulting Rectangle object (itself)
  ###
  scale: (scaleH, scaleV) ->
    throw new Error("Argument scaleH should be of type Number") if typeof scaleH isnt "number" #dev
    scaleV = (if scaleV isnt undefined then scaleV else scaleH)
    @width *= scaleH
    @height *= scaleV
    this

  ###
  Calculates the bounding rectangle of the of the two rectangles

  @param {Engine.Geometry.Rectangle} rectangle The rectangle to use for the calculation
  @return {Engine.Geometry.Rectangle} The bounding rectangle for the two rectangles
  ###
  getBoundingRectangle: (rectangle) ->
    x2 = undefined
    y2 = undefined
    rx2 = undefined
    ry2 = undefined
    crop = undefined
    x2 = @x + @width
    y2 = @y + @height
    rx2 = rectangle.x + rectangle.width
    ry2 = rectangle.y + rectangle.height
    crop = new Engine.Geometry.Rectangle()
    crop.x = (if rectangle.x < @x then rectangle.x else @x)
    crop.y = (if rectangle.y < @y then rectangle.y else @y)
    x2 = (if rx2 < x2 then x2 else rx2)
    y2 = (if ry2 < y2 then y2 else ry2)
    crop.width = x2 - crop.x
    crop.height = y2 - crop.y
    crop

  ###
  Creates a polygon with the same points as the rectangle.

  @return {Engine.Geometry.Polygon} The created Polygon object
  ###
  getPolygon: ->
    new Engine.Geometry.Polygon(@getPoints())

  ###
  Fetches the Rectangles points.

  @return {Engine.Geometry.Vector[]} Array of points, in the following order: top left corner, top right corner, bottom right corner, bottom left corner
  ###
  getPoints: ->
    [
      new Engine.Geometry.Vector(@x, @y)
      new Engine.Geometry.Vector(@x + @width, @y)
      new Engine.Geometry.Vector(@x + @width, @y + @height)
      new Engine.Geometry.Vector(@x, @y + @height)
    ]

  ###
  Calculates the area of the Rectangle.

  @return {number} The area of the Rectangle
  ###
  getArea: ->
    @width * @height

  ###
  Calculates the diagonal length of the Rectangle

  @return {number} The diagonal length of the Rectangle
  ###
  getDiagonal: ->
    Rectangle.sqrt Rectangle.pow(@width, 2) + Rectangle.pow(@height, 2)

  ###
  Calculates the shortest distance from the Rectangle object to another geometric object

  @param {Engine.Geometry.Vector|Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
  ###
  getDistance: (object) ->
    @getPolygon().getDistance object

  ###
  Checks whether or not the Rectangle contains another geometric object.

  @param {Engine.Geometry.Vector|Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object A geometric object to check
  @return {boolean} True if the Rectangle contains the checked object, false if not
  ###
  contains: (object) ->

    # If checked object is a vector, line or rectangle, do fast calculation otherwise convert to polygon and do calculation
    return @contains(new Engine.Geometry.Vector(object.x, object.y)) and @contains(new Engine.Geometry.Vector(object.x + object.width, object.y + object.height)) if object instanceof @constructor
    return @contains(object.a) and @contains(object.b) if object instanceof Engine.Geometry.Line
    return (object.x > @x and object.x < @x + @width and object.y > @y and object.y < @y + @height) if object instanceof Engine.Geometry.Vector
    @getPolygon().contains object

  ###
  Checks whether or not the Rectangle intersects with another geometric object.

  @param {Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object A geometric object to check
  @return {boolean} True if the Polygon intersects with the checked object, false if not
  ###
  intersects: (object) ->
    @getPolygon().intersects object
