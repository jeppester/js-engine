nameSpace('Mixin');

Mixin.WebGLHelpers = createClass( /** @lends Mixin.WebGLHelpers.prototype */ {
  colorFromCSSString: function (string) {
    var a, b, c;

    if (string.length === 4) {
      a = string.substr(1,1);
      b = string.substr(2,1);
      c = string.substr(3,1);
      return parseInt("0x" + a + a + b + b + c + c);
    }
    else {
      return parseInt("0x" + string.substr(1, 6));
    }
  },

  // Produces bufferdata for TRIANGLES
  setPlane: function(gl, x, y, width, height) {
    var x1, x2, y1, y2;

    x1 = x;
    x2 = x + width;
    y1 = y;
    y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2]), gl.STATIC_DRAW);
  },

  // Produces bufferdata for TRIANGLES
  setPlaneOutline: function(gl, x, y, width, height, outlineWidth) {
    var ox1, ox2, oy1, oy2, ix1, ix2, iy1, iy2;

    outlineWidth /= 2;

    ox1 = x - outlineWidth;
    ox2 = x + width + outlineWidth;
    oy1 = y - outlineWidth;
    oy2 = y + height + outlineWidth;

    ix1 = x + outlineWidth;
    ix2 = x + width - outlineWidth;
    iy1 = y + outlineWidth;
    iy2 = y + height - outlineWidth;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      // Top line
      ox1, oy1, ox2, oy1, ix1, iy1,
      ix1, iy1, ix2, iy1, ox2, oy1,

      // Left line
      ox1, oy1, ox1, oy2, ix1, iy1,
      ix1, iy1, ix1, iy2, ox1, oy2,

      // Bottom line
      ix1, iy2, ox1, oy2, ox2, oy2,
      ix1, iy2, ix2, iy2, ox2, oy2,

      // Right line
      ox2, oy1, ox2, oy2, ix2, iy1,
      ix2, iy1, ix2, iy2, ox2, oy2,

      ]), gl.STATIC_DRAW);
  },

  // Produces bufferdata for TRIANGLE_FAN
  setConvexPolygon: function(gl, coords) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  },

  // Produces bufferdata for TRIANGLE_FAN
  setCircle: function(gl, x, y, segmentsCount, radius) {
    var i, coords, segmentLength;

    coords = new Array(segmentsCount * 2);
    segmentLength = Math.PI * 2 / segmentsCount;

    for (i = 0; i < segmentsCount; i ++) {
      coords[i * 2] = x + Math.cos(segmentLength * i) * radius;
      coords[i * 2 + 1] = y + Math.sin(segmentLength * i) * radius;
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  },

  // Produces bufferdata for TRIANGLE_STRIP
  setCircleOutline: function (gl, x, y, segmentsCount, radius, outlineWidth) {
    var i, coords, segmentLength, or, ir;

    coords = new Array(segmentsCount * 4);
    segmentLength = Math.PI * 2 / segmentsCount;

    or = radius + outlineWidth / 2;
    ir = radius - outlineWidth / 2;

    // "<=" instead of "<" is because we want the first two points to appear
    // both in the beginning and in the end of the array (to close the circle)
    for (i = 0; i <= segmentsCount; i ++) {
      // Outer point
      coords[i * 4] = x + Math.cos(segmentLength * i) * or;
      coords[i * 4 + 1] = y + Math.sin(segmentLength * i) * or;

      // Inner point
      coords[i * 4 + 2] = x + Math.cos(segmentLength * i) * ir;
      coords[i * 4 + 3] = y + Math.sin(segmentLength * i) * ir;
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  },
});
