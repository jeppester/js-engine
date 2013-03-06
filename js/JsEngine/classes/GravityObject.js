/*
GravityObject:
Object affected by the (simplified) laws of gravity
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
	this.speed.x += Math.cos(this.gravDir) * this.gravity * engine.timeIncrease / 1000;
	this.speed.y += Math.sin(this.gravDir) * this.gravity * engine.timeIncrease / 1000;
};

GravityObject.prototype.doBorders = function () {
	if (this.x < this.size / 2 || this.x > engine.canvasResX - this.size / 2) {

		while (this.x < this.size / 2 || this.x > engine.canvasResX - this.size / 2) {
			this.x -= this.speed.x * engine.timeIncrease / 1000;
		}

		this.speed.x = -this.speed.x;
	}

	if (this.y > engine.canvasResY - this.size / 2) {
		this.y = engine.canvasResY - this.size / 2;
		if (Math.abs(this.speed.y) < 100) {
			this.speed.y *= -0.4;
			if (Math.abs(this.speed.y * engine.timeIncrease / 1000) < 1) {
				this.speed.y = 0;
			}
		} else {
			this.speed.y = -this.speed.y * 0.6;
		}

		this.speed.x *= 0.8;
	}
};