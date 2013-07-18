new Class('Rectangle', [Animatable, Vector], {
	/**
	 * The constructor for the Rectangle class. Uses the set-function to set the properties of the rectangle.
	 *
     * @name Rectangle
     * @class A math class which is used for handling non-rotated rectangles
	 * @param {number} x The x-coordinate for the rectangle's top left corner
	 * @param {number} y The y-coordinate for the rectangle's top left corner
	 * @param {number} width The width of the rectangle
	 * @param {number} height The height of the rectangle
	 */
	Rectangle: function (x, y, width, height) {
		this.set(x, y, width, height);
	},
    /** @scope Rectangle */

	/**
	 * Sets the properties of the rectangle.
	 * 
	 * @param {number} x The x-coordinate for the rectangle's top left corner
	 * @param {number} y The y-coordinate for the rectangle's top left corner
	 * @param {number} width The width of the rectangle
	 * @param {number} height The height of the rectangle
	 * @return {Rectangle} The resulting Rectangle object (itself)
	 */
	set: function (x, y, width, height) {
		this.x = x !== undefined ? x : 0;
		this.y = y !== undefined ? y : 0;
		this.width = width !== undefined ? width : 0;
		this.height = height !== undefined ? height : 0;

		return this;
	},

	/**
	 * Sets the properties of the rectangle from two vectors: one representing the position of the top left corner, another representing the width and height of the rectangle.
	 * 
	 * @param {Vector} position A Vector representing the position of the top left corner to set for the Rectangle
	 * @param {Vector} size A Vector representing the size (width and height) to set for the Rectangle
	 * @return {Rectangle} The resulting Rectangle object (itself)
	 */
	setFromVectors: function (position, size) {
		position = position !== undefined ? position : new Vector();
		size = size !== undefined ? size : new Vector();

		this.x = position.x;
		this.y = position.y;
		this.width = size.x;
		this.height = size.y;

		return this;
	},

	/**
	 * Copies the Rectangle object
	 * 
	 * @return {Rectangle} A copy of the Rectangle object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Rectangle(this.x, this.y, this.width, this.height);
	},

	/**
	 * Moves the Rectangle by adding a value to its x-coordinate and another value to its y-coordinate.
	 * 
	 * @param {number} x The value to add to the x-coordinate (can be negative)
	 * @param {number} y The value to add to the y-coordinate (can be negative)
	 * @return {Rectangle} The resulting Rectangle object (itself)
	 */
	move: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

		this.x += x;
		this.y += y;

		return this;
	},

	/**
	 * Moves the Rectangle to a fixed position by setting its x- and y-coordinates.
	 * 
	 * @param {number} x The x-coordinate of the position to move the Rectangle to
	 * @param {number} y The y-coordinate of the position to move the Rectangle to
	 * @return {Rectangle} The resulting Rectangle object (itself)
	 */
	moveTo: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); }
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); }

		this.x = x;
		this.y = y;

		return this;
	},

	/**
	 * Scales the Rectangle by multiplying the width and height values.
	 * Please notice that, opposed to the Polygon and Line objects, the position of the Rectangle will not be changed by scaling it, since the position of the top left corner will not be scaled.
	 * 
	 * @param {number} scaleH A factor with which to scale the Rectangle horizontally. If scaleH is undefined, both width and height will be scaled after this factor
	 * @param {number} scaleV A factor with which to scale the Rectangle vertically
	 * @return {Rectangle} The resulting Rectangle object (itself)
	 */
	scale: function (scaleH, scaleV) {
		if (typeof scaleH !== 'number') {throw new Error('Argument scaleH should be of type Number'); }
		scaleV = scaleV !== undefined ? scaleV : scaleH;

		this.width *= scaleH;
		this.height *= scaleV;

		return this;
	},

	/**
	 * Combines the rectangle with another rectangle, returning the bounding rectangle of the for the two rectangles
	 *
	 * @param {Rectangle} rectangle The rectangle to combine with
	 * @return {Rectangle} The bounding rectangle for the two combined rectangles
	 */
	combine: function (rectangle) {
		if (!rectangle.implements(Rectangle)) {throw new Error('Argument rectangle should be of type Rectangle'); }

		var pol = this.getPolygon();
		pol.points = pol.points.concat(rectangle.getPolygon().points);

		return pol.getBoundingRectangle();
	},

	/**
	 * Creates a polygon with the same points as the rectangle.
	 * 
	 * @return {object} The created Polygon object
	 */
	getPolygon: function () {
		return new Polygon(this.getPoints());
	},

	/**
	 * Fetches the Rectangles points.
	 * 
	 * @return {Array.<Vector>} Array of points, in the following order: top left corner, top right corner, bottom right corner, bottom left corner
	 */
	getPoints: function () {
		return [
			new Vector(this.x, this.y),
			new Vector(this.x + this.width, this.y),
			new Vector(this.x + this.width, this.y + this.height),
			new Vector(this.x, this.y + this.height)
		];
	},

	/**
	 * Calculates the area of the Rectangle.
	 * 
	 * @return {number} The area of the Rectangle
	 */
	getArea: function () {
		return this.width * this.height;
	},

	/**
	 * Calculates the diagonal length of the Rectangle
	 * 
	 * @return {number} The diagonal length of the Rectangle
	 */
	getDiagonal: function () {
		return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
	},

	/**
	 * Calculates the shortest distance from the Rectangle object to another geometric object
	 * 
	 * @param {Vector|Line|Circle|Rectangle|Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		return this.getPolygon().getDistance(object);
	},

	/**
	 * Checks whether or not the Rectangle contains another geometric object.
	 * 
	 * @param {Vector|Line|Circle|Rectangle|Polygon} object A geometric object to check
	 * @return {boolean} True if the Rectangle contains the checked object, false if not
	 */
	contains: function (object) {
		return this.getPolygon().contains(object);
	},

	/**
	 * Checks whether or not the Rectangle intersects with another geometric object.
	 * 
	 * @param {Line|Circle|Rectangle|Polygon} object A geometric object to check
	 * @return {boolean} True if the Polygon intersects with the checked object, false if not
	 */
	intersects: function (object) {
		return this.getPolygon().intersects(object);
	},

	/**
	 * Draws the Rectangle object on the canvas (if added as a child of a View)
	 *
	 * @private
	 * @param {CanvasRenderingContext2D} c A canvas 2D context on which to draw the Rectangle
     * @param {Vector} cameraOffset A vector defining the offset with which to draw the object
     */
	drawCanvas: function (c, cameraOffset) {
		c.save();

		c.translate(-cameraOffset.x, -cameraOffset.y);
		c.strokeStyle = "#f00";

		c.beginPath();

		c.moveTo(this.x, this.y);
		c.lineTo(this.x + this.width, this.y);
		c.lineTo(this.x + this.width, this.y + this.height);
		c.lineTo(this.x, this.y + this.height);
		c.lineTo(this.x, this.y);

		c.stroke();
		c.closePath();

		c.restore();
	},
});
