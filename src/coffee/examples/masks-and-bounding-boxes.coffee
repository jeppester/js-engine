class MasksAndBBoxes
  constructor: ->
    @onLoaded()

  onLoaded: ->
    # Hide loader overlay
    engine.loader.hideOverlay()

    object = new Engine.Views.GameObject(
      'Character' # Image ID (See "/themes/Example/theme.json" for an explanation of themes)
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

    object2 = new Engine.Views.GameObject(
      'Rock' # Image ID (See "/themes/Example/theme.json" for an explanation of themes)
      16 # x-position
      50 # y-position
      0 # Direction (in radians)
    )
    object.checkCollision = ->
      if @collidesWith object2
        text.string = 'Collides'
      else
        text.string = ''

    text = new Engine.Views.TextBlock '', 6, 4, 80, {color: '#FFF'}

    engine.currentRoom.loops.eachFrame.attachFunction object, object.checkCollision
    engine.currentRoom.addChildren object, object2, text

new JSEngine
	# Set main class
	gameClass: MasksAndBBoxes

	# Set themes to load
	themes: ['Example']

	#disableWebGL: true

	# Enable debugging of collision checks
	drawBoundingBoxes: true
	drawMasks: true

	# Set resolution of the game
	canvasResX: 100
	canvasResY: 100
