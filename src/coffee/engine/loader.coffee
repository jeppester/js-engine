module.exports = -> module.exports::constructor.apply @, arguments

###
Constructor for the Loader class.
This function will also create a load overlay which will not disappear until the hideOverlay is called.
Therefore, remember to call hideOverlay, when your game is ready to be shown.

@name Loader
@class Class for loading and storing resources.
On engine startup a Loader object is instantiated to the global variable "loader".
This loader object will also create a load overlay (the overlay saying "jsEngine loading"), this overlay will not be removed until the loader.hideOverlay() is called.
###
c = class Loader
  constructor: ->
    @images = {}
    @loaded = classes: []
    @themes =
      External:
        name: "External"
        inherit: []
        music: {}
        sfx: {}
        images: {}
        masks: {}
        textures: {}
        resourcesCount: 0
        resourcesLoaded: 0

    # Make load overlay
    @loadOverlay = document.createElement("div")
    @loadOverlay.setAttribute "style", "border: 0;position: absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 100;opacity: 1;"
    @loadOverlay.className = "load-overlay"
    @loadOverlay.innerHTML = """<div class="load-overlay-text">#{engine.loadText}</div>"""
    engine.arena.appendChild @loadOverlay
    return

  ###
  Fades out the load overlay (which is automatically created by Loader's constructor).
  Remember to call this function, when your game is ready to be shown. Otherwise, the load overlay will never disappear.

  @param {function} callback A callback function to run when the overlay has finished fading out
  ###
  hideOverlay: (callback) ->
    @fadeCallback = callback
    @fadeOpacity = 1
    @fade = =>
      obj = @loadOverlay
      @fadeOpacity = Math.max(0, @fadeOpacity - 0.1)
      @fadeOpacity = Math.floor(@fadeOpacity * 100) / 100
      obj.style.opacity = @fadeOpacity
      if @fadeOpacity isnt 0
        setTimeout =>
          @fade()
          return
        , 30
      else
        engine.arena.removeChild @loadOverlay
        delete @fade

        @fadeCallback() if @fadeCallback
        delete @fadeCallback
      return

    @fade()
    return


  ###
  Fetches an image from the Loader. This function will automatically be called by objects that implements the Sprite object.

  @param {string} resource The resource string of the image that should be fetched
  @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
  @return {HTMLImageElement} The image element corresponding to the resource string and theme
  ###
  getImage: (resource, themeName) ->
    throw new Error("Missing argument: resource") if resource is undefined #dev
    themeName = (if themeName isnt undefined then themeName else engine.defaultTheme)
    @getResource resource, "images", themeName


  ###
  Fetches a sound from the Loader.

  @param {string} resource The resource string of the sound that should be fetched
  @param {string} themeName The name of the theme from which the sound should be fetched. If unset, the engine's default theme will be used
  @return {Sounds.Effect} A Sound object corresponding to the resource string and theme
  ###
  getSound: (resource, themeName) ->
    throw new Error("Missing argument: resource") if resource is undefined #dev
    themeName = (if themeName isnt undefined then themeName else engine.defaultTheme)
    @getResource resource, "sfx", themeName


  ###
  Fetches a music track from the Loader.

  @param {string} resource The resource string of the track that should be fetched
  @param {string} themeName The name of the theme from which the track should be fetched. If unset, the engine's default theme will be used
  @return {Sounds.Music} A Music object corresponding to the resource string and theme
  ###
  getMusic: (resource, themeName) ->
    throw new Error("Missing argument: resource") if resource is undefined #dev
    themeName = (if themeName isnt undefined then themeName else engine.defaultTheme)
    @getResource resource, "music", themeName


  ###
  Creates (or loads from cache) a mask for an image which is loaded by the Loader.
  This function is automatically used by the Collidable object for fetching masks for collision checking.

  @param {string} resource The resource string of the image that should be fetched
  @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
  @return {HTMLCanvasElement} A generated mask (canvas element) for the image element corresponding to the resource string and theme
  ###
  getMask: (resource, themeName) ->
    throw new Error("Missing argument: resource") if resource is undefined #dev
    themeName = (if themeName isnt undefined then themeName else engine.defaultTheme)

    # Check if the mask has been generated
    mask = @getResource(resource, "masks", themeName)
    if mask
      # If yes, return the mask
      mask

    # Otherwise, generate the mask and return it
    else
      mask = @generateMask(resource)
      @themes[themeName].masks[resource] = mask
      mask

  ###
  Fetches a resource from the Loader's cache. Used by the getImage-, getSound- and getMusic functions.

  @private
  @param {string} resource The resource string of the resource that should be fetched
  @param {string} typeString A string representing the resource type, possible values are: "image", "sfx" and "music"
  @param {string} themeName The name of the theme from which the image should be fetched. If unset, the engine's default theme will be used
  @return {HTMLImageElement|Sounds.Effect|Sounds.Music} The resource corresponding to the provided resource string, resource type and theme name
  ###
  getResource: (resource, typeString, themeName) ->
    throw new Error("Missing argument: resource") if resource is undefined #dev
    throw new Error("Missing argument: typeString") if typeString is undefined #dev
    throw new Error("Missing argument: themeName") if themeName is undefined #dev
    resource = resource.replace(/\//g, ".") if resource.indexOf("/") isnt -1
    res = @themes[themeName][typeString][resource]

    # Search for the resource in inherited themes
    if res is undefined
      i = 0
      while i < @themes[themeName].inherit.length
        inh = @themes[themeName].inherit[i]
        if @themes[inh]
          res = @themes[inh][typeString][resource]
          break if res
        i++
    (if res is undefined then false else res)


  ###
  Fetches all loaded images' resource strings (from all themes).

  @return {string[]} An array containing all loaded images' resource strings
  ###
  getImageSources: ->
    object = @themes[engine.defaultTheme].images
    sourceStrings = []
    currentDir = []
    loopThrough = (object) ->
      if object.src isnt undefined
        pushStr = currentDir.join(".")
        sourceStrings.push pushStr if sourceStrings.indexOf(pushStr) is -1
      else
        for name of object
          if object.hasOwnProperty(name)
            currentDir.push name
            loopThrough object[name]
            currentDir.pop()
      return

    loopThrough object
    i = 0
    while i < @themes[engine.defaultTheme].inherit.length
      inheritTheme = @themes[@themes[engine.defaultTheme].inherit[i]]
      loopThrough inheritTheme.images if inheritTheme isnt undefined and inheritTheme.images isnt undefined
      i++
    sourceStrings


  ###
  Fetches all loaded sounds' resource strings (from all themes).

  @return {string[]} An array containing all loaded sounds' resource strings
  ###
  getAllSounds: ->
    res = []
    for themeName of @themes
      if @themes.hasOwnProperty(themeName)
        theme = @themes[themeName]
        for resourceString of theme.sfx
          res.push theme.sfx[resourceString] if theme.sfx.hasOwnProperty(resourceString)
    res


  ###
  Fetches all loaded music tracks' resource strings (from all themes).

  @return {string[]} An array containing all loaded music tracks' resource strings
  ###
  getAllMusic: ->
    res = []
    for themeName of @themes
      if @themes.hasOwnProperty(themeName)
        theme = @themes[themeName]
        for resourceString of theme.music
          res.push theme.music[resourceString] if theme.music.hasOwnProperty(resourceString)
    res


  ###
  Loads JavaScript classes from files. The loaded classes' names must follow the following format: [ClassName].js

  @param {string[]} paths An array of paths to JavaScripts - containing classes - which should be loaded
  @return {boolean} True, when the classes has been loaded without any errors
  ###
  loadClasses: (paths) ->
    throw new Error("Missing argument: paths") if paths is undefined #dev
    for i of paths
      if paths.hasOwnProperty(i)

        # Check that the object is not already loaded
        objectName = paths[i].match(/(\w*)\.\w+$/)[1]
        continue if window[objectName]
        engine.loadFiles paths[i]
        @loaded.classes[objectName] = paths[i]
    true


  ###
  Reloads all classes. This function is very useful for applying code changes without having to refresh the browser, usually it has to be run multiple times though, to force the browser not to just load the files from its cache.
  ###
  reloadAllClasses: ->
    for i of @loaded.classes
      engine.loadFiles @loaded.classes[i] if @loaded.classes.hasOwnProperty(i)
    return


  ###
  Loads a list of themes. This function is automatically called by the Engine during its startup, for loading the themes specified by the launch options.

  @private
  @param {string[]} themeNames An array of theme names (as strings) to load
  @param {function} callback A callback function to run when all the themes has been loaded
  ###
  loadThemes: (themeNames, callback) ->
    throw new Error("Missing argument: themeNames") if themeNames is undefined #dev
    @onthemesloaded = callback if callback isnt undefined
    i = 0
    while i < themeNames.length
      name = themeNames[i]

      # Check that the theme is not already loaded
      continue if @themes[name]

      # Fetch theme details
      req = new XMLHttpRequest()
      req.open "GET", engine.themesPath + "/" + name + "/theme.js", false
      req.send()

      # Check that the theme is actually there
      if req.status is 404
        console.log "Theme not found: " + name
        continue

      # Get theme details
      codeString = req.responseText + "\n//# sourceURL=/" + engine.themesPath + "/" + name + "/theme.js"
      eval "theme = " + codeString

      # Load inherited themes
      @loadThemes theme.inherit if theme.inherit.length

      # Always inherit "External" theme
      theme.inherit.push "External"

      # Create new theme
      @themes[name] = theme
      theme.resourcesCount = 0
      theme.resourcesLoaded = 0
      theme.masks = {}
      theme.textures = {}

      # Load all images
      @loadResources theme, theme.images, "images"
      @loadResources theme, theme.sfx, "sfx"
      @loadResources theme, theme.music, "music"
      i++

    # Check if the theme was empty, if so, run callback
    total = 0
    for i of @themes
      total += @themes[i].resourcesCount if @themes.hasOwnProperty(i)
    @onthemesloaded() if @onthemesloaded if total is 0
    return


  ###
  Loads resources to a theme. This function is used by loadThemes for caching the theme resources.

  @private
  @param {Object} theme A theme object to load the resources to
  @param {Object} object An object containing references to theme resources (like the subcategories of theme files)
  @param {string} typeString A string defining the resource type. Supported types are: "images", "sfx" and "music"
  ###
  loadResources: (theme, object, typeString) ->
    throw new Error("Missing argument: theme") if theme is undefined #dev
    throw new Error("Missing argument: object") if object is undefined #dev
    throw new Error("Missing argument: typeString") if typeString is undefined #dev
    onload = (event)=>
      return if event.target.hasAttribute("data-loaded")
      event.target.setAttribute "data-loaded", "true"
      theme = @themes[event.target.getAttribute("data-theme")]
      theme.resourcesLoaded++
      @checkAllLoaded()
      return

    for path of object
      if object.hasOwnProperty(path)
        switch typeString
          when "images"
            res = new Image()

            # Get image format
            format = object[path].match(/(png|jpg|jpeg|svg)/)
            format = format[0] if format

            # Start loading iage
            res.src = engine.themesPath + "/" + theme.name + "/images/" + path.replace(/\./g, "/") + "." + format

            # Find out if the image is a sprite
            images = object[path].match(/; *(\d+) *images?/)
            if images
              res.imageLength = parseInt(images[1], 10)
            else
              res.imageLength = 1
            if object[path].match(/; *bordered/)
              res.spacing = 1
            else
              res.spacing = 0
            theme.images[path] = res

            # Set load callback
            res.onload = onload
            theme.resourcesCount++
          when "sfx"
            format = false
            i = 0
            while i < engine.host.supportedAudio.length
              format = engine.host.supportedAudio[i] if object[path].search(engine.host.supportedAudio[i]) isnt -1
              i++
            unless format
              console.log "Sound was not available in a supported format: " + theme.name + "/sfx/" + path.replace(/\./g, "/")
              continue
            res = new Audio(engine.themesPath + "/" + theme.name + "/sfx/" + path.replace(/\./g, "/") + "." + format)
            theme.sfx[path] = new Sounds.Effect(res)
            if engine.preloadSounds
              res.setAttribute "preload", "auto"
              res.addEventListener "canplaythrough", onload, false
              theme.resourcesCount++
          when "music"
            format = false
            i = 0
            while i < engine.host.supportedAudio.length
              format = engine.host.supportedAudio[i] if object[path].search(engine.host.supportedAudio[i]) isnt -1
              i++
            throw new Error("Sound was not available in a supported format: " + theme.name + "/sfx/" + path.replace(/\./g, "/")) unless format #dev
            res = new Audio(engine.themesPath + "/" + theme.name + "/music/" + path.replace(/\./g, "/") + "." + format)
            theme.music[path] = new Sounds.Music(res)
            if engine.preloadSounds
              res.setAttribute "preload", "auto"
              res.addEventListener "canplaythrough", onload, false
              theme.resourcesCount++
        res.setAttribute "data-theme", theme.name
        res.setAttribute "data-resourceString", path.replace(/\./g, "/")
    return


  ###
  Loads an external resource to the built in External-theme

  @param {string} resourceString The proposed resource string of the resource when loaded
  @param {string} path The path to the resource's file
  @param {string} [typeString = "images"] A string defining the type of resource, can be: "images" (image file), sfx (sound effects) or "music" (background music)
  @param {function} [onLoaded = function () {}] A function to call when the resource has been loaded
  @param {string} [options = ""] A string defining the resource options (same as the string used for defining animations in a theme file)
  ###
  loadExternalResource: (resourceString, path, onLoaded, typeString, options) ->
    throw new Error("Missing argument: resourceString") if resourceString is undefined #dev
    throw new Error("Missing argument: path") if path is undefined #dev
    typeString = typeString or "images"
    onLoaded = onLoaded or ->

    options = options or ""
    theme = @themes.External
    switch typeString
      when "images"
        res = new Image()
        res.src = path
        images = options.match(RegExp(" *(\\d+) *images?"))
        if images
          res.imageLength = parseInt(images[1], 10)
        else
          res.imageLength = 1
        if options.match(/; *bordered/)
          res.spacing = 1
        else
          res.spacing = 0
        theme.images[resourceString] = res
        res.onload = onLoaded
        theme.resourcesCount++
      when "sfx"
        format = path.match(/[^\.]*$/)[0]
        throw new Error("Sound format is not supported:", format) if engine.host.supportedAudio.indexOf(format) is -1 #dev
        res = new Audio(path)
        theme.sfx[resourceString] = new Sounds.Effect(res)
        if engine.preloadSounds
          res.setAttribute "preload", "auto"
          res.addEventListener "canplaythrough", onLoaded, false
          theme.resourcesCount++
      when "music"
        format = path.match(/[^\.]*$/)[0]
        throw new Error("Sound format is not supported:", format) if engine.host.supportedAudio.indexOf(format) is -1 #dev
        res = new Audio(path)
        theme.music[resourceString] = new Sounds.Music(res)
        if engine.preloadSounds
          res.setAttribute "preload", "auto"
          res.addEventListener "canplaythrough", onLoaded, false
          theme.resourcesCount++
    res.setAttribute "data-theme", theme.name
    res.setAttribute "data-resourceString", resourceString
    return


  ###
  Generates a mask for an image specified by its resource string.
  This function is used by getMask to fetch and cache masks for each of the loaded images.

  @param {string} resourceString A resource string specifying the image to generate a mask for
  @param {number} alphaLimit An alpha value (0-255). Pixel having this alpha value or larger will become black on the mask, pixels with a value below the limit will become completely transparent
  @return {HTMLCanvasElement} A canvas element with the generated mask
  ###
  generateMask: (resourceString, alphaLimit) ->
    throw new Error("Missing argument: resourceString") if resourceString is undefined #dev
    alphaLimit = (if alphaLimit isnt undefined then alphaLimit else 255)
    image = engine.loader.getImage(resourceString)
    canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    canvas.imageLength = image.imageLength
    ctx = canvas.getContext("2d")
    #dev
    throw new Error("Trying to create mask for non-existing resource: " + resourceString) if image is false #dev
    #dev
    ctx.drawImage image, 0, 0, image.width, image.height
    bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height)
    data = bitmap.data
    length = data.length / 4
    top = bitmap.height
    bottom = 0
    left = bitmap.width
    right = 0
    pixel = 0
    while pixel < length

      # If the pixel is partly transparent, make it completely transparent, else make it completely black
      if data[pixel * 4 + 3] < alphaLimit
        data[pixel * 4] = 0 # Red
        data[pixel * 4 + 1] = 0 # Green
        data[pixel * 4 + 2] = 0 # Blue
        data[pixel * 4 + 3] = 0 # Alpha
      else
        data[pixel * 4] = 0 # Red
        data[pixel * 4 + 1] = 0 # Green
        data[pixel * 4 + 2] = 0 # Blue
        data[pixel * 4 + 3] = 255 # Alpha

        # Remember the mask's bounding box
        y = Math.floor(pixel / bitmap.width)
        x = pixel - y * bitmap.width
        x -= Math.floor(image.width / image.imageLength) + image.spacing while x >= Math.floor(image.width / image.imageLength)
        continue if x < 0
        top = Math.min(y, top)
        bottom = Math.max(y + 1, bottom)
        left = Math.min(x, left)
        right = Math.max(x + 1, right)
      pixel++
    ctx.putImageData bitmap, 0, 0
    canvas.bBox = new Geometry.Rectangle(left, top, right - left, bottom - top).getPolygon()
    canvas


  ###
  Checks if all resources - of all themes - has been loaded. This check is automatically called any time a single resource has finished loading.

  @private
  @return {boolean} Whether or not all themes' resources has been successfully loaded
  ###
  checkAllLoaded: ->
    total = 0
    loaded = 0
    for i of @themes
      if @themes.hasOwnProperty(i)
        theme = @themes[i]
        total += theme.resourcesCount
        loaded += theme.resourcesLoaded
    if loaded is total
      @onthemesloaded() if @onthemesloaded
      return true
    false

module.exports:: = Object.create c::
module.exports::constructor = c

Sounds =
  Music: require '../sounds/music'
  Effect: require '../sounds/effect'

Geometry =
  Rectangle: require '../geometry/rectangle'
