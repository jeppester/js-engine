/*
SceneEditor:
Class for controlling the scene editor, this class is not a part of the game engine.
This class has to be used together with the scene editor html file

Requires:
	Animator
	Sprite
*/

function SceneEditor() {
	// Load default scene
	var defaultScene = {"duration":50,"loopSpeed":20,"workarea":{"width":"200","height":"200","backgroundColor":"#14161C"},"actors":{"Man":{"source":"Character","drawOrder":0,"keyFrames":[{"frame":0,"properties":{"x":100,"y":100,"opacity":1,"bmSize":1,"dir":0}},{"frame":24,"properties":{"opacity":1,"bmSize":1,"dir":-6.28},"ease":"quadInOut"},{"frame":49,"properties":{"dir":-12.57},"ease":"quadInOut"}]},"Rock":{"source":"Rock","drawOrder":1,"keyFrames":[{"frame":0,"properties":{"bmSize":1,"opacity":1,"x":-16,"y":134,"dir":1}},{"frame":49,"properties":{"x":216},"ease":"linear"}]},"Rock2":{"source":"Rock","drawOrder":2,"keyFrames":[{"frame":0,"properties":{"opacity":1,"y":134,"x":100}},{"frame":24,"properties":{"x":216},"ease":"linear"},{"frame":25,"properties":{"x":-16}},{"frame":49,"properties":{"x":100},"ease":"linear"}]},"Star":{"source":"Folder.Star2","drawOrder":3,"keyFrames":[{"frame":0,"properties":{"opacity":1,"y":30,"x":-10,"dir":1}},{"frame":49,"properties":{"x":100},"ease":"linear"}]},"Star2":{"source":"Folder.Star2","drawOrder":4,"keyFrames":[{"frame":0,"properties":{"opacity":1,"y":30,"x":100,"dir":1}},{"frame":49,"properties":{"x":210},"ease":"linear"}]}}}

	// Create director object and Load scene
	this.director = new Director();
	engine.depth[0].addChild(this.director);
	this.loadScene(defaultScene);

	// Set event bindings
	$('#newActor').bind('click', function () {
		var images, optionsHTML, i;

		images = loader.getImageSources();
		optionsHTML = '';
		for (i = 0; i < images.length; i ++) {
			optionsHTML += '<option value="' + images[i] + '">' + images[i] + '</option>';
		}
		$('#newActorSource').html(optionsHTML);

		$('#newActorForm').slideDown(200);
		$(this).attr('disabled', 'disabled');
	});
	$('#newActorCreate').bind('click', function () {
		var actorName, actorSource, totalActors;

		// Collect input
		actorName = $('#newActorName').val();
		actorSource = $('#newActorSource').val();

		// Validate input
		if (sceneEditor.scene.actors[actorName] !== undefined) {
			alert('The chosen name is already taken.');
			return;
		}
		if (actorName.length === 0 || /^\d/.test(actorName)) {
			alert('The name has to be at least one charactor long and cannot start with a number.');
			return;
		}

		// Hide form
		$('#newActorForm').slideUp(200);
		$('#newActorName').val('New');
		$('#newActor').removeAttr('disabled');

		// Create new actor
		totalActors = Object.keys(sceneEditor.scene.actors).length;
		sceneEditor.scene.actors[actorName] = {
			"source": actorSource,
			"drawOrder": totalActors,
			"keyFrames": [],
		};

		// Reload scene
		sceneEditor.loadScene(sceneEditor.scene);
	});
	$('#newActorClose').bind('click', function () {
		// Hide form
		$('#newActorForm').slideUp(200);
		$('#newActorName').val('New');
		$('#newActor').removeAttr('disabled');
	});
	$('.propertyButton').bind('click', function () {
		var add, propName, value;

		add = $(this).hasClass('icon-plus');
		propName = this.parentNode.getAttribute('data-property');
		value = $('input', this.parentNode).val();

		if (add) {
			sceneEditor.addKeyFrameProperty(sceneEditor.currentActor, propName, sceneEditor.director.frame, value);
		}
		else {
			sceneEditor.removeKeyFrameProperty(sceneEditor.currentActor, propName, sceneEditor.director.frame);
		}
	});

	$('#keyFrameEditor .property').bind('input', function (e) {
		sceneEditor.saveKeyFrame();
	});

	$('#workAreaEditor .property').bind('input', function (e) {
		switch ($(this.parentNode).attr('data-property')) {
			case 'width':
				sceneEditor.setSceneWidth(this.value);
				break;
			case 'height':
				sceneEditor.setSceneHeight(this.value);
				break;
			case 'backgroundColor':
				sceneEditor.setSceneBackgroundColor(this.value);
				break;
		}
	});

	$('#sceneEditor .property').bind('blur', function (e) {
		switch ($(this.parentNode).attr('data-property')) {
			case 'duration':
				sceneEditor.setSceneDuration(this.value);
				break;
			case 'loopSpeed':
				sceneEditor.setSceneLoopSpeed(this.value);
				break;
		}
	});

	// Save new easing instantly on changed
	$('[data-property="ease"]').bind('change', function () {sceneEditor.saveKeyFrame(); });

	// Initiate global keyboard shortcuts
	$(document).bind('keydown', function (e) {
		if ($('input:focus').length) {return; }
		
		var actor;

		switch (e.keyCode) {
			case 32:
				if (sceneEditor.playing) {
					sceneEditor.pause();
				}
				else {
					sceneEditor.play();
				}
				return false;
				break;

			case KEY_LEFT:
				sceneEditor.director.frame = Math.max(sceneEditor.director.frame - 1, 0);
				sceneEditor.selectFrame(sceneEditor.currentActor, sceneEditor.director.frame);
				break;

			case KEY_RIGHT:
				sceneEditor.director.frame = Math.min(sceneEditor.director.frame + 1, sceneEditor.scene.duration - 1);
				sceneEditor.selectFrame(sceneEditor.currentActor, sceneEditor.director.frame);
				break;

			case KEY_UP:
				actor = $('[data-actor="' + sceneEditor.currentActor + '"]').prev();
				if (actor.length) {
					sceneEditor.selectFrame(actor.attr('data-actor'), sceneEditor.director.frame);
				}
				break;

			case KEY_DOWN:
				actor = $('[data-actor="' + sceneEditor.currentActor + '"]').next();
				if (actor.length) {
					sceneEditor.selectFrame(actor.attr('data-actor'), sceneEditor.director.frame);
				}
				break;
		}
	});
	$('#deleteKeyFrame').bind('click', function () {
		delete sceneEditor.scene.actors[sceneEditor.currentActor].keyFrames[sceneEditor.director.frame];
		sceneEditor.refreshTimeLine();
	});
	$('#sceneContainer .icon-disk').bind('click', function () {
		// Alert scene as JSON for the user to save
		alert(JSON.stringify(sceneEditor.scene));
	});
	$('#sceneContainer .icon-folder-open').bind('click', function () {
		$('#arena').slideUp(400);
		$('#loadSceneForm').slideDown(400);
	});
	$('#sceneContainer .icon-check').bind('click', function () {
		var scene, sceneScript;

		// Validate input
		sceneScript = $('#loadSceneCode').val();
		if (!sceneScript.length) {
			alert('No script to load');
			return;
		}
		try {
			scene = JSON.parse(sceneScript);
		}
		catch (e) {
			if (e) {
				alert('Error in script');
				return;
			}
		}

		// Load scene
		sceneEditor.loadScene(scene);

		// Hide load form
		$('#arena').slideDown(400);
		$('#loadSceneForm').slideUp(400);
		$('#loadSceneCode').val('');
	});

	loader.hideOverlay();
}

// Function for loading a scene into the scene editor
SceneEditor.prototype.loadScene = function (scene) {
	this.pause();
	this.scene = scene;
	this.director.loadScene(scene);

	this.currentActor = Object.keys(this.scene.actors)[0];

	this.setSceneWidth(scene.workarea.width);
	this.setSceneHeight(scene.workarea.height);
	this.setSceneBackgroundColor(scene.workarea.backgroundColor);
	this.setSceneLoopSpeed(scene.loopSpeed);
	this.setSceneDuration(scene.duration);

	this.selectFrame(this.currentActor, 0);
};

SceneEditor.prototype.setSceneWidth = function(width) {
	if (width < 100 || width > 2000 || width === engine.canvasResX) {return; }

	engine.setCanvasResX(width);
	$('[data-property="width"] input').val(width);
	this.scene.workarea.width = width;
}

SceneEditor.prototype.setSceneHeight = function (height) {
	if (height < 100 || height > 2000 || height === engine.canvasResY) {return; }

	engine.setCanvasResY(height);
	$('[data-property="height"] input').val(height);
	this.scene.workarea.height = height;
}

SceneEditor.prototype.setSceneBackgroundColor = function (colorStr) {
	// Check that the provided color is actually a color
	if (!/#[0-9a-fA-F]{6}/.test(colorStr)) {
		console.log('Not a color!');
		return;
	}

	this.scene.workarea.backgroundColor = colorStr;
	$('[data-property="backgroundColor"] input').val(colorStr);
	engine.backgroundColor = colorStr;
}

SceneEditor.prototype.setSceneDuration = function (duration) {
	if (typeof duration === "string") {duration = duration * 1}
	if (duration < 1) {return; }
	

	var actorName, actor, keyFrameId, deleteFrames;

	deleteFrames = false;

	// Check that there are no keyframes beyond the new duration
	for (actorName in this.scene.actors) {
		if (this.scene.actors.hasOwnProperty(actorName)) {
			actor = this.scene.actors[actorName];

			for (keyFrameId = 0; keyFrameId < actor.keyFrames.length; keyFrameId ++) {

				keyFrame = actor.keyFrames[keyFrameId];

				if (keyFrame.frame > duration - 1) {
					if (deleteFrames) {
						actor.keyFrames.splice(keyFrameId, 1);
					}
					else if (confirm('This will delete keyframes\nAre you sure that you want to do this?')) {
						actor.keyFrames.splice(keyFrameId, 1);

						deleteFrames = true;
					}
					else {
						$('[data-property="duration"] input').val(this.scene.duration);
						return;
					}
				}
			}
		}
	}

	this.scene.duration = duration;

	if (deleteFrames) {
		this.loadScene(this.scene);
	}
	else {
		$('[data-property="duration"] input').val(duration);
		this.refreshTimeLine();
	}
}

SceneEditor.prototype.setSceneLoopSpeed = function (loopSpeed) {
	if (typeof loopSpeed === "string") {loopSpeed = loopSpeed * 1}

	this.scene.loopSpeed = loopSpeed
	$('[data-property="loopSpeed"] input').val(loopSpeed);
	engine.setLoopSpeed(loopSpeed);
}

// Function for loading an actor and creating the HTML for it
SceneEditor.prototype.loadActor = function (name, actor) {
	var newActor, actorContainer, actorElem, html, keyFrame, keyFrames, newTimeLine, timeLineContainer, timeLineElem, i;

	// Add actor on actor list
	newActor = $('\
		<div class="actor" data-name="' + name + '" data-drawOrder="' + actor.drawOrder + '">\
			' + name + '\
			<span style="float: right;" class="icon icon-trash"></span>\
			<span style="float: right;" class="icon icon-arrow-1-s"></span>\
			<span style="float: right;" class="icon icon-arrow-1-n"></span>\
		</div>')[0];
	actorContainer = $('#actors')[0];

	// Order the actors after drawOrder
	for (i = 0; i < actorContainer.children.length; i ++) {
		actorElem = actorContainer.children[i];

		if (actorElem.getAttribute('data-drawOrder') * 1 > newActor.getAttribute('data-drawOrder') * 1) {
			actorContainer.insertBefore(newActor, actorElem);
			break;
		}
	}
	if (newActor.parentNode !== actorContainer) {
		actorContainer.appendChild(newActor);
	}

	// Set actor button bindings
	$('.icon-trash', newActor).bind('click', function () {
		var actorName = $(this.parentNode).attr('data-name');
		if (confirm('Delete actor?')) {
			delete sceneEditor.scene.actors[actorName];
			sceneEditor.loadScene(sceneEditor.scene);
		}
	});

	// For moving the actor up and changing the it's draw order
	$('.icon-arrow-1-n', newActor).bind('click', function () {
		var currentDrawOrder, newDrawOrder, actorName, otherName;

		if ($(this.parentNode).is(':first-child')) {
			return;
		}

		currentDrawOrder = $(this.parentNode).attr('data-drawOrder');
		newDrawOrder = $(this.parentNode).prev().attr('data-drawOrder');

		actorName = $(this.parentNode).attr('data-name');
		otherName = $(this.parentNode).prev().attr('data-name');

		sceneEditor.scene.actors[actorName].drawOrder = newDrawOrder;
		sceneEditor.scene.actors[otherName].drawOrder = currentDrawOrder;

		sceneEditor.loadScene(sceneEditor.scene);
	});
	// For moving the actor down and changing the it's draw order
	$('.icon-arrow-1-s', newActor).bind('click', function () {
		var currentDrawOrder, newDrawOrder, actorName, otherName;

		if ($(this.parentNode).is(':last-child')) {
			return;
		}

		currentDrawOrder = $(this.parentNode).attr('data-drawOrder');
		newDrawOrder = $(this.parentNode).next().attr('data-drawOrder');

		actorName = $(this.parentNode).attr('data-name');
		otherName = $(this.parentNode).next().attr('data-name');

		sceneEditor.scene.actors[actorName].drawOrder = newDrawOrder;
		sceneEditor.scene.actors[otherName].drawOrder = currentDrawOrder;

		sceneEditor.loadScene(sceneEditor.scene);
	});

	// Add time line for actor
	html = ' <div class="actorTimeLine" data-actor="' + name + '" data-drawOrder="' + actor.drawOrder + '"> ';
	keyFrames = [];
	for (i = 0; i < actor.keyFrames.length; i ++) {
		keyFrames.push(actor.keyFrames[i].frame);
	}

	for (i = 0; i < this.scene.duration; i ++) {
		keyFrame = keyFrames.indexOf(i) !== -1;

		html += '<div onclick="sceneEditor.selectFrame(this.parentNode.getAttribute(\'data-actor\'), this.getAttribute(\'data-frame\'))" data-frame="' + i + '" class="frame' + (keyFrame  ?  ' keyFrame': '') + '"></div>';
	}
	html += '</div>';

	newTimeLine = $(html)[0];
	timeLineContainer = $('#timeLine')[0];
	for (i = 0; i < timeLineContainer.children.length; i ++) {
		timeLineElem = timeLineContainer.children[i];

		if (timeLineElem.getAttribute('data-drawOrder') * 1 > newTimeLine.getAttribute('data-drawOrder') * 1) {
			timeLineContainer.insertBefore(newTimeLine, timeLineElem);
			break;
		}
	}
	if (newTimeLine.parentNode !== timeLineContainer) {
		timeLineContainer.appendChild(newTimeLine);
	}
};

// Function for reloading all actor's time lines
SceneEditor.prototype.refreshTimeLine = function () {
	var name, actor;

	$('#actors')[0].innerHTML = '';
	$('#timeLine')[0].innerHTML = '';

	// Create scene actors
	for (name in this.scene.actors) {
		if (this.scene.actors.hasOwnProperty(name)) {
			actor = this.scene.actors[name];
			this.loadActor(name, actor);
		}
	}

	this.selectFrame(this.currentActor, this.director.frame);
};

// Function for selecting a frame in the scene editor
SceneEditor.prototype.selectFrame = function (actorName, frame) {
	var keyFrame, animProps, propName, props, val, i;

	// Ensure that frame - argument is a number
	frame = frame * 1;

	// Set current actor and frame
	this.currentActor = actorName;
	this.director.goToFrame(frame);

	// Update selected frame in time line widget
	$('.frame').removeClass('frame-selected').removeClass('frame-highlight');
	$('.frame[data-frame="' + frame + '"]').addClass('frame-highlight');
	$('[data-actor="' + actorName + '"] [data-frame="' + frame + '"]').addClass('frame-selected');

	// Load properties to key frame editor
	keyFrame = this.scene.actors[actorName].keyFrames.getElementByPropertyValue('frame', frame);
	animProps = ['x', 'y', 'dir', 'opacity', 'bmSize'];
	$('.keyFrameButton').attr('disabled', 'disabled');

	if (keyFrame === undefined) {
		$('#keyFrameEditor input.property').attr('disabled', 'disabled');
		$('[data-property="ease"]').attr('disabled', 'disabled').val('false');
		for (i = 0; i < animProps.length; i ++) {
			propName = animProps[i];
			this.disableKeyFrameProperty(propName);
			$('[data-property="' + propName + '"] input').val(this.director.actors[actorName][propName]);
		}
		$('#newKeyFrame').removeAttr('disabled');
	}
	else {
		props = keyFrame.properties;

		$('[data-property="ease"]').removeAttr('disabled');
		$('[data-property="ease"]').val(keyFrame.ease);

		for (i = 0; i < animProps.length; i ++) {
			propName = animProps[i];

			val = props[propName];
			if (val === undefined) {
				this.disableKeyFrameProperty(propName);
			} else {
				this.enableKeyFrameProperty(propName);
				$('[data-property="' + propName + '"] input').val(val * 1);
			}
		}

		$('#deleteKeyFrame').removeAttr('disabled');
	}
};

// Function for enabling keyframe widget representation of a property
SceneEditor.prototype.enableKeyFrameProperty = function (propName) {
	$('[data-property="' + propName + '"] .propertyButton').removeClass('icon-plus').addClass('icon-minus');
	$('[data-property="' + propName + '"] input').removeAttr('disabled');
};

// Function for disabling keyframe widget representation of a property
SceneEditor.prototype.disableKeyFrameProperty = function (propName) {
	$('[data-property="' + propName + '"] .propertyButton').removeClass('icon-minus').addClass('icon-plus');
	$('[data-property="' + propName + '"] input').attr('disabled', 'disabled');

	var val = this.director.getInheritedPropertyValue(this.scene.actors[this.currentActor], this.director.frame, propName);
	$('[data-property="' + propName + '"] input').val(val * 1);
};

// Function for adding a keyframe property to a keyframe
SceneEditor.prototype.addKeyFrameProperty = function (actorName, propName, frameNumber, value) {
	var keyFrame = this.scene.actors[actorName].keyFrames.getElementByPropertyValue('frame', frameNumber);

	if (keyFrame === undefined) {
		keyFrame = this.createKeyFrame(actorName, frameNumber);
	}

	keyFrame.properties[propName] = value;
	this.enableKeyFrameProperty(propName);
	this.director.updateScene();
};

// Function for removing a keyframe property to a keyframe
SceneEditor.prototype.removeKeyFrameProperty = function (actorName, propName, frameNumber) {
	var keyFrame = this.scene.actors[actorName].keyFrames.getElementByPropertyValue('frame', frameNumber);
	delete keyFrame.properties[propName];
	if (Object.keys(keyFrame.properties).length === 0) {
		this.removeKeyFrame(actorName, frameNumber);
	}
	this.disableKeyFrameProperty(propName);
	this.director.updateScene();
};

// Function for creating a key frame for an object
SceneEditor.prototype.createKeyFrame = function (actorName, frameNumber) {
	var keyFrames, newFrame;

	keyFrames = this.scene.actors[actorName].keyFrames;
	newFrame = keyFrames[keyFrames.push({
		frame: frameNumber,
		properties: {},
	}) - 1];
	this.refreshTimeLine();
	return newFrame;
};

// Function for removing a key frame from an actor
SceneEditor.prototype.removeKeyFrame = function (actorName, frameNumber) {
	var keyFrames, i;

	keyFrames = this.scene.actors[actorName].keyFrames;
	for (i = 0; i < keyFrames.length; i ++) {
		if (keyFrames[i].frame === frameNumber) {
			keyFrames.splice(i, 1);
			break;
		}
	}
	this.refreshTimeLine();
};

// Function for saving all properties in the key frame widget to the scene
SceneEditor.prototype.saveKeyFrame = function () {
	var ease, keyFrame, animProps, propName, val, i;

	// Save easing
	ease = $('[data-property="ease"]').val();
	if (ease === "false") {
		ease = undefined;
	}

	keyFrame = this.scene.actors[this.currentActor].keyFrames.getElementByPropertyValue('frame', this.director.frame);
	keyFrame.ease = ease;

	animProps = ['x', 'y', 'dir', 'opacity', 'bmSize'];
	for (i = 0; i < animProps.length; i ++) {
		propName = animProps[i];

		if ($('[data-property="' + propName + '"] input').attr('disabled')) {continue; }
		val = $('[data-property="' + propName + '"] input').val() * 1;

		keyFrame.properties[propName] = val;

		this.director.updateScene();
	}
};

// Function for setting the scene length
SceneEditor.prototype.setSceneLength = function (frames) {
	this.scene.duration = frames;
	this.refreshTimeLine();
};

// Function for playing the scene
SceneEditor.prototype.play = function () {
	this.playing = true;
	engine.attachFunctionToLoop(this, this.onPlaying, 'eachFrame');
};

// Function for pausing the scene
SceneEditor.prototype.pause = function () {
	this.playing = false;
	engine.detachFunctionFromLoop(this, this.onPlaying, 'eachFrame');
};

// Function for updating scene (to be run in play loop)
SceneEditor.prototype.onPlaying = function () {
	this.director.frame ++;
	if (this.director.frame >= this.scene.duration) {
		this.director.frame = 0;
	}

	this.selectFrame(this.currentActor, this.director.frame);
};