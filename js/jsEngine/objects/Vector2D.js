/**
 * Vector2D:
 * A math object which is used for handling two-dimensional vectors
 */

jseCreateClass('Vector2D', [Animatable]);

/**
 * Constructor for the Vector2D object. Uses set-function to set the vector from x- and y values.
 * 
 * @param {number} x The x-value to set for the vector
 * @param {number} y The y-value to set for the vector
 */
Vector2D.prototype.vector2D = function (x, y) {
	this.set(x, y);
};

/**
 * Sets the vector from x- and y values.
 * 
 * @param {number} x The x-value to set for the vector
 * @param {number} y The y-value to set for the vector
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.set = function (x, y) {
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;

	return this;
};

/**
 * Calculates and sets the vector from a direction and a length.
 * 
 * @param {number} direction The direction (in radians)
 * @param {number} length The length
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.setFromDirection = function (direction, length) {
	if (typeof direction !== 'number') {throw new Error('Argument direction should be of type: Number'); }
	if (typeof length !== 'number') {throw new Error('Argument length should be of type: Number'); }

	this.x = Math.cos(direction) * length;
	this.y = Math.sin(direction) * length;

	return this;
};

/**
 * Copies the Vector2D object
 * 
 * @return {object} A copy of the Vector2D object (which can be modified without changing the original object)
 */
Vector2D.prototype.copy = function () {
	return new Vector2D(this.x, this.y);
};

/**
 * Moves the vector by adding a value to its x-property and another value to its y-property.
 * 
 * @param {number} x The value to add to the x-property (can be negative)
 * @param {number} y The value to add to the y-property (can be negative)
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.move = function (x, y) {
	if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
	if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

	this.x += x;
	this.y += y;

	return this;
};

/**
 * Rotates the vector around the zero-vector.
 * 
 * @param {number} dir The number of radians to rotate the vector
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.rotate = function (dir) {
	if (typeof dir !== 'number') {throw new Error('Argument dir should be of type: Number'); }

	this.setFromDirection(this.getDirection() + dir, this.getLength());

	return this;
};

/**
 * Scales the vector by multiplying the x- and y values with a factor.
 * 
 * @param {number} factor A factor with which to scale the vector
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); }

	this.x *= factor;
	this.y *= factor;

	return this;
};

/**
 * Adds another vector to the Vector2D.
 * Can by used for the same purpose as move, but takes a vector as argument.
 * 
 * @param {object} vector A vector to add to the Vector2D
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.add = function (vector) {
	if (vector.implements(Vector2D)) {
		this.x += vector.x;
		this.y += vector.y;
	}
	else if (typeof vector === 'number') {
		this.x += vector;
		this.y += vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector2D or Number');
	}

	return this;
};

/**
 * Subtracts another vector from the Vector2D.
 * 
 * @param {object} vector A vector to subtract from the Vector2D
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.subtract = function (vector) {
	if (vector.implements(Vector2D)) {
		this.x -= vector.x;
		this.y -= vector.y;
	}
	else if (typeof vector === 'number') {
		this.x -= vector;
		this.y -= vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector2D or Number');
	}

	return this;
};

/**
 * Divides the Vector2D with another vector.
 * 
 * @param {object} vector A vector to divide the Vector2D with
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.divide = function (vector) {
	if (vector.implements(Vector2D)) {
		this.x /= vector;
		this.y /= vector;
	}
	else if (typeof vector === 'number') {
		this.x /= vector;
		this.y /= vector;
	}
	else {
		throw new Error('Argument vector should be of type Vector2D or Number');
	}

	return this;
};

/**
 * Multiplies the Vector2D with another vector.
 * 
 * @param {object} vector A vector to multiply the Vector2D with
 * @return {object} The resulting Vector2D object (itself)
 */
Vector2D.prototype.multiply = function (vector) {
	if (!vector.implements(Vector2D)) {throw new Error('Argument vector should be of type Vector2D'); }

	this.x *= vector.x;
	this.y *= vector.y;

	return this;
};

/**
 * Calculates the scalar product of the Vector2D and another vector
 * 
 * @param {object} vector The vector to use for the calculation
 * @return {number} The scalar product
 */
Vector2D.prototype.getScalar = function (vector) {
	if (!vector.implements(Vector2D)) {throw new Error('Argument vector should be of type: Vector2D'); }

	return this.x * vector.x + this.y * vector.y;
};

/**
 * Calculates the length of the Vector2D
 * 
 * @return {number} The vector's length
 */
Vector2D.prototype.getLength = function () {
	return Math.sqrt(this.getScalar(this));
};

/**
 * Calculates the direction of the Vector2D
 * 
 * @return {number} The vector's direction (in radians)
 */
Vector2D.prototype.getDirection = function () {
	return Math.atan2(this.y, this.x);
};

/**
 * Calculates the direction to another Vector2D (or object inheriting Vector2D)
 * 
 * @param {object} point A Vector2D to calculate the direction to
 * @return {number} The direction to the object
 */
Vector2D.prototype.getDirectionTo = function (point) {
	if (!point.implements(Vector2D)) {throw new Error('Only Vector2Ds or objects inheriting Vector2D are supported'); }

	return point.copy().subtract(this).getDirection();
};