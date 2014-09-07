nameSpace('Math');

Math.Circle = createClass('Circle', [Mixin.Animatable], /** @lends Math.Circle.prototype */ {
	/**
	 * Constructor for Circle class, uses the set function, to set the properties of the circle.
	 *
     * @name Math.Circle
     * @class A math class which is used for handling circles
     * @augments Mixin.Animatable
     *
     * @property {number} x The circle's horizontal position
     * @property {number} y The circle's vertical position
     * @property {number} radius The circle's radius
     *
	 * @param {number} x The x-coordinate for the center of the circle
	 * @param {number} y The y-coordinate for the center of the circle
	 * @param {number} radius The radius for the circle
	 */
	Circle: function (x, y, radius) {
		this.set(x, y, radius);
	},

	/**
	 * Sets the properties of the circle.
	 *
	 * @param {number} x The x-coordinate for the center of the circle
	 * @param {number} y The y-coordinate for the center of the circle
	 * @param {number} radius The radius for the circle
	 * @return {Math.Circle} The resulting Circle object (itself)
	 */
	set: function (x, y, radius) {
		x = x !== undefined ? x : 0;
		y = y !== undefined ? y : 0;
		radius = radius !== undefined ? radius : 0;

		this.x = x;
		this.y = y;
		this.radius = radius;

		return this;
	},

	/**
	 * Copies the Circle object.
	 *
	 * @return {Math.Circle} A copy of the Circle object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Math.Circle(this.x, this.y, this.radius);
	},

	/**
	 * Moves the Circle by adding a value to its x-coordinate and another value to its y-coordinate.
	 *
	 * @param {number} x The value to add to the x-coordinate (can be negative)
	 * @param {number} y The value to add to the y-coordinate (can be negative)
	 * @return {Math.Circle} The resulting Circle object (itself)
	 */
	move: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); } //dev
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); } //dev

		this.x += x;
		this.y += y;

		return this;
	},

	/**
	 * Moves the Circle to a fixed position by setting its x- and y-coordinates.
	 *
	 * @param {number} x The x-coordinate of the position to move the Circle to
	 * @param {number} y The y-coordinate of the position to move the Circle to
	 * @return {Math.Circle} The resulting Circle object (itself)
	 */
	moveTo: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); } //dev
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); } //dev

		this.x = x;
		this.y = y;

		return this;
	},

	/**
	 * Scales the Circle object by multiplying it radius with a factor.
	 * Please notice that, opposite to the Polygon and Line objects, the position of the Circle will not be changed by scaling it, since the center of the circle will not be scaled.
	 * Also: since ellipses are not supported yet, circles cannot be scaled with various factors horizontally and vertically, like the other geometric objects.
	 *
	 * @param {number} factor A factor with which to scale the Circle
	 * @return {Math.Circle} The resulting Circle object (itself)
	 */
	scale: function (factor) {
		if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); } //dev

		this.radius *= factor;

		return this;
	},

	/**
	 * Calculates the perimeter of the circle
	 *
	 * @return {number} The perimeter of the Circle
	 */
	getPerimeter: function () {
		return this.radius * 2 * Math.PI;
	},

	/**
	 * Calculates the area of the Circle.
	 *
	 * @return {number} The area of the Circle
	 */
	getArea: function () {
		return Math.pow(this.radius) * Math.PI;
	},

	/**
	 * Calculates the shortest distance from the Circle object to another geometric object
	 *
	 * @param {Math.Vector|Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		if (object.implements(Math.Vector)) {
			return Math.max(0, object.getDistance(new Math.Vector(this.x, this.y)) - this.radius);
		}
		else if (object.implements(Math.Line)) {
			return Math.max(0, object.getDistance(new Math.Vector(this.x, this.y)) - this.radius);
		}
		else if (object.implements(Math.Circle)) {
			return Math.max(0, new Math.Vector(this.x, this.y).getDistance(new Math.Vector(object.x, object.y)) - (this.radius + object.radius));
		}
		else if (object.implements(Math.Rectangle)) {
			return object.getDistance(this);
		}
		else if (object.implements(Math.Polygon)) {
			return object.getDistance(this);
		}
		else { //dev
			throw new Error('Argument object should be of type: Vector, Line, Circle, Rectangle or Polygon'); //dev
		} //dev
	},

	/**
	 * Checks whether or not the Circle contains another geometric object.
	 *
	 * @param {Math.Vector|Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object A geometric object to check
	 * @return {boolean} True if the Rectangle contains the checked object, false if not
	 */
	contains: function (object) {
		var i, cDist;

		if (object.implements(Math.Vector)) {
			return object.copy().move(-this.x, -this.y).getLength() < this.radius;
		}
		else if (object.implements(Math.Line)) {
			return this.contains(object.a) && this.contains(object.b);
		}
		else if (object.implements(Math.Circle)) {
			// Find the distance between the circles' centres
			cDist = new Math.Vector(object.x, object.y).move(-this.x, -this.y).getLength();

			// If the sum of the distance and the checked circle's radius is smaller than this circles radius, this circle must contain the other circle
			return cDist + object.radius < this.radius;
		}
		else if (object.implements(Math.Rectangle)) {
			return this.contains(object.getPolygon());
		}
		else if (object.implements(Math.Polygon)) {
			// Check if any of the polygon's points are outside the circle
			for (i = 0; i < object.points.length; i++) {
				if (!this.contains(object.points[i])) {
					return false;
				}
			}
			// if not, the circle must contain the polygon
			return true;
		}
		else { //dev
			throw new Error('Argument object has to be of type: Vector, Line, Circle, Rectangle or Polygon'); //dev
		} //dev
	},

	/**
	 * Checks whether or not the Circle intersects with another geometric object.
	 *
	 * @param {Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object A geometric object to check. Supported objects are
	 * @return {boolean} True if the Circle intersects with the checked object, false if not
	 */
	intersects: function (object) {
		if (object.implements(Math.Line)) {
			return this.contains(object) === false && object.getDistance(this) <= 0;
		}
		else if (object.implements(Math.Circle)) {
			return !this.contains(object) && !object.contains(this) && new Math.Vector(this.x, this.y).getDistance(new Math.Vector(object.x, object.y)) <= this.radius + object.radius;
		}
		else if (object.implements(Math.Rectangle)) {
			return object.getPolygon().intersects(this);
		}
		else if (object.implements(Math.Polygon)) {
			return object.intersects(this);
		}
		else { //dev
			throw new Error('Argument object has to be of type: Line, Circle, Rectangle or Polygon'); //dev
		} //dev
	}
});
