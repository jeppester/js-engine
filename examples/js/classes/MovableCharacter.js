MovableCharacter = function(x, y) {
    // Call the sprite constructor to fully extend the sprite and set all sprite properties
    View.Sprite.call(this, 'Character', x, y, 0);

    // Add step function to the current room's eachFrame'-loop
    engine.currentRoom.loops.eachFrame.attachFunction(
        this, // This object (an instance reference is needed by the engine)
        this.step // The function to call each time the loop executes
    );
};

MovableCharacter.prototype = Object.create(View.Sprite.prototype);

MovableCharacter.prototype.import({
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
