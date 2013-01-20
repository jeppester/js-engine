jseCreateClass('MasksAndBBoxes');

MasksAndBBoxes.prototype.masksAndBBoxes = function () {
	// Make a global reference to the game object
	game = this;

	this.onLoaded();
}

MasksAndBBoxes.prototype.onLoaded=function() {
	var animation;

	// Hide loader overlay
	loader.hideOverlay();

	// SPRITE EXAMPLE
	// Make a sprite object
	object = new GameObject(
		'Character', // Image ID (See "/themes/Example/theme.json" for an explanation of themes)
		50, // x-position
		50, // y-position
		0 // Direction (in radians)
	);

	object.animation = function () {
		this.animate({
			dir: this.dir + Math.PI * 2
		}, {
			dur: 5000,
			callback: this.animation
		})
	}
	object.animation();

	engine.depth[0].addChild(object);
}
