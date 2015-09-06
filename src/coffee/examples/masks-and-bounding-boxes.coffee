class MasksAndBBoxes
  constructor: ->
    @onLoaded()

  onLoaded: ->
    # Hide loader overlay
    engine.loader.hideOverlay()

    object = engine.currentRoom.create.GameObject(
      'character' # Image ID (See "/themes/Example/theme.json" for an explanation of themes)
      50 # x-position
      50 # y-position
      0 # Direction (in radians)
    )

    object.animation = ->
      @animate(
          direction: @direction + Math.PI * 2
        ,
          duration: 10000, callback: @animation
      )
    object.animation()

    object2 = engine.currentRoom.create.GameObject(
      'rock' # Image ID (See "/themes/Example/theme.json" for an explanation of themes)
      16 # x-position
      50 # y-position
      0 # Direction (in radians)
    )
    object.checkCollision = ->
      if @boundingBoxCollidesWith object2
        text1.string = 'BB Collides'
      else
        text1.string = ''

      if @collidesWith object2
        text2.string = 'BM Collides'
      else
        text2.string = ''

    text1 = engine.currentRoom.create.TextBlock '', 6, 4, 80, {color: '#4F4'}
    text2 = engine.currentRoom.create.TextBlock '', 6, 78, 80, {color: '#000'}

    engine.currentRoom.loops.eachFrame.attachFunction object, object.checkCollision

new Engine
  # Set main class
  gameClass: MasksAndBBoxes

  # Set themes to load
  themes: ['example']

  backgroundColor: '#888'

  disableWebGL: true

  # Enable debugging of collision checks
  drawBoundingBoxes: true
  drawMasks: true

  # Set resolution of the game
  canvasResX: 100
  canvasResY: 100
