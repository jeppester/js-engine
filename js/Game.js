new Class('Game', {
    Game: function () {
        // Make a global reference to the game object
        game = this;

        /* LOAD GAME DATA FILES (global vars etc.)
         data=[];
         jseSyncLoad([
         'file1.js',
         'file2.js',
         'file3.js',
         'file4.js',
         ]);
         */

        /* LOAD GAME CLASSES
         loader.loadClasses([
         'js/classes/Object1.js',
         'js/classes/Object2.js',
         'js/classes/Object3.js',
         'js/classes/Object4.js'
         ]);
         */

        this.onLoaded();
    },

    onLoaded: function() {
        // Hide loader overlay
        loader.hideOverlay();

        /* DO GAME STUFF */
        engine.currentRoom.addChildren(
            new View.Sprite('Rock', 100, 100)
        );
    }
});