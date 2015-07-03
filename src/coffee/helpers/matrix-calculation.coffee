module.exports = MatrixCalculationHelper =
  calculateLocalMatrix: (object) ->
    scale = undefined
    rotation = undefined
    position = undefined
    scale = @makeScale(object.widthScale * object.size, object.heightScale * object.size)
    rotation = @makeRotation(-object.direction)
    position = @makeTranslation(object.x, object.y)
    @matrixMultiplyArray [
      scale
      rotation
      position
    ]

  calculateInverseLocalMatrix: (object) ->
    scale = undefined
    rotation = undefined
    position = undefined
    scale = @makeScale(1 / (object.widthScale * object.size), 1 / (object.heightScale * object.size))
    rotation = @makeRotation(object.direction)
    position = @makeTranslation(-object.x, -object.y)
    @matrixMultiplyArray [
      position
      rotation
      scale
    ]

  makeIdentity: ->
    [
      1
      0
      0
      0
      1
      0
      0
      0
      1
    ]

  makeTranslation: (tx, ty) ->
    [
      1
      0
      0
      0
      1
      0
      tx
      ty
      1
    ]

  makeRotation: (direction) ->
    c = Math.cos(direction)
    s = Math.sin(direction)
    [
      c
      -s
      0
      s
      c
      0
      0
      0
      1
    ]

  makeScale: (sx, sy) ->
    [
      sx
      0
      0
      0
      sy
      0
      0
      0
      1
    ]

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
    det = @matrixDeterminant(matrix)

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
      A
      D
      G
      B
      E
      H
      C
      F
      I
    ], 1 / det

  getNewMatrix: (matrix) ->
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
    [
      A
      D
      G
      B
      E
      H
      C
      F
      I
    ]

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
      a * s
      b * s
      c * s
      d * s
      e * s
      f * s
      g * s
      h * s
      i * s
    ]

  matrixMultiply: (a, b) ->
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
    [
      a1 * a2 + b1 * d2 + c1 * g2
      a1 * b2 + b1 * e2 + c1 * h2
      a1 * c2 + b1 * f2 + c1 * i2
      d1 * a2 + e1 * d2 + f1 * g2
      d1 * b2 + e1 * e2 + f1 * h2
      d1 * c2 + e1 * f2 + f1 * i2
      g1 * a2 + h1 * d2 + i1 * g2
      g1 * b2 + h1 * e2 + i1 * h2
      g1 * c2 + h1 * f2 + i1 * i2
    ]

  matrixMultiplyArray: (matrices) ->
    r = matrices[0]
    len = matrices.length
    i = 1
    while i < len
      r = @matrixMultiply(r, matrices[i])
      i++
    r
