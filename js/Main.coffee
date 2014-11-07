Main = ->
  
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

Main::import onLoaded: ->
  
  # Hide loader overlay
  loader.hideOverlay()
  return


# DO GAME STUFF 
