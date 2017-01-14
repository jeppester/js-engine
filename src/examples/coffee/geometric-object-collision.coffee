class Main
  constructor: (@engine)->
    # Add a circle
    @circle = new Engine.Views.Circle 300, 200, 80, "#F11", "#F11"

    # Add different objects to calculate the distance to
    @line = new Engine.Views.Line(null, null, "#F00", 6).setFromCoordinates 20, 320, 80, 380
    @polygon = new Engine.Views.Polygon([], "#FFF", "#F00", 6).setFromCoordinates 530, 30, 480, 120.5, 560, 120.5, 530, 70, 560, 35
    @rectangle = new Engine.Views.Rectangle 20.5, 130.5, 100, 40, "#FFF", "#F00", 6
    @circle2 = new Engine.Views.Circle 530, 330, 50, "#FFF", "#F00", 6

    # Add a text block for showing the distance between the circle and the line
    textOptions = color: '#FFF'
    @text = new Engine.Views.TextBlock 'Use arrow keys to move the circle in the middle', 10, 10, 600, textOptions
    @text2 = new Engine.Views.TextBlock 'Distance to line: 0', 10, 30, 600, textOptions
    @text3 = new Engine.Views.TextBlock 'Distance to polygon: 0', 10, 50, 600, textOptions
    @text4 = new Engine.Views.TextBlock 'Distance to circle: 0', 10, 70, 600, textOptions
    @text5 = new Engine.Views.TextBlock 'Distance to rectangle: 0', 10, 90, 600, textOptions

    @engine.currentRoom.addChildren(
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

    @engine.loader.hideOverlay => @onLoaded()

  onLoaded: ->
    @engine.currentRoom.loops.eachFrame.attachFunction @, @step

  step: ->
    # Keyboard controls
    dx = 0
    dy = 0

    dx = -@engine.convertSpeed 200 if @engine.keyboard.isDown Engine.Globals.KEY_LEFT
    dx = @engine.convertSpeed 200 if @engine.keyboard.isDown Engine.Globals.KEY_RIGHT
    dy = -@engine.convertSpeed 200 if @engine.keyboard.isDown Engine.Globals.KEY_UP
    dy = @engine.convertSpeed 200 if @engine.keyboard.isDown Engine.Globals.KEY_DOWN
    @circle.move dx, dy

    # Update text fields
    @text2.set string: "Distance to line: #{Math.round @circle.getDistance(@line)}#{if @circle.intersects @line then ' (intersects)' else ''}"
    @text3.set string: "Distance to polygon: #{Math.round @circle.getDistance(@polygon)}#{if @circle.intersects @polygon then ' (intersects)' else ''}"
    @text4.set string: "Distance to circle: #{Math.round @circle.getDistance(@circle2)}#{if @circle.intersects @circle2 then ' (intersects)' else ''}"
    @text5.set string: "Distance to rectangle: #{Math.round @circle.getDistance(@rectangle)}#{if @circle.intersects @rectangle then ' (intersects)' else ''}"
    return

# Start engine
new Engine
  # Main class
  mainClass: Main

  # Themes to load
  themes: ['example']

  # Container
  container: document.getElementById('container')

  # Container background-color
  backgroundColor: "#000"

  # Disable webgl using "canvas" search param
  disableWebGL: /canvas/.test window.location.search

  # Resolution of the game
  canvasResX: 600
  canvasResY: 400
