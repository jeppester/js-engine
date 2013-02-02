/*
Game object:
An object with movement

Requires;
    Sprite
    Animator
    Loader
*/

jseCreateClass('GameObject', [Collidable]);

GameObject.prototype.gameObject = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }

	this.sprite(source, x, y, dir, additionalProperties);

	this.mask = this.mask ? this.mask : loader.getMask(source, this.getTheme());
	
	// Add object to right loop
	this.loop = this.loop ? this.loop : 'eachFrame';
	engine.attachFunctionToLoop(this, this.updatePosition, this.loop);

	this.speed = this.speed ? this.speed : new Vector2D(0, 0);
	this.alive = true;
};

GameObject.prototype.updatePosition = function () {
	// If the object is "alive", add its speed vector to its position
	if (this.alive) {
		this.add(engine.convertSpeed(this.speed));
	}
};