###
Constructor for the Line class. Uses setFromVectors to create the line's start and end points

@name Geometry.Line
@class A math class which is used for handling lines
@augments Mixin.Animatable

@property {Geometry.Vector} a The line's starting point
@property {Geometry.Vector} b The line's ending point

@param {Geometry.Vector} startVector A Vector representing the start point of the line
@param {Geometry.Vector} endVector A Vector representing the end point of the line
###
module.exports = class Line
  constructor: (startVector, endVector) ->
    startVector = (if startVector isnt undefined then startVector else new Geometry.Vector())
    endVector = (if endVector isnt undefined then endVector else new Geometry.Vector())
    @setFromVectors startVector, endVector
    return

  ###
  Sets the start- and end points from two Vector's.

  @param {Geometry.Vector} startVector A Vector representing the start point of the line
  @param {Geometry.Vector} endVector A Vector representing the end point of the line
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  setFromVectors: (startVector, endVector) ->
    throw new Error("Argument startVector should be of type: Vector") if not startVector instanceof Geometry.Vector #dev
    throw new Error("Argument endVector should be of type: Vector") if not endVector instanceof Geometry.Vector #dev
    @a = startVector
    @b = endVector
    this

  ###
  Sets the start- and end points directly from x- and y-coordinates.

  @param {number} x1 The start points' x-coordinate
  @param {number} y1 The start points' y-coordinate
  @param {number} x2 The end points' x-coordinate
  @param {number} y2 The end points' y-coordinate
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  setFromCoordinates: (x1, y1, x2, y2) ->
    x1 = (if x1 isnt undefined then x1 else 0)
    y1 = (if y1 isnt undefined then y1 else 0)
    x2 = (if x2 isnt undefined then x2 else 0)
    y2 = (if y2 isnt undefined then y2 else 0)
    @a = new Geometry.Vector(x1, y1)
    @b = new Geometry.Vector(x2, y2)
    this

  ###
  Copies the Line object

  @return {Geometry.Line} A copy of the Line object (which can be modified without changing the original object)
  ###
  copy: ->
    new @constructor(@a, @b)

  ###
  Moves the line by moving the start- and the end point

  @param {number} x The value to add to both points' x-coordinates
  @param {number} y The value to add to both points' y-coordinates
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  move: (x, y) ->
    @a.move x, y
    @b.move x, y
    this

  ###
  Rotates the line around the zero-vector.

  @param {number} direction The number of radians to rotate the line
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  rotate: (direction) ->
    throw new Error("Argument direction should be of type: Number") if typeof direction isnt "number" #dev
    @a.rotate direction
    @b.rotate direction
    this

  ###
  Scales the line by multiplying the start- and end points

  @param {number} scaleH A factor with which to scale the Line horizontally.
  @param {number} [scaleV=scaleH] A factor with which to scale the Line vertically
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  scale: (scaleH, scaleV) ->
    @a.scale scaleH, scaleV
    @b.scale scaleH, scaleV
    this

  ###
  Adds a vector to the start- and end points of the line.
  Can by used for the same purpose as move, but takes a vector as argument.

  @param {Geometry.Vector} vector A vector to add to the line's start- and end points
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  add: (vector) ->
    @a.add vector
    @b.add vector
    this

  ###
  Subtracts a vector from the start- and end points of the line.

  @param {Geometry.Vector} vector A vector to subtract from the line's start- and end points
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  subtract: (vector) ->
    @a.substract vector
    @b.substract vector
    this

  ###
  Divides the start- and end points of the line with a vector.

  @param {Geometry.Vector} vector A vector to divide the line's start- and end points with
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  divide: (vector) ->
    @a.divide vector
    @b.divide vector
    this

  ###
  Multiplies the start- and end points of the line with a vector.

  @param {Geometry.Vector} vector A vector to multiply the line's start- and end points with
  @return {Geometry.Line} The resulting Line object (itself)
  ###
  multiply: (vector) ->
    @a.multiply vector
    @b.multiply vector
    this

  ###
  Checks whether the line intersects with another line or polygon.

  @param {Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object Geometric object to check for an intersection with
  @return {boolean} True if the checked object intersects with the line, false if not
  ###
  intersects: (object) ->
    if object instanceof @constructor
      c1 = undefined
      c2 = undefined
      c1 = (@b.x - @a.x) * (object.a.y - @b.y) - (object.a.x - @b.x) * (@b.y - @a.y)
      c2 = (@b.x - @a.x) * (object.b.y - @b.y) - (object.b.x - @b.x) * (@b.y - @a.y)
      return false if c1 * c2 > 0
      c1 = (object.b.x - object.a.x) * (@a.y - object.b.y) - (@a.x - object.b.x) * (object.b.y - object.a.y)
      c2 = (object.b.x - object.a.x) * (@b.y - object.b.y) - (@b.x - object.b.x) * (object.b.y - object.a.y)
      c1 * c2 < 0
    else if object instanceof Geometry.Circle
      object.intersects this
    else if object instanceof Geometry.Rectangle
      object.getPolygon().intersects this
    else if object instanceof Geometry.Polygon
      object.intersects this
    else #dev
      throw new Error("Argument object should be of type: Line, Rectangle, Circle or Polygon") #dev

  ###
  Calculates the length of the line.

  @return {number} The length of the line
  ###
  getLength: ->
    @b.copy().subtract(@a).getLength()

  ###
  Calculates the shortest distance from the Line object to another geometric object

  @param {Geometry.Vector|Geometry.Line|Geometry.Circle|Geometry.Rectangle|Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
  ###
  getDistance: (object) ->
    if object instanceof Geometry.Vector
      # Get all possibly used vectors
      ba = @a.copy().subtract(@b)
      ab = @b.copy().subtract(@a)
      bc = object.copy().subtract(@b)
      ac = object.copy().subtract(@a)

      # Check if one of the end points is closest to the vector
      if ab.getDot(bc) > 0
        bc.getLength()
      else if ba.getDot(ac) > 0
        ac.getLength()

      # Otherwise, return the distance from the vector to it's orthogonal projection on the line
      else
        Math.abs ab.getCross(ac) / ab.getLength()
    else if object instanceof @constructor
      # If the lines intersect, return 0
      if @intersects(object)
        0

      # Else, return the shortest of the distances from each line to the other line's points
      else
        Math.min @getDistance(object.a), @getDistance(object.b), object.getDistance(@a), object.getDistance(@b)
    else if object instanceof Geometry.Rectangle
      object.getDistance this
    else if object instanceof Geometry.Circle
      object.getDistance this
    else #dev
      throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon") #dev

  ###
  Creates a rectangular polygon based on the line segment and a width

  @param {Number} width The wished width of the created polygon
  @param {String} lineCap The type of line capsulation, supported types are: "butt", "square", "round"
  ###
  createPolygonFromWidth: (width, lineCap) ->
    lineCap = lineCap or "butt"
    v = @a.copy().subtract(@b)
    v.set v.y, -v.x
    r = (width / 2) / v.getLength()
    ort = v.scale(r)
    if lineCap isnt "round"
      a = @a.copy().add(ort)
      b = @a.copy().subtract(ort)
      c = @b.copy().subtract(ort)
      d = @b.copy().add(ort)
      if lineCap is "square"
        a.move -ort.y, ort.x
        b.move -ort.y, ort.x
        c.move ort.y, -ort.x
        d.move ort.y, -ort.x
      new Geometry.Polygon([
        a
        b
        c
        d
      ])
    else

      # To make round caps, make the line as two half circles, one half relative til point a, the other half relative to point b
      points = new Array(32)
      startAngle = ort.getDirection()
      width /= 2
      segmentRad = Math.PI / 15
      i = 0
      while i < 16
        angle = startAngle + segmentRad * i
        points[i] = new Geometry.Vector(@a.x + width * Math.cos(angle), @a.y + width * Math.sin(angle))
        i++
      i = 0
      while i < 16
        angle = startAngle + segmentRad * (i + 15)
        points[i + 16] = new Geometry.Vector(@b.x + width * Math.cos(angle), @b.y + width * Math.sin(angle))
        i++
      new Geometry.Polygon(points)

  ###
  Creates a polygon with the same points as the line.

  @return {Geometry.Polygon} The created Polygon object
  ###
  getPolygon: ->
    new Geometry.Polygon([
      @a.copy()
      @b.copy()
    ])

Geometry =
  Circle: require './circle'
  Rectangle: require './rectangle'
  Polygon: require './polygon'
  Vector: require './vector'
