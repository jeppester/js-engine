# Create movable character by extending Sprite
class MovableCharacter extends JSEngine.Views.Sprite
  constructor: (x, y)->
    super 'Character', x, y, 0

    engine.currentRoom.loops.eachFrame.attachFunction(
      @ # This object (an instance reference is needed by the engine)
      @step # The function to call each time the loop executes
    )
  step: ->
    # Check that the arrow keys are down, if so, move the object by increasing or decreasing it's x and y properties
    # Left
    if engine.keyboard.isDown JSEngine.Globals.KEY_LEFT
      @x -= engine.convertSpeed 200

    # Right
    if engine.keyboard.isDown JSEngine.Globals.KEY_RIGHT
      @x += engine.convertSpeed 200

    # Up
    if engine.keyboard.isDown JSEngine.Globals.KEY_UP
      @y -= engine.convertSpeed 200

    # Down
    if engine.keyboard.isDown JSEngine.Globals.KEY_DOWN
      @y += engine.convertSpeed 200

    # Space
    if engine.keyboard.isPressed JSEngine.Globals.KEY_SPACE
      # Turn the character around
      @animate(
        { direction: @direction + Math.PI * 2 }
        { duration: 2000 }
      )

# Add MovableCharactor to the ObjectCreator to make it easier to create a movable character
JSEngine.ObjectCreator.prototype.MovableCharacter = (x, y)->
  object = new MovableCharacter x, y
  @container.addChildren object

# Create main game class
class Main
  constructor: ->
    @onLoaded()

  onLoaded: ->
    # Create two views and add them to the room
    @bgView = new JSEngine.Views.Container
    @fgView = new JSEngine.Views.Container
    engine.currentRoom.addChildren @bgView, @fgView

    # TEXT EXAMPLE
    # Make a hello world text
    text = new JSEngine.Views.TextBlock(
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
    sprite = new JSEngine.Views.Sprite(
      'Rock' # Image ID (See "/themes/Example/theme.json" for an explanation of themes)
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
    engine.loader.hideOverlay()

# Start engine
new JSEngine
  # Set main class to load
  gameClass: Main

  # Set themes to load
  themes: ['Example']

  # Set arena background-color
  backgroundColor: "#000"

  # Set resolution of the game
  canvasResX: 600
  canvasResY: 400
