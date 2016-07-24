###
@name CustomLoop
@class A loop class.
Contains a list of functions to run each time the loop executes.
For the loop to be executed, it will have to be added to the current room via the engine.currentRoom.addLoop.
A loop also has it's own time that is stopped whenever the loop is not executed. This makes it possible to schedule a function execution that will be "postponed" if the loop gets paused.

@property {number} framesPerExecution The number of frames between each execution of the custom loop
@property {function} maskFunction A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
@property {number} time The "local" time of the loop. The loop's time is stopped when the loop is not executed.
@property {number} execTime The time it took to perform the last execution

@param {number} [framesPerExecution=1] The number of frames between each execution of the custom loop
@param {function} [maskFunction=function(){}] A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
###
module.exports = class CustomLoop
  constructor: (framesPerExecution, maskFunction) ->
    @framesPerExecution = framesPerExecution? || 1
    @maskFunction = maskFunction? || -> true

    # Operations
    @operationsQueue = []
    @operations = []

    # Attached functions
    @functionsQueue = []
    @functions = []

    # Scheduled executions
    @executionsQueue = []
    @executions = []

    # Animations
    @animations = []

    # Time tracking
    @lastFrame = window.engine.frames
    @time = 0

  ###
  Attaches a function to the loop.

  @param {Object} caller The object to run the function as
  @param {function} func The function to run on each execution of the custom loop
  ###
  attachOperation: (name, func)->
    throw new Error("Argument func must be of type function") if typeof func isnt "function" #dev
    @operationsQueue.unshift
      name: name
      objects: []
      operation: func
    return

  hasOperation: (name, func)->
    for exec in @operations
      return true if (!name || exec.name == name) && (!func || exec.operation == func)

    for exec in @operationsQueue
      return true if (!name || exec.name == name) && (!func || exec.operation == func)
    return false

  ###
  Detaches a function from the loop. If the same function is attached multiple times (which is never a good idea), only the first occurrence is detached.

  @param {Object} caller The object the function was run as
  @param {function} func The function to detach from the loop
  @return {boolean} Whether or not the function was found and detached
  ###
  detachOperation: (name, func) ->
    # Search activities and remove function
    for exec in @operations
      if (!name || exec.name == name) && (!func || exec.operation == func)
        @operations.splice i, 1
        return true

    # Search activities queue and remove function
    for exec in @operationsQueue
      if (!name || exec.name == name) && (!func || exec.operation == func)
        @operationsQueue.splice i, 1
        return true
    false

  subscribeToOperation: (name, object)->
    for exec in @operations
      if !name || exec.name == name
        exec.objects.unshift object
        return true

    for exec in @operationsQueue
      if !name || exec.name == name
        exec.objects.unshift object
        return true
    false

  unsubscribeFromOperation: (name, object)->
    for exec in @operations
      if !name || exec.name == name
        i = exec.objects.indexOf object
        if i != -1
          exec.objects.splice i, 1

    for exec in @operationsQueue
      if !name || exec.name == name
        i = exec.objects.indexOf object
        if i != -1
          exec.objects.splice i, 1
    false

  ###
  Attaches a function to the loop.

  @param {Object} caller The object to run the function as
  @param {function} func The function to run on each execution of the custom loop
  ###
  attachFunction: (caller, func) ->
    throw new Error("Missing argument: caller") if caller is undefined #dev
    throw new Error("Missing argument: func") if func is undefined #dev
    throw new Error("Argument func must be of type function") if typeof func isnt "function" #dev
    @functionsQueue.unshift
      object: caller
      activity: func

    return

  ###
  Detaches a function from the loop. If the same function is attached multiple times all occurrences will be removed

  @param {Object} caller The object the function was run as
  @param {function} func The function to detach from the loop
  @return {boolean} Whether or not the function was found and detached
  ###
  detachFunction: (caller, func) ->
    # Search activities and remove function
    i = @functions.length
    while i--
      exec = @functions[i]
      if (!caller || exec.object == caller) && (!func || exec.activity == func)
        @functions.splice i, 1

    # Search activities queue and remove function
    i = @functionsQueue.length
    while i--
      exec = @functionsQueue[i]
      if (!caller || exec.object == caller) && (!func || exec.activity == func)
        @functionsQueue.splice i, 1
    false

  ###
  Schedules a function to be run after a given amount of time in the loop.
  If the loop is paused before the execution has happened, the loop's time will stand still, and therefore the scheduled execution will not happen until the loop is started again.

  @param {Object} caller The object with which to run the function (by default the custom loop itself)
  @param {function} func The function to execute
  @param {number} delay The delay in ms
  ###
  schedule: (caller, func, delay) ->
    throw new Error("Missing argument: caller") if caller is undefined #dev
    throw new Error("Missing argument: function") if func is undefined #dev
    throw new Error("Missing argument: delay") if delay is undefined #dev
    @executionsQueue.unshift
      func: func
      execTime: @time + delay
      caller: caller

    return

  ###
  Unschedules a single scheduled execution. If multiple similar executions exists they will all be removed.

  @param {function} func The function to unschedule an execution of
  @param {Object} caller The object with which the function was to be executed (by default the custom loop itself)
  @return {boolean} Whether or not the function was found and unscheduled
  ###
  unschedule: (caller, func) ->
    # Search activities and remove function
    i = @executions.length
    while i--
      exec = @executions[i]
      if (!caller || exec.object == caller) && (!func || exec.activity == func)
        @executions.splice i, 1

    # Search activities queue and remove function
    i = @executionsQueue.length
    while i--
      exec = @executionsQueue[i]
      if (!caller || exec.object == caller) && (!func || exec.activity == func)
        @executionsQueue.splice i, 1
    false

  ###
  Unschedules all scheduled executions

  @return {function[]} An array of all the unscheduled functions
  ###
  unscheduleAll: ->
    removeArray = [].concat(@executions, @executionsQueue)
    @executions = []
    @executionsQueue = []
    removeArray


  ###
  Adds a new animation to the animator class (done automatically when running the animate-function).

  @private
  @param {object} animation An animation object
  ###
  addAnimation: (animation) ->
    throw new Error("Missing argument: animation") if animation is undefined #dev
    anim = animation
    anim.start = @time

    # If there are other animations of the same properties, stop the current animation of these properties
    propList = Object.keys(anim.prop)
    currentAnimations = anim.obj.getAnimations()
    i = 0
    while i < currentAnimations.length
      cur = currentAnimations[i]
      for propName of cur.prop
        delete cur.prop[propName] if propList.indexOf(propName) isnt -1 if cur.prop.hasOwnProperty(propName)
      i++
    @animations.push anim
    return

  ###
  Stop all animations of a specific object from the loop

  @param {Mixin.Animatable} object The object to stop all animations of
  ###
  removeAnimationsOfObject: (object) ->
    i = @animations.length
    while i--
      if object is @animations[i].obj
        @animations.splice i, 1
    return


  ###
  Update the loop's animations in a single loop (called by updateAllLoops)

  @private
  ###
  updateAnimations: ->
    # Run through the animations to update them
    animId = @animations.length - 1

    while animId > -1
      a = @animations[animId]
      continue if a is undefined
      t = @time - a.start
      if t > a.duration

        # Delete animation
        @animations.splice animId, 1

        # If the animation has ended: delete it and set the animated properties to their end values
        for propId of a.prop
          a.obj[propId] = a.prop[propId].end if a.prop.hasOwnProperty(propId)
        a.callback.call a.obj
      else
        # If the animation is still running: Ease the animation of each property
        for propId of a.prop
          a.obj[propId] = Helpers.Easing[a.easing] t, a.prop[propId].begin, a.prop[propId].end - a.prop[propId].begin, a.duration if a.prop.hasOwnProperty(propId)

      # Execute onStep-callback if any
      a.onStep and a.onStep()
      animId--
    return

  ###
  Executes the custom loop. This will execute all the functions that have been added to the loop, and checks all scheduled executions to see if they should fire.
  This function will automatically be executed, if the loop has been added to the current room, or the engine's masterRoom
  ###
  execute: ->
    return if engine.frames % @framesPerExecution || !@maskFunction()
    @time += engine.gameTimeIncrease if engine.frames - @lastFrame == @framesPerExecution
    @lastFrame = engine.frames
    @last = engine.now

    # Update animations
    @updateAnimations()

    # Execute scheduled executions
    i = @executions.length
    while i--
      exec = @executions[i]
      if @time >= exec.execTime
        exec.func.call exec.caller
        @executions.splice i, 1

    # Execute operations
    i = @operations.length
    while i--
      exec = @operations[i]
      continue unless exec
      throw new Error("Trying to exec non-existent attached operation") unless exec.operation #dev
      exec.operation exec.objects

    # Execute attached functi
    i = @functions.length
    while i--
      exec = @functions[i]
      continue unless exec
      throw new Error("Trying to exec non-existent attached function") unless exec.activity #dev
      exec.activity.call exec.object

    # Add queued operations
    @operations = @operations.concat(@operationsQueue)
    @operationsQueue = []

    # Add queued attached functions
    @functions = @functions.concat(@functionsQueue)
    @functionsQueue = []

    # Add queued executions
    @executions = @executions.concat(@executionsQueue)
    @executionsQueue = []
    return

Helpers =
  Easing: require '../helpers/easing'
