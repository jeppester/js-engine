Engine = require '../engine'

###
Constructor for the View class.

@name Container
@class A class for objects that are to be drawn on the canvas (or to contain drawn objects)
All objects which are drawn on the game's canvas extends the View-class.
@augments Child

@property {Child[]} children The view's children
@property {Container} parent The parent of the view or undefined if the view is an orphan
@property {boolean} drawCacheEnabled Whether or not draw caching is enabled

@param {Child} child1 A child to add to the view upon creation
@param {Child} child2 An other child to add to the view upon creation
@param {Child} child3 A third ...
###
module.exports = class Container extends Engine.Views.Child
  constructor: (children...) ->
    @children = []
    super()
    @parent = undefined

    #this.drawCacheCanvas = document.createElement('canvas');
    #	this.drawCacheCtx = Helpers.getCanvasContext(this.drawCacheCanvas);
    #	this.drawCacheEnabled = false;
    #	this.drawCacheOffset = new Math.Vector();
    @addChildren.apply this, children

    # Make an objectcreator for this object
    @create = new Engine.ObjectCreator(@)
    return

  ###
  Adds children to a View object. If the object that the children are added to, is a descendant of the current room, the children will be drawn on the stage when added. The added children will be drawn above the current children.

  @param {Child} child1 A child to add to the View object
  @param {Child} child2 Another child to add...
  @return {Child[]} An array containing the added children
  ###
  addChildren: (child1, child2) ->
    return if arguments.length is 0
    i = 0
    while i < arguments.length
      child = arguments[i]
      throw new Error("Argument child has to be of type: Child") if not child instanceof Engine.Views.Child #dev

      # If the child already has a parent, remove the child from that parent
      child.parent.removeChildren child if child.parent

      # Add the child
      @children.push child
      child.parent = this
      engine.enableRedrawRegions and child.onAfterChange()

      # Refresh the child's sprite (it might have changed)
      child.refreshSource() if child.refreshSource
      i++
    arguments


  ###
  Adds a child to a View object, below an already added child. This means that the inserted child (or children) will be drawn below the child which they are inserted below.

  @param {Child|Child[]} insertChildren Child or array of children to insert before an existing child
  @param {Child} child Current child to insert other children before
  @return {Child[]} Array of the inserted children
  ###
  insertBelow: (insertChildren, child) ->
    throw new Error("Missing argument: insertChildren") if insertChildren is undefined #dev
    throw new Error("Missing argument: child") if child is undefined #dev
    arr = undefined
    i = undefined
    unless Array::isPrototypeOf(insertChildren)
      arr = []
      arr.push insertChildren
      insertChildren = arr
    if (i = @children.indexOf(child)) isnt -1
      @children.splice.apply @children, [
        i
        0
      ].concat(insertChildren)
    i = 0
    while i < insertChildren.length
      child = insertChildren[i]
      throw new Error("Argument child has to be of type: Child") if not child instanceof Engine.Views.Child #dev

      # If the child already has a parent, remove the child from that parent
      child.parent.removeChildren child if child.parent
      child.parent = this
      engine.enableRedrawRegions and child.onAfterChange()
      child.refreshSource() if child.refreshSource
      i++
    insertChildren


  ###
  Fetches an array of all the View's children.
  This will not return a pointer, so changing the returned array will not change the View's children.

  @return {Child[]} Array containing all of the View's children
  ###
  getChildren: ->
    ret = undefined
    i = undefined
    ret = []
    i = 0
    while i < @children.length
      ret.push @children[i]
      i++
    ret


  ###
  Sets theme of an  Children whose theme is not already set, will inherit the set theme. To enforce the theme to all children, use the recursive argument.

  @param {string} themeName The name of the theme to apply as the object's theme
  @param {boolean} [recursive=false] Whether or not the set theme will be applied to children for which a theme has already been set. If this argument is unset, it will default to false
  ###
  setTheme: (themeName, recursive) ->
    if themeName
      throw new Error("Trying to set nonexistent theme: " + themeName) if loader.themes[themeName] is undefined #dev
    else
      themeName = undefined
    i = undefined
    recursive = (if recursive isnt undefined then recursive else false)
    @theme = themeName
    @refreshSource() if @refreshSource
    if recursive
      i = 0
      while i < @children.length
        @children[i].setTheme undefined, true
        i++
    else
      @applyToThisAndChildren ->
        @refreshSource() if @refreshSource
        return

    return


  ###
  Executes a function for the View and all of the its children.

  @param {function} func Function to execute
  ###
  applyToThisAndChildren: (func) ->
    throw new Error("Missing argument: function") if func is undefined #dev
    i = undefined
    func.call this
    i = 0
    while i < @children.length
      if @children[i].applyToThisAndChildren
        @children[i].applyToThisAndChildren func
      else
        func.call @children[i]
      i++
    return


  ###
  Gets the complete region that will used for drawing on next redraw

  @return {Math.Rectangle} A rectangle representing the region
  ###
  getCombinedRedrawRegion: ->
    box = undefined
    addBox = undefined
    i = undefined
    child = undefined
    box = @getRedrawRegion() if @getRedrawRegion
    i = 0
    while i < @children.length
      child = @children[i]
      if child.getCombinedRedrawRegion
        addBox = child.getCombinedRedrawRegion()
      else
        addBox = child.getRedrawRegion()
      child.currentRedrawRegion = addBox
      if addBox
        if box
          box = box.getBoundingRectangle(addBox)
        else
          box = addBox
      i++
    box


  ###
  Removes one or more children from the

  @param {Child} child1 A child to add to the View object
  @param {Child} child2 Another child to remove...
  @return {Child[]} An array of the children which was removed. If an object, which was supplied as argument, was not a child of the View, it will not appear in the returned array
  ###
  removeChildren: (child1, child2) ->
    throw new Error("This function needs at least one argument") if arguments.length is 0 #dev
    i = undefined
    childId = undefined
    removed = undefined
    removed = []
    i = arguments.length
    while i > -1
      childId = @children.indexOf(arguments[i])
      if childId isnt -1
        @children.splice childId, 1
        removed.push arguments[i]
        arguments[i].parent = undefined
      i--
    removed


  ###
  Removes all children from the

  @param {boolean} purge Whether or not to purge the removed children, meaning that their scheduled functions and loop-attached functions will be removed. (true by default)
  ###
  removeAllChildren: (purge) ->
    purge = (if purge isnt undefined then purge else true)
    rmChild = undefined
    rmChild = @children.splice(0, @children.length)
    rmChild.forEach (c) ->
      c.parent = undefined
      engine.purge c if purge
      return

    return


  ###
  Draws all children and grandchildren of an object that inherits the View class. It is usually not necessary to call this function since it is automatically called by the engine's redraw loop.

  @param {CanvasRenderingContext2D} c A canvas' 2d context to draw the children on
  @param {Math.Rectangle} area A rectangle specifying the area to draw
  @param {boolean} forceRedraw Whether or not to force a redraw even though draw caching is enabled (this option is actually used when caching the view)
  ###
  draw: (c, area, noCache) ->
    if engine.enableRedrawRegions
      @drawRedrawRegions c, area
    else
      @drawWholeCanvas c, noCache
    return

  drawWholeCanvas: (c, noCache) ->
    i = undefined
    len = undefined
    child = undefined
    return unless @isVisible()
    @transformCanvasContext c
    if @drawCacheEnabled and not noCache
      c.drawImage @drawCacheCanvas, 0, 0
    else
      if @drawCanvas
        engine.drawCalls++ #dev
        @drawCanvas c
        #dev
        @drawBoundingBox c if engine.drawBoundingBoxes and @drawBoundingBox #dev
        #dev
        #dev
        @drawMask c if engine.drawMasks and @drawMask #dev
      #dev

      # Draw children
      len = @children.length
      i = 0
      while i < len
        child = @children[i]
        if child.draw
          child.draw c
        else if child.isVisible()
          engine.drawCalls++ #dev
          child.transformCanvasContext c
          child.drawCanvas c
          child.restoreCanvasContext c
        i++
    @restoreCanvasContext c
    return


  ###
  Remove drawCanvas function which was inherited from View
  ###
  drawCanvas: undefined
  getRedrawRegion: undefined
