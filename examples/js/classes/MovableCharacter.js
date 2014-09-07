/*
MovableCharacter (Class example):
A character that can be moved around using the keyboard

Requires:
	Sprite
*/

// Create a new JsEngine class which extends the Sprite class
MovableCharacter = createClass('MovableCharacter', [View.Sprite], {
    // Create constructor (the constructors name is always the class name with lowercase first letter)
    MovableCharacter: function(x, y) {
        // Call the sprite constructor to fully extend the sprite and set all sprite properties
        this.Sprite('Character', x, y, 0);

        // Add step function to the current room's eachFrame'-loop
        engine.currentRoom.loops.eachFrame.attachFunction(
            this, // This object (an instance reference is needed by the engine)
            this.step // The function to call each time the loop executes
        );
    },

    step: function() {
        // Check that the arrow keys are down, if so, move the object by increasing or decreasing it's x and y properties
        // Left
        if (keyboard.isDown(KEY_LEFT)) {
            this.x -= engine.convertSpeed(200);
        }

        // Right
        if (keyboard.isDown(KEY_RIGHT)) {
            this.x += engine.convertSpeed(200);
        }

        // Up
        if (keyboard.isDown(KEY_UP)) {
            this.y -= engine.convertSpeed(200);
        }

        // Down
        if (keyboard.isDown(KEY_DOWN)) {
            this.y += engine.convertSpeed(200);
        }

        // Space
        if (keyboard.isPressed(KEY_SPACE)) {
            // Turn the character around
            this.animate(
                {
                    direction: this.direction + Math.PI * 2
                },
                {
                    duration: 2000
                }
            );
        }
    }
});
