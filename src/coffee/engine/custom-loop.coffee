module.exports = -> module.exports::constructor.apply @, arguments

###
@name Engine.CustomLoop
@class A loop class.
Contains a list of functions to run each time the loop executes.
For the loop to be executed, it will have to be added to the current room via the Engine.currentRoom.addLoop.
A loop also has it's own time that is stopped whenever the loop is not executed. This makes it possible to schedule a function execution that will be "postponed" if the loop gets paused.

@property {number} framesPerExecution The number of frames between each execution of the custom loop
@property {function} maskFunction A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
@property {number} time The "local" time of the loop. The loop's time is stopped when the loop is not executed.
@property {number} execTime The time it took to perform the last execution

@param {number} [framesPerExecution=1] The number of frames between each execution of the custom loop
@param {function} [maskFunction=function(){}] A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
###
c = class CustomLoop
  constructor: (framesPerExecution, maskFunction) ->
    @framesPerExecution = (if framesPerExecution is undefined then 1 else framesPerExecution)
    @maskFunction = (if maskFunction is undefined then -> true else maskFunction)

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
    @last = (if window.engine.now then window.engine.now else new Date().getTime())
    @time = 0
    @execTime = 0

  ###
  Attaches a function to the loop.

  @param {Object} caller The object to run the function as
  @param {function} func The function to run on each execution of the custom loop
  ###
  attachFunction: (caller, func) ->
    throw new Error("Missing argument: caller") if caller is undefined #dev
    throw new Error("Missing argument: func") if func is undefined #dev
    throw new Error("Argument func must be of type function") if typeof func isnt "function" #dev
    @functionsQueue.push
      object: caller
      activity: func

    return


  ###
  Queues a function for being added to the executed functions. The queue works as a buffer which prevent functions, that have just been added, from being executed before the next frame.

  @private
  ###
  addFunctionsQueue: ->
    @functions = @functions.concat(@functionsQueue)
    @functionsQueue = []
    return


  ###
  Detaches a function from the loop. If the same function is attached multiple times (which is never a good idea), only the first occurrence is detached.

  @param {Object} caller The object the function was run as
  @param {function} func The function to detach from the loop
  @return {boolean} Whether or not the function was found and detached
  ###
  detachFunction: (caller, func) ->
    throw new Error("Missing argument: caller") if caller is undefined #dev
    throw new Error("Missing argument: func") if func is undefined #dev

    # Search activities and remove function
    i = 0
    while i < @functions.length
      a = @functions[i]
      if a.object is caller and a.activity is func
        @functions.splice i, 1
        return true
      i++

    # Search activities queue and remove function
    i = 0
    while i < @functionsQueue.length
      a = @functionsQueue[i]
      if a.object is caller and a.activity is func
        @functionsQueue.splice i, 1
        return true
      i++
    false


  ###
  Detaches all occurrences of a specific function, no matter the caller.

  @param {function} func The function to detach from the loop
  @return {function[]} An array of detached functions
  ###
  detachFunctionsByFunction: (func) ->
    throw new Error("Missing argument: func") if func is undefined #dev
    removeArray = []

    # Search activities and remove function
    i = @functions.length
    while i--
      if func is @functions[i].func
        removeArray.push @functions.splice(i, 1)

    # Search activities queue and remove function
    i = @functionsQueue.length
    while i--
      if func is @functionsQueue[i].func
        removeArray.push @functionsQueue.splice(i, 1)

    if removeArray.length
      removeArray
    else
      false

  ###
  Detaches all attached functions with a specific caller

  @param {Object} caller The object the function was run as
  @return {function[]} An array of detached functions
  ###
  detachFunctionsByCaller: (caller) ->
    throw new Error("Missing argument: caller") if caller is undefined #dev
    removeArray = []

    # From activities
    i = @functions.length
    while i--
      if caller is @functions[i].object
        removeArray.push @functions.splice(i, 1)

    # From activities queue
    i = @functionsQueue.length
    while i--
      if caller is @functionsQueue[i].object
        removeArray.push @functionsQueue.splice(i, 1)
    if removeArray.length
      removeArray
    else
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
    @executionsQueue.push
      func: func
      execTime: @time + delay
      caller: caller

    return


  ###
  Adds the current executions queue to the list of planned executions. Automatically called at the end of each frame

  @private
  ###
  addExecutionsQueue: ->
    @executions = @executions.concat(@executionsQueue)
    @executionsQueue = []
    return


  ###
  Unschedules a single scheduled execution. If multiple similar executions exists, only the first will be unscheduled.

  @param {function} func The function to unschedule an execution of
  @param {Object} caller The object with which the function was to be executed (by default the custom loop itself)
  @return {boolean} Whether or not the function was found and unscheduled
  ###
  unschedule: (caller, func) ->
    throw new Error("Missing argument: caller") if caller is undefined #dev
    throw new Error("Missing argument: function") if func is undefined #dev
    i = undefined
    exec = undefined

    # Remove from executions
    i = 0
    while i < @executions.length
      exec = @executions[i]
      if caller is exec.caller and (exec.func is func or exec.func.toString() is func)
        @executions.splice i, 1
        return true
      i++

    # Remove from executions queue
    i = 0
    while i < @executionsQueue.length
      exec = @executionsQueue[i]
      if caller is exec.caller and (exec.func is func or exec.func.toString() is func)
        @executionsQueue.splice i, 1
        return true
      i++
    false


  ###
  Unschedule all scheduled executions of a specific function, no matter the caller.

  @param {function} func The function to unschedule all executions of
  @return {boolean|function[]} False if no functions has been unscheduled, otherwise an array containing the unscheduled functions
  ###
  unscheduleByFunction: (func) ->
    throw new Error("Missing argument: func") if func is undefined #dev
    unscheduledArray = undefined
    i = undefined
    exec = undefined
    unscheduledArray = []
    i = @executions.length
    while i--
      exec = @executions[i]
      unscheduledArray.push @executions.splice(i, 1) if func is exec.func
    i = @executionsQueue.length
    while i--
      exec = @executionsQueue[i]
      unscheduledArray.push @executionsQueue.splice(i, 1) if func is exec.func
    if unscheduledArray.length
      unscheduledArray
    else
      false


  ###
  Unschedule all executions scheduled with a specific caller

  @param {object} caller The caller
  @return {boolean|function[]} False if no functions has been unscheduled, otherwise an array containing the unscheduled functions
  ###
  unscheduleByCaller: (caller) ->
    throw new Error("Missing argument: caller") if caller is undefined #dev
    unscheduledArray = undefined
    i = undefined
    exec = undefined
    unscheduledArray = []
    i = @executions.length
    while i--
      exec = @executions[i]
      unscheduledArray.push @executions.splice(i, 1) if caller is exec.caller
    i = @executionsQueue.length
    while i--
      exec = @executionsQueue[i]
      unscheduledArray.push @executionsQueue.splice(i, 1) if caller is exec.caller
    if unscheduledArray.length
      unscheduledArray
    else
      false


  ###
  Unschedules all scheduled executions

  @return {function[]} An array of all the unscheduled functions
  ###
  unscheduleAll: ->
    removeArray = undefined
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
    anim = undefined
    propList = undefined
    currentAnimations = undefined
    i = undefined
    cur = undefined
    propName = undefined
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
    i = undefined
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
    animId = undefined
    a = undefined
    propId = undefined
    t = undefined

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
        if typeof a.callback is "string"
          eval a.callback
        else
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
    timer = undefined
    i = undefined
    exec = undefined
    timer = new Date().getTime()
    return if not @maskFunction() or engine.frames % @framesPerExecution
    @time += engine.gameTimeIncrease if engine.frames - @lastFrame is @framesPerExecution
    @lastFrame = engine.frames
    @last = engine.now

    # Update animations
    @updateAnimations()

    # Execute scheduled executions
    i = @executions.length
    while i--
      continue if i >= @executions.length
      exec = @executions[i]
      if @time >= exec.execTime
        exec.func.call exec.caller
        @executions.splice i, 1

    # Execute attached functions
    i = 0
    while i < @functions.length
      exec = @functions[i]
      #dev
      throw new Error("Trying to exec non-existent attached function") unless exec.activity #dev
      #dev
      exec.activity.call exec.object
      i++

    # Add queued attached functions
    @addFunctionsQueue()

    # Add queued executions
    @addExecutionsQueue()
    @execTime = (new Date().getTime()) - timer
    return

module.exports:: = Object.create c::
module.exports::constructor = c

Helpers =
  Easing: require '../helpers/easing'
