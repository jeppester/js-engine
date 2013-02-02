jseCreateClass('Rectangle', [Animation]);

Rectangle.prototype.rectangle = function (x, y, width, height) {
	this.set(x, y, width, height);
};

Rectangle.prototype.set = function (x, y, width, height) {
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;
	this.width = width !== undefined ? width : 0;
	this.height = height !== undefined ? height : 0;
}

Rectangle.prototype.setFromVectors = function (position, size) {
	position = position !== undefined ? position : new Vector2D();
	size = size !== undefined ? size : new Vector2D();

	this.x = position.x;
	this.y = position.y;
	this.width = size.x;
	this.height = size.y;

	return this;
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

Rectangle.prototype.scale = function (factor) {
	if (typeof factor !== 'number') {throw new Error('Argument factor should be of type Number'); }

	this.width *= factor;
	this.height *= factor;

	return this;
}

Rectangle.prototype.getPolygon = function () {
	return new Polygon(this.getPoints());
};

Rectangle.prototype.getPoints = function () {
	return [
		new Vector2D(this.x, this.y),
		new Vector2D(this.x + this.width, this.y),
		new Vector2D(this.x + this.width, this.y + this.height),
		new Vector2D(this.x, this.y + this.height)
	];
};

Rectangle.prototype.getArea = function () {
	return this.width * this.height;
};

Rectangle.prototype.getDiagonal = function () {
	return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
};