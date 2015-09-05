module.exports =
  linear: (t, b, c, d) ->
    t /= d
    b + c * t

  quadIn: (t, b, c, d) ->
    t /= d
    b + c * t * t

  quadOut: (t, b, c, d) ->
    t /= d
    b - c * t * (t - 2)

  quadInOut: (t, b, c, d) ->
    t = t / d * 2
    if t < 1
      b + c * t * t / 2
    else
      t--
      b + c * (1 - t * (t - 2)) / 2

  powerIn: (t, b, c, d) ->
    t /= d

    # a determines if c is positive or negative
    a = c / Math.abs(c)
    b + a * Math.pow(Math.abs(c), t)

  powerOut: (t, b, c, d) ->
    t /= d

    # a determines if c is positive or negative
    a = c / Math.abs(c)
    b + c - a * Math.pow(Math.abs(c), 1 - t)

  powerInOut: (t, b, c, d) ->
    t = t / d * 2

    # a determines if c is positive or negative
    a = c / Math.abs(c)
    if t < 1
      b + a * Math.pow(Math.abs(c), t) / 2
    else
      t--
      b + c - a * Math.pow(Math.abs(c), 1 - t) / 2

  sinusInOut: (t, b, c, d) ->
    t /= d
    b + c * (1 + Math.cos(Math.PI * (1 + t))) / 2
