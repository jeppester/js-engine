Views =
  Collidable: require './collidable'

###
The constructor for the GameObject class.

@name View.GameObject
@class A class which incorporates functions that are often used by objects in games:
- Is drawn as a sprite
- Has movement vector
- Has collision checking
@augments View.Collidable

@property {CustomLoop} loop The loop to which movement of the object has been assigned
@property {boolean} alive Whether or not the object is alive. If the object is not alive, it will not move
@property {Math.Vector} speed The two-directional velocity of the object in px/second

@param {string} source A string representing the source of the object's bitmap
@param {number} [x=0] The x-position of the object in the game container, in pixels
@param {number} [y=0] The y-position of the object in the game container, in pixels
@param {number} [direction=0] The rotation (in radians) of the object when drawn in the game container
@param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
The default is:
<code>
{
size: 1,
opacity: 1,
composite: 'source-over',
offset: new Math.Vector('center', 'center'),
loop: 'eachFrame',
speed: new Math.Vector(0, 0)
}
</code>
###
module.exports = class GameObject extends Views.Collidable
  onAdded: ->
    super
    @loop = @getRoom().loops.eachFrame
    unless @loop.hasOperation 'basic-transforms'
      @loop.attachOperation 'basic-transforms', @constructor.basicTransformsOperation.bind(@getRoom())

    @loop.subscribeToOperation 'basic-transforms', @
    @speed ?= new Geometry.Vector 0, 0
    @rotationSpeed ?= 0
    @alive = true
    return

  @basicTransformsOperation: (objects)->
    for object in objects
      # If the object is "alive", add its speed vector to its position
      if object.alive
        object.x += @engine.convertSpeed object.speed.x
        object.y += @engine.convertSpeed object.speed.y
        object.direction += @engine.convertSpeed object.rotationSpeed if object.rotationSpeed

Geometry =
  Vector: require '../geometry/vector'
