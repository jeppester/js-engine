jseCreateClass('Line');

Line.prototype.line = function (startVector, endVector) {
	if (!Vector2D.prototype.isPrototypeOf(startVector)) {throw new Error('Agument startVector should be of type: Vector2D'); }
	if (!Vector2D.prototype.isPrototypeOf(endVector)) {throw new Error('Agument endVector should be of type: Vector2D'); }

	this.a = startVector;
	this.b = endVector;
};

Line.prototype.rotate = function (dir) {
	this.a.rotate(dir);
	this.b.rotate(dir);

	return this;
}

Line.prototype.copy = function () {
	return new Line(this.a, this.b);
}

Line.prototype.intersects = function (line) {
	if (!Line.prototype.isPrototypeOf(line)) {throw new Error('Agument line should be of type: Line'); }

	var c1, c2;

	c1 = (this.b.x - this.a.x) * (line.a.y - this.b.y) - (line.a.x - this.b.x) * (this.b.y - this.a.y);
	c2 = (this.b.x - this.a.x) * (line.b.y - this.b.y) - (line.b.x - this.b.x) * (this.b.y - this.a.y);

	if (c1 * c2 > 0) {return false; }

	c1 = (line.b.x - line.a.x) * (this.a.y - line.b.y) - (this.a.x - line.b.x) * (line.b.y - line.a.y);
	c2 = (line.b.x - line.a.x) * (this.b.y - line.b.y) - (this.b.x - line.b.x) * (line.b.y - line.a.y);

	return c1 * c2 < 0;
}