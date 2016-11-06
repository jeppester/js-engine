(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Main, MovableCharacter,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

MovableCharacter = (function(superClass) {
  extend(MovableCharacter, superClass);

  function MovableCharacter(x, y) {
    MovableCharacter.__super__.constructor.call(this, 'character', x, y, 0);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.step);
  }

  MovableCharacter.prototype.step = function() {
    if (engine.keyboard.isDown(Engine.Globals.KEY_LEFT)) {
      this.x -= engine.convertSpeed(200);
    }
    if (engine.keyboard.isDown(Engine.Globals.KEY_RIGHT)) {
      this.x += engine.convertSpeed(200);
    }
    if (engine.keyboard.isDown(Engine.Globals.KEY_UP)) {
      this.y -= engine.convertSpeed(200);
    }
    if (engine.keyboard.isDown(Engine.Globals.KEY_DOWN)) {
      this.y += engine.convertSpeed(200);
    }
    if (engine.keyboard.isPressed(Engine.Globals.KEY_SPACE)) {
      return this.animate({
        direction: this.direction + Math.PI * 2
      }, {
        duration: 2000
      });
    }
  };

  return MovableCharacter;

})(Engine.Views.Sprite);

Engine.ObjectCreator.prototype.MovableCharacter = function(x, y) {
  var object;
  object = new MovableCharacter(x, y);
  return this.container.addChildren(object);
};

Main = (function() {
  function Main() {
    this.onLoaded();
  }

  Main.prototype.onLoaded = function() {
    var movable, sprite, text;
    this.bgView = new Engine.Views.Container;
    this.fgView = new Engine.Views.Container;
    engine.currentRoom.addChildren(this.bgView, this.fgView);
    text = new Engine.Views.TextBlock('Hello world!', 50, 50, 200, {
      font: 'bold 24px Verdana',
      color: '#FFF'
    });
    this.bgView.addChildren(text);
    sprite = new Engine.Views.Sprite('rock', 70, 200, 0);
    this.fgView.addChildren(sprite);
    sprite.animate({
      dir: Math.PI * 4
    }, {
      dur: 5000
    });
    movable = this.fgView.create.MovableCharacter(300, 200);
    return engine.loader.hideOverlay();
  };

  return Main;

})();

new Engine({
  gameClass: Main,
  themes: ['example'],
  container: document.getElementById('container'),
  backgroundColor: "#000",
  disableWebGL: /canvas/.test(window.location.search),
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
