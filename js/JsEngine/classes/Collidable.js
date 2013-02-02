jseCreateClass('Collidable', [Sprite]);

Collidable.prototype.collidable = function (source, x, y, dir, additionalProperties) {
	this.sprite(source, x, y, dir, additionalProperties);
};

Collidable.prototype.polygonCollidesWith = function (objects, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

	var pol1, pol2, i, collidingObjects, obj;

	pol1 = this.mask.bBox.copy().move(this.mask.width / 2 - this.offset.x, this.mask.height / 2 - this.offset.y).rotate(this.dir).scale(this.bmSize).move(this.x, this.y);

	collidingObjects = [];
	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		pol2 = obj.mask.bBox.copy().move(obj.mask.width / 2 - obj.offset.x, obj.mask.height / 2 - obj.offset.y).rotate(obj.dir).scale(obj.bmSize).move(obj.x, obj.y);

		// Find out if the two objects' bounding boxes intersect
		if (pol1.intersects(pol2)) {
			if (getCollidingObjects) {
				collidingObjects.push(obj);
			}
			else {
				return true;
			}
		}
	}

	if (collidingObjects.length) {
		return collidingObjects;
	}
	else {
		return false;
	}
};

Collidable.prototype.bBoxCollidesWith = function (objects, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

	var obj, rVect, bb1, bb2, i, collidingObjects;

	rVect = new Vector2D(this.bm.width / 2 - this.offset.x, this.bm.height / 2 - this.offset.y).rotate(this.dir);
	bb1 = this.mask.bBox.copy().rotate(this.dir).move(rVect.x + this.x, rVect.y + this.y).scale(this.bmSize);
	bb1 = {
		x1: Math.min(bb1.points[0].x, bb1.points[1].x, bb1.points[2].x, bb1.points[3].x),
		x2: Math.max(bb1.points[0].x, bb1.points[1].x, bb1.points[2].x, bb1.points[3].x),
		y1: Math.min(bb1.points[0].y, bb1.points[1].y, bb1.points[2].y, bb1.points[3].y),
		y2: Math.max(bb1.points[0].y, bb1.points[1].y, bb1.points[2].y, bb1.points[3].y)
	};

	collidingObjects = [];

	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		rVect = new Vector2D(obj.bm.width / 2 - obj.offset.x, obj.bm.height / 2 - obj.offset.y).rotate(obj.dir);
		bb2 = obj.mask.bBox.copy().rotate(obj.dir).move(rVect.x + obj.x, rVect.y + obj.y).scale(obj.bmSize);
		bb2 = {
			x1: Math.min(bb2.points[0].x, bb2.points[1].x, bb2.points[2].x, bb2.points[3].x),
			x2: Math.max(bb2.points[0].x, bb2.points[1].x, bb2.points[2].x, bb2.points[3].x),
			y1: Math.min(bb2.points[0].y, bb2.points[1].y, bb2.points[2].y, bb2.points[3].y),
			y2: Math.max(bb2.points[0].y, bb2.points[1].y, bb2.points[2].y, bb2.points[3].y)
		};

		// Find out if the two objects' bounding boxes intersect
		if (bb1.x1 < bb2.x2 &&
			bb1.x2 > bb2.x1 &&

			bb1.y1 < bb2.y2 &&
			bb1.y2 > bb2.y1) {

			if (getCollidingObjects) {
				collidingObjects.push(obj);
			}
			else {
				return true;
			}
		}
	}

	if (collidingObjects.length) {
		return collidingObjects;
	}
	else {
		return false;
	}
};

Collidable.prototype.collidesWith = function (objects, resolution, getCollisionPosition, checkBBox) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	resolution = resolution !== undefined ? resolution : 2;
	getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;
	checkBBox = checkBBox !== undefined ? checkBBox : true;

	var canvas, mask, ctx, obj, bitmap, i, data, length, pixel, pxArr, x, y, avX, avY, avDist, avDir;

	if (this.bmSize === 0) {
		return false;
	}

	if (checkBBox) {
		if (engine.useRotatedBoundingBoxes) {
			objects = this.polygonCollidesWith(objects, true);
		}
		else {
			objects = this.bBoxCollidesWith(objects, true);
		}

		if (objects === false) {
			return false;
		}
	}

	// Get mask from loader object
	mask = loader.getMask(this.source, this.getTheme());

	// Create a new canvas for checking for a collision
	canvas = document.createElement('canvas');
	canvas.width = Math.ceil(mask.width * this.bmSize);
	canvas.height = Math.ceil(mask.height * this.bmSize);

	ctx = canvas.getContext('2d');
	
	ctx.fillStyle = "#FFF";
	
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 0.5;
	ctx.save();

	// Draw checked object
	ctx.drawImage(
		mask,
		0,
		0,
		this.bmWidth * this.bmSize,
		this.bmHeight * this.bmSize
	);
	ctx.translate(this.offset.x * this.bmSize, this.offset.y * this.bmSize);
	ctx.rotate(-this.dir);

	// Draw other objects
	for (i = 0; i < objects.length; i++) {
		obj = objects[i];
		
		// Get mask from loader object
		mask = loader.getMask(obj.source, obj.getTheme());
		
		ctx.translate(obj.x - this.x, obj.y - this.y);
		ctx.rotate(obj.dir);
		
		ctx.drawImage(
			obj.mask,
			- obj.offset.x * obj.bmSize,
			- obj.offset.y * obj.bmSize,
			obj.bmWidth * obj.bmSize,
			obj.bmHeight * obj.bmSize
		);

		ctx.translate(this.x - obj.x, this.y - obj.y);
		ctx.rotate(-obj.dir);
	}
	ctx.restore();

	bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
	data = bitmap.data;
	length = data.length / 4;

	pxArr = [];

	for (pixel = 0; pixel < length; pixel += resolution) {
		if (data[pixel * 4] < 127) {
			if (getCollisionPosition) {
				y = Math.floor(pixel / bitmap.width);
				x = pixel - y * bitmap.width;

				pxArr.push({
					x: x,
					y: y
				});
				// document.body.appendChild(canvas);
			}
			else {
				return true;
				// document.body.appendChild(canvas);
			}
		}
	}
	
	if (pxArr.length > 0) {
		// Find the collision pixel's mean value
		pxArr = pxArr.sortByNumericProperty('x');
		avX = (pxArr[0].x + pxArr[pxArr.length - 1].x) / 2;
		
		pxArr = pxArr.sortByNumericProperty('y');
		avY = (pxArr[0].y + pxArr[pxArr.length - 1].y) / 2;
		
		// Translate the position according to the object's sprite offset
		avX -= this.offset.x * this.bmSize;
		avY -= this.offset.y * this.bmSize;

		// Rotate the position according to the object's direction
		avDir = Math.atan2(avY, avX);
		avDist = Math.sqrt(Math.pow(avX, 2) + Math.pow(avY, 2));
		
		avDir += this.dir;
		avX = Math.cos(avDir) * avDist;
		avY = Math.sin(avDir) * avDist;

		return {x: avX, y: avY, dir: avDir};
	}

	return false;
};

Collidable.prototype.drawBBox = function () {
	var c, pol, rVect, x1, y1, x2, y2;


	rVect = new Vector2D(this.bm.width / 2 - this.offset.x, this.bm.height / 2 - this.offset.y).rotate(this.dir);
	pol = this.mask.bBox.copy().rotate(this.dir).move(rVect.x, rVect.y).scale(this.bmSize);

	x1 = Math.min(pol.points[0].x, pol.points[1].x, pol.points[2].x, pol.points[3].x);
	x2 = Math.max(pol.points[0].x, pol.points[1].x, pol.points[2].x, pol.points[3].x);
	y1 = Math.min(pol.points[0].y, pol.points[1].y, pol.points[2].y, pol.points[3].y);
	y2 = Math.max(pol.points[0].y, pol.points[1].y, pol.points[2].y, pol.points[3].y);

	c = this.ctx;
	c.save();
	c.strokeStyle = "#00F";
	c.translate(this.x, this.y);

	c.strokeRect(x1, y1, x2 - x1, y2 - y1);

	c.restore();
};

Collidable.prototype.drawRotatedBBox = function () {
	var pol, c;

	pol = this.mask.bBox.copy().move(this.mask.width / 2 - this.offset.x, this.mask.height / 2 - this.offset.y).rotate(this.dir).scale(this.bmSize);

	c = this.ctx;
	c.save();
	c.strokeStyle = "#0F0";
	c.translate(this.x, this.y);

	c.beginPath();
	c.moveTo(pol.points[0].x, pol.points[0].y);
	c.lineTo(pol.points[1].x, pol.points[1].y);
	c.lineTo(pol.points[2].x, pol.points[2].y);
	c.lineTo(pol.points[3].x, pol.points[3].y);
	c.closePath();
	c.stroke();

	c.restore();
};

Collidable.prototype.drawMask = function () {
	// Draw Sprite on canvas
	var c, mask;

	if (this.mask) {
		mask = this.mask;
	}
	else {
		return;
	}
	c = this.ctx;
	c.save();
	c.translate(this.x, this.y);
	c.rotate(this.dir);
	try {
		c.drawImage(this.mask, - this.offset.x * this.bmSize, - this.offset.y * this.bmSize, this.bmWidth * this.bmSize, this.bmHeight * this.bmSize);
	} catch (e) {
		console.log(this.source);
		console.log(this.bm);
		engine.stopMainLoop();
		throw new Error(e);
	}
	c.restore();
};