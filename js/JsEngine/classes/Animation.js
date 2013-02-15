/*
Animation:
An object whose numeric properties can be tween by using the animate-function.
*/

jseCreateClass('Animation');

Animation.prototype.animate = function (properties, options) {
	if (properties === undefined) {throw new Error('Missing argument: properties'); }
	if (options === undefined) {throw new Error('Missing argument: options'); }
	var anim, i, c, loop, map, opt;

	anim = {},
	map = properties,
	opt = options  ?  options : {};

	if (!map) {
		return false;
	}

	anim.obj = this;

	loop = opt.loop !== undefined  ?  opt.loop : engine.defaultAnimationLoop;
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
		console.log('Animation skipped, nothing to animate');
		return;
	}

	animator.addAnimation(anim, loop);
};

Animation.prototype.isAnimated = function () {
	var name, loop, animId, animation;

	for (name in engine.loops) {
		if (engine.loops.hasOwnProperty(name)) {
			loop = engine.loops[name];
			for (animId = loop.animations.length - 1; animId > -1; animId --) {
				animation = loop.animations[animId];
				if (animation.obj === this) {
					return true;
				}
			}
		}
	}
	return false;
};

Animation.prototype.getAnimations = function () {
	var animations, name, loop, animId, animation;

	animations = [];
	for (name in engine.loops) {
		if (engine.loops.hasOwnProperty(name)) {
			loop = engine.loops[name];
			for (animId = loop.animations.length - 1; animId > -1; animId --) {
				animation = loop.animations[animId];
				if (animation.obj === this) {
					animations.push(animation);
				}
			}
		}
	}
	return animations;
};

Animation.prototype.stopAnimations = function () {
	var animations, name, loop, animId, animation;

	animations = [];
	for (name in engine.loops) {
		if (engine.loops.hasOwnProperty(name)) {
			loop = engine.loops[name];
			for (animId = loop.animations.length - 1; animId > -1; animId --) {
				animation = loop.animations[animId];
				if (animation.obj === this) {
					loop.animations.splice(animId, 1);
				}
			}
		}
	}
};