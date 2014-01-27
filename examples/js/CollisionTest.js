new Class('CollisionTest', {
    CollisionTest: function () {
        // Make a global reference to the game object
        game = this;

        // LOAD GAME CLASSES
        loader.loadClasses([
            'js/classes/CollisionObject.js'
        ]);

        // Add collision checking loop
        engine.currentRoom.addLoop('collisionChecking', new Engine.CustomLoop(5));

        // Make two collision objects
        window.balls = [];
        this.addBalls(15);

        player = new CollisionObject(
            "Character",
            200, // x-position
            100, // y-position
            {
                upKey: KEY_UP,
                downKey: KEY_DOWN,
                leftKey: KEY_LEFT,
                rightKey: KEY_RIGHT
            }
        );

        engine.currentRoom.addChildren(player);

        // Hide loader overlay
        loader.hideOverlay();
    },

    addBalls: function (number) {
        number = number !== undefined ? number : 1;
        var ball, i;

        for (i = 0; i < number; i ++) {
            ball = new CollisionObject(
                "Rock",
                20 + Math.random() * 560, // x-position
                20 + Math.random() * 360 // y-position
            );
            ball.speed.setFromDirection(Math.PI * 2 * Math.random(), 150);
            window.balls.push(ball);
            engine.currentRoom.addChildren(ball);
        }
    }
});