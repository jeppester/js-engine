poly2tri = require 'poly2tri'
Vector = require '../geometry/vector'

module.exports = WebGLHelper =
  planeCache: new Float32Array 12
  colorCache: {}
  triangleCaches: {
    line: {}
    circle: {}
    circleOutline: {}
    polygon: {}
    polygonOutline: {}
    planeOutline: {}
  }

  # SHAPE TRIANGULATION FUNCTIONS
  getLineCoords: (line) ->
    cacheKey = "#{line.a.x},#{line.a.y},#{line.b.x},#{line.b.y},#{line.lineWidth},#{line.lineCap}"
    coords = @triangleCaches.line[cacheKey]
    unless coords
      points = line.createPolygonFromWidth(line.lineWidth, line.lineCap).points
      coords = @triangleCaches.line[cacheKey] = @getTrianglesForConvexShape(points)
    coords

  getPlaneOutlineTriangleCoords: (width, height, outlineWidth) ->
    cacheKey = "#{width},#{height},#{outlineWidth}"
    coords = @triangleCaches.planeOutline[cacheKey]
    if !coords
      points = [
        new Vector(0,     0)
        new Vector(width, 0)
        new Vector(width, height)
        new Vector(0,     height)
      ]
      coords = @triangleCaches.planeOutline[cacheKey] = @getOutlineCoords points, outlineWidth
    coords

  getCircleTriangleCoords: (radius) ->
    cacheKey = "#{radius}"
    coords = @triangleCaches.circle[cacheKey]

    unless coords
      points = @getCirclePoints(radius)
      coords = @triangleCaches.circle[cacheKey] = @getTrianglesForConvexShape(points)
    coords

  getCircleOutlineTriangleCoords: (radius, outlineWidth) ->
    cacheKey = "#{radius},#{outlineWidth}"
    coords = @triangleCaches.circleOutline[cacheKey]
    unless coords
      points = @getCirclePoints(radius)
      coords = @triangleCaches.circleOutline[cacheKey] = @getOutlineCoords points, outlineWidth
    coords

  getPolygonTriangleCoords: (points)->
    cacheKey = this.generateCacheKeyForPoints points
    coords = @triangleCaches.polygon[cacheKey]
    unless coords
      triangles = new poly2tri.SweepContext(points.slice())
        .triangulate()
        .getTriangles()
      coords = []
      triangles.forEach (triangle)->
        p = triangle.getPoints()
        coords.push(
          p[0].x, p[0].y
          p[1].x, p[1].y
          p[2].x, p[2].y
        )
      coords = @triangleCaches.polygon[cacheKey] = new Float32Array coords
    coords

  getPolygonOutlineTriangleCoords: (points, width)->
    cacheKey = "#{this.generateCacheKeyForPoints(points)},#{width}"
    coords = @triangleCaches.polygonOutline[cacheKey]
    unless coords
      coords = @triangleCaches.polygonOutline[cacheKey] = @getOutlineCoords points, width
    coords

  # OTHER HELPERS
  colorFromCSSString: (string) ->
    color = @colorCache[string]
    if !color
      if string.length is 4
        color = new Float32Array([
          parseInt(string.substr(1, 1), 16) / 16
          parseInt(string.substr(2, 1), 16) / 16
          parseInt(string.substr(3, 1), 16) / 16
        ])
      else
        color = new Float32Array([
          parseInt(string.substr(1, 2), 16) / 255
          parseInt(string.substr(3, 2), 16) / 255
          parseInt(string.substr(5, 2), 16) / 255
        ])
      @colorCache[string] = color
    color

  generateCacheKeyForPoints: (points) ->
    string = ''
    string += "#{p.x},#{p.y}," for p in points
    string

  getTrianglesForConvexShape: (points) ->
    trianglesCount = points.length - 2
    coords = new Float32Array(trianglesCount * 6)

    first = points[points.length - 1]
    last = points[points.length - 2]
    while trianglesCount--
      # All triangles consist of:
      # - the very first point
      # - the last used point
      # - the current point
      offset = trianglesCount * 6
      current = points[trianglesCount]
      coords[offset]     = first.x
      coords[offset + 1] = first.y
      coords[offset + 2] = last.x
      coords[offset + 3] = last.y
      coords[offset + 4] = current.x
      coords[offset + 5] = current.y
      last = current
    coords

  getCirclePoints: (radius)->
    pointsCount = Math.round(radius / 2)
    pointsCount = Math.min 80, pointsCount
    pointsCount = Math.max 12, pointsCount

    segmentLength = Math.PI * 2 / pointsCount
    points = []
    while pointsCount--
      points.push new Vector(
        Math.cos(segmentLength * pointsCount) * radius
        Math.sin(segmentLength * pointsCount) * radius
      )
    points

  getOutlineCoords: (points, width)->
    # Find miter points
    miterPoints = []
    for point, i in points
      prev = points[(i - 1 + points.length) % points.length]
      next = points[(i + 1 + points.length) % points.length]

      # Find normal direction
      pN = point.copy().subtract(prev)
      pN.set -pN.y, pN.x
      pN.scale 1 / pN.getLength()

      nN = next.copy().subtract(point)
      nN.set -nN.y, nN.x
      nN.scale 1 / nN.getLength()

      pointNormal = pN.copy().add nN

      # Find normal length
      angle = pN.getDirectionTo pointNormal
      length = width / 2 / Math.cos(angle)
      pointNormal.scale length / pointNormal.getLength()

      # Find miter points
      p1 = point.copy().add(pointNormal)
      p2 = point.copy().subtract(pointNormal)
      miterPoints.push [p1, p2]

    # Create triangles for miter points
    pointsCount = points.length
    coords = new Float32Array pointsCount * 12 # Two triangles per point

    lastPoint1 = miterPoints[0][0]
    lastPoint2 = miterPoints[0][1]
    while pointsCount--
      point1 = miterPoints[pointsCount][0]
      point2 = miterPoints[pointsCount][1]

      offset = pointsCount * 12
      coords[offset]      = lastPoint1.x
      coords[offset + 1]  = lastPoint1.y
      coords[offset + 2]  = lastPoint2.x
      coords[offset + 3]  = lastPoint2.y
      coords[offset + 4]  = point2.x
      coords[offset + 5]  = point2.y

      coords[offset + 6]  = lastPoint1.x
      coords[offset + 7]  = lastPoint1.y
      coords[offset + 8]  = point1.x
      coords[offset + 9]  = point1.y
      coords[offset + 10] = point2.x
      coords[offset + 11] = point2.y

      lastPoint1 = point1
      lastPoint2 = point2
    coords
