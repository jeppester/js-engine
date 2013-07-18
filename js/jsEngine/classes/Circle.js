new Class('Circle', [Animatable], {
	/**
	 * Constructor for Circle class, uses the set function, to set the properties of the circle.
	 *
     * @name Circle
     * @class A math class which is used for handling circles
	 * @param {number} x The x-coordinate for the center of the circle
	 * @param {number} y The y-coordinate for the center of the circle
	 * @param {number} radius The radius for the circle
	 */
	Circle: function (x, y, radius) {
		this.set(x, y, radius);
	},
    /** @scope Circle */

	/**
	 * Sets the properties of the circle.
	 * 
	 * @param {number} x The x-coordinate for the center of the circle
	 * @param {number} y The y-coordinate for the center of the circle
	 * @param {number} radius The radius for the circle
	 * @return {object} The resulting Circle object (itself)
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
	 * @return {Circle} A copy of the Circle object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Circle(this.x, this.y, this.radius);
	},

	/**
	 * Moves the Circle by adding a value to its x-coordinate and another value to its y-coordinate.
	 * 
	 * @param {number} x The value to add to the x-coordinate (can be negative)
	 * @param {number} y The value to add to the y-coordinate (can be negative)
	 * @return {object} The resulting Circle object (itself)
	 */
	move: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

		this.x += x;
		this.y += y;

		return this;
	},

	/**
	 * Moves the Circle to a fixed position by setting its x- and y-coordinates.
	 * 
	 * @param {number} x The x-coordinate of the position to move the Circle to
	 * @param {number} y The y-coordinate of the position to move the Circle to
	 * @return {Circle} The resulting Circle object (itself)
	 */
	moveTo: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

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
	 * @return {Circle} The resulting Circle object (itself)
	 */
	scale: function (factor) {
		if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); }

		this.radius *= factor;

		return this;
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
	 * @param {Vector|Line|Circle|Rectangle|Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		if (object.implements(Vector)) {
			return Math.max(0, object.getDistance(new Vector(this.x, this.y)) - this.radius);
		}
		else if (object.implements(Line)) {
			return Math.max(0, object.getDistance(new Vector(this.x, this.y)) - this.radius);
		}
		else if (object.implements(Circle)) {
			return Math.max(0, new Vector(this.x, this.y).getDistance(new Vector(object.x, object.y)) - (this.radius + object.radius));
		}
		else if (object.implements(Rectangle)) {
			return object.getDistance(this);
		}
		else if (object.implements(Polygon)) {
			return object.getDistance(this);
		}
		else {
			throw new Error('Agument object should be of type: Vector, Line, Circle, Rectangle or Polygon');
		}
	},

	/**
	 * Checks whether or not the Circle contains another geometric object.
	 * 
	 * @param {Vector|Line|Circle|Rectangle|Polygon} object A geometric object to check
	 * @return {boolean} True if the Rectangle contains the checked object, false if not
	 */
	contains: function (object) {
		var i, cDist;

		if (object.implements(Vector)) {
			return object.copy().move(-this.x, -this.y).getLength() < this.radius;
		}
		else if (object.implements(Line)) {
			return this.contains(object.a) && this.contains(object.b);
		}
		else if (object.implements(Circle)) {
			// Find the distance between the circles' centres
			cDist = new Vector(object.x, object.y).move(-this.x, -this.y).getLength();

			// If the sum of the distance and the checked circle's radius is smaller than this circles radius, this circle must contain the other circle
			return cDist + object.radius < this.radius;
		}
		else if (object.implements(Rectangle)) {
			return this.contains(object.getPolygon());
		}
		else if (object.implements(Polygon)) {
			// Check if any of the polygon's points are outside the circle
			for (i = 0; i < object.points.length; i++) {
				if (!this.contains(object.points[i])) {
					return false;
				}
			}
			// if not, the circle must contain the polygon
			return true;
		}
		else {
			throw new Error('Argument object has to be of type: Vector, Line, Circle, Rectangle or Polygon');
		}
	},

	/**
	 * Checks whether or not the Circle intersects with another geometric object.
	 * 
	 * @param {Line|Circle|Rectangle|Polygon} object A geometric object to check. Supported objects are
	 * @return {boolean} True if the Circle intersects with the checked object, false if not
	 */
	intersects: function (object) {
		if (object.implements(Line)) {
			return this.contains(object) === false && object.getDistance(this) <= 0;
		}
		else if (object.implements(Circle)) {
			return !this.contains(object) && !object.contains(this) && new Vector(this.x, this.y).getDistance(new Vector(object.x, object.y)) <= this.radius + object.radius;
		}
		else if (object.implements(Rectangle)) {
			return object.getPolygon().intersects(this);
		}
		else if (object.implements(Polygon)) {
			return object.intersects(this);
		}
		else {
			throw new Error('Argument object has to be of type: Line, Circle, Rectangle or Polygon');
		}
	},

	/**
	 * Draws the Circle object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Circle
	 * @param {Vector} cameraOffset A vector defining the offset with which to draw the object
	 */
	drawCanvas: function (c, cameraOffset) {
		c.save();

		c.translate(-cameraOffset.x, -cameraOffset.y);
		c.strokeStyle = "#f00";
		c.beginPath();

		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		c.stroke();

		c.restore();
	},
});
