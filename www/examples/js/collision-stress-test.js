(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CollisionStressTest;

CollisionStressTest = (function() {
  function CollisionStressTest() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
    this.objectView = new Engine.Views.Container();
    this.hudView = new Engine.Views.Container();
    engine.currentRoom.addChildren(this.objectView, this.hudView);
    this.fpsCounter = new Engine.Views.TextBlock('FPS: 0', 10, 10, 100, {
      color: '#FFF'
    });
    this.objectCounter = new Engine.Views.TextBlock('Objects: 0', 10, 30, 100, {
      color: '#FFF'
    });
    this.collisionDisplay = new Engine.Views.TextBlock('Collides: No', 10, 50, 100, {
      color: '#FFF'
    });
    this.collider = new Engine.Views.Collidable('Character', 300, 200);
    window.collider = this.collider;
    this.hudView.addChildren(this.collider, this.fpsCounter, this.objectCounter, this.collisionDisplay);
    engine.currentRoom.addLoop('each20Frames', new Engine.CustomLoop(20));
    engine.currentRoom.loops.each20Frames.attachFunction(this, this.updateFPS);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.controls);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.checkCollision);
  }

  CollisionStressTest.prototype.onLoaded = function() {
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
    var i, j, ref, results, sprite;
    if (count == null) {
      count = 10;
    }
    results = [];
    for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      sprite = new Engine.Views.GameObject('Rock', Math.random() * 600, Math.random() * 400);
      results.push(this.objectView.addChildren(sprite));
    }
    return results;
  };

  CollisionStressTest.prototype.removeObjects = function(count) {
    var i, j, objects, ref, results;
    if (count == null) {
      count = 10;
    }
    objects = this.objectView.getChildren();
    count = Math.min(count, objects.length);
    results = [];
    for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      results.push(engine.purge(objects.shift()));
    }
    return results;
  };

  CollisionStressTest.prototype.controls = function() {
    var pointers;
    if (engine.keyboard.isDown(Engine.Globals.KEY_UP)) {
      this.addObjects();
    }
    if (engine.keyboard.isDown(Engine.Globals.KEY_DOWN)) {
      this.removeObjects();
    }
    pointers = engine.pointer.isDown(Engine.Globals.MOUSE_TOUCH_ANY);
    if (pointers) {
      this.collider.x = pointers[0].x;
      return this.collider.y = pointers[0].y;
    }
  };

  return CollisionStressTest;

})();

new Engine({
  gameClass: CollisionStressTest,
  themes: ['Example'],
  backgroundColor: "#000",
  pauseOnBlur: false,
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);