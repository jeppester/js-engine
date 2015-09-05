(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MasksAndBBoxes;

MasksAndBBoxes = (function() {
  function MasksAndBBoxes() {
    this.onLoaded();
  }

  MasksAndBBoxes.prototype.onLoaded = function() {
    var object, object2, text;
    engine.loader.hideOverlay();
    object = new Engine.Views.GameObject('Character', 50, 50, 0);
    object.animation = function() {
      return this.animate({
        direction: this.direction + Math.PI * 2
      }, {
        duration: 10000,
        callback: this.animation
      });
    };
    object.animation();
    object2 = new Engine.Views.GameObject('Rock', 16, 50, 0);
    object.checkCollision = function() {
      if (this.collidesWith(object2)) {
        return text.string = 'Collides';
      } else {
        return text.string = '';
      }
    };
    text = new Engine.Views.TextBlock('', 6, 4, 80, {
      color: '#FFF'
    });
    engine.currentRoom.loops.eachFrame.attachFunction(object, object.checkCollision);
    return engine.currentRoom.addChildren(object, object2, text);
  };

  return MasksAndBBoxes;

})();

new JSEngine({
  gameClass: MasksAndBBoxes,
  themes: ['Example'],
  drawBoundingBoxes: true,
  drawMasks: true,
  canvasResX: 100,
  canvasResY: 100
});



},{}]},{},[1]);
