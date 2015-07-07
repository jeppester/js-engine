###
Constructor for Circle class, uses the set function, to set the properties of the circle.

@name Engine.Geometry.Circle
@class A math class which is used for handling circles
@augments Mixin.Animatable

@property {number} x The circle's horizontal position
@property {number} y The circle's vertical position
@property {number} radius The circle's radius

@param {number} x The x-coordinate for the center of the circle
@param {number} y The y-coordinate for the center of the circle
@param {number} radius The radius for the circle
###
module.exports = class Circle
  # Mix in animatable
  Engine.Helpers.Mixin.mixin @, Engine.Mixins.Animatable

  constructor: (x, y, radius) ->
    @set x, y, radius
    return

  ###
  Sets the properties of the circle.

  @param {number} x The x-coordinate for the center of the circle
  @param {number} y The y-coordinate for the center of the circle
  @param {number} radius The radius for the circle
  @return {Engine.Geometry.Circle} The resulting Circle object (itself)
  ###
  set: (x, y, radius) ->
    x = (if x isnt undefined then x else 0)
    y = (if y isnt undefined then y else 0)
    radius = (if radius isnt undefined then radius else 0)
    @x = x
    @y = y
    @radius = radius
    this

  ###
  Copies the Circle object.

  @return {Engine.Geometry.Circle} A copy of the Circle object (which can be modified without changing the original object)
  ###
  copy: ->
    new @constructor(@x, @y, @radius)

  ###
  Moves the Circle by adding a value to its x-coordinate and another value to its y-coordinate.

  @param {number} x The value to add to the x-coordinate (can be negative)
  @param {number} y The value to add to the y-coordinate (can be negative)
  @return {Engine.Geometry.Circle} The resulting Circle object (itself)
  ###
  move: (x, y) ->
    throw new Error("Argument x should be of type: Number") if typeof x isnt "number" #dev
    throw new Error("Argument y should be of type: Number") if typeof y isnt "number" #dev
    @x += x
    @y += y
    this

  ###
  Moves the Circle to a fixed position by setting its x- and y-coordinates.

  @param {number} x The x-coordinate of the position to move the Circle to
  @param {number} y The y-coordinate of the position to move the Circle to
  @return {Engine.Geometry.Circle} The resulting Circle object (itself)
  ###
  moveTo: (x, y) ->
    throw new Error("Argument x should be of type: Number") if typeof x isnt "number" #dev
    throw new Error("Argument y should be of type: Number") if typeof y isnt "number" #dev
    @x = x
    @y = y
    this

  ###
  Scales the Circle object by multiplying it radius with a factor.
  Please notice that, opposite to the Polygon and Line objects, the position of the Circle will not be changed by scaling it, since the center of the circle will not be scaled.
  Also: since ellipses are not supported yet, circles cannot be scaled with various factors horizontally and vertically, like the other geometric objects.

  @param {number} factor A factor with which to scale the Circle
  @return {Engine.Geometry.Circle} The resulting Circle object (itself)
  ###
  scale: (factor) ->
    throw new Error("Argument factor should be of type Number") if typeof factor isnt "number" #dev
    @radius *= factor
    this

  ###
  Calculates the perimeter of the circle

  @return {number} The perimeter of the Circle
  ###
  getPerimeter: ->
    @radius * 2 * PI

  ###
  Calculates the area of the Circle.

  @return {number} The area of the Circle
  ###
  getArea: ->
    pow(@radius) * PI

  ###
  Calculates the shortest distance from the Circle object to another geometric object

  @param {Engine.Geometry.Vector|Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
  ###
  getDistance: (object) ->
    if object instanceof Engine.Geometry.Vector
      Math.max 0, object.getDistance(new Engine.Geometry.Vector(@x, @y)) - @radius
    else if object instanceof Engine.Geometry.Line
      Math.max 0, object.getDistance(new Engine.Geometry.Vector(@x, @y)) - @radius
    else if object instanceof @constructor
      Math.max 0, new Engine.Geometry.Vector(@x, @y).getDistance(new Engine.Geometry.Vector(object.x, object.y)) - (@radius + object.radius)
    else if object instanceof Engine.Geometry.Rectangle
      object.getDistance this
    else if object instanceof Engine.Geometry.Polygon
      object.getDistance this
    else #dev
      throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon") #dev

  ###
  Checks whether or not the Circle contains another geometric object.

  @param {Engine.Geometry.Vector|Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object A geometric object to check
  @return {boolean} True if the Rectangle contains the checked object, false if not
  ###
  contains: (object) ->
    i = undefined
    cDist = undefined
    if object instanceof Engine.Geometry.Vector
      object.copy().move(-@x, -@y).getLength() < @radius
    else if object instanceof Engine.Geometry.Line
      @contains(object.a) and @contains(object.b)
    else if object instanceof @constructor

      # Find the distance between the circles' centres
      cDist = new Engine.Geometry.Vector(object.x, object.y).move(-@x, -@y).getLength()

      # If the sum of the distance and the checked circle's radius is smaller than this circles radius, this circle must contain the other circle
      cDist + object.radius < @radius
    else if object instanceof Engine.Geometry.Rectangle
      @contains object.getPolygon()
    else if object instanceof Engine.Geometry.Polygon

      # Check if any of the polygon's points are outside the circle
      i = 0
      while i < object.points.length
        return false unless @contains(object.points[i])
        i++

      # if not, the circle must contain the polygon
      true
    else #dev
      throw new Error("Argument object has to be of type: Vector, Line, Circle, Rectangle or Polygon") #dev

  ###
  Checks whether or not the Circle intersects with another geometric object.

  @param {Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object A geometric object to check. Supported objects are
  @return {boolean} True if the Circle intersects with the checked object, false if not
  ###
  intersects: (object) ->
    if object instanceof Engine.Geometry.Line
      @contains(object) is false and object.getDistance(this) <= 0
    else if object instanceof @constructor
      not @contains(object) and not object.contains(this) and new Engine.Geometry.Vector(@x, @y).getDistance(new Engine.Geometry.Vector(object.x, object.y)) <= @radius + object.radius
    else if object instanceof Engine.Geometry.Rectangle
      object.getPolygon().intersects this
    else if object instanceof Engine.Geometry.Polygon
      object.intersects this
    else #dev
      throw new Error("Argument object has to be of type: Line, Circle, Rectangle or Polygon") #dev
