/*
Animator:
The animator handles animations inside objects based on sprites.
An animation is an eased change in a numeric variable inside an object.
The animator features different easing functions.

No requirements
*/

jseCreateClass('Animator');

// Function for adding a new animation
Animator.prototype.addAnimation = function (animation, loop) {
	if (animation === undefined) {throw new Error('Missing argument: animation'); }
	if (loop === undefined) {throw new Error('Missing argument: loop'); }
	var anim, propList, currentAnimations, i, cur, propName;

	loop = engine.loops[loop];

	anim = animation;
	anim.start = loop.time;

	// If there are other animations of the same properties, stop the current animation of these properties
	propList = Object.keys(anim.prop);
	currentAnimations = anim.obj.getAnimations();
	for (i = 0; i < currentAnimations.length; i ++) {
		cur = currentAnimations[i];
		for (propName in cur.prop) {
			if (cur.prop.hasOwnProperty(propName)) {
				if (propList.indexOf(propName) !== -1) {
					delete cur.prop[propName];
				}
			}
		}
	}

	loop.animations.push(anim);
};

Animator.prototype.updateAllLoops = function () {
	var name;

	for (name in engine.loops) {
		if (engine.loops.hasOwnProperty(name)) {
			this.updateLoop(name);
		}
	}
};

Animator.prototype.updateLoop = function (loop) {
	if (loop === undefined) {throw new Error('Missing argument: loop'); }
	var animId, a, propId, t;

	loop = engine.loops[loop];

	// Run through the layer and update all animations
	for (animId = loop.animations.length - 1; animId > -1; animId --) {
		a = loop.animations[animId];

		if (a === undefined) {
			continue;
		}

		t = loop.time - a.start;

		if (t > a.dur) {
			// Delete animation
			loop.animations.splice(animId, 1);

			// If the animation has ended: delete it and set the animated properties to their end values
			for (propId in a.prop) {
				if (a.prop.hasOwnProperty(propId)) {
					a.obj[propId] = a.prop[propId].end;
				}
			}
			if (typeof a.callback === "string") {
				eval(a.callback);
			} else {
				a.callback.call(a.obj);
			}
		} else {
			// If the animation is still running: Ease the animation of each property
			for (propId in a.prop) {
				if (a.prop.hasOwnProperty(propId)) {
					a.obj[propId] = this.ease(a.easing, t, a.prop[propId].begin, a.prop[propId].end - a.prop[propId].begin, a.dur);
				}
			}
		}
	}
};

// ease is used for easing the animation of a property
Animator.prototype.ease = function (type, t, b, c, d) {
	var a;

	switch (type) {
	case "linear":
		t /= d;
		return b + c * t;
	case "quadIn":
		t /= d;
		return b + c * t * t;
	case "quadOut":
		t /= d;
		return b - c * t * (t - 2);
	case "quadInOut":
		t = t / d * 2;
		if (t < 1) {
			return b + c * t * t / 2;
		} else {
			t --;
			return b + c * (1 - t * (t - 2)) / 2;
		}
	case "powerIn":
		t /= d;
		// a determines if c is positive or negative
		a = c / Math.abs(c);
		return b + a * Math.pow(Math.abs(c), t);
	case "powerOut":
		t /= d;
		// a determines if c is positive or negative
		a = c / Math.abs(c);
		return b + c - a * Math.pow(Math.abs(c), 1 - t);
	case "powerInOut":
		t = t / d * 2;
		// a determines if c is positive or negative
		a = c / Math.abs(c);
		if (t < 1) {
			return b + a * Math.pow(Math.abs(c), t) / 2;
		} else {
			t --;
			return b + c - a * Math.pow(Math.abs(c), 1 - t) / 2;
		}
	case "sinusInOut":
		t /= d;
		return b + c * (1 + Math.cos(Math.PI * (1 + t))) / 2;
	}
	return b + c;
};