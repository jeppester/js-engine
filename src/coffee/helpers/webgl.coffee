poly2tri = require 'poly2tri'

module.exports = WebGLHelper =
  planeCache: new Float32Array 12
  colorCache: {}
  polygonCoordsCache: {}
  polygonOutlineCoordsCache: {}
  lineCoordsCache: {}
  planeOutlineCoordsCache: {}
  circleTriangleCoordsCache: {}
  circleOutlineTriangleCoordsCache: {}

  generateCacheKeyForPoints: (points) ->
    string = ''
    string += "#{p.x},#{p.y}," for p in points
    string

  getLineCoords: (line) ->
    cacheKey = "#{line.a.x},#{line.a.y},#{line.b.x},#{line.b.y},#{line.lineWidth},#{line.lineCap}"
    coords = @lineCoordsCache[cacheKey]
    if !coords
      coords = line.createPolygonFromWidth(line.lineWidth, line.lineCap).getCoordinates()
      @lineCoordsCache[cacheKey] = coords
    coords

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

  # Produces bufferdata for TRIANGLES
  getPlaneOutlineTriangleCoords: (width, height, outlineWidth) ->
    cacheKey = "#{width},#{height},#{outlineWidth}"
    coords = @planeOutlineCoordsCache[cacheKey]
    if !coords
      outlineWidth /= 2
      ox1 = -outlineWidth
      ox2 = width + outlineWidth
      oy1 = -outlineWidth
      oy2 = height + outlineWidth
      ix1 = outlineWidth
      ix2 = width - outlineWidth
      iy1 = outlineWidth
      iy2 = height - outlineWidth
      coords = new Float32Array([
        # Top line
        ox1, oy1, ox2, oy1, ix1, iy1
        ix1, iy1, ix2, iy1, ox2, oy1

        # Left line
        ox1, oy1, ox1, oy2, ix1, iy1
        ix1, iy1, ix1, iy2, ox1, oy2

        # Bottom line
        ix1, iy2, ox1, oy2, ox2, oy2
        ix1, iy2, ix2, iy2, ox2, oy2

        # Right line
        ox2, oy1, ox2, oy2, ix2, iy1
        ix2, iy1, ix2, iy2, ox2, oy2
      ])
      @planeOutlineCoordsCache[cacheKey] = coords
    coords

  getCircleTriangleCoords: (radius) ->
    cacheKey = "#{radius}"
    coords = @circleTriangleCoordsCache[cacheKey]

    if !coords
      pointsCount = @getPointsCountForRadius(radius)
      trianglesCount = pointsCount - 2
      coords = new Float32Array(trianglesCount * 6)
      segmentLength = Math.PI * 2 / pointsCount

      firstX = Math.cos(-1 * segmentLength) * radius
      firstY = Math.sin(-1 * segmentLength) * radius
      lastX =  Math.cos(-2 * segmentLength) * radius
      lastY =  Math.sin(-2 * segmentLength) * radius
      while trianglesCount--
        # All other triangles consist of the very first point + the last used point
        offset = trianglesCount * 6
        coords[offset]             = firstX
        coords[offset + 1]         = firstY
        coords[offset + 2]         = lastX
        coords[offset + 3]         = lastY
        coords[offset + 4] = lastX = Math.cos(segmentLength * trianglesCount) * radius
        coords[offset + 5] = lastY = Math.sin(segmentLength * trianglesCount) * radius
      @circleTriangleCoordsCache[cacheKey] = coords
    coords

  # Produces bufferdata for TRIANGLE_STRIP
  getCircleOutlineTriangleCoords: (radius, outlineWidth) ->
    cacheKey = "#{radius},#{outlineWidth}"
    coords = @circleOutlineTriangleCoordsCache[cacheKey]
    if !coords
      pointsCount = @getPointsCountForRadius(radius)
      coords = new Float32Array pointsCount * 12 # Two triangles per point

      segmentLength = Math.PI * 2 / pointsCount
      outerRadius = radius + outlineWidth / 2
      innerRadius = radius - outlineWidth / 2

      lastInnerX = innerRadius
      lastInnerY = 0
      lastOuterX = outerRadius
      lastOuterY = 0
      while pointsCount--
        innerX = Math.cos(segmentLength * pointsCount) * innerRadius
        innerY = Math.sin(segmentLength * pointsCount) * innerRadius
        outerX = Math.cos(segmentLength * pointsCount) * outerRadius
        outerY = Math.sin(segmentLength * pointsCount) * outerRadius

        # Use the last corner coords to create two triangles
        offset = pointsCount * 12
        coords[offset]                   = lastInnerX
        coords[offset + 1]               = lastInnerY
        coords[offset + 2]               = lastOuterX
        coords[offset + 3]               = lastOuterY
        coords[offset + 4]               = outerX
        coords[offset + 5]               = outerY

        coords[offset + 6]               = lastInnerX
        coords[offset + 7]               = lastInnerY
        coords[offset + 8]  = lastInnerX = innerX
        coords[offset + 9]  = lastInnerY = innerY
        coords[offset + 10] = lastOuterX = outerX
        coords[offset + 11] = lastOuterY = outerY

      @circleOutlineTriangleCoordsCache[cacheKey] = coords
    coords

  getPointsCountForRadius: (radius)->
    if radius < 10
      12
    else if radius < 50
      30
    else if radius < 100
      50
    else
      80

  triangulatePolygonPoints: (points)->
    triangles = new poly2tri.SweepContext(points.slice())
      .triangulate()
      .getTriangles()
    new Float32Array triangles.reduce (coords, triangle)->
      p = triangle.getPoints()
      coords.push(
        p[0].x, p[0].y
        p[1].x, p[1].y
        p[2].x, p[2].y
      )
      coords
    , []

  calculatePolygonOutlineCoords: (points, width)->
    coords = new Float32Array(points.length * 4 + 4)

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
      coords[i * 4] = p1.x
      coords[i * 4 + 1] = p1.y
      coords[i * 4 + 2] = p2.x
      coords[i * 4 + 3] = p2.y

    coords[coords.length - 4] = coords[0]
    coords[coords.length - 3] = coords[1]
    coords[coords.length - 2] = coords[2]
    coords[coords.length - 1] = coords[3]
    coords

  setPolygon: (gl, points)->
    # Triangulate polygon if it is not already cached
    cacheKey = this.generateCacheKeyForPoints points
    unless this.polygonCoordsCache[cacheKey]
      this.polygonCoordsCache[cacheKey] = this.triangulatePolygonPoints(points)

    coords = this.polygonCoordsCache[cacheKey]
    gl.bufferData gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW
    return

  setPolygonOutline: (gl, points, width)->
    # Triangulate polygon if it is not already cached
    cacheKey = this.generateCacheKeyForPoints(points) + width
    unless this.polygonOutlineCoordsCache[cacheKey]
      this.polygonOutlineCoordsCache[cacheKey] = this.calculatePolygonOutlineCoords(points, width)

    coords = this.polygonOutlineCoordsCache[cacheKey]
    gl.bufferData gl.ARRAY_BUFFER, coords, gl.STATIC_DRAW
    return
