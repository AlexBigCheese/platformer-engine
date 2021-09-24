// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"vec.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Vec = void 0;

var Vec = function () {
  function Vec(x, y) {
    this.x = x;
    this.y = y;
  }

  Object.defineProperty(Vec, "zero", {
    get: function get() {
      return new Vec(0, 0);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Vec, "one", {
    get: function get() {
      return new Vec(1, 1);
    },
    enumerable: false,
    configurable: true
  });

  Vec.prototype.add = function (other) {
    return new Vec(this.x + other.x, this.y + other.y);
  };

  Vec.prototype.sub = function (other) {
    return this.add(other.fmap(function (x) {
      return -x;
    }));
  };

  Vec.prototype.cross = function (other) {
    return this.x * other.y - this.y * other.x;
  };

  Vec.prototype.dot = function (other) {
    return this.x * other.x + this.y * other.y;
  };

  Vec.prototype.norm = function () {
    var mag = Math.sqrt(this.dot(this));
    return new Vec(this.x / mag, this.y / mag);
  };

  Vec.prototype.fmap = function (f) {
    return new Vec(f(this.x), f(this.y));
  };

  Vec.prototype.neg = function () {
    return new Vec(-this.x, -this.y);
  };

  Vec.prototype.mul_parts = function (other) {
    return new Vec(this.x * other.x, this.y * other.y);
  };

  return Vec;
}();

exports.Vec = Vec;
},{}],"transform.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transform = void 0;

var vec_1 = require("./vec");

var Transform = function () {
  function Transform() {
    this.parent = null;
    this.pos = vec_1.Vec.zero;
  } ///Local to World


  Transform.prototype.TransformPoint = function (p) {
    var myspace = this.pos.add(p);

    if (this.parent === null) {
      return myspace;
    } else {
      return this.parent.TransformPoint(myspace);
    }
  }; //World to Local


  Transform.prototype.InverseTransformPoint = function (p) {
    var parentspace = this.parent === null ? p : this.parent.InverseTransformPoint(p);
    return parentspace.sub(this.pos);
  };

  return Transform;
}();

exports.Transform = Transform;
},{"./vec":"vec.ts"}],"gameobject.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GameObject = exports.RenderBehaviour = exports.Behaviour = exports.Component = void 0;

var transform_1 = require("./transform");

var Component = function () {
  function Component() {}

  Component.prototype.Start = function () {};

  Component.prototype.Init = function () {}; //runs when component is added


  Object.defineProperty(Component.prototype, "transform", {
    get: function get() {
      return this.gameObject.transform;
    },
    enumerable: false,
    configurable: true
  });
  return Component;
}();

exports.Component = Component;

var Behaviour = function (_super) {
  __extends(Behaviour, _super);

  function Behaviour() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return Behaviour;
}(Component);

exports.Behaviour = Behaviour;

var RenderBehaviour = function (_super) {
  __extends(RenderBehaviour, _super);

  function RenderBehaviour() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  return RenderBehaviour;
}(Component);

exports.RenderBehaviour = RenderBehaviour;

var GameObject = function () {
  function GameObject() {
    this.transform = new transform_1.Transform();
    this.components = [];
    this.tag = "";
  }

  GameObject.prototype.GetComponent = function (T) {
    return this.components.find(function (x) {
      return x instanceof T;
    });
  };

  GameObject.prototype.AddComponent = function (ctor) {
    var comp = new ctor();
    this.components.push(comp);
    comp.gameObject = this;
    comp.Init();
    return comp;
  };

  GameObject.prototype.ApplyComponent = function (C, f) {
    var comp = new C();
    this.components.push(comp);
    comp.gameObject = this;
    f(comp);
    comp.Init();
  };

  return GameObject;
}();

exports.GameObject = GameObject;
},{"./transform":"transform.ts"}],"box.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoxMesh = void 0;

var gameobject_1 = require("./gameobject");

var BoxMesh = function (_super) {
  __extends(BoxMesh, _super);

  function BoxMesh() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  Object.defineProperty(BoxMesh.prototype, "start", {
    get: function get() {
      return this.transform.pos.sub(this.radius);
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(BoxMesh.prototype, "end", {
    get: function get() {
      return this.transform.pos.add(this.radius);
    },
    enumerable: false,
    configurable: true
  });

  BoxMesh.prototype.ClosestCorner = function (direction) {
    return this.transform.pos.add(this.radius.mul_parts(direction.fmap(Math.sign)));
  };

  return BoxMesh;
}(gameobject_1.Component);

exports.BoxMesh = BoxMesh;
},{"./gameobject":"gameobject.ts"}],"collision.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoxCollider = exports.Collision = void 0;

var box_1 = require("./box");

var gameobject_1 = require("./gameobject");

var Collision = function () {
  function Collision(other) {
    this.other = other;
  }

  return Collision;
}();

exports.Collision = Collision;

var BoxCollider = function (_super) {
  __extends(BoxCollider, _super);

  function BoxCollider() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  BoxCollider.prototype.collide = function (other) {
    if (this.box.start.x < other.box.end.x && this.box.end.x > other.box.start.x && this.box.start.y < other.box.end.y && this.box.end.y > other.box.start.y) {
      return new Collision(other);
    } else return null;
  };

  BoxCollider.prototype.Init = function () {
    this.box = this.gameObject.GetComponent(box_1.BoxMesh);
  };

  BoxCollider.prototype.slide = function (other, motion) {
    other.transform.pos.sub(motion.velocity);
    var my_corner = this.box.ClosestCorner(motion.velocity.neg()); //if vy = 0, this is left or right

    var their_corner = other.box.ClosestCorner(motion.velocity); //   vx = 0,         top or bottom

    var diff_corner = their_corner.sub(my_corner); //from mine to theirs

    if (motion.velocity.y === 0) {
      other.transform.pos.x -= diff_corner.x;
      motion.velocity.x = 0;
      return;
    } else if (motion.velocity.x === 0) {
      //change the y pos by the difference of terra top to player bottom
      other.transform.pos.y -= diff_corner.y;
      motion.velocity.y = 0;
      return;
    } //dcy + dcx*vy/vx = ydiff


    var use_y = Math.sign(diff_corner.y + diff_corner.x * motion.velocity.y / motion.velocity.x); // -1 = slide along |
    // 0 = corner
    // 1 = slide along -

    switch (use_y) {
      case 1:
        other.transform.pos.x += motion.velocity.x * this.gameObject.engine.dt / 1000;
        other.transform.pos.y -= diff_corner.y;
        motion.velocity.y = 0;
        break;

      case 0:
      case -1:
        console.log("wow");
        other.transform.pos.y += motion.velocity.y * this.gameObject.engine.dt / 1000;
        other.transform.pos.x -= diff_corner.x;
        motion.velocity.x = 0;
        break;
    }
  };

  return BoxCollider;
}(gameobject_1.Component);

exports.BoxCollider = BoxCollider;
},{"./box":"box.ts","./gameobject":"gameobject.ts"}],"debugbox.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoxRenderer = exports.DebugBox = void 0;

var box_1 = require("./box");

var gameobject_1 = require("./gameobject");

var vec_1 = require("./vec");

var DebugBox = function (_super) {
  __extends(DebugBox, _super);

  function DebugBox() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  DebugBox.prototype.Update = function (dt) {
    this.transform.pos = this.transform.pos.add(new vec_1.Vec(this.horiz.value, this.vert.value));
  };

  return DebugBox;
}(gameobject_1.Behaviour);

exports.DebugBox = DebugBox;

var BoxRenderer = function (_super) {
  __extends(BoxRenderer, _super);

  function BoxRenderer() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.fillStyle = "#00ff00";
    return _this;
  }

  BoxRenderer.prototype.Draw = function (dt, ctx) {
    ctx.fillStyle = this.fillStyle;
    var start = this.box.start;

    if (this.fillStyle === "#00ff00") {// console.log(start)
    }

    var dims = this.box.end.sub(start);
    ctx.fillRect(start.x, start.y, dims.x, dims.y);
  };

  BoxRenderer.prototype.Init = function () {
    this.box = this.gameObject.GetComponent(box_1.BoxMesh);
  };

  return BoxRenderer;
}(gameobject_1.RenderBehaviour);

exports.BoxRenderer = BoxRenderer;
},{"./box":"box.ts","./gameobject":"gameobject.ts","./vec":"vec.ts"}],"input.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyBind = exports.KeyBinder = exports.MaxBind = exports.TwoBind = exports.ConstBind = void 0;

var ConstBind = function () {
  function ConstBind(value) {
    this.value = value;
  }

  return ConstBind;
}();

exports.ConstBind = ConstBind;

var TwoBind = function () {
  function TwoBind(neg, pos) {
    this.value_pos = pos;
    this.value_neg = neg;
  }

  Object.defineProperty(TwoBind.prototype, "value", {
    get: function get() {
      return this.value_pos.value - this.value_neg.value;
    },
    enumerable: false,
    configurable: true
  });
  return TwoBind;
}();

exports.TwoBind = TwoBind;

var MaxBind = function () {
  function MaxBind() {}

  Object.defineProperty(MaxBind.prototype, "value", {
    get: function get() {
      var a = this.a.value;
      var b = this.b.value;
      return Math.abs(a) > Math.abs(b) ? a : b;
    },
    enumerable: false,
    configurable: true
  });
  return MaxBind;
}();

exports.MaxBind = MaxBind;

var KeyBinder = function () {
  function KeyBinder(e) {
    var _this = this;

    this.callbacks = new Map();
    e.addEventListener("keydown", function (event) {
      if (_this.callbacks.has(event.code)) _this.callbacks.get(event.code).forEach(function (x) {
        return x.down = true;
      });
    });
    e.addEventListener("keyup", function (event) {
      if (_this.callbacks.has(event.code)) _this.callbacks.get(event.code).forEach(function (x) {
        return x.down = false;
      });
    });
  }

  KeyBinder.prototype.bind = function (key) {
    var b = new KeyBind();

    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }

    this.callbacks.get(key).push(b);
    return b;
  };

  return KeyBinder;
}();

exports.KeyBinder = KeyBinder;

var KeyBind = function () {
  function KeyBind() {
    this.down = false;
  }

  Object.defineProperty(KeyBind.prototype, "value", {
    get: function get() {
      return this.down ? 1 : 0;
    },
    enumerable: false,
    configurable: true
  });
  return KeyBind;
}();

exports.KeyBind = KeyBind;
},{}],"inputman.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonMeasure = exports.VelocityMeasure = exports.Bindings = void 0;

var Bindings = function () {
  function Bindings() {}

  return Bindings;
}();

exports.Bindings = Bindings;

var VelocityMeasure = function () {
  function VelocityMeasure(v) {
    this.value = v;
  }

  VelocityMeasure.prototype.update = function (dt) {
    this.delta = dt;
    this.last = this.current;
    this.current = this.value();
    this.velocity = (this.current - this.last) / this.delta;
  };

  return VelocityMeasure;
}();

exports.VelocityMeasure = VelocityMeasure;

var ButtonMeasure = function () {
  function ButtonMeasure(v) {
    this.change = 0;
    this.changed = false;
    this.current = 0;
    this.last = 0;
    this.threshold = 0.5;
    this.value = v;
  }

  ButtonMeasure.prototype.update = function () {
    this.last = this.current;
    this.current = this.value(); //last=0,current=1
    //current-last=1

    if (Math.abs(this.current - this.last) > this.threshold) {
      this.change = this.current - this.last;
      this.changed = true;
    } else {
      this.change = 0;
      this.changed = false;
    }
  };

  return ButtonMeasure;
}();

exports.ButtonMeasure = ButtonMeasure;
},{}],"motion.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Motion = void 0;

var gameobject_1 = require("./gameobject");

var vec_1 = require("./vec");

var Motion = function (_super) {
  __extends(Motion, _super);

  function Motion() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.velocity = vec_1.Vec.zero; //pixels per second

    return _this;
  }

  Motion.prototype.Update = function (dt) {
    var dts = dt / 1000;
    this.transform.pos = this.transform.pos.add(this.velocity.fmap(function (x) {
      return x * dts;
    }));
  };

  Motion.prototype.Add = function (other) {
    this.velocity = this.velocity.add(other);
  };

  Motion.prototype.Set = function (x, y) {
    this.velocity = new vec_1.Vec(x !== null && x !== void 0 ? x : this.velocity.x, y !== null && y !== void 0 ? y : this.velocity.y);
  };

  return Motion;
}(gameobject_1.Behaviour);

exports.Motion = Motion;
},{"./gameobject":"gameobject.ts","./vec":"vec.ts"}],"player.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoxBody = exports.Player = void 0;

var collision_1 = require("./collision");

var debugbox_1 = require("./debugbox");

var gameobject_1 = require("./gameobject");

var inputman_1 = require("./inputman");

var motion_1 = require("./motion");

var vec_1 = require("./vec");

var Player = function (_super) {
  __extends(Player, _super);

  function Player() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.color = "#ff0000";
    return _this;
  }

  Player.prototype.Update = function (dt) {
    this.jbind.update();

    if (this.jbind.change == 1) {
      this.motion.Set(null, -10 * this.jbind.change * dt);
    }

    this.motion.velocity.x = 50 * this.hbind.value;
    this.motion.Add(new vec_1.Vec(0, 4));
  };

  Player.prototype.Init = function () {
    var _this = this;

    console.log("bruh");
    this.jbind = new inputman_1.ButtonMeasure(function () {
      return _this.gameObject.engine.bindings.jump.value;
    });
    this.hbind = this.gameObject.engine.bindings.horizontal;
    this.collider = this.gameObject.AddComponent(collision_1.BoxCollider);
    this.motion = this.gameObject.AddComponent(motion_1.Motion);
    var renderer = this.gameObject.AddComponent(debugbox_1.BoxRenderer);
    var body = this.gameObject.AddComponent(BoxBody);
    renderer.fillStyle = "#0000ff";
    console.log(this);
  };

  return Player;
}(gameobject_1.Behaviour);

exports.Player = Player;

var BoxBody = function (_super) {
  __extends(BoxBody, _super);

  function BoxBody() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  BoxBody.prototype.Update = function (dt) {
    var _this = this;

    var collided = false;
    this.gameObject.engine.gameObjects.filter(function (x) {
      return x.tag == "terrain";
    }).forEach(function (terra) {
      var t_coll = terra.GetComponent(collision_1.BoxCollider);

      if (t_coll.collide(_this.collider)) {
        collided = true;
        t_coll.slide(_this.collider, _this.motion);
      }
    });
  };

  BoxBody.prototype.Init = function () {
    this.motion = this.gameObject.GetComponent(motion_1.Motion);
    this.collider = this.gameObject.GetComponent(collision_1.BoxCollider);
  };

  return BoxBody;
}(gameobject_1.Behaviour);

exports.BoxBody = BoxBody;
},{"./collision":"collision.ts","./debugbox":"debugbox.ts","./gameobject":"gameobject.ts","./inputman":"inputman.ts","./motion":"motion.ts","./vec":"vec.ts"}],"engine.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Engine = void 0;

var box_1 = require("./box");

var collision_1 = require("./collision");

var debugbox_1 = require("./debugbox");

var gameobject_1 = require("./gameobject");

var input_1 = require("./input");

var player_1 = require("./player");

var vec_1 = require("./vec");

var Engine = function () {
  function Engine(canvas, bindings) {
    this.last_time = 0;
    this.cur_time = 0;
    this.dt = 0;
    this.gameObjects = [];
    this.bindings = bindings;
    this.ctx = canvas.getContext("2d");
  }

  Engine.prototype.Update = function (dt) {
    this.gameObjects.forEach(function (o) {
      o.components.forEach(function (c) {
        if (c instanceof gameobject_1.Behaviour) c.Update(dt);
        return true;
      });
    });
  };

  Engine.prototype.Draw = function (dt) {
    var _this = this;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.gameObjects.forEach(function (o) {
      o.components.forEach(function (c) {
        if (c instanceof gameobject_1.RenderBehaviour) c.Draw(dt, _this.ctx);
        return true;
      });
    });
  };

  Engine.prototype.Start = function () {
    this.gameObjects.forEach(function (o) {
      return o.components.forEach(function (c) {
        c.Start();
        return true;
      });
    });
    var eng = this;

    function upd(t) {
      eng.dt = t - eng.cur_time;
      eng.cur_time = t;
      eng.Update(eng.dt);
      eng.Draw(eng.dt);
      eng.af = window.requestAnimationFrame(upd);
    }

    this.af = window.requestAnimationFrame(upd);
  };

  Engine.prototype.Stop = function () {
    window.cancelAnimationFrame(this.af);
  };

  Engine.prototype.CreateGameObject = function () {
    var o = new gameobject_1.GameObject();
    o.engine = this;
    this.gameObjects.push(o);
    return o;
  };

  return Engine;
}();

exports.Engine = Engine;
var canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);
var keybinder = new input_1.KeyBinder(document.body);
var binds = {
  jump: keybinder.bind("Space"),
  horizontal: new input_1.TwoBind(keybinder.bind("ArrowLeft"), keybinder.bind("ArrowRight")),
  vertical: new input_1.TwoBind(keybinder.bind("ArrowUp"), keybinder.bind("ArrowDown")),
  shoot: keybinder.bind("KeyX"),
  reload: keybinder.bind("KeyC")
};
var engine = new Engine(canvas, binds);
{
  var player = engine.CreateGameObject();
  player.transform.pos = new vec_1.Vec(0, 60);
  player.ApplyComponent(box_1.BoxMesh, function (box) {
    box.radius = new vec_1.Vec(8, 8);
  });
  player.AddComponent(player_1.Player);
}
{
  var ground = engine.CreateGameObject();
  ground.transform.pos = new vec_1.Vec(640 / 2, 200);
  ground.ApplyComponent(box_1.BoxMesh, function (box) {
    box.radius = new vec_1.Vec(640 / 2, 20);
    console.log(box.start, box.end);
  });
  ground.AddComponent(collision_1.BoxCollider);
  ground.ApplyComponent(debugbox_1.BoxRenderer, function (renderer) {
    renderer.fillStyle = "#00ff00";
  });
  ground.tag = "terrain";
}
{
  var m_terrain = engine.CreateGameObject();
  m_terrain.transform.pos = new vec_1.Vec(640 / 2, 480 / 2);
  m_terrain.ApplyComponent(box_1.BoxMesh, function (box) {
    box.radius = new vec_1.Vec(32, 32);
  });
  m_terrain.AddComponent(collision_1.BoxCollider);
  m_terrain.ApplyComponent(debugbox_1.BoxRenderer, function (renderer) {
    renderer.fillStyle = "#ffff00";
  });
  m_terrain.ApplyComponent(debugbox_1.DebugBox, function (d_box) {
    d_box.horiz = new input_1.TwoBind(keybinder.bind("KeyJ"), keybinder.bind("KeyL"));
    d_box.vert = new input_1.TwoBind(keybinder.bind("KeyI"), keybinder.bind("KeyK"));
  });
  m_terrain.tag = "terrain";
}
engine.Start();
},{"./box":"box.ts","./collision":"collision.ts","./debugbox":"debugbox.ts","./gameobject":"gameobject.ts","./input":"input.ts","./player":"player.ts","./vec":"vec.ts"}],"../../../../usr/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "34367" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../usr/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","engine.ts"], null)
//# sourceMappingURL=/engine.53ffba88.js.map