/*
Director:
The director handles scene's with animation of sprites.
A scene is an object (JSON) consisting of a list of actors (sprites) and a timeline with their movements.
The director class is very useful for creating flash like animations.
*/

jseCreateClass('Director', [View]);

Director.prototype.director = function () {
	this.actors = {};
	this.frame = 0;
};

Director.prototype.loadScene = function (scene) {
	if (scene === undefined) {throw new Error('Missing argument: scene'); }

	this.scene = scene;
	this.removeActors();
	this.createActors();
};

Director.prototype.removeActors = function () {
	var name;
	for (name in this.actors) {
		if (this.actors.hasOwnProperty(name)) {
			this.actors[name].remove();
		}
	}
};

Director.prototype.createActors = function () {
	var name, actor;

	for (name in this.scene.actors) {
		if (this.scene.actors.hasOwnProperty(name)) {
			actor = this.scene.actors[name];
			this.actors[name] = new Sprite(actor.source, 0, 0, 0, {opacity: 0, drawOrder: actor.drawOrder});
			this.addChild(this.actors[name]);
			this.children = this.children.sortByNumericProperty('drawOrder');
		}
	}
};

Director.prototype.startScene = function () {
	this.frame = 0;

	this.updateScene();
	this.pauseScene();
	this.playScene();
};

Director.prototype.pauseScene = function () {
	engine.detachFunctionFromLoop(this, this.onRunning, 'eachFrame');
};

Director.prototype.playScene = function () {
	// Try to detach the onRunning function in case the scene is already running
	engine.detachFunctionFromLoop(this, this.onRunning, 'eachFrame');

	engine.attachFunctionToLoop(this, this.onRunning, 'eachFrame');
};

Director.prototype.goToFrame = function (frameNumber) {
	if (frameNumber === undefined) {throw new Error('Missing argument: frameNumber'); }
	this.frame = frameNumber;
	this.updateScene();
};

Director.prototype.getKeyFrameProperties = function (actor, keyFrameNumber) {
	if (actor === undefined) {throw new Error('Missing argument: actor'); }
	if (keyFrameNumber === undefined) {throw new Error('Missing argument: keyFrameNumber'); }
	var ret, propName, frame, propValue;
	
	ret = {x: 0, y: 0, dir: 0, opacity: 0, bmSize: 1};
	for (propName in ret) {
		if (ret.hasOwnProperty(propName)) {
			frame = actor.keyFrames.getElementByPropertyValue('frame', keyFrameNumber);
			propValue = frame.properties[propName];

			if (propValue === undefined) {
				propValue = this.getInheritedPropertyValue(actor, keyFrameNumber, propName);
			}

			ret[propName] = propValue !== false  ?  propValue : ret[propName];
		}
	}
	return ret;
};

Director.prototype.getInheritedPropertyValue = function (actor, keyFrameNumber, propName) {
	if (actor === undefined) {throw new Error('Missing argument: actor'); }
	if (keyFrameNumber === undefined) {throw new Error('Missing argument: keyFrameNumber'); }
	if (propName === undefined) {throw new Error('Missing argument: propName'); }
	var defaults, value, inheritFrameNumber, inheritFrame, i;

	defaults = {x: 0, y: 0, dir: 0, opacity: 0, bmSize: 1};
	value = defaults[propName];
	inheritFrameNumber = 0;

	for (i = 0; i < actor.keyFrames.length; i ++) {
		inheritFrame = actor.keyFrames[i];

		if (inheritFrame.frame < inheritFrameNumber || inheritFrame.frame > keyFrameNumber) {
			continue;
		}

		if (inheritFrame.properties[propName] !== undefined) {
			value = inheritFrame.properties[propName];
			inheritFrameNumber = inheritFrame.frame;
		}
	}
	return value;
};

Director.prototype.onRunning = function () {
	this.frame ++;
	if (this.frame === this.scene.duration) {
		engine.detachFunctionFromLoop(this, this.updateScene, 'eachFrame');
		this.frame = 0;
	}
	this.updateScene();
};

Director.prototype.updateScene = function () {
	var name, a, lastFrame, nextFrame, last, next, i, frame, props, propName, ease, lastProps, nextProps, t, b, c, d;

	for (name in this.scene.actors) {
		if (this.scene.actors.hasOwnProperty(name)) {
			a = this.scene.actors[name];

			// Find last and next keyframe
			lastFrame = false;
			nextFrame = this.scene.duration;
			last = false;
			next = false;
			for (i = 0; i < a.keyFrames.length; i ++) {
				frame = a.keyFrames[i].frame;
				if (frame <= this.frame && frame >= lastFrame) {
					lastFrame = frame;
					last = a.keyFrames[i];
				}
				else if (frame < nextFrame) {
					nextFrame = frame;
					next = a.keyFrames[i];
				}
			}

			// If there's no last frame, reset all properties
			if (lastFrame === false) {
				this.actors[name].x = 0;
				this.actors[name].y = 0;
				this.actors[name].dir = 0;
				this.actors[name].opacity = 0;
				this.actors[name].bmSize = 1;
				continue;
			}

			// If there's no next keyframe to ease properties to, set properties to the same as in last keyframe
			if (lastFrame === this.frame || nextFrame === false || next.ease === undefined) {
				props = this.getKeyFrameProperties(a, lastFrame);

				for (propName in props) {
					if (props.hasOwnProperty(propName)) {
						this.actors[name][propName] = props[propName];
					}
				}
			}
			// If the timeline is in between two keyframes with easing, ease the properties
			else {
				ease = next.ease;
				lastProps = this.getKeyFrameProperties(a, lastFrame);
				nextProps = this.getKeyFrameProperties(a, nextFrame);

				for (propName in nextProps) {
					if (nextProps.hasOwnProperty(propName)) {
						// Generate arguments for easing
						t = this.frame - lastFrame;
						b = lastProps[propName];
						c = nextProps[propName] - b;
						d = nextFrame - lastFrame;

						// Use Animator's easing function for easing the propert transitions
						this.actors[name][propName] = Animator.prototype.ease(ease, t, b, c, d);
					}
				}
			}
		}
	}
};