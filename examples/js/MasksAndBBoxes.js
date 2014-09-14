MasksAndBBoxes = function () {
    // Make a global reference to the game object
    game = this;

    this.onLoaded();
};

MasksAndBBoxes.prototype.import({
    onLoaded: function() {
        // Hide loader overlay
        loader.hideOverlay();

        object = new View.GameObject(
            'Character', // Image ID (See "/themes/Example/theme.json" for an explanation of themes)
            50, // x-position
            50, // y-position
            0 // Direction (in radians)
        );

        object.animation = function () {
            this.animate({
                direction: this.direction + Math.PI * 2
            }, {
                duration: 10000,
                callback: this.animation
            });
        };
        object.animation();

        object2 = new View.GameObject(
            'Rock', // Image ID (See "/themes/Example/theme.json" for an explanation of themes)
            16, // x-position
            50, // y-position
            0 // Direction (in radians)
        );
        object.checkCollision = function () {
            if (this.collidesWith(object2)) {
                text.string = 'Collides';
            }
            else {
                text.string = '';
            }
        };

        text = new View.TextBlock('', 6, 4, 80, {color: '#FFF'});

        engine.currentRoom.loops.eachFrame.attachFunction(object, object.checkCollision);

        engine.currentRoom.addChildren(object, object2, text);
    }
});
