Geometry =
  Rectangle: require '../geometry/rectangle'

Helpers =
  MatrixCalculation: require './matrix-calculation'

module.exports =
  generateMask: (image, alphaLimit) ->
    throw new Error("Missing argument: image") unless image #dev

    alphaLimit ?= 255
    canvas = document.createElement "canvas"
    canvas.width = image.width
    canvas.height = image.height
    canvas.imageLength = image.imageLength
    canvas.cacheKey = "mask:" + image.cacheKey
    ctx = canvas.getContext("2d")

    ctx.drawImage image, 0, 0, image.width, image.height
    bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height)
    bytes = bitmap.data
    pixelCount = bytes.length / 4
    top = image.height
    bottom = 0
    left = image.width
    right = 0
    pixel = 0
    frameWidth = Math.floor(image.width / image.imageLength)
    for pixel in [0...pixelCount]
      # If the pixel is partly transparent, make it completely transparent,
      # else make it completely black
      if bytes[pixel * 4 + 3] < alphaLimit
        bytes[pixel * 4] = 0 # Red
        bytes[pixel * 4 + 1] = 0 # Green
        bytes[pixel * 4 + 2] = 0 # Blue
        bytes[pixel * 4 + 3] = 0 # Alpha
      else
        bytes[pixel * 4] = 0 # Red
        bytes[pixel * 4 + 1] = 0 # Green
        bytes[pixel * 4 + 2] = 0 # Blue
        bytes[pixel * 4 + 3] = 255 # Alpha

        # Remember the mask's bounding box
        y = Math.floor(pixel / bitmap.width)
        x = pixel - y * bitmap.width

        while x >= frameWidth
          x -= frameWidth + image.spacing

        top    = Math.min(y, top)
        bottom = Math.max(y + 1, bottom)
        left   = Math.min(x, left)
        right  = Math.max(x + 1, right)
      pixel++

    ctx.putImageData bitmap, 0, 0
    canvas.boundingBox = new Geometry.Rectangle(left, top, right - left, bottom - top).getPolygon()
    canvas

  generateCollisionMap: (source, objects) ->
    # Get mask from loader object
    { mask, clipHeight, clipWidth, offset, texture, imageNumber } = source
    calc = Helpers.MatrixCalculation

    # Create a new canvas for checking for a collision
    canvas = document.createElement("canvas")
    canvas.width = Math.ceil(clipWidth)
    canvas.height = Math.ceil(clipHeight)

    # Add canvas for debugging
    canvas.id = 'colCanvas'
    # if document.getElementById 'colCanvas'
    #   document.body.removeChild document.getElementById('colCanvas')
    # document.body.appendChild canvas

    c = canvas.getContext "2d"
    c.fillStyle = "#FFF"
    c.fillRect 0, 0, canvas.width, canvas.height
    parents = source.getParents()
    parents.unshift source

    # Reset transform to the world matrix
    source.wm ?= new Float32Array 9
    calc.setTranslation source.wm, offset.x, offset.y

    for parent in parents
      calc.reverseMultiply source.wm, calc.getInverseLocalMatrix(parent)

    # Draw other objects
    for obj in objects
      if obj == source
        throw new Error "Objects should not check for collisions with themselves"

      # Create local matrix (to add to the world matrix)
      obj.wm ?= new Float32Array 9
      calc.setIdentity obj.wm

      parents = obj.getParents()
      parents.reverse()
      parents.push obj

      for parent in parents
        calc.reverseMultiply(obj.wm, calc.getLocalMatrix(parent))

      calc.multiply(obj.wm, source.wm)
      calc.reverseMultiply(obj.wm, calc.getTranslation(-obj.offset.x, -obj.offset.y))

      # Set world transform
      c.setTransform(
        obj.wm[0]
        obj.wm[1]
        obj.wm[3]
        obj.wm[4]
        obj.wm[6]
        obj.wm[7]
      )

      # Draw object mask
      c.drawImage obj.mask, (obj.clipWidth + obj.texture.spacing) * obj.imageNumber, 0, obj.clipWidth, obj.clipHeight, 0, 0, obj.clipWidth, obj.clipHeight

    # Reset transform
    c.setTransform 1, 0, 0, 1, 0, 0

    # Draw over other objects to make them semi transparant
    c.globalAlpha = 0.5
    c.fillRect 0, 0, canvas.width, canvas.height

    # Draw checked objects mask
    c.drawImage mask, (clipWidth + texture.spacing) * imageNumber, 0, clipWidth, clipHeight, 0, 0, clipWidth, clipHeight
    canvas
