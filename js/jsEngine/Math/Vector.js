new Class('Math.Vector', [Lib.Animatable], {
	/**
	 * Constructor for the Vector class. Uses set-function to set the vector from x- and y values.
	 *
     * @name Math.Vector
     * @class A math class which is used for handling two-dimensional vectors
     * @augments Lib.Animatable
     *
     * @property {number} x The x-value of the vector
     * @property {number} y The y-value of the vector
     *
	 * @param {number} [x=0] The x-value to set for the vector
	 * @param {number} [y=0] The y-value to set for the vector
	 */
	Vector: function (x, y) {
        this.set(x, y);
        this.opacity = 1;
	},
    /** @scope Math.Vector */

	/**
	 * Sets the vector from x- and y values.
	 * 
	 * @param {number} [x=0] The x-value to set for the vector
	 * @param {number} [y=0] The y-value to set for the vector
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	set: function (x, y) {
		this.x = x !== undefined ? x : 0;
		this.y = y !== undefined ? y : 0;

		return this;
	},

	/**
	 * Calculates and sets the vector from a direction and a length.
	 * 
	 * @param {number} direction The direction (in radians)
	 * @param {number} length The length
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	setFromDirection: function (direction, length) {
		if (typeof direction !== 'number') {throw new Error('Argument direction should be of type: Number'); }
		if (typeof length !== 'number') {throw new Error('Argument length should be of type: Number'); }

		this.x = Math.cos(direction) * length;
		this.y = Math.sin(direction) * length;

		return this;
	},

	/**
	 * Copies the Vector object
	 * 
	 * @return {Math.Vector} A copy of the Vector object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Math.Vector(this.x, this.y);
	},

	/**
	 * Moves the vector by adding a value to its x-property and another value to its y-property.
	 * 
	 * @param {number} x The value to add to the x-property (can be negative)
	 * @param {number} y The value to add to the y-property (can be negative)
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	move: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

		this.x += x;
		this.y += y;

		return this;
	},

	/**
	 * Rotates the vector around the zero-vector.
	 * 
	 * @param {number} direction The number of radians to rotate the vector
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	rotate: function (direction) {
		if (typeof direction !== 'number') {throw new Error('Argument direction should be of type: Number'); }

		this.setFromDirection(this.getDirection() + direction, this.getLength());

		return this;
	},

	/**
	 * Scales the vector by multiplying the x- and y values.
	 * 
	 * @param {number} scaleH A factor with which to scale the Vector horizontally. If scaleH is undefined, both width and height will be scaled after this factor
	 * @param {number} scaleV A factor with which to scale the Vector vertically
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	scale: function (scaleH, scaleV) {
		if (typeof scaleH !== 'number') {throw new Error('Argument scaleH should be of type Number'); }
		scaleV = scaleV !== undefined ? scaleV : scaleH;

		this.x *= scaleH;
		this.y *= scaleV;

		return this;
	},

	/**
	 * Adds another vector to the Vector.
	 * Can by used for the same purpose as move, but takes a vector as argument.
	 * 
	 * @param {Math.Vector} vector A vector to add to the Vector
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	add: function (vector) {
		if (vector.implements(Math.Vector)) {
			this.x += vector.x;
			this.y += vector.y;
		}
		else if (typeof vector === 'number') {
			this.x += vector;
			this.y += vector;
		}
		else {
			throw new Error('Argument vector should be of type Vector or Number');
		}

		return this;
	},

	/**
	 * Subtracts another vector from the Vector.
	 * 
	 * @param {Math.Vector} vector A vector to subtract from the Vector
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	subtract: function (vector) {
		if (vector.implements(Math.Vector)) {
			this.x -= vector.x;
			this.y -= vector.y;
		}
		else if (typeof vector === 'number') {
			this.x -= vector;
			this.y -= vector;
		}
		else {
			throw new Error('Argument vector should be of type Vector or Number');
		}

		return this;
	},

	/**
	 * Divides the Vector with another vector.
	 * 
	 * @param {Math.Vector} vector A vector to divide the Vector with
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	divide: function (vector) {
		if (vector.implements(Math.Vector)) {
			this.x /= vector;
			this.y /= vector;
		}
		else if (typeof vector === 'number') {
			this.x /= vector;
			this.y /= vector;
		}
		else {
			throw new Error('Argument vector should be of type Vector or Number');
		}

		return this;
	},

	/**
	 * Multiplies the Vector with another vector.
	 * 
	 * @param {Math.Vector} vector A vector to multiply the Vector with
	 * @return {Math.Vector} The resulting Vector object (itself)
	 */
	multiply: function (vector) {
		if (!vector.implements(Math.Vector)) {throw new Error('Argument vector should be of type Vector'); }

		this.x *= vector.x;
		this.y *= vector.y;

		return this;
	},

	/**
	 * Calculates the cross product of the Vector and another vector
	 * 
	 * @param {Math.Vector} vector The vector to use for the calculation
	 * @return {number} The dot product
	 */
	getDot: function (vector) {
		if (!vector.implements(Math.Vector)) {throw new Error('Argument vector should be of type: Vector'); }

		return this.x * vector.x + this.y * vector.y;
	},

	/**
	 * Calculates the cross product of the Vector and another vector
	 * 
	 * @param {Math.Vector} vector The vector to use for the calculation
	 * @return {number} The cross product
	 */
	getCross: function (vector) {
		if (!vector.implements(Math.Vector)) {throw new Error('Argument vector should be of type: Vector'); }

		return this.x * vector.y - this.y * vector.x;
	},

	/**
	 * Calculates the length of the Vector
	 * 
	 * @return {number} The vector's length
	 */
	getLength: function () {
		return Math.sqrt(this.getDot(this));
	},

	/**
	 * Calculates the direction of the Vector
	 * 
	 * @return {number} The vector's direction (in radians)
	 */
	getDirection: function () {
		return Math.atan2(this.y, this.x);
	},

	/**
	 * Calculates the direction to another Vector
	 * 
	 * @param {Math.Vector} point A Vector to calculate the direction to
	 * @return {number} The direction to the object
	 */
	getDirectionTo: function (point) {
		if (!point.implements(Math.Vector)) {throw new Error('Only Vectors or objects inheriting Vector are supported'); }

		return point.copy().subtract(this).getDirection();
	},

	/**
	 * Calculates the shortest distance from the Vector object to another geometric object
	 * 
	 * @param {Math.Vector|Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		if (object.implements(Math.Vector)) {
			return object.copy().subtract(this).getLength();
		}
		if (object.implements(Math.Line)) {
			return object.getDistance(this);
		}
		if (object.implements(Math.Circle)) {
			return object.getDistance(this);
		}
		if (object.implements(Math.Rectangle)) {
			return object.getDistance(this);
		}
		if (object.implements(Math.Polygon)) {
			return object.getDistance(this);
		}
		throw new Error('Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon');
	}
});
