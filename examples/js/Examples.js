jseCreateClass('Examples');

Examples.prototype.examples = function () {
	// Make a global reference to the game object
	game = this;

	/* LOAD GAME DATA FILES (global vars etc.)
	data=[];
	jseSyncLoad([
		'file1.js',
		'file2.js',
		'file3.js',
		'file4.js',
	]);
	*/

	/* LOAD GAME CLASSES
	loader.loadClasses([
		'js/classes/Class1.js',
		'js/classes/Class2.js',
		'js/classes/Class3.js',
		'js/classes/Class4.js',
	]);
	*/

	this.onLoaded();
}

Examples.prototype.onLoaded=function() {
	var text, sprite, movable;

	// Hide loader overlay
	loader.hideOverlay();

	// TEXT EXAMPLE
	// Make a hello world text
	text = new TextBlock(
		'Hello world!', // TextBlock
		50, // x-position
		50, // y-position
		200, // width
		{
			font: 'bold 24px Verdana',
			color: '#FFF',
		}
	);

	// To draw the text, add it to a depth
	engine.depth[0].addChild(text);

	// Since depth[0] is not automatically redrawn (look at the "new JsEngine"-call in game.html), redraw the depth
	engine.redraw(true);


	// SPRITE EXAMPLE
	// Make a sprite object
	sprite = new Sprite(
		'Rock', // Image ID (See "/themes/Example/theme.json" for an explanation of themes)
		70, // x-position
		200, // y-position
		0 // Direction (in radians)
	);

	// Add sprite to depth[1] for it to be drawn
	// (since depth[1] is automatically redrawn, there's no need to call the engine.redraw-function)
	engine.depth[1].addChild(sprite);


	// ANIMATION EXAMPLE
	// Animate a rotation of the sprite
	sprite.animate(
		{
			// Animated properties (can be all numeric properties of the animated object)
			dir: Math.PI * 4 // 2 rounds in radians
		},
		{
			// Animation options
			dur: 5000 // Set the animation duration (in ms)
		}
	);


	// LOADING A CUSTOM CLASS
	// Usually you would load all game classes in the Game-class' constructor-function.
	// (see commented out example near the beginning of this file)

	// For simplicity lets load the class a this point
	loader.loadClasses([
		'js/classes/MovableCharacter.js'
	]);

	// Now that the class is loaded, lets create an instance of the class
	movable = new MovableCharacter(
		120, // x-position
		200 // y-position
	);

	// And lets add the new object to depth[1]
	engine.depth[1].addChild(movable);

	// You should now have a character that you can move around width the arrow keys :)

	// If you want to dig into how to create and extend classes, take a look at the MovableCharacter-class' source (/js/classes/MovableCharacter.js)
}
