/**
 * GameObject:
 * A class which incorporates functions that are often used by objects in games:
 * - Is drawn as a sprite
 * - Has movement vector
 * - Has collision checking
 */

NewClass('GameObject', [Collidable]);

/**
 * The constructor for the GameObject class.
 *
 * @param {string} source A string representing the source of the object's bitmap
 * @param {number} x The x-position of the object in the game arena, in pixels
 * @param {number} y The y-position of the object in the game arena, in pixels
 * @param {number} dir The rotation (in radians) of the object when drawn in the game arena
 * @param {object} additionalProperties An object containing additional properties to assign to the created object.
 * The default is:
 * <code>
 * {
 * 	size: 1,
 * 	opacity: 1,
 * 	composite: 'source-over',
 * 	offset: new Vector('center', 'center'),
 * 	loop: 'eachFrame',
 * 	speed: new Vector(0, 0)
 * }
 * </code>
 */
GameObject.prototype.GameObject = function (source, x, y, dir, additionalProperties) {
	if (source === undefined) {throw new Error('Missing argument: source'); }
	if (x === undefined) {throw new Error('Missing argument: x'); }
	if (y === undefined) {throw new Error('Missing argument: y'); }

	this.Collidable(source, x, y, dir, additionalProperties);

	this.mask = this.mask ? this.mask : loader.getMask(source, this.getTheme());

	// Add object to right loop
	this.loop = this.loop ? this.loop : engine.currentRoom.loops.eachFrame;
	this.loop.attachFunction(this, this.updatePosition);

	this.speed = this.speed ? this.speed : new Vector(0, 0);
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