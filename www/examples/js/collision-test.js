(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var CollisionObject, CollisionTest,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

CollisionObject = (function(_super) {
  __extends(CollisionObject, _super);

  function CollisionObject(source, x, y, additionalProperties) {
    CollisionObject.__super__.constructor.call(this, source, x, y, 0, additionalProperties);
    if (this.leftKey) {
      engine.currentRoom.loops.eachFrame.attachFunction(this, this.step);
    }
    engine.currentRoom.loops.collisionChecking.attachFunction(this, this.collisionCheck);
  }

  CollisionObject.prototype.step = function() {
    if (engine.keyboard.isDown(this.leftKey)) {
      this.speed.x -= engine.convertSpeed(100);
    }
    if (engine.keyboard.isDown(this.rightKey)) {
      this.speed.x += engine.convertSpeed(100);
    }
    if (engine.keyboard.isDown(this.upKey)) {
      this.speed.y -= engine.convertSpeed(100);
    }
    if (engine.keyboard.isDown(this.downKey)) {
      return this.speed.y += engine.convertSpeed(100);
    }
  };

  CollisionObject.prototype.collisionCheck = function() {
    var colPos, collision, i, rock, speed, _i, _len, _ref;
    if (collision = this.collidesWith(window.rocks, true, true)) {
      _ref = collision.objects;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        rock = _ref[i];
        colPos = collision.positions[i];
        while (true) {
          this.x += Math.cos(colPos.getDirection() - Math.PI);
          this.y += Math.sin(colPos.getDirection() - Math.PI);
          rock.x += Math.cos(colPos.getDirection());
          rock.y += Math.sin(colPos.getDirection());
          if (!this.collidesWith(rock, true)) {
            break;
          }
        }
        speed = rock.speed.getLength();
        rock.speed.setFromDirection(colPos.getDirection(), speed);
        this.speed.setFromDirection(colPos.getDirection() - Math.PI, speed);
      }
    }
    if (this.x < 16) {
      this.x = 16;
      this.speed.x = -this.speed.x;
    }
    if (this.x > engine.canvasResX - 16) {
      this.x = engine.canvasResX - 16;
      this.speed.x = -this.speed.x;
    }
    if (this.y < 16) {
      this.y = 16;
      this.speed.y = -this.speed.y;
    }
    if (this.y > engine.canvasResY - 16) {
      this.y = engine.canvasResY - 16;
      return this.speed.y = -this.speed.y;
    }
  };

  return CollisionObject;

})(Engine.Views.GameObject);

CollisionTest = (function() {
  function CollisionTest() {
    var player;
    engine.currentRoom.addLoop('collisionChecking', new Engine.CustomLoop(5));
    window.rocks = [];
    this.addRocks(15);
    player = new CollisionObject("character", 200, 100, {
      upKey: Engine.Globals.KEY_UP,
      downKey: Engine.Globals.KEY_DOWN,
      leftKey: Engine.Globals.KEY_LEFT,
      rightKey: Engine.Globals.KEY_RIGHT
    });
    engine.currentRoom.addChildren(player);
    engine.loader.hideOverlay();
  }

  CollisionTest.prototype.addRocks = function(number) {
    var i, rock, _i, _results;
    if (number == null) {
      number = 1;
    }
    _results = [];
    for (i = _i = 0; 0 <= number ? _i < number : _i > number; i = 0 <= number ? ++_i : --_i) {
      rock = new CollisionObject("rock", 20 + Math.random() * 560, 20 + Math.random() * 360);
      rock.speed.setFromDirection(Math.PI * 2 * Math.random(), 150);
      window.rocks.push(rock);
      _results.push(engine.currentRoom.addChildren(rock));
    }
    return _results;
  };

  return CollisionTest;

})();

new Engine({
  gameClass: CollisionTest,
  themes: ['example'],
  backgroundColor: "#222",
  disableWebGL: /canvas/.test(window.location.search),
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
