jseCreateClass('Rectangle');

Rectangle.prototype.rectangle = function (x, y, width, height) {
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;
	this.width = width !== undefined ? width : 0;
	this.height = height !== undefined ? height : 0;
};

Rectangle.prototype.getArea = function () {
	return this.width * this.height;
};

Rectangle.prototype.getDiagonal = function () {
	return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
};

Rectangle.prototype.createFromVectors = function (position, size) {
	position = position !== undefined ? position : new Vector2D();
	size = size !== undefined ? size : new Vector2D();

	return new Rectangle(position.x, position.y, size.x, size.y);
};

Rectangle.prototype.copy = function () {
	return new Rectangle(this.x, this.y, this.width, this.height);
};

Rectangle.prototype.move = function (moveX, moveY) {
	this.x += moveX;
	this.y += moveY;

	return this;
};

Rectangle.prototype.moveTo = function (x, y) {
	this.x = x;
	this.y = y;

	return this;
};

Rectangle.prototype.getPolygon = function () {
	return new Polygon(this.getPoints());
}

Rectangle.prototype.getPoints = function () {
	return [
		new Vector2D(this.x, this.y),
		new Vector2D(this.x + this.width, this.y),
		new Vector2D(this.x + this.width, this.y + this.height),
		new Vector2D(this.x, this.y + this.height)
	];
};