NewObject('Game');

Game.prototype.game = function () {
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

	/* LOAD GAME objects
	loader.loadObjects([
		'js/objects/Object1.js',
		'js/objects/Object2.js',
		'js/objects/Object3.js',
		'js/objects/Object4.js'
	]);
	*/

	this.onLoaded();
}

Game.prototype.onLoaded=function() {
	// Hide loader overlay
	loader.hideOverlay();

	/* DO GAME STUFF */
}