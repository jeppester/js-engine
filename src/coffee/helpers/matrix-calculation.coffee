module.exports = MatrixCalculationHelper =
  getOperationMatrix: ->
    @operationMatrix ?= new Float32Array 9
    @setIdentity @operationMatrix
    @operationMatrix

  calculateLocalMatrix: (object, cache) ->
    cache ?= new Float32Array 9

    @setScale cache, object.widthScale * object.size, object.heightScale * object.size
    @multiply cache, @getRotation -object.direction
    @multiply cache, @getTranslation object.x, object.y
    cache

  calculateInverseLocalMatrix: (object, cache) ->
    cache ?= new Float32Array 9

    @setScale cache, 1 / (object.widthScale * object.size), 1 / (object.heightScale * object.size)
    @multiply cache, @getRotation object.direction
    @multiply cache, @getTranslation -object.x, -object.y
    cache

  setIdentity: (matrix)->
    matrix[0] = 1
    matrix[1] = 0
    matrix[2] = 0

    matrix[3] = 0
    matrix[4] = 1
    matrix[5] = 0

    matrix[6] = 0
    matrix[7] = 0
    matrix[8] = 1

    matrix

  getIdentity: ->
    @setIdentity @getOperationMatrix()

  setRotation: (matrix, direction)->
    c = Math.cos direction
    s = Math.sin direction

    matrix[0] = c
    matrix[1] = -s
    matrix[2] = 0

    matrix[3] = s
    matrix[4] = c
    matrix[5] = 0

    matrix[6] = 0
    matrix[7] = 0
    matrix[8] = 1

    matrix

  getRotation: (direction)->
    @setRotation @getOperationMatrix(), direction

  setTranslation: (matrix, tx, ty)->
    matrix[0] = 1
    matrix[1] = 0
    matrix[2] = 0

    matrix[3] = 0
    matrix[4] = 1
    matrix[5] = 0

    matrix[6] = tx
    matrix[7] = ty
    matrix[8] = 1

    matrix

  getTranslation: (tx, ty) ->
    @setTranslation @getOperationMatrix(), tx, ty

  setScale: (matrix, sx, sy)->
    matrix[0] = sx
    matrix[1] = 0
    matrix[2] = 0

    matrix[3] = 0
    matrix[4] = sy
    matrix[5] = 0

    matrix[6] = 0
    matrix[7] = 0
    matrix[8] = 1

    matrix

  getScale: (sx, sy) ->
    @setScale @getOperationMatrix(), sx, sy

  matrixDeterminant: (matrix) ->
    a = matrix[0 * 3 + 0]
    b = matrix[0 * 3 + 1]
    c = matrix[0 * 3 + 2]

    d = matrix[1 * 3 + 0]
    e = matrix[1 * 3 + 1]
    f = matrix[1 * 3 + 2]

    g = matrix[2 * 3 + 0]
    h = matrix[2 * 3 + 1]
    i = matrix[2 * 3 + 2]

    a * (e * i - f * h) - b * (i * d - f * g) + c * (d * h - e * g)

  matrixInverse: (matrix) ->
    # Get determinant
    det = @matrixDeterminant matrix

    # If determinant is zero return false;
    return false if det is 0

    # Calculate inverse
    a = matrix[0 * 3 + 0]
    b = matrix[0 * 3 + 1]
    c = matrix[0 * 3 + 2]
    d = matrix[1 * 3 + 0]
    e = matrix[1 * 3 + 1]
    f = matrix[1 * 3 + 2]
    g = matrix[2 * 3 + 0]
    h = matrix[2 * 3 + 1]
    i = matrix[2 * 3 + 2]
    A =   e * i - f * h
    B = -(d * i - f * g)
    C =   d * h - e * g
    D = -(b * i - c * h)
    E =   a * i - c * g
    F = -(a * h - b * g)
    G =   b * f - c * e
    H = -(a * f - c * d)
    I =   a * e - b * d
    @matrixMultiplyNumber [
      A, D, G
      B, E, H
      C, F, I
    ], 1 / det

  matrixMultiplyNumber: (matrix, factor) ->
    a = matrix[0 * 3 + 0]
    b = matrix[0 * 3 + 1]
    c = matrix[0 * 3 + 2]
    d = matrix[1 * 3 + 0]
    e = matrix[1 * 3 + 1]
    f = matrix[1 * 3 + 2]
    g = matrix[2 * 3 + 0]
    h = matrix[2 * 3 + 1]
    i = matrix[2 * 3 + 2]
    s = factor
    [
      a * s, b * s, c * s
      d * s, e * s, f * s
      g * s, h * s, i * s
    ]

  multiply: (a, b) ->
    a1 = a[0 * 3 + 0]
    b1 = a[0 * 3 + 1]
    c1 = a[0 * 3 + 2]

    d1 = a[1 * 3 + 0]
    e1 = a[1 * 3 + 1]
    f1 = a[1 * 3 + 2]

    g1 = a[2 * 3 + 0]
    h1 = a[2 * 3 + 1]
    i1 = a[2 * 3 + 2]

    a2 = b[0 * 3 + 0]
    b2 = b[0 * 3 + 1]
    c2 = b[0 * 3 + 2]

    d2 = b[1 * 3 + 0]
    e2 = b[1 * 3 + 1]
    f2 = b[1 * 3 + 2]

    g2 = b[2 * 3 + 0]
    h2 = b[2 * 3 + 1]
    i2 = b[2 * 3 + 2]

    a[0] = a1 * a2 + b1 * d2 + c1 * g2
    a[1] = a1 * b2 + b1 * e2 + c1 * h2
    a[2] = a1 * c2 + b1 * f2 + c1 * i2

    a[3] = d1 * a2 + e1 * d2 + f1 * g2
    a[4] = d1 * b2 + e1 * e2 + f1 * h2
    a[5] = d1 * c2 + e1 * f2 + f1 * i2

    a[6] = g1 * a2 + h1 * d2 + i1 * g2
    a[7] = g1 * b2 + h1 * e2 + i1 * h2
    a[8] = g1 * c2 + h1 * f2 + i1 * i2

    a
