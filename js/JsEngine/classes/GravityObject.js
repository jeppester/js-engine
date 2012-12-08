/*
GravityObject:
Test object affected by the (simplified) laws of gravity

Requires;
	GameObject
	Sprite
	Animator
	Loader
*/

jseCreateClass('GravityObject', [GameObject]);

GravityObject.prototype.gravityObject = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }
	if (dir === undefined) {throw new Error('Missing argument: dir'); }

	// Extend GameObject
	this.gameObject(source, x, y, dir, additionalProperties);

	engine.attachFunctionToLoop(this, this.doGrav, this.loop);
	engine.attachFunctionToLoop(this, this.doBorders, this.loop);

	this.gravity = this.gravity ? this.gravity : 0;
	this.gravDir = this.gravityDirection ? this.gravityDirection : Math.PI / 2;
};

GravityObject.prototype.doGrav = function () {
	this.dX += Math.cos(this.gravDir) * this.gravity * (engine.now - engine.last) / 1000;
	this.dY += Math.sin(this.gravDir) * this.gravity * (engine.now - engine.last) / 1000;
};

GravityObject.prototype.doBorders = function () {
	if (this.x < this.bmSize / 2 || this.x > engine.canvasResX - this.bmSize / 2) {

		while (this.x < this.bmSize / 2 || this.x > engine.canvasResX - this.bmSize / 2) {
			this.x -= this.dX * (engine.now - engine.last) / 1000;
		}

		this.dX = -this.dX;
	}

	if (this.y > engine.canvasResY - this.bmSize / 2) {
		this.y = engine.canvasResY - this.bmSize / 2;
		if (Math.abs(this.dY) < 100) {
			this.dY *= -0.4;
			if (Math.abs(this.dY * (engine.now - engine.last) / 1000) < 1) {
				this.dY = 0;
			}
		} else {
			this.dY = -this.dY * 0.6;
		}

		this.dX *= 0.8;
	}
};