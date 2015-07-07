Engine = require '../engine'

module.exports = class Polygon
  ###
  The constructor for the Polygon class. Uses the setFromPoints-function to set the points of the polygon.

  @name Engine.Geometry.Polygon
  @class A math class which is used for handling polygons
  @property {Engine.Geometry.Vector[]} points An array of the polygon's points. Each point is connect to the previous- and next points, and the first and last points are connected
  @param {Engine.Geometry.Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
  ###
  constructor: (points) ->
    @setFromPoints points
    return

  ###
  Sets the points of the polygon from Vector's.

  @param {Engine.Geometry.Vector[]} points An array of Vector's which are to be used as points for the polygon. Keep in mind that the polygon will NOT copy the points, so changing another reference to one of the added points will change the point inside the polygon.
  @return {Object} The resulting Polygon object (itself)
  ###
  setFromPoints: (points) ->
    @points = points
    this

  ###
  Sets the points of the polygon from a list on point coordinates. Please notice that this function can take as an infinite number of x- and y coordinates as arguments.

  @param {number} x1 The x-coordinate for the first point in the polygon
  @param {number} y1 The y-coordinate for the first point in the polygon
  @param {number} x2 The x-coordinate for the second point ...
  @param {number} y2 The y-coordinate for the second point ...
  @param {number} x3 The x-coordinate for the third point ...
  @param {number} y3 The y-coordinate for the third point ...
  @return {Polygon} The resulting Polygon object (itself)
  ###
  setFromCoordinates: (x1, y1, x2, y2, x3, y3) ->
    numPoints = Math.floor(arguments.length / 2)
    @points = []
    i = 0
    while i < numPoints
      x = arguments[i * 2]
      y = arguments[i * 2 + 1]
      throw new Error("All arguments should be of type: Number") if typeof x isnt "number" or typeof y isnt "number" #dev
      @points.push new Engine.Geometry.Vector(x, y)
      i++
    this

  ###
  Gets the polygons points as a list of coordinates

  @return {Array} An array of x- and y values
  ###
  getCoordinates: ->
    coords = []
    len = @points.length
    i = 0
    while i < len
      coords.push @points[i].x, @points[i].y
      i++
    coords

  ###
  Moves the Polygon object by moving all of its points.

  @param {number} x The value to add to all points' x-coordinates
  @param {number} y The value to add to all points' y-coordinates
  @return {Engine.Geometry.Polygon} The resulting Polygon object (itself)
  ###
  move: (x, y) ->
    throw new Error("Argument x should be of type Number") if typeof x isnt "number" #dev
    throw new Error("Argument y should be of type Number") if typeof y isnt "number" #dev
    @add new Engine.Geometry.Vector(x, y)

  ###
  Adds a vector to all points.

  @param {Engine.Geometry.Vector} vector A Vector to add to all points
  @return {Engine.Geometry.Polygon} The resulting Polygon object (itself)
  ###
  add: (vector) ->
    throw new Error("Argument vector should be of type Vector") if not vector instanceof Engine.Geometry.Vector #dev
    i = 0
    while i < @points.length
      @points[i].add vector
      i++
    this

  ###
  Rotates the Polygon object by rotating all of its points around the zero vector.

  @param {number} direction The number of radians to rotate the polygon
  @return {Engine.Geometry.Polygon} The resulting Polygon object (itself)
  ###
  rotate: (direction) ->
    throw new Error("Argument direction should be of type Number") if typeof direction isnt "number" #dev
    i = 0
    while i < @points.length
      @points[i].rotate direction
      i++
    this

  ###
  Scales the polygon by multiplying all of its points

  @param {number} scaleH A factor with which to scale the Polygon horizontally. If scaleH is undefined, both width and height will be scaled after this factor
  @param {number} scaleV A factor with which to scale the Polygon vertically
  @return {Engine.Geometry.Polygon} The resulting Polygon object (itself)
  ###
  scale: (scaleH, scaleV) ->
    i = 0
    while i < @points.length
      @points[i].scale scaleH, scaleV
      i++
    this

  ###
  Copies the Polygon object

  @return {Engine.Geometry.Polygon} A copy of the Polygon object (which can be modified without changing the original object)
  ###
  copy: ->
    new @constructor(@getPoints())

  ###
  Fetches all of the polygon's points as Vector objects

  @return {Engine.Geometry.Vector} An array containing all the points of the polygon, as Vector objects
  ###
  getPoints: ->
    points = []
    i = 0
    while i < @points.length
      points.push @points[i].copy()
      i++
    points

  ###
  Fetches all of the polygon's sides as Line objects.

  @return {Engine.Geometry.Vector} An array containing all of the polygon's sides as Line objects
  ###
  getLines: ->
    lines = []
    points = @points
    i = 0
    while i < points.length
      to = (if i is points.length - 1 then 0 else i + 1)
      lines.push new Engine.Geometry.Line(points[i], points[to])
      i++
    lines

  ###
  Calculates the bounding rectangle of the polygon

  @return {Engine.Geometry.Rectangle} The bounding rectangle
  ###
  getBoundingRectangle: ->
    throw new Error("Cannot create bounding rectangle for pointless polygon") if @points.length is 0 #dev
    startVector = new Engine.Geometry.Vector(@points[0].x, @points[0].y)
    endVector = startVector.copy()
    i = 0
    while i < @points.length
      startVector.x = Math.min(@points[i].x, startVector.x)
      startVector.y = Math.min(@points[i].y, startVector.y)
      endVector.x = Math.max(@points[i].x, endVector.x)
      endVector.y = Math.max(@points[i].y, endVector.y)
      i++
    new Engine.Geometry.Rectangle().setFromVectors startVector, endVector.subtract(startVector)

  ###
  Calculates the shortest distance from the Polygon object to another geometric object

  @param {Engine.Geometry.Vector|Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object The object to calculate the distance to
  @return {number} The distance
  ###
  getDistance: (object) ->
    # Initially set the distance to infinite
    dist = Number.POSITIVE_INFINITY
    lines = @getLines()
    if object instanceof Engine.Geometry.Vector
      i = 0
      while i < lines.length
        dist = Math.min(dist, lines[i].getDistance(object))
        break if dist < 0
        i++
      dist
    else if object instanceof Engine.Geometry.Line
      i = 0
      while i < lines.length
        dist = Math.min(dist, lines[i].getDistance(object))
        break if dist < 0
        i++
      dist
    else if object instanceof Engine.Geometry.Circle
      pVector = new Engine.Geometry.Vector(object.x, object.y)
      i = 0
      while i < lines.length
        dist = Math.min(dist, lines[i].getDistance(pVector))
        break if dist < 0
        i++
      Math.max 0, dist - object.radius
    else if object instanceof Engine.Geometry.Rectangle
      object.getDistance @
    else if object instanceof @constructor
      objLines = object.getLines()
      i = 0
      while i < lines.length
        ii = 0
        while ii < objLines.length
          dist = Math.min(dist, lines[i].getDistance(objLines[ii]))
          break if dist < 0
          ii++
        break if dist < 0
        i++
      dist
    else #dev
      throw new Error("Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon") #dev

  ###
  Checks whether or not the Polygon contains another geometric object.

  @param {Engine.Geometry.Vector|Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle} object A geometric object to check
  @return {boolean} True if the Polygon contains the checked object, false if not
  ###
  contains: (object) ->
    if object instanceof Engine.Geometry.Vector
      @intersects(new Engine.Geometry.Line().setFromCoordinates(-123456, -98765, object.x, object.y), true) % 2
    else if object instanceof Engine.Geometry.Line
      not @intersects(object) and @contains(object.a)
    else if object instanceof Engine.Geometry.Circle

      # Check that the circle's center is placed inside the Polygon
      if @contains(new Engine.Geometry.Vector(object.x, object.y))

        # If so, return whether or not, the circle does not intersect the polygon
        not @intersects(object)
      else
        false
    else if object instanceof Engine.Geometry.Rectangle
      @contains object.getPolygon()
    else if object instanceof @constructor
      object.points.length > 0 and not @intersects(object) and @contains(object.points[0])
    else #dev
      throw new Error("Argument object has to be of type: Vector, Line, Rectangle or Polygon") #dev

  ###
  Checks whether or not the Polygon intersects with another geometric object.

  @param {Engine.Geometry.Line|Engine.Geometry.Circle|Engine.Geometry.Rectangle|Engine.Geometry.Polygon} object A geometric object to check for intersections with
  @param {boolean} [countIntersections=true] A geometric object to check for intersections with
  @return {boolean} True if the Polygon intersects with the checked object, false if not
  ###
  intersects: (object, countIntersections) ->
    countIntersections = (if countIntersections isnt undefined then countIntersections else false)
    intersectionCount = 0 if countIntersections

    if object instanceof Engine.Geometry.Line
      lines = @getLines()
      i = 0
      while i < lines.length
        line = lines[i]
        if line.intersects(object)
          if countIntersections
            intersectionCount++
          else
            return true
        i++

    else if object instanceof Engine.Geometry.Circle
      # Check if each line intersects with the circle
      lines = @getLines()
      i = 0
      while i < lines.length
        if object.intersects(lines[i])
          if countIntersections
            intersectionCount++
          else
            return true
        i++

    else if object instanceof Engine.Geometry.Rectangle
      return @intersects(object.getPolygon())

    else if object instanceof @constructor
      lines = @getLines()
      oLines = object.getLines()
      i = 0
      while i < lines.length
        line = lines[i]
        ii = 0
        while ii < oLines.length
          oLine = oLines[ii]
          if line.intersects(oLine)
            if countIntersections
              intersectionCount++
            else
              return true
          ii++
        i++
    else #dev
      throw new Error("Argument object has to be of type: Line, Circle, Rectangle or Polygon") #dev

    if countIntersections
      intersectionCount
    else
      false
