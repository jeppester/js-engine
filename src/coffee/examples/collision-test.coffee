# Create collision object class
class CollisionObject extends Engine.Views.GameObject
  constructor: (source, x, y, additionalProperties)->
    # Call the sprite constructor to fully extend the sprite and set all sprite properties
    super source, x, y, 0, additionalProperties

    # Add step function to 'eachFrame'-loop
    if @leftKey
      engine.currentRoom.loops.eachFrame.attachFunction(
        @ # This object (an instance reference is needed by the loop)
        @step # The function to call each time the loop executes
      )

    engine.currentRoom.loops.collisionChecking.attachFunction(
      @ # This object (an instance reference is needed by the loop)
      @collisionCheck # The function to call each time the loop executes
    )

  # Create a new JsEngine class which extends the Sprite class
  step: ->
    # Check that the arrow keys are down, if so, move the object by increasing or decreasing it's x and y properties
    # Left
    @speed.x -= engine.convertSpeed 100 if engine.keyboard.isDown @leftKey

    # Right
    @speed.x += engine.convertSpeed 100 if engine.keyboard.isDown @rightKey

    # Up
    @speed.y -= engine.convertSpeed 100 if engine.keyboard.isDown @upKey

    # Down
    @speed.y += engine.convertSpeed 100 if engine.keyboard.isDown @downKey

  collisionCheck: ->
    if collision = @collidesWith window.balls, true, true
      for ball, i in col.objects
        colPos = collision.positions[i]

        # Move to contact position
        loop
          @x += Math.cos colPos.getDirection() - Math.PI
          @y += Math.sin colPos.getDirection() - Math.PI

          ball.x += Math.cos colPos.getDirection()
          ball.y += Math.sin colPos.getDirection()

          break if @collidesWith ball, true

        speed = ball.speed.getLength()
        ball.speed.setFromDirection colPos.getDirection(), speed
        @speed.setFromDirection colPos.getDirection() - Math.PI, speed

    # Bounce against borders
    if @x < 16
      @x = 16
      @speed.x = -@speed.x

    if @x > engine.canvasResX - 16
      @x = engine.canvasResX - 16
      @speed.x = -@speed.x

    if @y < 16
      @y = 16
      @speed.y = -@speed.y

    if @y > engine.canvasResY - 16
      @y = engine.canvasResY - 16
      @speed.y = -@speed.y

# create main class
class CollisionTest
  constructor: ->
    # Add collision checking loop
    engine.currentRoom.addLoop 'collisionChecking', new Engine.CustomLoop(5)

    # Make two collision objects
    window.balls = []
    this.addBalls 15

    player = new CollisionObject(
      "Character"
      200 # x-position
      100 # y-position
      {
        upKey: Engine.Globals.KEY_UP
        downKey: Engine.Globals.KEY_DOWN
        leftKey: Engine.Globals.KEY_LEFT
        rightKey: Engine.Globals.KEY_RIGHT
      }
    )

    engine.currentRoom.addChildren player

    # Hide loader overlay
    engine.loader.hideOverlay()

  addBalls: (number = 1)->
    for i in [0...number]
      ball = new CollisionObject(
        "Rock"
        20 + Math.random() * 560 # x-position
        20 + Math.random() * 360 # y-position
      )
      ball.speed.setFromDirection Math.PI * 2 * Math.random(), 150
      window.balls.push ball
      engine.currentRoom.addChildren ball

# Start engine
new Engine
  # Set game-class path (Look at this file to start programming your game)
  gameClass: CollisionTest

  # Set themes to load
  themes:['Example']

  # Set background color
  backgroundColor: "#222"

  # Set resolution of the game
  canvasResX: 600
  canvasResY: 400
