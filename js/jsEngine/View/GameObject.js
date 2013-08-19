new Class('View.GameObject', [View.Collidable], {
	/**
	 * The constructor for the GameObject class.
     *
     * @name View.GameObject
     * @class A class which incorporates functions that are often used by objects in games:
     *        - Is drawn as a sprite
     *        - Has movement vector
     *        - Has collision checking
     * @augments View.Collidable
     *
     * @property {Engine.CustomLoop} loop The loop to which movement of the object has been assigned
     * @property {boolean} alive Whether or not the object is alive. If the object is not alive, it will not move
     * @property {Math.Vector} speed The two-directional velocity of the object in px/second
	 *
	 * @param {string} source A string representing the source of the object's bitmap
	 * @param {number} [x=0] The x-position of the object in the game arena, in pixels
	 * @param {number} [y=0] The y-position of the object in the game arena, in pixels
	 * @param {number} [direction=0] The rotation (in radians) of the object when drawn in the game arena
	 * @param {Object} [additionalProperties] An object containing additional properties to assign to the created object.
	 *                                      The default is:
	 *                                      <code>
	 *                                      {
	 * 	                                        size: 1,
	 * 	                                        opacity: 1,
	 * 	                                        composite: 'source-over',
	 * 	                                        offset: new Math.Vector('center', 'center'),
	 * 	                                        loop: 'eachFrame',
	 * 	                                        speed: new Math.Vector(0, 0)
	 *                                      }
	 *                                      </code>
	 */
	GameObject: function (source, x, y, direction, additionalProperties) {
		if (source === undefined) {throw new Error('Missing argument: source'); }
		if (x === undefined) {throw new Error('Missing argument: x'); }
		if (y === undefined) {throw new Error('Missing argument: y'); }

		this.Collidable(source, x, y, direction, additionalProperties);
		
		// Add object to right loop
		this.loop = this.loop ? this.loop : engine.defaultActivityLoop;
		this.loop.attachFunction(this, this.updatePosition);

		this.speed = this.speed ? this.speed : new Math.Vector(0, 0);
		this.alive = true;
	},
    /** @scope View.GameObject */

	/**
	 * Adds the game object's speed vector to its current position. This function is automatically run in each frame.
	 * 
	 * @private
	 */
	updatePosition: function () {
		// If the object is "alive", add its speed vector to its position
		if (this.alive) {
			this.add(engine.convertSpeed(this.speed));
		}
	}
});
