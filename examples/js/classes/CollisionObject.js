/*
CollisionObject (Class example):
A character that can be moved around using the keyboard

Requires:
	Sprite
*/

// Create a new JsEngine class which extends the Sprite class
jseCreateClass('CollisionObject', [GameObject]);

// Create constructor (the constructors name is always the class name with lowercase first letter)
CollisionObject.prototype.collisionObject = function (source, x, y, additionalProperties) {
	// Call the sprite constructor to fully extend the sprite and set all sprite properties
	this.gameObject(source, x, y, 0, additionalProperties);
	this.generateMask(this.source, 100);

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

		engine.attachFunctionToLoop(
			this, // This object (an instance reference is needed by the engine)
			this.step, // The function to call each time the loop executes
			'eachFrame' // The loop in which to run the function (eachFrame is the default loop, but you can make your own)
		);
	}

	engine.attachFunctionToLoop(
		this, // This object (an instance reference is needed by the engine)
		this.collisionCheck, // The function to call each time the loop executes
		'collisionChecking' // The loop in which to run the function (eachFrame is the default loop, but you can make your own)
	);
};

CollisionObject.prototype.step = function () {
	// Check that the arrow keys are down, if so, move the object by increasing or decreasing it's x and y properties
	// Left
	if (keyboard.isDown(this.leftKey)) {
		this.dX -= engine.convertSpeed(100);
	}

	// Right
	if (keyboard.isDown(this.rightKey)) {
		this.dX += engine.convertSpeed(100);
	}

	// Up
	if (keyboard.isDown(this.upKey)) {
		this.dY -= engine.convertSpeed(100);
	}

	// Down
	if (keyboard.isDown(this.downKey)) {
		this.dY += engine.convertSpeed(100);
	}
};

CollisionObject.prototype.collisionCheck = function () {
	var col, speed, sound;

	if (this !== window.ball) {
		if (col = this.bitmapCollidesWith(window.ball, 1, true)) {
			// Use the direction to the collision, and the direction of the object to calculate obj1's bounce
			this.dX = 0;
			this.dY = 0;

			// Move to contact position
			while (this.bitmapCollidesWith(window.ball, 1)) {
				this.x += 1 * Math.cos(col.dir - Math.PI);
				this.y += 1 * Math.sin(col.dir - Math.PI);

				window.ball.x += 1 * Math.cos(col.dir);
				window.ball.y += 1 * Math.sin(col.dir);
			}

			//engine.stopMainLoop();
			speed = ball.getSpeed();
			ball.dX = Math.cos(col.dir) * speed;
			ball.dY = Math.sin(col.dir) * speed;
		}
	}

	// Bounce against borders
	if (this.x < 16) {
		this.x = 16;
		this.dX = -this.dX;
	}

	if (this.x > engine.canvasResX - 16) {
		this.x = engine.canvasResX - 16;
		this.dX = -this.dX;
	}

	if (this.y < 16) {
		this.y = 16;
		this.dY = -this.dY;
	}

	if (this.y > engine.canvasResY - 16) {
		this.y = engine.canvasResY - 16;
		this.dY = -this.dY;
	}
}