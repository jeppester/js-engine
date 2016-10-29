poly2tri = require 'poly2tri'

module.exports = WebGLHelper =
  planeCache: new Float32Array 12
  colorCache: new Float32Array 3
  polygonCoordsCache: {}
  polygonOutlineCoordsCache: {}

  generateCacheKeyForPoints: (points) ->
    string = ''
    string += "#{p.x},#{p.y}," for p in points
    string

  colorFromCSSString: (string) ->
    if string.length is 4
      a = string[1]
      b = string[2]
      c = string[3]
      string = '#' + a + a + b + b + c + c

    @colorCache[0] = parseInt(string.substr(1, 2), 16) / 255
    @colorCache[1] = parseInt(string.substr(3, 2), 16) / 255
    @colorCache[2] = parseInt(string.substr(5, 2), 16) / 255
    @colorCache

  # Produces bufferdata for TRIANGLES
  setPlane: (gl, x, y, width, height) ->
    x1 = x
    x2 = x + width
    y1 = y
    y2 = y + height

    p = @planeCache
    p[0] = x1
    p[1] = y1
    p[2] = x2
    p[3] = y1
    p[4] = x1
    p[5] = y2
    p[6] = x1
    p[7] = y2
    p[8] = x2
    p[9] = y1
    p[10] = x2
    p[11] = y2
    gl.bufferData gl.ARRAY_BUFFER, p, gl.STATIC_DRAW

  # Produces bufferdata for TRIANGLES
  setPlaneOutline: (gl, x, y, width, height, outlineWidth) ->
    outlineWidth /= 2
    ox1 = x - outlineWidth
    ox2 = x + width + outlineWidth
    oy1 = y - outlineWidth
    oy2 = y + height + outlineWidth
    ix1 = x + outlineWidth
    ix2 = x + width - outlineWidth
    iy1 = y + outlineWidth
    iy2 = y + height - outlineWidth
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array([

      # Top line
      ox1, oy1
      ox2, oy1
      ix1, iy1
      ix1, iy1
      ix2, iy1
      ox2, oy1

      # Left line
      ox1, oy1
      ox1, oy2
      ix1, iy1
      ix1, iy1
      ix1, iy2
      ox1, oy2

      # Bottom line
      ix1, iy2
      ox1, oy2
      ox2, oy2
      ix1, iy2
      ix2, iy2
      ox2, oy2

      # Right line
      ox2, oy1
      ox2, oy2
      ix2, iy1
      ix2, iy1
      ix2, iy2
      ox2, oy2
    ]), gl.STATIC_DRAW
    return

  # Produces bufferdata for TRIANGLE_FAN
  setConvexPolygon: (gl, coords) ->
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW
    return

  # Produces bufferdata for TRIANGLE_FAN
  setCircle: (gl, x, y, segmentsCount, radius) ->
    coords = new Array(segmentsCount * 2)
    segmentLength = Math.PI * 2 / segmentsCount
    i = 0
    while i < segmentsCount
      coords[i * 2] = x + Math.cos(segmentLength * i) * radius
      coords[i * 2 + 1] = y + Math.sin(segmentLength * i) * radius
      i++
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW
    return

  # Produces bufferdata for TRIANGLE_STRIP
  setCircleOutline: (gl, x, y, segmentsCount, radius, outlineWidth) ->
    coords = new Array(segmentsCount * 4)
    segmentLength = Math.PI * 2 / segmentsCount
    or_ = radius + outlineWidth / 2
    ir = radius - outlineWidth / 2

    # "<=" instead of "<" is because we want the first two points to appear
    # both in the beginning and in the end of the array (to close the circle)
    i = 0
    while i <= segmentsCount
      # Outer point
      coords[i * 4] = x + Math.cos(segmentLength * i) * or_
      coords[i * 4 + 1] = y + Math.sin(segmentLength * i) * or_

      # Inner point
      coords[i * 4 + 2] = x + Math.cos(segmentLength * i) * ir
      coords[i * 4 + 3] = y + Math.sin(segmentLength * i) * ir
      i++
    gl.bufferData gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW
    return

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
