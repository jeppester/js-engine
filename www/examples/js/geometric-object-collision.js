(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var GeometricObjectCollision;

GeometricObjectCollision = (function() {
  function GeometricObjectCollision() {
    var textOptions;
    this.circle = new JSEngine.Views.Circle(300, 200, 80, "#F11", "#F11");
    this.line = new JSEngine.Views.Line(null, null, "#F00", 6).setFromCoordinates(20, 320, 80, 380);
    this.polygon = new JSEngine.Views.Polygon([], "#FFF", "#F00", 6).setFromCoordinates(540, 40, 535, 70.5, 560, 70.5, 540, 50, 560, 35);
    this.rectangle = new JSEngine.Views.Rectangle(20.5, 130.5, 100, 40, "#FFF", "#F00", 6);
    this.circle2 = new JSEngine.Views.Circle(530, 330, 50, "#FFF", "#F00", 6);
    textOptions = {
      color: '#FFF'
    };
    this.text = new JSEngine.Views.TextBlock('Use arrow keys to move the circle in the middle', 10, 10, 600, textOptions);
    this.text2 = new JSEngine.Views.TextBlock('Distance to line: 0', 10, 30, 600, textOptions);
    this.text3 = new JSEngine.Views.TextBlock('Distance to polygon: 0', 10, 50, 600, textOptions);
    this.text4 = new JSEngine.Views.TextBlock('Distance to circle: 0', 10, 70, 600, textOptions);
    this.text5 = new JSEngine.Views.TextBlock('Distance to rectangle: 0', 10, 90, 600, textOptions);
    engine.currentRoom.addChildren(this.circle, this.line, this.polygon, this.rectangle, this.circle2, this.text, this.text2, this.text3, this.text4, this.text5);
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
  }

  GeometricObjectCollision.prototype.onLoaded = function() {
    return engine.currentRoom.loops.eachFrame.attachFunction(this, this.step);
  };

  GeometricObjectCollision.prototype.step = function() {
    var dx, dy;
    dx = 0;
    dy = 0;
    if (engine.keyboard.isDown(JSEngine.Globals.KEY_LEFT)) {
      dx = -engine.convertSpeed(200);
    }
    if (engine.keyboard.isDown(JSEngine.Globals.KEY_RIGHT)) {
      dx = engine.convertSpeed(200);
    }
    if (engine.keyboard.isDown(JSEngine.Globals.KEY_UP)) {
      dy = -engine.convertSpeed(200);
    }
    if (engine.keyboard.isDown(JSEngine.Globals.KEY_DOWN)) {
      dy = engine.convertSpeed(200);
    }
    this.circle.move(dx, dy);
    this.text2.string = "Distance to line: " + (Math.round(this.circle.getDistance(this.line))) + (this.circle.intersects(this.line) ? ' (intersects)' : '');
    this.text3.string = "Distance to polygon: " + (Math.round(this.circle.getDistance(this.polygon))) + (this.circle.intersects(this.polygon) ? ' (intersects)' : '');
    this.text4.string = "Distance to circle: " + (Math.round(this.circle.getDistance(this.circle2))) + (this.circle.intersects(this.circle2) ? ' (intersects)' : '');
    return this.text5.string = "Distance to rectangle: " + (Math.round(this.circle.getDistance(this.rectangle))) + (this.circle.intersects(this.rectangle) ? ' (intersects)' : '');
  };

  return GeometricObjectCollision;

})();

new JSEngine({
  gameClass: GeometricObjectCollision,
  themes: ['Example'],
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
