Game = ->

  # LOAD GAME DATA FILES (global vars etc.)
  #   data=[];
  #   jseSyncLoad([
  #   'file1.js',
  #   'file2.js',
  #   'file3.js',
  #   'file4.js',
  #   ]);
  #

  # LOAD GAME CLASSES
  #   loader.loadClasses([
  #   'js/classes/Object1.js',
  #   'js/classes/Object2.js',
  #   'js/classes/Object3.js',
  #   'js/classes/Object4.js'
  #   ]);
  #
  @onLoaded()
  return

Game::import onLoaded: ->

  # Hide loader overlay
  engine.loader.hideOverlay()
  return

# DO GAME STUFF
