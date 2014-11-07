###
Provides requestAnimationFrame in a cross browser way.

@author paulirish / http://paulirish.com/
###
unless window.requestAnimationFrame
  window.requestAnimationFrame = (->
    window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or window.oRequestAnimationFrame or window.msRequestAnimationFrame or (callback) ->
      window.setTimeout callback, 1000 / 60
      return
  )()
