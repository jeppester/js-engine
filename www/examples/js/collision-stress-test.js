(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CollisionStressTest;

CollisionStressTest = (function() {
  function CollisionStressTest() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
  }

  CollisionStressTest.prototype.onLoaded = function() {
    this.objectView = new JSEngine.Views.Container();
    this.hudView = new JSEngine.Views.Container();
    engine.currentRoom.addChildren(this.objectView, this.hudView);
    this.fpsCounter = new JSEngine.Views.TextBlock('FPS: 0', 10, 10, 150, {
      color: '#FFF'
    });
    this.objectCounter = new JSEngine.Views.TextBlock('Objects: 0', 10, 30, 150, {
      color: '#FFF'
    });
    this.collisionDisplay = new JSEngine.Views.TextBlock('Collides: No', 10, 50, 150, {
      color: '#FFF'
    });
    this.collider = new JSEngine.Views.Collidable('Character', 300, 200);
    this.hudView.addChildren(this.collider, this.fpsCounter, this.objectCounter, this.collisionDisplay);
    engine.currentRoom.addLoop('each20Frames', new JSEngine.CustomLoop(20));
    engine.currentRoom.loops.each20Frames.attachFunction(this, this.updateFPS);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.controls);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.checkCollision);
    return this.addObjects(200);
  };

  CollisionStressTest.prototype.checkCollision = function() {
    if (this.collider.collidesWith(this.objectView.getChildren(), 1)) {
      return this.collisionDisplay.string = 'Collides: Yes';
    } else {
      return this.collisionDisplay.string = 'Collides: No';
    }
  };

  CollisionStressTest.prototype.updateFPS = function() {
    this.fpsCounter.string = 'FPS: ' + engine.fps;
    return this.objectCounter.string = 'Objects: ' + (Object.keys(engine.objectIndex).length - 2);
  };

  CollisionStressTest.prototype.addObjects = function(count) {
    var i, sprite, _i, _results;
    if (count == null) {
      count = 10;
    }
    _results = [];
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      sprite = new JSEngine.Views.GameObject('Rock', Math.random() * 600, Math.random() * 400);
      _results.push(this.objectView.addChildren(sprite));
    }
    return _results;
  };

  CollisionStressTest.prototype.removeObjects = function(count) {
    var i, objects, _i, _results;
    if (count == null) {
      count = 10;
    }
    objects = this.objectView.getChildren();
    count = Math.min(count, objects.length);
    _results = [];
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      _results.push(engine.purge(objects.shift()));
    }
    return _results;
  };

  CollisionStressTest.prototype.controls = function() {
    var pointers;
    if (engine.keyboard.isDown(JSEngine.Globals.KEY_UP)) {
      this.addObjects();
    }
    if (engine.keyboard.isDown(JSEngine.Globals.KEY_DOWN)) {
      this.removeObjects();
    }
    pointers = engine.pointer.isPressed(JSEngine.Globals.MOUSE_TOUCH_ANY) || engine.pointer.isDown(JSEngine.Globals.MOUSE_TOUCH_ANY);
    if (pointers) {
      this.collider.x = pointers[0].x;
      return this.collider.y = pointers[0].y;
    }
  };

  return CollisionStressTest;

})();

new JSEngine({
  gameClass: CollisionStressTest,
  themes: ['Example'],
  backgroundColor: "#000",
  pauseOnBlur: false,
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
