jseCreateClass('StressTest');

StressTest.prototype.stressTest = function () {
	// Make a global reference to the game object
	stressTest = this;

	loader.hideOverlay(function () {
		stressTest.onLoaded();
	});

	fpsCounter = new TextBlock('FPS: 0', 10, 10, 100, {color: '#FFF'});
	objectCounter = new TextBlock('Objects: 0', 10, 30, 100, {color: '#FFF'});

	engine.depth[1].addChildren(fpsCounter, objectCounter);
	
	engine.newLoop('each20Frames', 20);
	engine.attachFunctionToLoop(this, this.updateFPS, 'each20Frames');
	engine.attachFunctionToLoop(this, this.controls, 'eachFrame');
}

StressTest.prototype.onLoaded=function() {
	var sprite, i, ii, movable;

	this.addObjects(100);
}

StressTest.prototype.updateFPS = function () {
	fpsCounter.setString('FPS: ' + engine.fps);
	objectCounter.setString('Objects: '+Object.keys(engine.objectIndex).length);
}

StressTest.prototype.addObjects = function (count) {
	count = count !== undefined ? count : 1;

	// SPRITE EXAMPLE
	// Make 100 sprites
	for (i = 0; i < count; i++) {
		sprite = new GameObject(
			'Rock',
			Math.random() * 600,
			Math.random() * 400,
			Math.random() * Math.PI * 2 /*,
			{
				dX: -3 + Math.random() * 6,
				dY: -3 + Math.random() * 6
			}*/
		);

		engine.depth[0].addChildren(sprite);
	}
}

StressTest.prototype.removeObjects = function (count) {
	count = count !== undefined ? count : 1;

	// SPRITE EXAMPLE
	// Make 100 sprites
	
	for (i = 0; i < count; i++) {
		var arr = Object.keys(engine.objectIndex);
		if (arr.length > 2) {
			jsePurge(engine.objectIndex[arr[2]]);
		}
	}
}

StressTest.prototype.controls = function () {
	if (keyboard.isDown(KEY_UP)) {
		this.addObjects();
	}

	if (keyboard.isDown(KEY_DOWN)) {
		this.removeObjects();
	}
}