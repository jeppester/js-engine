/*
CollisionObject (Class example):
A character that can be moved around using the keyboard

Requires:
	Sprite
*/

// Create a new JsEngine class which extends the Sprite class
NewClass('CollisionObject', [GameObject]);

// Create constructor (the constructors name is always the class name with lowercase first letter)
CollisionObject.prototype.CollisionObject = function (source, x, y, additionalProperties) {
	// Call the sprite constructor to fully extend the sprite and set all sprite properties
	this.GameObject(source, x, y, 0, additionalProperties);

	// Add step function to 'eachFrame'-loop
	if (this.leftKey !== undefined) {
		if (typeof this.upKey === 'string') {
			this.upKey = this.upKey.toUpperCase().charCodeAt(0);
		}
		if (typeof this.downKey === 'string') {
			this.downKey = this.downKey.toUpperCase().charCodeAt(0);
		}
		if (typeof this.leftKey === 'string') {
			this.leftKey = this.leftKey.toUpperCase().charCodeAt(0);
		}
		if (typeof this.rightKey === 'string') {
			this.rightKey = this.rightKey.toUpperCase().charCodeAt(0);
		}

		engine.currentRoom.loops.eachFrame.attachFunction(
			this, // This object (an instance reference is needed by the engine)
			this.step // The function to call each time the loop executes
		);
	}

	engine.currentRoom.loops.collisionChecking.attachFunction(
		this, // This object (an instance reference is needed by the engine)
		this.collisionCheck // The function to call each time the loop executes
	);
};

CollisionObject.prototype.step = function () {
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
};

CollisionObject.prototype.collisionCheck = function () {
	var col, speed, sound;

	if (this !== window.ball) {
		if (col = this.collidesWith(window.ball, 1, true)) {
			// Use the direction to the collision, and the direction of the object to calculate obj1's bounce
			this.speed.x = 0;
			this.speed.y = 0;

			// Move to contact position
			while (this.collidesWith(window.ball, 1)) {
				this.x += 1 * Math.cos(col.dir - Math.PI);
				this.y += 1 * Math.sin(col.dir - Math.PI);

				window.ball.x += 1 * Math.cos(col.dir);
				window.ball.y += 1 * Math.sin(col.dir);
			}

			speed = ball.speed.getLength();
			ball.speed.setFromDirection(col.dir, speed);
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