new Class('Lib.Animatable', {
    /**
     * @name Lib.Animatable
     * @class
     */
    /** @scope Animatable */

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
	 *                            {
	 *                            	"[property name]": "[end value]"
	 *                            }
	 *                            </code>
	 * @param {object} options An object containing key-value pairs for the animation's option:<code>
	 *                         {
	 *                         	"duraton": "[animation duration (in ms)]",
	 *                          "callback": "[callback function]",
	 *                          "easing": "[easing function to use]"
	 *                         }
	 *                         </code>
	 */
	animate: function (properties, options) {
		if (properties === undefined) {throw new Error('Missing argument: properties'); } //dev
		if (options === undefined) {throw new Error('Missing argument: options'); } //dev
		var anim, i, c, loop, map, opt;

		anim = {};
		map = properties;
		opt = options ? options : {};

		anim.obj = this;

		loop = opt.loop !== undefined  ?  opt.loop : (this.loop !== undefined ? this.loop : engine.defaultAnimationLoop);

		anim.callback = opt.callback !== undefined  ?  opt.callback : function () {};
		anim.easing = opt.easing !== undefined ?  opt.easing : "quadInOut";
		anim.duration = opt.duration !== undefined ?  opt.duration : 1000;

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
            if (anim.prop.hasOwnProperty(i)) {
                if (anim.prop[i].begin === anim.prop[i].end && !this.propertyIsAnimated(i)) {
                    delete anim.prop[i];
                } else {
                    c ++;
                }
            }
		}

		// If there are no properties left to animate and the animation does not have a callback function, do nothing
		if (!c && anim.callback === function () {}) {
			// console.log('Animation skipped, nothing to animate');
			return;
		}

		loop.addAnimation(anim);
	},
	/** @scope Lib.Animatable */

	/**
	 * Checks if the object is currently being animated.
	 * 
	 * @return {boolean} Whether or not the object is being animated
	 */
	isAnimated: function () {
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
	},

	/**
	 * Checks if a specific property is current being animated
	 * 
	 * @return {boolean} Whether or not the property is being animated
	 */
	propertyIsAnimated: function (property) {
		var roomId, room, name, loop, animId, animation;

		// Look through all room on the room list, to see if one of the rooms' loops contains an animation of the object
		for (roomId = 0; roomId < engine.roomList.length; roomId ++) {
			room = engine.roomList[roomId];

			for (name in room.loops) {
				if (room.loops.hasOwnProperty(name)) {
					loop = room.loops[name];
					for (animId = loop.animations.length - 1; animId > -1; animId --) {
						animation = loop.animations[animId];
						if (animation.obj === this && animation.prop[property] !== undefined) {
							return true;
						}
					}
				}
			}
		}
		return false;
	},

	/**
	 * Fetches all current animations of the object.
	 * 
	 * @return {Object[]} An array of all the current animations of the object
	 */
	getAnimations: function () {
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
	},

	/**
	 * Stops all current animations of the object.
	 */
	stopAnimations: function () {
		var roomId, room, name;

		for (roomId = 0; roomId < engine.roomList.length; roomId ++) {
			room = engine.roomList[roomId];

			for (name in room.loops) {
				if (room.loops.hasOwnProperty(name)) {
					room.loops[name].removeAnimationsOfObject(this);
				}
			}
		}
	},

	schedule: function (func, delay, loopName) {
		var room;

		loopName = loopName || 'eachFrame';
		room = this.getRoom();

		if (!room) { //dev
			throw new Error('Schedule requires that the object is added to a room'); //dev
		} //dev
		
		room.loops[loopName].schedule(this, func, delay);
	},
});


