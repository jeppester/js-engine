jseCreateClass('CollisionTest');

CollisionTest.prototype.collisionTest = function () {
	// Make a global reference to the game object
	game = this;

	// LOAD GAME OBJECTS
	loader.loadObjects([
		'js/objects/CollisionObject.js',
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
			upKey: 38,
			downKey: 40,
			leftKey: 37,
			rightKey: 39
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