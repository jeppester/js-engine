/**
 * Collidable:
 * A class with functions for collisionschecking.
 * Can check both for precise (bitmap-based) collisions and bounding box collisions
 */

NewClass('Collidable', [Sprite]);

/**
 * The constructor for the Collidable class
 * 
 * @param {string} source A ressource string for the sprite of the created object.
 * @param {number} x The x-position of the created object.
 * @param {number} y The y-position of the created object.
 * @param {number} dir The direction of the created object. Defaults to 0
 * @param {object} additionalProperties An object containing key-value pairs that will be set as properties for the created object. Can be used for setting advanced options such as sprite offset and opacity.
 */
Collidable.prototype.Collidable = function (source, x, y, dir, additionalProperties) {
	this.Sprite(source, x, y, dir, additionalProperties);
};

/**
 * Checks for a collision with other objects' rotated BBoxes. The word polygon is used because the check is actually done by using the Polygon object.
 * 
 * @param {mixed} objects Target object, or array of target objects
 * @param {boolean} getCollidingObjects Whether or not to return an array of colliding objects (is slower because the check cannot stop when a single collission has been detected)
 * @return {mixed} If getCollidingObjects is set to true, an array of colliding object, else a boolean representing whether or not a collission was detected.
 */
Collidable.prototype.polygonCollidesWith = function (objects, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

	var pol1, pol2, i, collidingObjects, obj;

	pol1 = this.mask.bBox.copy().move(this.mask.width / 2 - this.offset.x, this.mask.height / 2 - this.offset.y).rotate(this.dir).scale(this.size).move(this.x, this.y);

	collidingObjects = [];
	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		pol2 = obj.mask.bBox.copy().move(obj.mask.width / 2 - obj.offset.x, obj.mask.height / 2 - obj.offset.y).rotate(obj.dir).scale(obj.size).move(obj.x, obj.y);

		// Find out if the two objects' bounding boxes intersect
		// If not, check if one of the points of each object is inside the other's polygon. This will ensure that one of the objects does not contain the other
		if (pol1.intersects(pol2) || pol1.contains(pol2.points[0]) || pol2.contains(pol1.points[0])) {
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

/**
 * Checks for a collision with other objects' non-rotated bounding boxes.
 * 
 * @param {mixed} objects Target object, or array of target objects
 * @param {boolean} getCollidingObjects Whether or not to return an array of colliding objects (is slower because the check cannot stop when a single collission has been detected)
 * @return {mixed} If getCollidingObjects is set to true, an array of colliding object, else a boolean representing whether or not a collission was detected.
 */
Collidable.prototype.bBoxCollidesWith = function (objects, getCollidingObjects) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	getCollidingObjects = getCollidingObjects !== undefined ? getCollidingObjects : false;

	var obj, rVect, bb1, bb2, i, collidingObjects;

	rVect = new Vector(this.bm.width / 2 - this.offset.x, this.bm.height / 2 - this.offset.y).rotate(this.dir);
	bb1 = this.mask.bBox.copy().rotate(this.dir).move(rVect.x + this.x, rVect.y + this.y).scale(this.size);
	bb1 = {
		x1: Math.min(bb1.points[0].x, bb1.points[1].x, bb1.points[2].x, bb1.points[3].x),
		x2: Math.max(bb1.points[0].x, bb1.points[1].x, bb1.points[2].x, bb1.points[3].x),
		y1: Math.min(bb1.points[0].y, bb1.points[1].y, bb1.points[2].y, bb1.points[3].y),
		y2: Math.max(bb1.points[0].y, bb1.points[1].y, bb1.points[2].y, bb1.points[3].y)
	};

	collidingObjects = [];

	for (i = 0; i < objects.length; i++) {
		obj = objects[i];

		rVect = new Vector(obj.bm.width / 2 - obj.offset.x, obj.bm.height / 2 - obj.offset.y).rotate(obj.dir);
		bb2 = obj.mask.bBox.copy().rotate(obj.dir).move(rVect.x + obj.x, rVect.y + obj.y).scale(obj.size);
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

/**
 * Checks for a mask based collisions with other Collidable objects.
 * @param {mixed} objects Target object, or array of target objects
 * @param {number} resolution The resolution of the collision check. 1: check every pixel, 2: check every second pixel, etc. Defaults to 2.
 * @param {boolean} getCollisionPosition If true, the function returns an object representing the position of the detected collision. Defaults to false.
 * @param {boolean} checkBBox If true: Run a bbox collision check before the mask based collision check. Makes the check much faster under most circumstances. Defaults to true. 
 * @return {mixed} If getCollisionPosition is false: a boolean representing whether or not a collision was detected. If getCollisionPosition is true: An object representing the position of the detected collision.
 */
Collidable.prototype.collidesWith = function (objects, resolution, getCollisionPosition, checkBBox) {
	if (objects === undefined) {throw new Error('Missing argument: objects'); }
	if (!Array.prototype.isPrototypeOf(objects)) {
		objects = [objects];
	}

	resolution = resolution !== undefined ? resolution : 2;
	getCollisionPosition = getCollisionPosition !== undefined ? getCollisionPosition : false;
	checkBBox = checkBBox !== undefined ? checkBBox : true;

	var canvas, mask, ctx, obj, bitmap, i, data, length, pixel, pxArr, x, y, avX, avY, avDist, avDir;

	if (this.size === 0) {
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
	canvas.width = Math.ceil(mask.width * this.size);
	canvas.height = Math.ceil(mask.height * this.size);

	ctx = canvas.getContext('2d');

	ctx.fillStyle = "#FFF";

	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 0.5;
	ctx.save();

	// Draw checked object
	ctx.drawImage(
		mask,

		// Define image cutout
		(this.width + this.bm.spacing) * this.currentImage,
		0,
		this.width,
		this.height,

		// Define position and width on canvas
		0,
		0,
		this.width * this.size,
		this.height * this.size
	);
	ctx.translate(this.offset.x * this.size, this.offset.y * this.size);
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

			// Define image cutout
			(obj.width + obj.bm.spacing) * obj.currentImage,
			0,
			obj.width,
			obj.height,

			// Define position and width on canvas
			- obj.offset.x * obj.size,
			- obj.offset.y * obj.size,
			obj.width * obj.size,
			obj.height * obj.size
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
		avX -= this.offset.x * this.size;
		avY -= this.offset.y * this.size;

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

/**
 * Draws the object's BBox to the arena. Does only work (and is only relevant) if engine option "useRotatedBoundingBoxes" is set to false. Use engine option "drawBBoxes" to draw all BBoxes.
 * 
 * @private
 */
Collidable.prototype.drawBBox = function () {
	var c, pol, rVect, x1, y1, x2, y2;


	rVect = new Vector(this.bm.width / 2 - this.offset.x, this.bm.height / 2 - this.offset.y).rotate(this.dir);
	pol = this.mask.bBox.copy().rotate(this.dir).move(rVect.x, rVect.y).scale(this.size);

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

/**
 * Draws the object's rotated BBox to the arena. Does only work (and is only relevant) if engine option "useRotatedBoundingBoxes" is not set to false. Use engine option "drawBBoxes" to draw all BBoxes.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the bbox
 */
Collidable.prototype.drawRotatedBBox = function (c) {
	var pol;

	pol = this.mask.bBox.copy().move(this.mask.width / 2 - this.offset.x, this.mask.height / 2 - this.offset.y).rotate(this.dir).scale(this.size);

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

/**
 * Draws the object's collision mask to the arena. Use engine option "drawMasks" to draw all masks.
 * 
 * @private
 * @param {object} c A canvas 2D context on which to draw the mask
 */
Collidable.prototype.drawMask = function (c) {
	// Draw Sprite on canvas
	var mask;

	if (this.mask) {
		mask = this.mask;
	}
	else {
		return;
	}

	c.save();
	c.translate(this.x, this.y);
	c.rotate(this.dir);
	try {
		c.drawImage(
			this.mask,

			(this.width + this.bm.spacing) * this.currentImage,
			0,
			this.width,
			this.height,

			- this.offset.x * this.size,
			- this.offset.y * this.size,
			this.width * this.size,
			this.height * this.size);
	} catch (e) {
		console.log(this.source);
		console.log(this.bm);
		engine.stopMainLoop();
		throw new Error(e);
	}
	c.restore();
};