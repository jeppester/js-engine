Examples = function () {
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
     'js/classes/Object4.js',
     ]);
     */

    this.onLoaded();
};

Examples.prototype.import({
    onLoaded: function() {
        var text, sprite, movable;

        // Create two views and add them to the room
        this.bgView = new View.Container();
        this.fgView = new View.Container();
        engine.currentRoom.addChildren(this.bgView, this.fgView);

        // TEXT EXAMPLE
        // Make a hello world text
        text = new View.TextBlock(
            'Hello world!', // TextBlock
            50, // x-position
            50, // y-position
            200, // width
            {
                font: 'bold 24px Verdana',
                color: '#FFF'
            }
        );

        // To draw the text, add it to the bgView
        this.bgView.addChildren(text);

        // Cache the bgView to save resources (this will cache the view's objects, and stop redrawing them separately)
        //this.bgView.setDrawCache(true);

        // SPRITE EXAMPLE
        // Make a sprite object
        sprite = new View.Sprite(
            'Rock', // Image ID (See "/themes/Example/theme.json" for an explanation of themes)
            70, // x-position
            200, // y-position
            0 // Direction (in radians)
        );

        // Add sprite to the fg view for it to be drawn
        this.fgView.addChildren(sprite);

        // ANIMATION EXAMPLE
        // Animate a rotation of the sprite
        sprite.animate(
            {
                // Animated properties (can be all numeric properties of the animated object)
                dir: Math.PI * 4 // 2 rounds in radians
            },
            {
                // Animation options
                dur: 5000 // Set the animation duration (in ms)
            }
        );


        // LOADING A CUSTOM CLASS
        // Usually you would load all game classes in the Game-object's constructor-function.
        // (see commented out example near the beginning of this file)

        // For simplicity lets load the class at this point
        engine.loader.loadClasses([
            'js/classes/MovableCharacter.js'
        ]);

        // Now that the object is loaded, lets create an instance of the object
        movable = this.fgView.create.MovableCharacter(
            300, // x-position
            200 // y-position
        );

        // You should now have a character that you can move around width the arrow keys :)

        // If you want to dig into how to create and extend objects, take a look at the MovableCharacter-object's source (/js/objects/MovableCharacter.js)


        // Hide loader overlay now that everything is ready
        engine.loader.hideOverlay();
    }
});
