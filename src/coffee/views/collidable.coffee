Views =
  Sprite: require './sprite'

###
The constructor for the Collidable class

@name View.Collidable
@class A class with functions for collision checking.
Can check both for precise (bitmap-based) collisions and bounding box collisions
@augments View.Sprite

@property {HTMLCanvasElement|HTMLImageElement} mask The mask to use for bitmap based collision checking, by default the mask will be autogenerated from the collidable's source
@property {int} collisionResolution The space between the checked pixels when checking for bitmap based collisions

@param {string} source A resource string for the sprite of the created object.
@param {number} [x=0] The x-position of the created object.
@param {number} [y=0] The y-position of the created object.
@param {number} [direction=0] The direction of the created object. Defaults to 0
@param {object} [additionalProperties] An object containing key-value pairs that will be set as properties for the created object. Can be used for setting advanced options such as sprite offset and opacity.
###
module.exports = class Collidable extends Views.Sprite
  constructor: (source, x, y, direction, additionalProperties) ->
    super
    @mask = (if @mask then @mask else engine.loader.getMask(source, @getTheme()))
    @collisionResolution = (if @collisionResolution then @collisionResolution else engine.defaultCollisionResolution)

  ###
  A "metafunction" for checking if the Collidable collides with another object of the same type.
  This function uses boundingBoxCollidesWith for narrowing down the number of objects to check, then uses maskCollidesWith for doing a precise collision check on the remaining objects.

  @param {View.Collidable|View.Collidable[]} objects Target object, or array of target objects
  @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
  @param {boolean} getCollidingObjects If true, the function returns all colliding objects
  @return {Object|boolean} If not getCollisionPosition or getCollidingObjects is true, a boolean representing whether or not a collision was detected. If getCollisionPosition and or getCollidingObjects is true, returns an object of the following type:
  <code>{
  "objects": [Array of colliding objects],
  "positions": [Array of collision positions for each object]
  "combinedPosition": [The combined position of the collision]
  }</code>

  If getCollidingObjects is false, the objects-array will be empty and the positions-array will only contain one position which is the average collision position for all colliding objects.
  If getCollisionPosition is false, the positions-array will be empty
  If both getCollisionPosition and getCollidingObjects are true, the objects-array will contain all colliding objects, and the positions-array will contain each colliding object's collision position
  ###
  collidesWith: (objects, getCollisionPosition = false, getCollidingObjects = false) ->
    throw new Error("Missing argument: objects") if objects is undefined #dev

    objects = [objects] unless Array::isPrototypeOf(objects)

    # Don't do collision checks for objects with no size
    return false if @size is 0 or @widthScale is 0 or @heightScale is 0

    # First, do a bounding box based collision check
    objects = @boundingBoxCollidesWith objects, true
    return false if objects is false


    # If a bounding box collision is detected, do a precise collision check with maskCollidesWith
    # If getCollisionPosition and getCollidingObjects are both false, just return a boolean
    if not getCollisionPosition and not getCollidingObjects
      return @maskCollidesWith(objects)
    else

      # Create an object to return
      ret =
        objects: []
        positions: []
        combinedPosition: false


      # If getCollidingObjects is false, only getCollisionPosition is true. Therefore return an average position of all checked objects
      if getCollidingObjects is false
        position = @maskCollidesWith(objects, true)
        if position
          ret.positions.push position
          ret.combinedPosition = position.copy()
          ret.combinedPosition.pixelCount = 0
      else

        # If both getCollidingObjects and getCollisionPosition is true, both return an array of objects and positions (this is slower)
        if getCollisionPosition
          i = 0
          while i < objects.length
            position = @maskCollidesWith(objects[i], true)
            if position
              ret.objects.push objects[i]
              ret.positions.push position
            i++

          # Calculate a combined position
          if ret.positions.length
            ret.combinedPosition = new Geometry.Vector()
            ret.combinedPosition.pixelCount = 0
            ret.positions.forEach (p) ->
              ret.combinedPosition.add p.scale(p.pixelCount)
              ret.combinedPosition.pixelCount += p.pixelCount
              return

            ret.combinedPosition.scale 1 / ret.combinedPosition.pixelCount

        # If only getCollidingObjects is true, return an array of colliding objects
        else
          i = 0
          while i < objects.length
            ret.objects.push objects[i] if @maskCollidesWith(objects[i])
            i++
    if ret.positions.length + ret.objects.length isnt 0
      ret
    else
      false

  ###
  Checks for a collision with other objects' rotated BBoxes. The word polygon is used because the check is actually done by using the Polygon object.

  @param {Collidable|Collidable[]} objects Target object, or array of target objects
  @param {boolean} getCollidingObjects Whether or not to return an array of colliding objects (is slower because the check cannot stop when a single collission has been detected)
  @return {Object[]|boolean} If getCollidingObjects is set to true, an array of colliding object, else a boolean representing whether or not a collission was detected.
  ###
  boundingBoxCollidesWith: (objects, getCollidingObjects = false) ->
    throw new Error("Missing argument: objects") if objects is undefined #dev
    objects = [objects] unless Array::isPrototypeOf(objects)

    pol1 = @getTransformedBoundingBox()
    collidingObjects = []
    i = 0
    while i < objects.length
      obj = objects[i]
      pol2 = obj.getTransformedBoundingBox()

      # Find out if the two objects' bounding boxes intersect
      # If not, check if one of the points of each object is inside the other's polygon. This will ensure that one of the objects does not contain the other
      if pol1.intersects(pol2) or pol1.contains(pol2.points[0]) or pol2.contains(pol1.points[0])
        if getCollidingObjects
          collidingObjects.push obj
        else
          return true
      i++
    if collidingObjects.length
      collidingObjects
    else
      false

  getTransformedBoundingBox: ->
    box = @mask.bBox.copy().move(-@offset.x, -@offset.y)
    parents = @getParents()
    parents.unshift this
    i = 0
    while i < parents.length
      parent = parents[i]
      box.scale parent.size * parent.widthScale, parent.size * parent.heightScale if parent.size isnt 1 or parent.widthScale isnt 1 or parent.heightScale isnt 1
      box.rotate parent.direction if parent.direction isnt 0
      box.move parent.x, parent.y if parent.x isnt 0 or parent.y isnt 0
      i++
    box

  ###
  Checks for a mask based collisions with other Collidable objects.

  @param {View.Collidable|View.Collidable[]} objects Target object, or array of target objects
  @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false
  @return {Object|boolean} If getCollisionPosition is false, a boolean representing whether or not a collision was detected, else an object of the following type:
  <code>{
  "x": [The average horizontal distance from the Collidable to the detected collision],
  "y": [The average vertical distance from the Collidable to the detected collision],
  "pixelCount": [The number of colliding pixels]
  }</code>
  ###
  maskCollidesWith: (objects, getCollisionPosition) ->
    throw new Error("Missing argument: objects") if objects is undefined #dev
    objects = [objects] unless Array::isPrototypeOf(objects)
    getCollisionPosition = (if getCollisionPosition isnt undefined then getCollisionPosition else false)
    bitmap = @createCollisionBitmap(objects)
    length = bitmap.data.length / 4
    pxArr = []
    pixel = 0
    while pixel < length

      # To get better spread of the checked pixels, increase the pixel each time we're on a new line
      x = pixel % bitmap.width
      if @collisionResolution > 1 and x < @collisionResolution
        y = Math.floor(pixel / bitmap.width)
        pixel -= x
        pixel += Math.floor(@collisionResolution / 2) if y % 2

      # Log the checked pixel
      if bitmap.data[pixel * 4] < 127
        if getCollisionPosition
          y = Math.floor(pixel / bitmap.width) if y is undefined
          pxArr.push
            x: x
            y: y

        else
          return true
      pixel += @collisionResolution
    if pxArr.length > 0

      # Find the collision pixel's mean value
      pxArr = pxArr.sort((a, b) ->
        if a.x is b.x
          0
        else if a.x > b.x
          1
        else
          -1
      )
      avX = (pxArr[0].x + pxArr[pxArr.length - 1].x) / 2
      pxArr = pxArr.sort((a, b) ->
        if a.y is b.y
          0
        else if a.y > b.y
          1
        else
          -1
      )
      avY = (pxArr[0].y + pxArr[pxArr.length - 1].y) / 2

      # Translate the position according to the object's sprite offset
      avX -= @offset.x
      avY -= @offset.y

      # Scale the position according to the object's size modifiers
      avX /= @size * @widthScale
      avY /= @size * @heightScale

      # Rotate the position according to the object's direction
      retVector = new Geometry.Vector(avX, avY)
      retVector.rotate @direction

      # Save the number of colliding pixels
      retVector.pixelCount = pxArr.length
      return retVector
    false

  createCollisionBitmap: (objects) ->
    # Get mask from loader object
    mask = @mask
    calc = Helpers.MatrixCalculation

    # Create a new canvas for checking for a collision
    canvas = document.createElement("canvas")
    canvas.width = Math.ceil(@clipWidth)
    canvas.height = Math.ceil(@clipHeight)

    # Add canvas for debugging
    canvas.id = 'colCanvas'
    # if document.getElementById 'colCanvas'
    #   document.body.removeChild document.getElementById('colCanvas')
    # document.body.appendChild canvas

    c = canvas.getContext "2d"
    c.fillStyle = "#FFF"
    c.fillRect 0, 0, canvas.width, canvas.height
    parents = @getParents()
    parents.unshift this

    # Reset transform to the world matrix
    wm = calc.makeIdentity()
    wm = calc.matrixMultiply(calc.makeTranslation(@offset.x, @offset.y), wm)
    i = 0
    while i < parents.length
      wm = calc.matrixMultiply(calc.calculateInverseLocalMatrix(parents[i]), wm)
      i++

    # If getInverse returns false, the object is invisible (thus cannot collide)
    throw new Error("Trying to detect collision for invisble object") if wm is false # dev

    # Draw other objects
    i = 0
    while i < objects.length
      obj = objects[i]

      # If the checked object is "this", do nothing (this situation should maybe result in an error)
      continue if obj is this

      # Create local matrix (to add to the world matrix)
      lm = calc.makeIdentity()
      parents = obj.getParents()
      parents.reverse()
      parents.push obj
      ii = 0
      while ii < parents.length
        lm = calc.matrixMultiply(calc.calculateLocalMatrix(parents[ii]), lm)
        ii++
      offset = calc.matrixMultiply(lm, wm)
      offset = calc.matrixMultiply(calc.makeTranslation(-obj.offset.x, -obj.offset.y), offset)

      # Set world transform
      c.setTransform offset[0], offset[1], offset[3], offset[4], offset[6], offset[7]

      # Draw object mask
      c.drawImage obj.mask, (obj.clipWidth + obj.bm.spacing) * obj.imageNumber, 0, obj.clipWidth, obj.clipHeight, 0, 0, obj.clipWidth, obj.clipHeight
      i++

    # Reset transform
    c.setTransform 1, 0, 0, 1, 0, 0

    # Draw over other objects to make them semi transparant
    c.globalAlpha = 0.5
    c.fillRect 0, 0, canvas.width, canvas.height

    # Draw checked objects mask
    c.drawImage mask, (@clipWidth + @bm.spacing) * @imageNumber, 0, @clipWidth, @clipHeight, 0, 0, @clipWidth, @clipHeight

    # Return collision image data
    c.getImageData 0, 0, canvas.width, canvas.height

Helpers =
  MatrixCalculation: require '../helpers/matrix-calculation'

Geometry =
  Vector: require '../geometry/vector'
