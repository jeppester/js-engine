class GeometricObjectCollision
  constructor: ->
    # Add a circle
    @circle = new JSEngine.Views.Circle 300, 200, 80, "#F11", "#F11"

    # Add different objects to calculate the distance to
    @line = new JSEngine.Views.Line(null, null, "#F00", 6).setFromCoordinates 20, 320, 80, 380
    @polygon = new JSEngine.Views.Polygon([], "#FFF", "#F00", 6).setFromCoordinates 540, 40, 535, 70.5, 560, 70.5, 540, 50, 560, 35
    @rectangle = new JSEngine.Views.Rectangle 20.5, 130.5, 100, 40, "#FFF", "#F00", 6
    @circle2 = new JSEngine.Views.Circle 530, 330, 50, "#FFF", "#F00", 6

    # Add a text block for showing the distance between the circle and the line
    textOptions = color: '#FFF'
    @text = new JSEngine.Views.TextBlock 'Use arrow keys to move the circle in the middle', 10, 10, 600, textOptions
    @text2 = new JSEngine.Views.TextBlock 'Distance to line: 0', 10, 30, 600, textOptions
    @text3 = new JSEngine.Views.TextBlock 'Distance to polygon: 0', 10, 50, 600, textOptions
    @text4 = new JSEngine.Views.TextBlock 'Distance to circle: 0', 10, 70, 600, textOptions
    @text5 = new JSEngine.Views.TextBlock 'Distance to rectangle: 0', 10, 90, 600, textOptions

    engine.currentRoom.addChildren(
      @circle
      @line
      @polygon
      @rectangle
      @circle2
      @text
      @text2
      @text3
      @text4
      @text5
    )

    engine.loader.hideOverlay => @onLoaded()

  onLoaded: ->
    engine.currentRoom.loops.eachFrame.attachFunction @, @step

  step: ->
    # Keyboard controls
    dx = 0
    dy = 0

    dx = -engine.convertSpeed 200 if engine.keyboard.isDown JSEngine.Globals.KEY_LEFT
    dx = engine.convertSpeed 200 if engine.keyboard.isDown JSEngine.Globals.KEY_RIGHT
    dy = -engine.convertSpeed 200 if engine.keyboard.isDown JSEngine.Globals.KEY_UP
    dy = engine.convertSpeed 200 if engine.keyboard.isDown JSEngine.Globals.KEY_DOWN
    @circle.move dx, dy

    # Update text fields
    @text2.string = "Distance to line: #{Math.round @circle.getDistance(@line)}#{if @circle.intersects @line then ' (intersects)' else ''}"
    @text3.string = "Distance to polygon: #{Math.round @circle.getDistance(@polygon)}#{if @circle.intersects @polygon then ' (intersects)' else ''}"
    @text4.string = "Distance to circle: #{Math.round @circle.getDistance(@circle2)}#{if @circle.intersects @circle2 then ' (intersects)' else ''}"
    @text5.string = "Distance to rectangle: #{Math.round @circle.getDistance(@rectangle)}#{if @circle.intersects @rectangle then ' (intersects)' else ''}"

new JSEngine
  # Set game-class path (Look at this file to start programming your game)
  gameClass: GeometricObjectCollision

  # Set themes to load
  themes: ['Example']

  #disableWebGL: true

  # Set resolution of the game
  canvasResX: 600
  canvasResY: 400
