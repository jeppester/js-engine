/**
 * GameObject:
 * An object which incorporates functions that are often used by objects in games:
 * - Is drawn as a sprite
 * - Has movement vector
 * - Has collision checking
 */

jseCreateClass('GameObject', [Collidable]);

/**
 * The constructor for the GameObject class.
 *
 * @param {object} additionalProperties An object containing additional properties to assign to the created object.
 * The default is:
 * <code>
 * {
 * 	bmSize: 1,
 * 	opacity: 1,
 * 	composite: 'source-over',
 * 	xOff: 'center',
 * 	yOff: 'center',
 * 	loop: 'eachFrame',
 * 	dX: 0,
 * 	dY: 0
 * }
 * </code>
 */
GameObject.prototype.gameObject = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }

	this.sprite(source, x, y, dir, additionalProperties);

	this.mask = this.mask ? this.mask : loader.getMask(source, this.getTheme());

	// Add object to right loop
	this.loop = this.loop ? this.loop : 'eachFrame';
	engine.loops[this.loop].attachFunction(this, this.updatePosition);

	this.speed = this.speed ? this.speed : new Vector2D(0, 0);
	this.alive = true;
};

/**
 * Adds the game object's speed vector to its current position. This function is automatically run in each frame.
 * 
 * @private
 */
GameObject.prototype.updatePosition = function () {
	// If the object is "alive", add its speed vector to its position
	if (this.alive) {
		this.add(engine.convertSpeed(this.speed));
	}
};