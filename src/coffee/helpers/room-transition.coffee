module.exports =
  slideOut: (camera, from, animOptions) ->
    switch from
      when "left"
        camera.projectionRegion.animate
          x: camera.projectionRegion.x + engine.canvasResX
        , animOptions
      when "right"
        camera.projectionRegion.animate
          x: camera.projectionRegion.x - engine.canvasResX
        , animOptions
      when "top"
        camera.projectionRegion.animate
          y: camera.projectionRegion.y + engine.canvasResY
        , animOptions
      when "bottom"
        camera.projectionRegion.animate
          y: camera.projectionRegion.y - engine.canvasResY
        , animOptions

  slideIn: (camera, from, animOptions) ->
    switch from
      when "left"
        camera.projectionRegion.x -= engine.canvasResX
        camera.projectionRegion.animate
          x: camera.projectionRegion.x + engine.canvasResX
        , animOptions
      when "right"
        camera.projectionRegion.x += engine.canvasResX
        camera.projectionRegion.animate
          x: camera.projectionRegion.x - engine.canvasResX
        , animOptions
      when "top"
        camera.projectionRegion.y -= engine.canvasResY
        camera.projectionRegion.animate
          y: camera.projectionRegion.y + engine.canvasResY
        , animOptions
      when "bottom"
        camera.projectionRegion.y += engine.canvasResY
        camera.projectionRegion.animate
          y: camera.projectionRegion.y - engine.canvasResY
        , animOptions

  squeezeOut: (camera, from, animOptions) ->
    switch from
      when "left"
        camera.projectionRegion.animate
          width: 0
          x: camera.projectionRegion.x + engine.canvasResX
        , animOptions
      when "right"
        camera.projectionRegion.animate
          width: 0
        , animOptions
      when "top"
        camera.projectionRegion.animate
          height: 0
          y: camera.projectionRegion.y + engine.canvasResY
        , animOptions
      when "bottom"
        camera.projectionRegion.animate
          height: 0
        , animOptions

  squeezeIn: (camera, from, animOptions) ->
    oldWidth = undefined
    oldHeight = undefined
    switch from
      when "left"
        oldWidth = camera.projectionRegion.width
        camera.projectionRegion.width = 0
        camera.projectionRegion.animate
          width: oldWidth
        , animOptions
      when "right"
        oldWidth = camera.projectionRegion.width
        camera.projectionRegion.width = 0
        camera.projectionRegion.x += engine.canvasResX
        camera.projectionRegion.animate
          x: camera.projectionRegion.x - engine.canvasResX
          width: oldWidth
        , animOptions
      when "top"
        oldHeight = camera.projectionRegion.height
        camera.projectionRegion.height = 0
        camera.projectionRegion.animate
          height: oldHeight
        , animOptions
      when "bottom"
        oldHeight = camera.projectionRegion.height
        camera.projectionRegion.height = 0
        camera.projectionRegion.y += engine.canvasResY
        camera.projectionRegion.animate
          y: camera.projectionRegion.y - engine.canvasResY
          height: oldHeight
        , animOptions
