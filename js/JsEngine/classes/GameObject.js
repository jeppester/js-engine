/*
Game object:
An object with movement

Requires;
    Sprite
    Animator
    Loader
*/

jseCreateClass('GameObject', [Sprite, Collidable]);

GameObject.prototype.gameObject = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }

	this.sprite(source, x, y, dir, additionalProperties);

	if (this.maskSource) {
		this.setMask(this.maskSource);
	}
	else {
		this.maskGenerateAlphaLimit = this.maskGenerateAlphaLimit ? this.maskGenerateAlphaLimit : 255;
		this.generateMask(source, this.maskGenerateAlphaLimit);
	}

	this.generateBoundingBox();

	// Add object to right loop
	this.loop = this.loop ? this.loop: 'eachFrame';
	engine.attachFunctionToLoop(this, this.update, this.loop);

	// Create movement variables
	this.dX = this.dX  ?  this.dX : 0;
	this.dY = this.dY  ?  this.dY : 0;
	this.alive = true;
};

GameObject.prototype.getSpeed = function () {
	return Math.sqrt(Math.pow(this.dX, 2) + Math.pow(this.dY, 2));
}

GameObject.prototype.getDirection = function () {
	return Math.atan2(this.dY, this.dX);
}

GameObject.prototype.setVelocity = function (dir, speed) {
	dir = dir !== undefined ? dir : 0;
	speed = speed !== undefined ? speed : 0;

	this.dX = Math.cos(dir) * speed;
	this.dY = Math.sin(dir) * speed;
}

GameObject.prototype.directionTo = function (obj) {
	return Math.atan2(obj.y - this.y, obj.x - this.x);
}

GameObject.prototype.accelerate = function (direction, speed) {
	this.dX += Math.cos(direction) * speed;
	this.dY += Math.sin(direction) * speed;
}

GameObject.prototype.update = function () {
	if (this.alive) {
		// Kør funktion til tilføjelse af yderligere til update(), kaldet "step";
		this.x += this.dX * engine.timeIncrease / 1000;
		this.y += this.dY * engine.timeIncrease / 1000;
	}
};