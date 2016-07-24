# Mixins and parent class at top
Helpers =
  Mixin: require '../helpers/mixin'

Mixins =
  Animatable: require '../mixins/animatable'

###
Constructor for the Vector class. Uses set-function to set the vector from x- and y values.

@name Vector
@class A math class which is used for handling two-dimensional vectors
@augments Mixin.Animatable

@property {number} x The x-value of the vector
@property {number} y The y-value of the vector
@param {number} [x=0] The x-value to set for the vector
@param {number} [y=0] The y-value to set for the vector
###
module.exports = class Vector
  Helpers.Mixin.mixin @, Mixins.Animatable

  constructor: (x, y) ->
    # Mix in animatable
    @set x, y
    return

  ###
  Sets the vector from x- and y values.

  @param {number} [x=0] The x-value to set for the vector
  @param {number} [y=0] The y-value to set for the vector
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  set: (x, y) ->
    @x = (if x isnt undefined then x else 0)
    @y = (if y isnt undefined then y else 0)
    this

  ###
  Calculates and sets the vector from a direction and a length.

  @param {number} direction The direction (in radians)
  @param {number} length The length
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  setFromDirection: (direction, length) ->
    throw new Error("Argument direction should be of type: Number") if typeof direction isnt "number" #dev
    throw new Error("Argument length should be of type: Number") if typeof length isnt "number" #dev
    @x = Math.cos(direction) * length
    @y = Math.sin(direction) * length
    this

  ###
  Copies the Vector object

  @return {Geometry.Vector} A copy of the Vector object (which can be modified without changing the original object)
  ###
  copy: ->
    new module.exports(@x, @y)

  ###
  Moves the vector by adding a value to its x-property and another value to its y-property.

  @param {number} x The value to add to the x-property (can be negative)
  @param {number} y The value to add to the y-property (can be negative)
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  move: (x, y) ->
    throw new Error("Argument x should be of type: Number") if typeof x isnt "number" #dev
    throw new Error("Argument y should be of type: Number") if typeof y isnt "number" #dev
    @x += x
    @y += y
    this

  ###
  Rotates the vector around the zero-vector.

  @param {number} direction The number of radians to rotate the vector
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  rotate: (direction) ->
    throw new Error("Argument direction should be of type: Number") if typeof direction isnt "number" #dev
    @setFromDirection @getDirection() + direction, @getLength()
    this

  ###
  Scales the vector by multiplying the x- and y values.

  @param {number} scaleH A factor with which to scale the Vector horizontally. If scaleH is undefined, both width and height will be scaled after this factor
  @param {number} scaleV A factor with which to scale the Vector vertically
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  scale: (scaleH, scaleV) ->
    throw new Error("Argument scaleH should be of type Number") if typeof scaleH isnt "number" #dev
    scaleV = (if scaleV isnt undefined then scaleV else scaleH)
    @x *= scaleH
    @y *= scaleV
    this

  ###
  Adds another vector to the Vector.
  Can by used for the same purpose as move, but takes a vector as argument.

  @param {Geometry.Vector} vector A vector to add to the Vector
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  add: (vector) ->
    if vector instanceof @constructor
      @x += vector.x
      @y += vector.y
    else if typeof vector is "number"
      @x += vector
      @y += vector
    else #dev
      throw new Error("Argument vector should be of type Vector or Number") #dev
    this

  ###
  Subtracts another vector from the Vector.

  @param {Geometry.Vector} vector A vector to subtract from the Vector
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  subtract: (vector) ->
    if vector instanceof module.exports
      @x -= vector.x
      @y -= vector.y
    else if typeof vector is "number"
      @x -= vector
      @y -= vector
    else #dev
      throw new Error("Argument vector should be of type Vector or Number") #dev
    this


  ###
  Divides the Vector with another vector.

  @param {Geometry.Vector} vector A vector to divide the Vector with
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  divide: (vector) ->
    if vector instanceof module.exports
      @x /= vector
      @y /= vector
    else if typeof vector is "number"
      @x /= vector
      @y /= vector
    else #dev
      throw new Error("Argument vector should be of type Vector or Number") #dev
    this

  ###
  Multiplies the Vector with another vector.

  @param {Geometry.Vector} vector A vector to multiply the Vector with
  @return {Geometry.Vector} The resulting Vector object (itself)
  ###
  multiply: (vector) ->
    throw new Error("Argument vector should be of type Vector") if not vector instanceof module.exports #dev
    @x *= vector.x
    @y *= vector.y
    this

  ###
  Calculates the cross product of the Vector and another vector

  @param {Geometry.Vector} vector The vector to use for the calculation
  @return {number} The dot product
  ###
  getDot: (vector) ->
    throw new Error("Argument vector should be of type: Vector") if not vector instanceof module.exports #dev
    @x * vector.x + @y * vector.y

  ###
  Calculates the cross product of the Vector and another vector

  @param {Geometry.Vector} vector The vector to use for the calculation
  @return {number} The cross product
  ###
  getCross: (vector) ->
    throw new Error("Argument vector should be of type: Vector") if not vector instanceof module.exports #dev
    @x * vector.y - @y * vector.x

  ###
  Calculates the length of the Vector

  @return {number} The vector's length
  ###
  getLength: ->
    Math.sqrt @getDot(this)

  ###
  Calculates the direction of the Vector

  @return {number} The vector's direction (in radians)
  ###
  getDirection: ->
    Math.atan2 @y, @x

  ###
  Calculates the direction to another Vector

  @param {Geometry.Vector} point A Vector to calculate the direction to
  @return {number} The direction to the object
  ###
  getDirectionTo: (point) ->
    throw new Error("Only Vectors or objects inheriting Vector are supported") if not point instanceof module.exports #dev
    point.copy().subtract(this).getDirection()

  ###
  Calculates the shortest distance from the Vector object to another geometric object

  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
  ###
  getDistance: (object) ->
    return object.copy().subtract(this).getLength() if object instanceof module.exports
    return object.getDistance(this) if object instanceof Geometry.Line
    return object.getDistance(this) if object instanceof Geometry.Circle
    return object.getDistance(this) if object instanceof Geometry.Rectangle
    return object.getDistance(this) if object instanceof Geometry.Polygon
    throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon") #dev

# Classes used in class functions at bottom
Geometry =
  Circle: require './circle'
  Line: require './line'
  Rectangle: require './rectangle'
  Polygon: require './polygon'
