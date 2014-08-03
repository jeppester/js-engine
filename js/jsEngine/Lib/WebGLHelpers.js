new Class('Lib.WebGLHelpers', {
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

  setConvexPolygon: function(gl, coords) {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW);
  },
});
