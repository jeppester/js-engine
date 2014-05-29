new Class('StressTest', {
    StressTest: function () {
        // Make a global reference to the game object
        game = this;

        loader.hideOverlay(function () {
            game.onLoaded();
        });

        this.objectView = new View.Container();
        this.hudView = new View.Container();
        engine.currentRoom.addChildren(this.objectView, this.hudView);

        fpsCounter = new View.TextBlock('FPS: 0', 10, 10, 100, {color: '#FFF'});
        objectCounter = new View.TextBlock('Objects: 0', 10, 30, 100, {color: '#FFF'});
        this.hudView.addChildren(fpsCounter, objectCounter);

        engine.currentRoom.addLoop('each20Frames', new Engine.CustomLoop(20));
        engine.currentRoom.loops.each20Frames.attachFunction(this, this.updateFPS);
        engine.currentRoom.loops.eachFrame.attachFunction(this, this.controls);
    },

    onLoaded: function() {
        this.addObjects(1000);
    },

    updateFPS: function () {
        fpsCounter.string = 'FPS: ' + engine.fps;
        objectCounter.string = 'Objects: ' + (Object.keys(engine.objectIndex).length - 2);
    },

    addObjects: function (count) {
        count = count !== undefined ? count : 10;
        var i;

        for (i = 0; i < count; i++) {
            sprite = new View.GameObject(
                'Rock',
                Math.random() * 600,
                Math.random() * 400,
                Math.random() * Math.PI * 2,
                {speed: new Math.Vector(-5 + Math.random() * 10, -5 + Math.random() * 10)}
            );
            sprite.checkBounce = function () {
                if (this.x < 0) {
                    this.x = 0;
                    this.speed.x = -this.speed.x;
                }
                else if (this.x > 600) {
                    this.x = 600;
                    this.speed.x = -this.speed.x;
                }

                if (this.y < 0) {
                    this.y = 0;
                    this.speed.y = -this.speed.y;
                }
                else if (this.y > 400) {
                    this.y = 400;
                    this.speed.y = -this.speed.y;
                }
            }
            engine.currentRoom.loops.eachFrame.attachFunction(sprite, sprite.checkBounce);

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
        // Add objects when arrow up key is down
        if (keyboard.isDown(KEY_UP)) {
            this.addObjects();
        }

        // Remove objects when arrow down key is down
        if (keyboard.isDown(KEY_DOWN)) {
            this.removeObjects();
        }
    }
});

