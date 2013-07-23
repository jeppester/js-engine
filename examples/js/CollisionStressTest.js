new Class('CollisionStressTest', {
    CollisionStressTest: function () {
        // Make a global reference to the game object
        game = this;
    
        loader.hideOverlay(function () {
            game.onLoaded();
        });
    
        this.objectView = new View();
        this.hudView = new View();
        engine.currentRoom.addChildren(this.objectView, this.hudView);
    
        this.fpsCounter = new TextBlock('FPS: 0', 10, 10, 100, {color: '#FFF'});
        this.objectCounter = new TextBlock('Objects: 0', 10, 30, 100, {color: '#FFF'});
        this.collisionDisplay = new TextBlock('Collides: No', 10, 50, 100, {color: '#FFF'});
        this.collider = new Collidable('Character', 300, 200);
        this.hudView.addChildren(this.collider, this.fpsCounter, this.objectCounter, this.collisionDisplay);
    
        engine.currentRoom.addLoop('each20Frames', new CustomLoop(20));
        engine.currentRoom.loops.each20Frames.attachFunction(this, this.updateFPS);
        engine.currentRoom.loops.eachFrame.attachFunction(this, this.controls);
        engine.currentRoom.loops.eachFrame.attachFunction(this, this.checkCollision);
    },
    
    onLoaded: function() {
        this.addObjects(200);
    },
    
    checkCollision: function () {
        if (this.collider.collidesWith(this.objectView.getChildren(), 1)) {
            this.collisionDisplay.setString('Collides: Yes');
        }
        else {
            this.collisionDisplay.setString('Collides: No');
        }
    },
    
    updateFPS: function () {
        this.fpsCounter.setString('FPS: ' + engine.fps);
        this.objectCounter.setString('Objects: ' + (Object.keys(engine.objectIndex).length - 2));
    },
    
    addObjects: function (count) {
        count = count !== undefined ? count : 10;
        var i;
    
        for (i = 0; i < count; i++) {
            sprite = new GameObject(
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