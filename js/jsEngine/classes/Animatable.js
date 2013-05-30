/**
 * Animatable:
 * A class which has functions for tweening of its numeric properties.
 * This class' main purpose is to be inherited by other classes which should be animatable.
 */

NewClass('Animatable');

/**
 * Used for animating numeric properties of the owner of the function.
 * Available easing functions are:
 * "linear"
 * "quadIn"
 * "quadOut"
 * "quadInOut"
 * "powerIn"
 * "powerOut"
 * "powerInOut"
 * "sinusInOut"
 * 
 * @param {object} properties An object containing key-value pairs in the following format:<code>
 * {
 * 	"[property name]": "[end value]"
 * }
 * </code>
 * @param {object} options An object containing key-value pairs for the animation's option:<code>
 * {
 * 	"dur": "[animation duration (in ms)]",
 * 	"callback": "[callback function]",
 * 	"easing": "[easing function to use]"
 * }
 * </code>
 */
Animatable.prototype.animate = function (properties, options) {
	if (properties === undefined) {throw new Error('Missing argument: properties'); }
	if (options === undefined) {throw new Error('Missing argument: options'); }
	var anim, i, c, loop, map, opt;

	anim = {},
	map = properties,
	opt = options ? options : {};

	if (!map) {
		return false;
	}

	anim.obj = this;

	loop = opt.loop !== undefined  ?  opt.loop : (this.loop !== undefined ? this.loop : engine.defaultAnimationLoop);

	anim.callback = opt.callback !== undefined  ?  opt.callback : function () {};
	anim.easing = opt.easing !== undefined ?  opt.easing : "quadInOut";
	anim.dur = opt.dur !== undefined ?  opt.dur : 1000;

	anim.prop = {};
	for (i in map) {
		if (map.hasOwnProperty(i)) {
			anim.prop[i] = {
				begin: this[i],
				end: map[i]
			};
		}
	}

	// Remove properties that are equal to their end value
	c = 0;
	for (i in anim.prop) {
		if (anim.prop[i].begin === anim.prop[i].end) {
			delete anim.prop[i];
		} else {
			c ++;
		}
	}

	// If there are no properties left to animate and the animation does not have a callback function, do nothing
	if (!c && anim.callback === function () {}) {
		// console.log('Animation skipped, nothing to animate');
		return;
	}

	loop.addAnimation(anim);
};

/**
 * Checks if the object is currently being animated.
 * 
 * @return {boolean} Wether or not the object is being animated
 */
Animatable.prototype.isAnimated = function () {
	var roomId, room, name, loop, animId, animation;

	// Look through all room on the room list, to see if one of the rooms' loops contains an animation of the object
	for (roomId = 0; roomId < engine.roomList.length; roomId ++) {
		room = engine.roomList[roomId];

		for (name in room.loops) {
			if (room.loops.hasOwnProperty(name)) {
				loop = room.loops[name];
				for (animId = loop.animations.length - 1; animId > -1; animId --) {
					animation = loop.animations[animId];
					if (animation.obj === this) {
						return true;
					}
				}
			}
		}
	}
	return false;
};

/**
 * Fetches all current animations of the object.
 * 
 * @return {array} An array of all the current animations of the object
 */
Animatable.prototype.getAnimations = function () {
	var animations, roomId, room, name, loop, animId, animation;

	animations = [];
	for (roomId = 0; roomId < engine.roomList.length; roomId ++) {
		room = engine.roomList[roomId];

		for (name in room.loops) {
			if (room.loops.hasOwnProperty(name)) {
				loop = room.loops[name];
				for (animId = loop.animations.length - 1; animId > -1; animId --) {
					animation = loop.animations[animId];
					if (animation.obj === this) {
						animations.push(animation);
					}
				}
			}
		}
	}
	return animations;
};

/**
 * Stops all current animations of the object.
 */
Animatable.prototype.stopAnimations = function () {
	var animations, roomId, room;

	animations = [];
	for (roomId = 0; roomId < engine.roomList.length; roomId ++) {
		room = engine.roomList[roomId];

		for (name in room.loops) {
			if (room.loops.hasOwnProperty(name)) {
				room.loops[name].removeAnimationsOfObject(this);
			}
		}
	}
};