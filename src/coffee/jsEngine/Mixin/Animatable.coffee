nameSpace "Mixin"
Mixin.Animatable =
  ###
  Used for animating numeric properties of the owner of the function.
  Available easing functions are:
  "linear"
  "quadIn"
  "quadOut"
  "quadInOut"
  "powerIn"
  "powerOut"
  "powerInOut"
  "sinusInOut"

  @param {object} properties An object containing key-value pairs in the following format:<code>
  {
  "[property name]": "[end value]"
  }
  </code>
  @param {object} options An object containing key-value pairs for the animation's option:<code>
  {
  "duraton": "[animation duration (in ms)]",
  "callback": "[callback function]",
  "easing": "[easing function to use]"
  }
  </code>
  ###
  animate: (properties, options) ->
    throw new Error("Missing argument: properties")  if properties is undefined #dev
    throw new Error("Missing argument: options")  if options is undefined #dev

    anim = {}
    map = properties
    opt = (if options then options else {})
    anim.obj = this
    loop_ = (if options.loop isnt undefined then options.loop else ((if @loop isnt undefined then @loop else engine.defaultAnimationLoop)))
    anim.callback = (if opt.callback isnt undefined then opt.callback else ->
    )
    anim.easing = (if opt.easing isnt undefined then opt.easing else EASING_QUAD_IN_OUT)
    anim.duration = (if opt.duration isnt undefined then opt.duration else 1000)
    anim.onStep = (if opt.onStep isnt undefined then opt.onStep else ->
    )
    anim.prop = {}
    for i of map
      if map.hasOwnProperty(i)
        anim.prop[i] =
          begin: this[i]
          end: map[i]

    # Remove properties that are equal to their end value
    c = 0
    for i of anim.prop
      if anim.prop.hasOwnProperty(i)
        if anim.prop[i].begin is anim.prop[i].end and not @propertyIsAnimated(i)
          delete anim.prop[i]
        else
          c++

    # If there are no properties left to animate and the animation does not have a callback function, do nothing

    # console.log('Animation skipped, nothing to animate');
    return  if not c and anim.callback is ->

    loop_.addAnimation anim
    return

  ###
  @scope Mixin.Animatable
  ###

  ###
  Checks if the object is currently being animated.

  @return {boolean} Whether or not the object is being animated
  ###
  isAnimated: ->
    roomId = undefined
    room = undefined
    name = undefined
    loop_ = undefined
    animId = undefined
    animation = undefined

    # Look through all room on the room list, to see if one of the rooms' loops contains an animation of the object
    roomId = 0
    while roomId < engine.roomList.length
      room = engine.roomList[roomId]
      for name of room.loops
        if room.loops.hasOwnProperty(name)
          loop_ = room.loops[name]
          animId = loop_.animations.length - 1
          while animId > -1
            animation = loop_.animations[animId]
            return true  if animation.obj is this
            animId--
      roomId++
    false

  ###
  Checks if a specific property is current being animated

  @return {boolean} Whether or not the property is being animated
  ###
  propertyIsAnimated: (property) ->
    roomId = undefined
    room = undefined
    name = undefined
    loop_ = undefined
    animId = undefined
    animation = undefined

    # Look through all room on the room list, to see if one of the rooms' loops contains an animation of the object
    roomId = 0
    while roomId < engine.roomList.length
      room = engine.roomList[roomId]
      for name of room.loops
        if room.loops.hasOwnProperty(name)
          loop_ = room.loops[name]
          animId = loop_.animations.length - 1
          while animId > -1
            animation = loop_.animations[animId]
            return true  if animation.obj is this and animation.prop[property] isnt undefined
            animId--
      roomId++
    false

  ###
  Fetches all current animations of the object.

  @return {Object[]} An array of all the current animations of the object
  ###
  getAnimations: ->
    animations = undefined
    roomId = undefined
    room = undefined
    name = undefined
    loop_ = undefined
    animId = undefined
    animation = undefined
    animations = []
    roomId = 0
    while roomId < engine.roomList.length
      room = engine.roomList[roomId]
      for name of room.loops
        if room.loops.hasOwnProperty(name)
          loop_ = room.loops[name]
          animId = loop_.animations.length - 1
          while animId > -1
            animation = loop_.animations[animId]
            animations.push animation  if animation.obj is this
            animId--
      roomId++
    animations

  ###
  Stops all current animations of the object.
  ###
  stopAnimations: ->
    roomId = undefined
    room = undefined
    name = undefined
    roomId = 0
    while roomId < engine.roomList.length
      room = engine.roomList[roomId]
      for name of room.loops
        room.loops[name].removeAnimationsOfObject this  if room.loops.hasOwnProperty(name)
      roomId++
    return

  schedule: (func, delay, loopName) ->
    room = undefined
    loopName = loopName or "eachFrame"
    room = @getRoom()
    #dev
    throw new Error("Schedule requires that the object is added to a room")  unless room #dev
    #dev
    room.loops[loopName].schedule this, func, delay
    return
