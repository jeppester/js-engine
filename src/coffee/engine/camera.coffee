nameSpace "Engine"

###
Constructor for Camera class

@name Engine.Camera
@class A camera represents a part of the arena which is "projected" on to the engines main canvas.
the camera contains both a capture region and a projection region, the capture region decides which part of the arena to "capture".
The projection region decides where the captured region will be drawn on the main canvas.

@property {Math.Rectangle} captureRegion A rectangle which defines the region of the current room to capture
@property {Math.Rectangle} projectionRegion A rectangle which defines the region on the main canvas where the captured region should be drawn
@property {Engine.Room} room The room to capture from

@param {Math.Rectangle} captureRegion A rectangle which defines the region of the current room to capture
@param {Math.Rectangle} projectionRegion A rectangle which defines the region on the main canvas where the captured region should be drawn
@param {Engine.Room} room The room to capture from
###
class Engine.Camera
  constructor: (captureRegion, projectionRegion, room) ->
    throw new Error("Argument captureRegion should be of type: Rectangle") if not captureRegion instanceof Math.Rectangle #dev
    throw new Error("Argument projectionRegion should be of type: Rectangle") if not projectionRegion instanceof Math.Rectangle #dev
    @captureRegion = captureRegion
    @projectionRegion = projectionRegion
    @room = room or engine.currentRoom
    return
