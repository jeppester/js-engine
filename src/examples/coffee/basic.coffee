# Create movable character by extending Sprite
class MovableCharacter extends Engine.Views.Sprite
  constructor: (x, y)->
    super 'character', x, y, 0

  onAdded: ->
    super
    @getRoom().loops.eachFrame.attachFunction(
      @ # This object (an instance reference is needed by the engine)
      @step # The function to call each time the loop executes
    )

  step: ->
    engine = @getEngine()

    # Check that the arrow keys are down, if so, move the object by increasing or decreasing it's x and y properties
    # Left
    if engine.keyboard.isDown Engine.Globals.KEY_LEFT
      @x -= engine.convertSpeed 200

    # Right
    if engine.keyboard.isDown Engine.Globals.KEY_RIGHT
      @x += engine.convertSpeed 200

    # Up
    if engine.keyboard.isDown Engine.Globals.KEY_UP
      @y -= engine.convertSpeed 200

    # Down
    if engine.keyboard.isDown Engine.Globals.KEY_DOWN
      @y += engine.convertSpeed 200

    # Space
    if engine.keyboard.isPressed Engine.Globals.KEY_SPACE
      # Turn the character around
      @animate(
        { direction: @direction + Math.PI * 2 }
        { duration: 2000 }
      )

# Add MovableCharactor to the ObjectCreator to make it easier to create a movable character
Engine.ObjectCreator.prototype.MovableCharacter = (x, y)->
  object = new MovableCharacter x, y
  @container.addChildren object

# Create main game class
class Main
  constructor: (@engine)->
    @onLoaded()

  onLoaded: ->
    # Create two views and add them to the room
    @bgView = new Engine.Views.Container
    @fgView = new Engine.Views.Container
    @engine.currentRoom.addChildren @bgView, @fgView

    # TEXT EXAMPLE
    # Make a hello world text
    text = new Engine.Views.TextBlock(
      'Hello world!' # TextBlock
      50 # x-position
      50 # y-position
      200 # width
      {
        font: 'bold 24px Verdana'
        color: '#FFF'
      }
    )

    # To draw the text, add it to the bgView
    @bgView.addChildren text

    # SPRITE EXAMPLE
    # Make a sprite object
    sprite = new Engine.Views.Sprite(
      'rock' # Image ID (See "/themes/Example/theme.json" for an explanation of themes)
      70 # x-position
      200 # y-position
      0 # Direction (in radians)
    )

    # Add sprite to the fg view for it to be drawn
    @fgView.addChildren sprite

    # ANIMATION EXAMPLE
    # Animate a rotation of the sprite
    sprite.animate(
      {
          # Animated properties (can be all numeric properties of the animated object)
          dir: Math.PI * 4 # 2 rounds in radians
      }
      {
          # Animation options
          dur: 5000 # Set the animation duration (in ms)
      }
    )

    # Now that the object is loaded, lets create an instance of the object
    movable = @fgView.create.MovableCharacter(
        300 # x-position
        200 # y-position
    )

    # Hide loader overlay now that everything is ready
    @engine.loader.hideOverlay()

# Start engine
new Engine
  # Main class
  gameClass: Main

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
