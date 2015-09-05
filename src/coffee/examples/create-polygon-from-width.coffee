class CreatePolygonFromWidth
  constructor: ->
    # Make a global reference to the game object
    engine.loader.hideOverlay => @onLoaded()

  onLoaded: ->
    polygons = []

    line = new JSEngine.Geometry.Line().setFromCoordinates 10, 10, 590, 310
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#88F")

    line = new JSEngine.Geometry.Line().setFromCoordinates 10, 30, 590, 330
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#88F")

    line = new JSEngine.Geometry.Line().setFromCoordinates 10, 370, 590, 10
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#8F8")

    line = new JSEngine.Geometry.Line().setFromCoordinates 10, 390, 590, 30
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#8F8")

    line = new JSEngine.Geometry.Line().setFromCoordinates 10, 200, 590, 200
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#F88")

    line = new JSEngine.Geometry.Line().setFromCoordinates 10, 220, 590, 220
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'round').getPoints(), "#F88")

    line = new JSEngine.Geometry.Line().setFromCoordinates 300, 10, 300, 390
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10).getPoints(), "#FFF")

    line = new JSEngine.Geometry.Line().setFromCoordinates 320, 10, 320, 390
    polygons.push new JSEngine.Views.Polygon(line.createPolygonFromWidth(10, 'square').getPoints(), "#FFF")

    # WebGL Line drawing tests
    polygons.push new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 50), new JSEngine.Geometry.Vector(590, 350), "#88F", 10, 'butt')
    polygons.push new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 70), new JSEngine.Geometry.Vector(590, 370), "#88F", 10, 'round')
    polygons.push new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 90), new JSEngine.Geometry.Vector(590, 390), "#88F", 10, 'square')
    polygons.push new JSEngine.Views.Line(new JSEngine.Geometry.Vector(10, 110), new JSEngine.Geometry.Vector(590, 110), "#88F", 10, 'round')

    engine.currentRoom.addChildren.apply engine.currentRoom, polygons

    # Speed tests
    tests = 10000
    t = new Date()
    for i in [0...tests]
      line.createPolygonFromWidth 10

    console.log "createPolygonFromWidth (tests/sec): " + ~~(tests / (new Date() - t)) * 1000

new JSEngine
  # Set main class to load
  gameClass: CreatePolygonFromWidth

  # Set themes to load
  themes:['Example']

  disableWebGL: true

  # Set arena background-color
  backgroundColor: "#000"

  # Set resolution of the game
  canvasResX: 600
  canvasResY: 400
