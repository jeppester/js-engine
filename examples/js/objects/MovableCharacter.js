/*
MovableCharacter (Class example):
A character that can be moved around using the keyboard

Requires:
	Sprite
*/

// Create a new JsEngine class which extends the Sprite class
jseCreateClass('MovableCharacter', [Sprite]);

// Create constructor (the constructors name is always the class name with lowercase first letter)
MovableCharacter.prototype.movableCharacter = function(x, y) {
	// Call the sprite constructor to fully extend the sprite and set all sprite properties
	this.sprite('Character', x, y, 0);

	// Add step function to 'eachFrame'-loop
	engine.loops.eachFrame.attachFunction(
		this, // This object (an instance reference is needed by the engine)
		this.step // The function to call each time the loop executes
	);
}

MovableCharacter.prototype.step = function() {
	// Check that the arrow keys are down, if so, move the object by increasing or decreasing it's x and y properties
	// Left
	if (keyboard.isDown(37)) {
		this.x -= engine.convertSpeed(200);
	}

	// Right
	if (keyboard.isDown(39)) {
		this.x += engine.convertSpeed(200);
	}

	// Up
	if (keyboard.isDown(38)) {
		this.y -= engine.convertSpeed(200);
	}

	// Down
	if (keyboard.isDown(40)) {
		this.y += engine.convertSpeed(200);
	}

	// Space
	if (keyboard.isPressed(32)) {
		// Turn the character around
		this.animate(
			{
				dir: this.dir + Math.PI * 2
			},
			{
				dur: 2000
			}
		);
	}
}