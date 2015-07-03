CollisionObject = function (source, x, y, additionalProperties) {
    // Call the sprite constructor to fully extend the sprite and set all sprite properties
    View.GameObject.call(this, source, x, y, 0, additionalProperties);

    // Add step function to 'eachFrame'-loop
    if (this.leftKey !== undefined) {
        engine.currentRoom.loops.eachFrame.attachFunction(
            this, // This object (an instance reference is needed by the loop)
            this.step // The function to call each time the loop executes
        );
    }

    engine.currentRoom.loops.collisionChecking.attachFunction(
        this, // This object (an instance reference is needed by the loop)
        this.collisionCheck // The function to call each time the loop executes
    );
};

CollisionObject.prototype = Object.create(View.GameObject.prototype);

// Create a new JsEngine class which extends the Sprite class
CollisionObject.prototype.import({
    step: function () {
        // Check that the arrow keys are down, if so, move the object by increasing or decreasing it's x and y properties
        // Left
        if (keyboard.isDown(this.leftKey)) {
            this.speed.x -= engine.convertSpeed(100);
        }

        // Right
        if (keyboard.isDown(this.rightKey)) {
            this.speed.x += engine.convertSpeed(100);
        }

        // Up
        if (keyboard.isDown(this.upKey)) {
            this.speed.y -= engine.convertSpeed(100);
        }

        // Down
        if (keyboard.isDown(this.downKey)) {
            this.speed.y += engine.convertSpeed(100);
        }
    },

    collisionCheck: function () {
        var i, col, ball, colPos, speed;

        if (col = this.collidesWith(window.balls, true, true)) {
            for (i = 0; i < col.objects.length; i ++) {
                ball = col.objects[i];
                colPos = col.positions[i];

                // Move to contact position
                do {
                    this.x += Math.cos(colPos.getDirection() - Math.PI);
                    this.y += Math.sin(colPos.getDirection() - Math.PI);

                    ball.x += Math.cos(colPos.getDirection());
                    ball.y += Math.sin(colPos.getDirection());
                }
                while (this.collidesWith(ball, true));

                speed = ball.speed.getLength();
                ball.speed.setFromDirection(colPos.getDirection(), speed);
                this.speed.setFromDirection(colPos.getDirection() - Math.PI, speed);
            }
        }

        // Bounce against borders
        if (this.x < 16) {
            this.x = 16;
            this.speed.x = -this.speed.x;
        }

        if (this.x > engine.canvasResX - 16) {
            this.x = engine.canvasResX - 16;
            this.speed.x = -this.speed.x;
        }

        if (this.y < 16) {
            this.y = 16;
            this.speed.y = -this.speed.y;
        }

        if (this.y > engine.canvasResY - 16) {
            this.y = engine.canvasResY - 16;
            this.speed.y = -this.speed.y;
        }
    }
});
