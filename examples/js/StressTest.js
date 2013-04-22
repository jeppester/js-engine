NewClass('StressTest');

StressTest.prototype.StressTest = function () {
	// Make a global reference to the game object
	game = this;

	loader.hideOverlay(function () {
		game.onLoaded();
	});

	fpsCounter = new TextBlock('FPS: 0', 10, 10, 100, {color: '#FFF'});
	objectCounter = new TextBlock('Objects: 0', 10, 30, 100, {color: '#FFF'});

	engine.depth[1].addChildren(fpsCounter, objectCounter);
	
	engine.addLoop('each20Frames', new CustomLoop(20));
	engine.loops.each20Frames.attachFunction(this, this.updateFPS);
	engine.loops.eachFrame.attachFunction(this, this.controls);
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

	for (i = 0; i < count; i++) {
		sprite = new GameObject(
			'Rock',
			Math.random() * 600,
			Math.random() * 400,
			Math.random() * Math.PI * 2
		);

		engine.depth[0].addChildren(sprite);
	}
}

StressTest.prototype.removeObjects = function (count) {
	count = count !== undefined ? count : 1;

	for (i = 0; i < count; i++) {
		var arr = Object.keys(engine.objectIndex);
		if (arr.length > 2) {
			engine.purge(engine.objectIndex[arr[2]]);
		}
	}
}

StressTest.prototype.controls = function () {
	// Add objects when arrow up key is down
	if (keyboard.isDown(KEY_UP)) {
		this.addObjects();
	}

	// Remove objects when arrow down key is down
	if (keyboard.isDown(KEY_DOWN)) {
		this.removeObjects();
	}
}