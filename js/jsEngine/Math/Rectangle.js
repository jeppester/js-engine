nameSpace('Math');

Math.Rectangle = createClass('Rectangle', [Math.Vector], /** @lends Math.Rectangle.prototype */ {
	/**
	 * The constructor for the Rectangle class. Uses the set-function to set the properties of the rectangle.
	 *
     * @name Math.Rectangle
     * @class A math class which is used for handling non-rotated rectangles
     * @augments Math.Vector
     *
     * @property {number} x The top left corner's x-coordinate
     * @property {number} y The top left corner's y-coordinate
     * @property {number} width The width of the rectangle
     * @property {number} height The height of the rectangle
     *
	 * @param {number} x The x-coordinate for the rectangle's top left corner
	 * @param {number} y The y-coordinate for the rectangle's top left corner
	 * @param {number} width The width of the rectangle
	 * @param {number} height The height of the rectangle
	 */
	Rectangle: function (x, y, width, height, fillStyle, strokeStyle, lineWidth) {
		this.set(x, y, width, height);
	},

	/**
	 * Sets the properties of the rectangle.
	 *
	 * @param {number} x The x-coordinate for the rectangle's top left corner
	 * @param {number} y The y-coordinate for the rectangle's top left corner
	 * @param {number} width The width of the rectangle
	 * @param {number} height The height of the rectangle
	 * @return {Math.Rectangle} The resulting Rectangle object (itself)
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
	 * @param {Math.Vector} position A Vector representing the position of the top left corner to set for the Rectangle
	 * @param {Math.Vector} size A Vector representing the size (width and height) to set for the Rectangle
	 * @return {Math.Rectangle} The resulting Rectangle object (itself)
     *
	 */
	setFromVectors: function (position, size) {
		position = position !== undefined ? position : new Math.Vector();
		size = size !== undefined ? size : new Math.Vector();

		this.x = position.x;
		this.y = position.y;
		this.width = size.x;
		this.height = size.y;

		return this;
	},

	/**
	 * Copies the Rectangle object
	 *
	 * @return {Math.Rectangle} A copy of the Rectangle object (which can be modified without changing the original object)
	 */
	copy: function () {
		return new Math.Rectangle(this.x, this.y, this.width, this.height);
	},

	/**
	 * Moves the Rectangle by adding a value to its x-coordinate and another value to its y-coordinate.
	 *
	 * @param {number} x The value to add to the x-coordinate (can be negative)
	 * @param {number} y The value to add to the y-coordinate (can be negative)
	 * @return {Math.Rectangle} The resulting Rectangle object (itself)
	 */
	move: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); } //dev
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); } //dev

		this.x += x;
		this.y += y;

		return this;
	},

	/**
	 * Moves the Rectangle to a fixed position by setting its x- and y-coordinates.
	 *
	 * @param {number} x The x-coordinate of the position to move the Rectangle to
	 * @param {number} y The y-coordinate of the position to move the Rectangle to
	 * @return {Math.Rectangle} The resulting Rectangle object (itself)
	 */
	moveTo: function (x, y) {
		if (typeof x !== 'number') {throw new Error('Argument x should be of type: Number'); } //dev
		if (typeof y !== 'number') {throw new Error('Argument y should be of type: Number'); } //dev

		this.x = x;
		this.y = y;

		return this;
	},

	/**
	 * Calculates the overlapping area of the rectangle and another rectangle
	 * @param  {Math.Rectangle} rectangle The rectangle to use for the operation
	 * @return {Math.Rectangle|boolean} The overlapping rectangle, or false if there is no overlap
	 */
	getOverlap: function (rectangle) {
		var x2, y2, rx2, ry2, crop;

		x2 = this.x + this.width;
		y2 = this.y + this.height;
		rx2 = rectangle.x + rectangle.width;
		ry2 = rectangle.y + rectangle.height;

		crop = new Math.Rectangle();

		crop.x = rectangle.x > this.x ? rectangle.x : this.x;
		crop.y = rectangle.y > this.y ? rectangle.y : this.y;
		x2 = rx2 > x2 ? x2 : rx2;
		y2 = ry2 > y2 ? y2 : ry2;

		crop.width = x2 - crop.x;
		crop.height = y2 - crop.y;

		return crop.width <= 0 || crop.height <= 0 ? false: crop;
	},

	/**
	 * Scales the Rectangle by multiplying the width and height values.
	 * Please notice that, opposed to the Polygon and Line objects, the position of the Rectangle will not be changed by scaling it, since the position of the top left corner will not be scaled.
	 *
	 * @param {number} scaleH A factor with which to scale the Rectangle horizontally. If scaleH is undefined, both width and height will be scaled after this factor
	 * @param {number} scaleV A factor with which to scale the Rectangle vertically
	 * @return {Math.Rectangle} The resulting Rectangle object (itself)
	 */
	scale: function (scaleH, scaleV) {
		if (typeof scaleH !== 'number') {throw new Error('Argument scaleH should be of type Number'); } //dev
		scaleV = scaleV !== undefined ? scaleV : scaleH;

		this.width *= scaleH;
		this.height *= scaleV;

		return this;
	},

	/**
	 * Calculates the bounding rectangle of the of the two rectangles
	 *
	 * @param {Math.Rectangle} rectangle The rectangle to use for the calculation
	 * @return {Math.Rectangle} The bounding rectangle for the two rectangles
	 */
	getBoundingRectangle: function (rectangle) {
		var x2, y2, rx2, ry2, crop;

		x2 = this.x + this.width;
		y2 = this.y + this.height;
		rx2 = rectangle.x + rectangle.width;
		ry2 = rectangle.y + rectangle.height;

		crop = new Math.Rectangle();

		crop.x = rectangle.x < this.x ? rectangle.x : this.x;
		crop.y = rectangle.y < this.y ? rectangle.y : this.y;
		x2 = rx2 < x2 ? x2 : rx2;
		y2 = ry2 < y2 ? y2 : ry2;

		crop.width = x2 - crop.x;
		crop.height = y2 - crop.y;

		return crop;
	},

	/**
	 * Creates a polygon with the same points as the rectangle.
	 *
	 * @return {Object} The created Polygon object
	 */
	getPolygon: function () {
		return new Math.Polygon(this.getPoints());
	},

	/**
	 * Fetches the Rectangles points.
	 *
	 * @return {Math.Vector[]} Array of points, in the following order: top left corner, top right corner, bottom right corner, bottom left corner
	 */
	getPoints: function () {
		return [
			new Math.Vector(this.x, this.y),
			new Math.Vector(this.x + this.width, this.y),
			new Math.Vector(this.x + this.width, this.y + this.height),
			new Math.Vector(this.x, this.y + this.height)
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
	 * @param {Math.Vector|Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object The object to calculate the distance to
	 * @return {number} The distance
	 */
	getDistance: function (object) {
		return this.getPolygon().getDistance(object);
	},

	/**
	 * Checks whether or not the Rectangle contains another geometric object.
	 *
	 * @param {Math.Vector|Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object A geometric object to check
	 * @return {boolean} True if the Rectangle contains the checked object, false if not
	 */
	contains: function (object) {
        // If checked object is a vector, line or rectangle, do fast calculation otherwise convert to polygon and do calculation
        if (object.implements(Math.Rectangle)) {
            return this.contains(new Math.Vector(object.x, object.y)) && this.contains(new Math.Vector(object.x + object.width, object.y + object.height));
        }
        if (object.implements(Math.Line)) {
            return this.contains(object.a) && this.contains(object.b);
        }
        if (object.implements(Math.Vector)) {
            return (
                object.x > this.x &&
                object.x < this.x + this.width &&
                object.y > this.y &&
                object.y < this.y + this.height
            );
        }

        return this.getPolygon().contains(object);
	},

	/**
	 * Checks whether or not the Rectangle intersects with another geometric object.
	 *
	 * @param {Math.Line|Math.Circle|Math.Rectangle|Math.Polygon} object A geometric object to check
	 * @return {boolean} True if the Polygon intersects with the checked object, false if not
	 */
	intersects: function (object) {
		return this.getPolygon().intersects(object);
	}
});
