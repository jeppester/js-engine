jseCreateClass('Collidable');

Collidable.prototype.collidable = function (maskSource, x, y, dir, additionalProperties) {
	if (maskSource === undefined) {throw new Error('Missing argument: maskSource'); }

	// Load default options
	this.maskSource = maskSource
	this.x = x !== undefined ? x : 0;
	this.y = y !== undefined ? y : 0;
	this.dir = dir !== undefined ? dir : 0;
	this.maskGenerate = false;

	engine.registerObject(this);

	this.bmSize = 1;
	this.opacity = 1;

	// Load additional properties
	this.importProperties(additionalProperties);

	if (!this.refreshMaskSource()) {
		throw new Error('Mask source was not successfully loaded: ' + maskSource);
	}
	
	this.bmWidth = this.mask.width;
	this.bmHeight = this.mask.height;
	this.xOff = this.xOff !== undefined && this.xOff !== 'center' ? this.xOff : this.bmWidth / 2;
	this.yOff = this.yOff !== undefined && this.xOff !== 'center' ? this.yOff : this.bmHeight / 2;
};

Collidable.prototype.refreshMaskSource = function () {
	var parent, theme;

	theme = this.theme;

	if (theme === undefined) {
		if (this.parent) {
			parent = this.parent;

			while (theme === undefined) {
				if (parent.theme) {
					theme = parent.theme;
				}
				else {
					if (parent.parent) {
						parent = parent.parent;
					}
					else {
						break;
					}
				}
			}
		}
	}

	this.mask = loader.getImage(this.maskSource, theme);
	return this.mask;
};

Collidable.prototype.setMask = function (ressourceString) {
	this.maskSource = ressourceString;
	this.maskGenerate = false;
	this.refreshMaskSource();
};

Collidable.prototype.bBoxCollidesWith = function (objects, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;
	//getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;

	var obj, bBox, rVect, bb1, bb2, i, collideObjects;

	bBox = Math.round(this.dir / Math.PI * 50);
	while (bBox > 99) {
		bBox -= 100;
	}
	bb1 = this.bBox[bBox];
	rVect = this.rotateVector(this.bm.width / 2 - this.xOff, this.bm.height / 2 - this.yOff, this.dir);

	bb1 = {
		x1: this.x + (rVect.x + bb1.xOff) * this.bmSize,
		x2: this.x + (rVect.x + bb1.xOff + bb1.width) * this.bmSize,
		y1: this.y + (rVect.y + bb1.yOff) * this.bmSize,
		y2: this.y + (rVect.y + bb1.yOff + bb1.height) * this.bmSize
	};

	collidingObjects = [];

	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		bBox = Math.round(obj.dir / Math.PI * 50);
		while (bBox > 99) {
			bBox -= 100;
		}
		bb2 = obj.bBox[bBox];
		rVect = this.rotateVector(obj.bm.width / 2 - obj.xOff, obj.bm.height / 2 - obj.yOff, obj.dir);
		
		bb2 = {
			x1: obj.x + (rVect.x + bb2.xOff) * obj.bmSize,
			x2: obj.x + (rVect.x + bb2.xOff + bb2.width) * obj.bmSize,
			y1: obj.y + (rVect.y + bb2.yOff) * obj.bmSize,
			y2: obj.y + (rVect.y + bb2.yOff + bb2.height) * obj.bmSize
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

Collidable.prototype.generateBBox = function (mask) {
	mask = mask !== undefined ? mask : this.mask;

	// New method
	var bBoxes, i, canvas, ctx, bitmap, data, length, pixel, left, top, right, bottom;
	bBoxes = [];

	canvas = document.createElement('canvas');
	canvas.width = Math.ceil(Math.max(mask.width, mask.height) * 1.42);
	canvas.height = canvas.width;
	ctx = canvas.getContext('2d');

	// Generate the bounding box for 100 angles
	for (i = 0; i < 100; i++) {
		// Draw bitmap
		ctx.save();
		ctx.fillStyle = "#FFF";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.rotate(Math.PI * 2 / 100 * i);

		ctx.drawImage(
			mask,
			- mask.width / 2,
			- mask.height / 2,
			mask.width,
			mask.height
		);

		ctx.restore();

		// Find bounding box
		top = canvas.height;
		bottom = 0;
		left = canvas.width;
		right = 0;

		bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
		data = bitmap.data;
		length = data.length / 4;

		pxArr = [];
		for (pixel = 0; pixel < length; pixel++) {
			if (data[pixel * 4] < 255) {
				y = Math.floor(pixel / bitmap.width);
				x = pixel - y * bitmap.width;

				top = Math.min(y, top);
				bottom = Math.max(y, top);
				left = Math.min(x, left);
				right = Math.max(x, right);
			}
		}

		bBoxes[i] = {
			xOff: left - canvas.width / 2,
			yOff: top - canvas.height / 2,
			width: right - left,
			height: bottom - top
		}
	}

	return bBoxes;
};

Collidable.prototype.generateMask = function (ressourceString, alphaLimit) {
	if (ressourceString === undefined) {throw new Error('Missing argument: ressourceString'); }

	this.maskSource = ressourceString;
	this.maskGenerate = true;
	this.maskGenerateAlphaLimit = alphaLimit;
	this.refreshMaskSource();

	alphaLimit = alphaLimit !== undefined ? alphaLimit : 255;

	var canvas, ctx, bitmap, data, length, pixel;

	canvas = document.createElement('canvas');
	canvas.width = this.mask.width;
	canvas.height = this.mask.height;
	ctx = canvas.getContext('2d');
	ctx.drawImage(
		this.mask,
		0,
		0,
		this.mask.width,
		this.mask.height
	);

	bitmap = ctx.getImageData(0, 0, canvas.width, canvas.height);
	data = bitmap.data;
	length = data.length / 4;

	for (pixel = 0; pixel < data.length; pixel ++) {
		// If the pixel is partly transparent, make it completely transparent, else make it completely black
		if (data[pixel * 4 + 3] < alphaLimit) {
			data[pixel * 4] = 0; // Red
			data[pixel * 4 + 1] = 0; // Green
			data[pixel * 4 + 2] = 0; // Blue
			data[pixel * 4 + 3] = 0; // Alpha
		}
		else {
			data[pixel * 4] = 0; // Red
			data[pixel * 4 + 1] = 0; // Green
			data[pixel * 4 + 2] = 0; // Blue
			data[pixel * 4 + 3] = 255; // Alpha
		}
	}
	ctx.putImageData(bitmap, 0, 0);

	return canvas;
};

Collidable.prototype.bitmapCollidesWith = function (objects, resolution, getCollisionPosition, checkbBox) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	resolution = resolution !== undefined ? resolution : 1;
	getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;
	checkbBox = checkbBox !== undefined ? checkbBox : true;

	var canvas, canvasSize, ctx, obj, bitmap, i, data, length, pixel, pxArr, x, y, sumX, sumY, avX, avY, avDist, avDir;

	if (this.bmSize === 0) {
		return false;
	}

	if (checkbBox) {
		objects = this.bBoxCollidesWith(objects, true);
		if (objects === false) {
			return false;
		}
	}

	// Create a new canvas for checking for a collision
	canvas = document.createElement('canvas');
	canvas.width = Math.ceil(this.mask.width * this.bmSize);
	canvas.height = Math.ceil(this.mask.height * this.bmSize);

	ctx = canvas.getContext('2d');
	
	ctx.fillStyle = "#FFF";
	
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 0.5;
	ctx.save();

	// Draw checked object
	ctx.drawImage(
		this.mask,
		0,
		0,
		this.bmWidth * this.bmSize,
		this.bmHeight * this.bmSize
	);
	ctx.translate(this.xOff * this.bmSize, this.yOff * this.bmSize);
	ctx.rotate(-this.dir);

	// Draw other objects
	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		ctx.translate(obj.x - this.x, obj.y - this.y);
		ctx.rotate(obj.dir);

		ctx.drawImage(
			obj.mask,
			- obj.xOff * obj.bmSize,
			- obj.yOff * obj.bmSize,
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
		avX -= this.xOff * this.bmSize;
		avY -= this.yOff * this.bmSize;

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

Collidable.prototype.rotateVector = function (x, y, dir) {
	var dist, initDir;

	dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
	initDir = Math.atan2(y, x);
	initDir += dir;

	return {
		x: Math.cos(initDir) * dist,
		y: Math.sin(initDir) * dist
	};
}

Collidable.prototype.drawBBox = function () {
	// Draw Sprite on canvas
	var c, bBox, rVect;

	if (this.bBox) {
		bBox = Math.round(this.dir / Math.PI * 50);
		while (bBox > 99) {
			bBox -= 100;
		}

		bBox = this.bBox[bBox];
	}
	else {
		return;
	}

	// Rotate bbox center point according to object's xOffset and the object's direction
	rVect = this.rotateVector(this.bm.width / 2 - this.xOff, this.bm.height / 2 - this.yOff, this.dir);

	c = this.ctx;

	c.save();
	c.translate(this.x, this.y);
	c.strokeStyle = "#00F";

	try {
		c.strokeRect((rVect.x + bBox.xOff) * this.bmSize, (rVect.y + bBox.yOff) * this.bmSize, bBox.width * this.bmSize, bBox.height * this.bmSize);
	} catch (e) {
		console.log(bBox);
		engine.stopMainLoop();
		throw new Error(e);
	}
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
		c.drawImage(this.mask, - this.xOff * this.bmSize, - this.yOff * this.bmSize, this.bmWidth * this.bmSize, this.bmHeight * this.bmSize);
	} catch (e) {
		console.log(this.source);
		console.log(this.bm);
		engine.stopMainLoop();
		throw new Error(e);
	}
	c.restore();
};