module.exports = WebGLHelper =
  planeCache: new Float32Array 12

  colorFromCSSString: (string) ->
    if string.length is 4
      a = string.substr(1, 1)
      b = string.substr(2, 1)
      c = string.substr(3, 1)
      parseInt "0x" + a + a + b + b + c + c
    else
      parseInt "0x" + string.substr(1, 6)

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
