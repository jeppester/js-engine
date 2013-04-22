NewClass('CollisionTest');

CollisionTest.prototype.CollisionTest = function () {
	// Make a global reference to the game object
	game = this;

	// LOAD GAME CLASSES
	loader.loadClasses([
		'js/classes/CollisionObject.js',
	]);

	// Add collision checking loop
	engine.addLoop('collisionChecking', new CustomLoop(2));

	// Make two collision objects
	ball = new CollisionObject(
		"Rock",
		100, // x-position
		100 // y-position
	);

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

	engine.depth[0].addChildren(ball, player);

	// Hide loader overlay
	loader.hideOverlay(function () {
		game.onLoaded();
	});
};

CollisionTest.prototype.onLoaded = function () {
	ball.speed = new Vector(-100, -100);
};