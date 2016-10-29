module.exports = class TriangleBuffer
  constructor: (@triangleCount)->
    # Each point has a two coordinates, a color, and an opacity
    @buffer = new Float32Array (2 + 3 + 1) * 3 * @triangleCount # 20000 triangles
    @currentTriangle = 0

  resetIndex: -> @currentTriangle = 0

  getTriangleCount: -> @currentTriangle

  getBuffer: -> @buffer

  pushTriangle: (x1, y1, x2, y2, x3, y3, color, opacity, wm) ->
    i = @currentTriangle * 18
    ++@currentTriangle

    # Matrix equation:
    # x = x * wm[0] + y * wm[3] + wm[6]
    # y = x * wm[1] + y * wm[4] + wm[7]

    # Point 1
    @buffer[i] =     x1 * wm[0] + y1 * wm[3] + wm[6] # x
    @buffer[i + 1] = x1 * wm[1] + y1 * wm[4] + wm[7] # y
    @buffer[i + 2] = color[0] # r
    @buffer[i + 3] = color[1] # g
    @buffer[i + 4] = color[2] # b
    @buffer[i + 5] = opacity # opacity

    # Point 2
    @buffer[i + 6] =  x2 * wm[0] + y2 * wm[3] + wm[6] # x
    @buffer[i + 7] =  x2 * wm[1] + y2 * wm[4] + wm[7] # y
    @buffer[i + 8] =  color[0] # r
    @buffer[i + 9] =  color[1] # g
    @buffer[i + 10] = color[2] # b
    @buffer[i + 11] = opacity # opacity

    # Point 2
    @buffer[i + 12] = x3 * wm[0] + y3 * wm[3] + wm[6] # x
    @buffer[i + 13] = x3 * wm[1] + y3 * wm[4] + wm[7] # y
    @buffer[i + 14] = color[0] # r
    @buffer[i + 15] = color[1] # g
    @buffer[i + 16] = color[2] # b
    @buffer[i + 17] = opacity # opacity

    # Return whether or not there is space for more triangles
    return @triangleCount != @currentTriangle
