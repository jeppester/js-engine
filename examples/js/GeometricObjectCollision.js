new Class('GeometricObjectCollision', {
    GeometricObjectCollision: function () {
        // Make a global reference to the game object
        game = this;

        // Add a circle
        circle = new Circle(300, 200, 80);

        // Add different objects to calculate the distance to
        line = new Line().setFromCoordinates(20, 320, 80, 380);
        polygon = new Polygon().setFromCoordinates(540, 40, 535, 70.5, 560, 70.5, 540, 50, 560, 35);
        rectangle = new Rectangle(20.5, 130.5, 100, 40);
        circle2 = new Circle(530, 330, 50);

        // Add a text block for showing the distance between the circle and the line
        text = new TextBlock('Use arrow keys to move the circle in the middle', 10, 10, 600);
        text2 = new TextBlock('Distance to line: 0', 10, 30, 600);
        text3 = new TextBlock('Distance to polygon: 0', 10, 50, 600);
        text4 = new TextBlock('Distance to circle: 0', 10, 70, 600);
        text5 = new TextBlock('Distance to rectangle: 0', 10, 90, 600);

        engine.currentRoom.addChildren(circle, line, polygon, rectangle, circle2, text, text2, text3, text4, text5);

        loader.hideOverlay(function () {
            game.onLoaded();
        });
    },

    onLoaded: function () {
        engine.currentRoom.loops.eachFrame.attachFunction(this, this.step);
    },

    step: function () {
        // Keyboard controls
        var dx = 0, dy = 0;

        if (keyboard.isDown(KEY_LEFT)) {
            dx = -engine.convertSpeed(100);
        }
        if (keyboard.isDown(KEY_RIGHT)) {
            dx = engine.convertSpeed(100);
        }
        if (keyboard.isDown(KEY_UP)) {
            dy = -engine.convertSpeed(100);
        }
        if (keyboard.isDown(KEY_DOWN)) {
            dy = engine.convertSpeed(100);
        }
        circle.move(dx, dy);

        // Update text fields
        text2.setString('Distance to line: ' + Math.round(circle.getDistance(line)) + (circle.intersects(line) ? ' (intersects)' : ''));
        text3.setString('Distance to polygon: ' + Math.round(circle.getDistance(polygon)) + (circle.intersects(polygon) ? ' (intersects)' : ''));
        text4.setString('Distance to circle: ' + Math.round(circle.getDistance(circle2)) + (circle.intersects(circle2) ? ' (intersects)' : ''));
        text5.setString('Distance to rectangle: ' + Math.round(circle.getDistance(rectangle)) + (circle.intersects(rectangle) ? ' (intersects)' : ''));
    }
});

