CollisionStressTest = function () {
    // Make a global reference to the game object
    game = this;

    loader.hideOverlay(function () {
        game.onLoaded();
    });

    this.objectView = new View.Container();
    this.hudView = new View.Container();
    engine.currentRoom.addChildren(this.objectView, this.hudView);

    this.fpsCounter = new View.TextBlock('FPS: 0', 10, 10, 100, {color: '#FFF'});
    this.objectCounter = new View.TextBlock('Objects: 0', 10, 30, 100, {color: '#FFF'});
    this.collisionDisplay = new View.TextBlock('Collides: No', 10, 50, 100, {color: '#FFF'});
    this.collider = new View.Collidable('Character', 300, 200);

    window.collider = this.collider;

    this.hudView.addChildren(this.collider, this.fpsCounter, this.objectCounter, this.collisionDisplay);

    engine.currentRoom.addLoop('each20Frames', new Engine.CustomLoop(20));
    engine.currentRoom.loops.each20Frames.attachFunction(this, this.updateFPS);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.controls);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.checkCollision);
};

CollisionStressTest.prototype.import({
    onLoaded: function() {
        this.addObjects(200);
    },

    checkCollision: function () {
        if (this.collider.collidesWith(this.objectView.getChildren(), 1)) {
            this.collisionDisplay.string = 'Collides: Yes';
        }
        else {
            this.collisionDisplay.string = 'Collides: No';
        }
    },

    updateFPS: function () {
        this.fpsCounter.string = 'FPS: ' + engine.fps;
        this.objectCounter.string = 'Objects: ' + (Object.keys(engine.objectIndex).length - 2);
    },

    addObjects: function (count) {
        count = count !== undefined ? count : 10;
        var i;

        for (i = 0; i < count; i++) {
            sprite = new View.GameObject(
                'Rock',
                Math.random() * 600,
                Math.random() * 400
            );

            this.objectView.addChildren(sprite);
        }
    },

    removeObjects: function (count) {
        var i;

        count = count !== undefined ? count : 10;
        objects = this.objectView.getChildren();
        count = Math.min(count, objects.length);

        for (i = 0; i < count; i++) {
            engine.purge(objects.shift());
        }
    },

    controls: function () {
        var pointers;

        // Add objects when arrow up key is down
        if (keyboard.isDown(KEY_UP)) {
            this.addObjects();
        }

        // Remove objects when arrow down key is down
        if (keyboard.isDown(KEY_DOWN)) {
            this.removeObjects();
        }

        // When clicking somewhere, move the collision object to that position
        pointers = pointer.isDown(MOUSE_TOUCH_ANY);
        if (pointers) {
            this.collider.x = pointers[0].x;
            this.collider.y = pointers[0].y;
        }
    }
});