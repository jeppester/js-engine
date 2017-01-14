(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Main;

Main = (function() {
  function Main(engine) {
    this.engine = engine;
    this.onLoaded();
  }

  Main.prototype.onLoaded = function() {
    var object, object2, text1, text2;
    this.engine.loader.hideOverlay();
    object = this.engine.currentRoom.create.GameObject('character', 50, 50, 0);
    object.animation = function() {
      return this.animate({
        direction: this.direction + Math.PI * 2
      }, {
        duration: 10000,
        callback: this.animation
      });
    };
    object.animation();
    object2 = this.engine.currentRoom.create.GameObject('rock', 16, 50, 0);
    object.checkCollision = function() {
      if (this.boundingBoxCollidesWith(object2)) {
        text1.set({
          string: 'COLLISION'
        });
      } else {
        text1.set({
          string: 'no collision'
        });
      }
      if (this.collidesWith(object2)) {
        return text2.set({
          string: 'COLLISION'
        });
      } else {
        return text2.set({
          string: 'no collision'
        });
      }
    };
    text1 = this.engine.currentRoom.create.TextBlock('', 6, 4, 80, {
      color: '#4F4'
    });
    text2 = this.engine.currentRoom.create.TextBlock('', 6, 78, 80, {
      color: '#000'
    });
    return this.engine.currentRoom.loops.eachFrame.attachFunction(object, object.checkCollision);
  };

  return Main;

})();

new Engine({
  mainClass: Main,
  themes: ['example'],
  container: document.getElementById('container'),
  backgroundColor: "#888",
  disableWebGL: /canvas/.test(window.location.search),
  canvasResX: 100,
  canvasResY: 100,
  drawMasks: true,
  drawBoundingBoxes: true
});



},{}]},{},[1]);
