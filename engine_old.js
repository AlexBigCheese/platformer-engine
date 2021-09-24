var chroma;
if (typeof process !== "undefined" && process.versions['node-webkit']) {
    chroma = require("chroma-js");
}
var pregame = {
  enemyTemplate: function (x,y,hp) {
    this.w = this.h = 16;
    this.hp = hp;
    this.maxhp = hp;
    this.x = x;
    this.y = y;
    this.gravity = false;
    this.spd = {
      x:0,
      y:0
    };
    this.cols = {
      up: {t:false,ent:{},geom:{}},
      down: {t:false,ent:{},geom:{}},
      left: {t:false,ent:{},geom:{}},
      right: {t:false,ent:{},geom:{}},
      middle: {trigger: {}, touch:false}
    };
    return this;
  },
  gwhst: function (text,font,padding) {
    var whs = {width:0,height:0,sigleHeight:0};
    var fontheight = parseInt(font);
    whs.singleHeight = fontheight;
    var tcanv = document.createElement("CANVAS");
    var tdraw = tcanv.getContext("2d");
    tdraw.font = font;
    var longestText = {
      text:"",
      size: 0
    };
    if (Array.isArray(text)) {
      for (var t = 0;t < text.length;t++) {
        if (tdraw.measureText(text[t]).width > longestText.size) {
          longestText.text = text[t];
          longestText.size = tdraw.measureText(text[t]).width;
        }
      }
      whs.height = (fontheight * text.length) + (padding * 2);
    }
    else if (typeof text === "string") {
      longestText.text = text;
      longestText.size = tdraw.measureText(text).width;
      whs.height = fontheight + (padding * 2);
    }
    whs.width = longestText.size + (padding * 2);
    return whs;
  },
  textboxTemplate: function (x,y,font,text,padding,fg,bg,enabled) {
    var pad = padding;
    var tempwhst = pregame.gwhst(text,font,pad);
    var textbox = {
      x:x,
      y:y,
      text: text,
      font: font,
      width: tempwhst.width,
      height: tempwhst.height,
      singleHeight: tempwhst.singleHeight,
      bg: bg,
      fg: fg,
      pad: pad,
      enabled: enabled
    };
    return textbox;
  },
  randomInt(min,max) {
    return Math.round(Math.random() * (max - min) + min);
  },
  flashingColors: {},
  colorFlash: {
    make(name,colora,colorb,time) {
      if (typeof pregame.flashingColors[name] === "undefined") {
        //btw, credit to chroma js lib
        pregame.flashingColors[name] = {
          colora: colora,
          colorb: colorb,
          currColor: "",
          time: time,
          frame: 0,
          minus: false,
          colorScale: chroma.scale([colora,colorb])
        };
      }
    },
    remove(name) {
      if (typeof pregame.flashingColors[name] !== "undefined") {
        delete pregame.flashingColors[name];
      }
    },
    retr(name) {
      return pregame.flashingColors[name].currColor;
    },
    update() {
      for (var color in pregame.flashingColors) {
        if (pregame.flashingColors.hasOwnProperty(color)) {
          if (pregame.flashingColors[color].frame > pregame.flashingColors[color].time) {
            pregame.flashingColors[color].minus = true;
            pregame.flashingColors[color].frame--;
          }
          else if (pregame.flashingColors[color].frame === -1) {
            pregame.flashingColors[color].minus = false
            pregame.flashingColors[color].frame++;
          }
          else if (pregame.flashingColors[color].minus) {
            pregame.flashingColors[color].frame--;
          }
          else if (!pregame.flashingColors[color].minus) {
            pregame.flashingColors[color].frame++;
          }
          pregame.flashingColors[color].currColor = pregame.flashingColors[color].colorScale(pregame.flashingColors[color].frame / pregame.flashingColors[color].time);
        }
      }
    }
  },
  rectTemplate(x1,y1,x2,y2,color) {
    this.type = "rect";
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.color = color;
    return this;
  }
};
var game = {
  screenfx:{
    hud: false,
  },
  keyboard: {
    id: 0,
    buttons: {
      a: {
        pressed: false,
        pressedlf: false
      },
      b: {
        pressed: false,
        pressedlf: false},
      x: {
        pressed: false,
        pressedlf: false},
      y: {
        pressed: false,
        pressedlf: false},
      l1: {
        pressed: false,
        pressedlf: false
      },
      r1: {
        pressed:false,
        pressedlf:false
      },
      select: {
        pressed:false,
        pressedlf:false
      },
      l2: {
        value: 0,
        pressed: false,
        pressedlf: false
      },
      r2: {
        value:0,
        pressed: false,
        pressedlf: false
      }
    },
    sticks: {
      l: {
        x: 0,
        y: 0,
        rot: 0,
        dist: 0
      },
      r: {
        x: 0,
        y: 0,
        rot: 0,
        dist: 0
      }
    },
    dpad: {
      u: {pressed: false, pressedlf: false},
      d: {pressed: false, pressedlf: false},
      l: {pressed: false, pressedlf: false},
      r: {pressed: false, pressedlf: false},
    },
    buttonsraw: [],
    axesraw: []
  },
  allowkbupdate: true,
  bulletTemplate: function (spdx2,spdy2,punch2 = false) {
    var spdx = spdx2;
    var spdy = spdy2;
    var punch = punch2
    var toReturn = {
      speeds:{
        x: spdx,
        y: spdy,
      },
      pos: {
        x: game.data.player.wep.x,
        y: game.data.player.wep.y
      },
      punch: punch,
      lifespan: 2,
    };
    return toReturn;
  },
  data: {
    flags: {},
    map: "start",
    get p() {
      return game.data.player;
    },
    player: {
      gravity:true,
      x: 0,
      y: 0,
      w: 16,
      h: 16,
      hp: 10,
      stamina: 1000,
      maxstam: 1000,
      stamTimeout:500,
      clip: 10,
      reloads: 10,
      floor: 0,
      still: true,
      cols: {middle: {touch: false,trigger: {}}},
      spd: {
        x: 0,
        y: 0,
      },
      forces:{
        gravity: false
      },
      mvs: {
        attack: false,
        attackTimeout: 0,
        jump: false,
        jumpTimeout: 0,
        jumps: 1,
        wallJump: false,
        wallJumpTimeout: 0,
        hang: false,
        reload: false,
        punch: false
      },
      wep: {
        get x() {return (game.gamepads[0].sticks.r.dist + 8) * Math.cos(game.gamepads[0].sticks.r.rot) + game.data.player.x;},
        get y() {return (game.gamepads[0].sticks.r.dist + 8) * Math.sin(game.gamepads[0].sticks.r.rot) + game.data.player.y;},
        show: false,
        bullets: [],
        bulletsMoving: true
      }
    }
  },
  options: {
    renderAnons: true,
  },
  rawpads: [],
  mouse: {
    x: 0,
    y: 0,
    get relX() {
      return game.mouse.x - game.data.player.x;
    },
    get relY() {
      return game.mouse.y - game.data.player.y;
    },
  rotation: function () {
    return Math.atan2(game.mouse.relY, game.mouse.relX);
  },
  distance: function() {
    return Math.sqrt(((game.mouse.relX * game.mouse.relX)) + ((game.mouse.relY * game.mouse.relY)));
  },
},
  gamepads: [
    {
      id: 0,
      buttons: {
        a: {
          pressed: false,
          pressedlf: false
        },
        b: {
          pressed: false,
          pressedlf: false},
        x: {
          pressed: false,
          pressedlf: false},
        y: {
          pressed: false,
          pressedlf: false},
        l1: {
          pressed: false,
          pressedlf: false
        },
        r1: {
          pressed:false,
          pressedlf:false
        },
        select: {
          pressed:false,
          pressedlf:false
        },
        l2: {
          value: 0,
          pressed: false,
          pressedlf: false
        },
        r2: {
          value:0,
          pressed: false,
          pressedlf: false
        }
      },
      sticks: {
        l: {
          x: 0,
          y: 0,
          rot: 0,
          dist: 0
        },
        r: {
          x: 0,
          y: 0,
          rot: 0,
          dist: 0
        }
      },
      dpad: {
        u: {pressed: false, pressedlf: false},
        d: {pressed: false, pressedlf: false},
        l: {pressed: false, pressedlf: false},
        r: {pressed: false, pressedlf: false},
      },
      buttonsraw: [],
      axesraw: []
    }
  ],
  get rp() {return game.renderpoints;},
  renderpoints: {
    mapScroll: {
      direction: "",
      offset:0,
      playeroffset:0,
      playerx: 0,
      playery: 0,
      to:"",
      enabled: false,
      start: true
    },
    anons: [

    ],
    background: {
      clouds: []
    },
    player: {
      rtype: "solid",
      color: "#fb0df3",
      get x() {return game.data.player.x;},
      get y() {return game.data.player.y;},
      width: 16,
      height: 16,
      weapon: {
        rtype: "solid",
        color: "#ebf0f5",
        get x() {return game.data.player.wep.x;},
        get y() {return game.data.player.wep.y;},
        width: 4,
        height: 4,
        get show() {return game.data.player.wep.show;},
      }
    },
    hud: {
      hptxt: {
        x:16,
        y:480 - 16,
        get color() {
          return "rgb(" + game.data.player.hp / 10 * 256 + ",0,0)";
        },
        get text() {
          return game.data.player.hp;
        },
        font: "20px Monospace"
      },
      cliptxt: {
        x: 360,
        y: 480 - 16,
        color: "#baf704",
        get text() {
          return game.data.player.clip;
        },
        font:"20px Monospace"
      },
      reloadstxt: {
        x: 480,
        y: 480 - 16,
        color: "#baf704",
        get text() {
          return game.data.player.reloads;
        },
        font:"20px Monospace"
      },
    },
    textbox: {
      x:0,
      y:0,
      text: "",
      font: "",
      width: 0,
      height: 0,
      singleHeight:0,
      bg: "",
      fg: "",
      pad: 0,
      enabled: false
    }
  },
  canv: {},
  draw: {},
  loadbtn: {},
  load(event) {
    let reader = new FileReader();
    reader.onload = function (event) {
      game.maps = JSON.parse(event.target.result);
    };
    reader.readAsText(event.target.files[0]);
  },
  ents: [
    {
      name:"spawnpoint",
      x:18,
      y:2,
      map: "start"
    },

  ],
  maps: {
    "start":{
      number: 1,
      name: "start",
      geoms: [
        {
          type: "rect",
          x1: 30,
          x2: 40,
          y1: 50,
          y2: 60,
          color: "#32b910"
        },
        {
          type: "rect",
          x1: 40,
          x2: 50,
          y1: 50,
          y2: 60,
          color: "#ec0849"
        },
        {
          type: "rect",
          x1: 0,
          x2: 640,
          y1: 464,
          y2: 480,
          color: "#55f107"
        }
      ],
      sides: {
        right: "jump over",
        left: "finish"
      },
      triggers: [
        {
          func: function () {
            game.renderpoints.textbox = pregame.textboxTemplate(game.data.player.x,game.data.player.y - 64,"12px Arial",["Hello, This is:","A GAME","that I havent named yet"],5,"#FFFFFF","rgba(100,100,100,0.8)",(game.data.map === "start"));
          },
          x1: 0,
          x2: 128,
          y1: 432,
          y2: 464
        },
        {
          func: function () {
            game.renderpoints.textbox = pregame.textboxTemplate(game.data.player.x,game.data.player.y - 64,"12px Arial",["Triggers are cool,","Right?"],5,"#FFFFFF","rgba(100,100,100,0.8)",(game.data.map === "start"));
          },
          x1: 129,
          x2: 193,
          y1: 432,
          y2: 464
        },
        {
          func: function () {
            game.maps.start.enemies.push(new pregame.enemyTemplate(16,450,10));
          },
          x1: 257,
          x2: 289,
          y1: 416,
          y2: 464,
          onetime:{
            on:true
          }
        }
      ],
      enemies: [
        new pregame.enemyTemplate(100,450,2),
        new pregame.enemyTemplate(64,450,6)
      ]
    },
    "jump over": {
      geoms: [
        {
          type:"rect",
          x1:0,
          x2:640,
          y1:464,
          y2:480,
          color:"#00FF00",
        },
        {
          type:"rect",
          x1:600,
          x2:616,
          y1:432,
          y2:464,
          color:"#00FF00",
        }

      ],
      triggers: [
        {
          func() {
            game.renderpoints.textbox = pregame.textboxTemplate(game.data.player.x - 64,game.data.player.y - 64,"12px Arial","Where are you going?",5,pregame.colorFlash.retr("warn"),"rgba(100,100,100,0.8)",(game.data.map === "jump over"));
          },
          x1:568,
          x2:640,
          y1:400,
          y2:464
        }
      ],
      enemies: [
        new pregame.enemyTemplate(64,456,10)
      ],
      sides: {
        left: "start",
        right: "start"
      }
    }
  },
  init:function () {
    pregame.colorFlash.make("warn","black","red","15");
    game.loadbtn = document.createElement("INPUT");
    game.loadbtn.setAttribute("type", "file");
    game.loadbtn.addEventListener("change", game.load);
    game.canv = document.createElement("CANVAS");
    game.canv.width = 640;
    game.canv.height = 480;
    game.canv.addEventListener("mousemove", function(event) {
      game.mouse.x = event.offsetX;
      game.mouse.y = event.offsetY;
    });
    game.canv.addEventListener("mousedown", function(event) {
      game.gamepads[0].buttons.r1.pressed = true;
    });
    game.canv.addEventListener("mouseup", function(event) {
      game.gamepads[0].buttons.r1.pressed = false;
    })
    document.body.appendChild(game.loadbtn);
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(game.canv);
    game.draw = game.canv.getContext("2d");
    game.makebg();
    document.body.addEventListener("keydown", function(ev) {

      switch (ev.key) {
        case "d":
          game.keyboard.dpad.r.pressed = true;
          break;
        case "a":
          game.keyboard.dpad.l.pressed = true;
          break;
        case "w":
          game.keyboard.dpad.u.pressed = true;
          break;
        case "s":
          game.keyboard.dpad.d.pressed = true;
          break;
        case "e":
          game.keyboard.buttons.y.pressed = true;
          break;
        case " ":
          game.keyboard.buttons.a.pressed = true;
          break;
        case "f":
          game.keyboard.buttons.l1.pressed = true;
          break;
        case "shift":
          game.keyboard.buttons.b.pressed = true;
          break;
        default:
          return;
          break;
      }
      ev.preventDefault();
    }, true);
    document.body.addEventListener("keyup", function(ev) {
      switch (ev.key.toLowerCase()) {
        case "d":
          game.keyboard.dpad.r.pressed = false;
          break;
        case "a":
          game.keyboard.dpad.l.pressed = false;
          break;
        case "w":
          game.keyboard.dpad.u.pressed = false;
          break;
        case "s":
          game.keyboard.dpad.d.pressed = false;
          break;
        case " ":
          game.keyboard.buttons.a.pressed = false;
          break;
        case "f":
          game.keyboard.buttons.l1.pressed = false;
          break;
        case "shift":
          game.keyboard.buttons.b.pressed = false;
          break;
      }
      ev.preventDefault();
    }, true);
    window.requestAnimationFrame(game.loop);
  },
  loop:function () {
    pregame.colorFlash.update();
    game.updateGamepads();
    game.updateColls();
    game.update();
    game.render();
    window.requestAnimationFrame(game.loop);
  },
  makebg:function() {
    //clouds
    game.renderpoints.background.clouds = [];
    var cloudcount = pregame.randomInt(0,10);
    for (var cloudnum = 0;cloudnum < cloudcount;cloudnum++) {
      var tempw = pregame.randomInt(10,64);
      game.renderpoints.background.clouds.push({
        x:pregame.randomInt(0,640),
        y:pregame.randomInt(0,100),
        w:tempw,
        h:pregame.randomInt(10,tempw)
      });
    }
  },
  makebgx2() {
    //clouds
    game.renderpoints.background.clouds = [];
    var cloudcount = pregame.randomInt(0,10);
    for (var cloudnum = 0;cloudnum < cloudcount;cloudnum++) {
      var tempw = pregame.randomInt(10,64);
      game.renderpoints.background.clouds.push({
        x:pregame.randomInt(2,game.canv.width * 2),
        y:pregame.randomInt(0,100),
        w:tempw,
        h:pregame.randomInt(10,tempw)
      });
    }
  },
  updateColls: function () {
    var colObj = {
      up: {t:false,ent:{},geom:{}},
      down: {t:false,ent:{},geom:{}},
      left: {t:false,ent:{},geom:{}},
      right: {t:false,ent:{},geom:{}},
      middle: {trigger: {}, touch:false,tnum:0},
      all:{
        up: {t:false,ent:{},geom:{}},
        down: {t:false,ent:{},geom:{}},
        left: {t:false,ent:{},geom:{}},
        right: {t:false,ent:{},geom:{}},
      }
    };
    var gdp = game.data.player;
    var colLocs = {
      m: {x:gdp.x ,y: gdp.y},
      u: {x:[gdp.x - gdp.w / 2,gdp.x + gdp.w / 2],y: gdp.y - gdp.h / 2 - 1},
      d: {x:[gdp.x - gdp.w / 2,gdp.x + gdp.w / 2],y: gdp.y + gdp.h / 2 + 1},
      l: {x:gdp.x - gdp.w / 2 - 1,y:[gdp.y - gdp.h / 2, gdp.y + gdp.h / 2]},
      r: {x:gdp.x + gdp.w / 2 + 1,y:[gdp.y - gdp.h / 2, gdp.y + gdp.h / 2]},
    };
    var currMap = game.maps[game.data.map];
    if (Array.isArray(currMap.triggers)) {
      for (var trign = 0;trign < currMap.triggers.length;trign++) {
        var trig = currMap.triggers[trign];
        if ((colLocs.m.x > trig.x1) && (colLocs.m.x < trig.x2) && (colLocs.m.y > trig.y1) && (colLocs.m.y < trig.y2)) {
          colObj.middle.touch = true;
          colObj.middle.trigger = currMap.triggers[trign];
          colObj.middle.tnum = trign;
        }
      }
    }

    for (var geomno = 0;geomno < currMap.geoms.length;geomno++) {
      var simpleGeom = currMap.geoms[geomno];
      if (simpleGeom.type === "rect") {
        if ((colLocs.u.x.some(ux => (ux > simpleGeom.x1) && (ux < simpleGeom.x2))) && ((colLocs.u.y > simpleGeom.y1) && (colLocs.u.y < simpleGeom.y2))) {
          colObj.up.t = true;
        }
        if ((colLocs.d.x.some(dx => (dx > simpleGeom.x1) && (dx < simpleGeom.x2))) && ((colLocs.d.y > simpleGeom.y1) && (colLocs.d.y < simpleGeom.y2))) {
          colObj.down.t = true;
        }
        if (((colLocs.l.x > simpleGeom.x1) && (colLocs.l.x < simpleGeom.x2)) && (colLocs.l.y.some(lx => (lx > simpleGeom.y1) && (lx < simpleGeom.y2)))) {
          colObj.left.t = true;
        }
        if (((colLocs.r.x > simpleGeom.x1) && (colLocs.r.x < simpleGeom.x2)) && (colLocs.r.y.some(rx => (rx > simpleGeom.y1) && (rx < simpleGeom.y2)))) {
          colObj.right.t = true;
        }
        //all (every)
        if ((colLocs.u.x.every(ux => (ux > simpleGeom.x1) && (ux < simpleGeom.x2))) && ((colLocs.u.y > simpleGeom.y1) && (colLocs.u.y < simpleGeom.y2))) {
          colObj.all.up.t = true;
        }
        if ((colLocs.d.x.every(dx => (dx > simpleGeom.x1) && (dx < simpleGeom.x2))) && ((colLocs.d.y > simpleGeom.y1) && (colLocs.d.y < simpleGeom.y2))) {
          colObj.all.down.t = true;
        }
        if (((colLocs.l.x > simpleGeom.x1) && (colLocs.l.x < simpleGeom.x2)) && (colLocs.l.y.every(lx => (lx > simpleGeom.y1) && (lx < simpleGeom.y2)))) {
          colObj.all.left.t = true;
        }
        if (((colLocs.r.x > simpleGeom.x1) && (colLocs.r.x < simpleGeom.x2)) && (colLocs.r.y.every(rx => (rx > simpleGeom.y1) && (rx < simpleGeom.y2)))) {
          colObj.all.right.t = true;
        }
      }
    }
    if ("enemies" in currMap) {
      for (var enemyno = 0;enemyno < currMap.enemies.length;enemyno++) {
        var enemyColLocs = {
          m: {x:currMap.enemies[enemyno].x ,y: currMap.enemies[enemyno].y},
          u: {x:[currMap.enemies[enemyno].x - currMap.enemies[enemyno].w / 2,currMap.enemies[enemyno].x + currMap.enemies[enemyno].w / 2],y: currMap.enemies[enemyno].y - currMap.enemies[enemyno].h / 2 - 1},
          d: {x:[currMap.enemies[enemyno].x - (currMap.enemies[enemyno].w / 2),currMap.enemies[enemyno].x + (currMap.enemies[enemyno].w / 2)],y: currMap.enemies[enemyno].y + currMap.enemies[enemyno].h / 2 + 1},
          l: {x:currMap.enemies[enemyno].x - currMap.enemies[enemyno].w / 2 - 1,y:[currMap.enemies[enemyno].y - currMap.enemies[enemyno].h / 2, currMap.enemies[enemyno].y + currMap.enemies[enemyno].h / 2]},
          r: {x:currMap.enemies[enemyno].x + currMap.enemies[enemyno].w / 2 + 1,y:[currMap.enemies[enemyno].y - currMap.enemies[enemyno].h / 2, currMap.enemies[enemyno].y + currMap.enemies[enemyno].h / 2]},
        };
        var enemyColObj = {
          up: {t:false,ent:{},geom:{}},
          down: {t:false,ent:{},geom:{}},
          left: {t:false,ent:{},geom:{}},
          right: {t:false,ent:{},geom:{}},
          middle: {trigger: {}, touch:false}
        };
        for (var geomno = 0;geomno < currMap.geoms.length;geomno++) {
          var simpleGeom = currMap.geoms[geomno];
          if (simpleGeom.type === "rect") {
            if ((enemyColLocs.u.x.some(ux => (ux > simpleGeom.x1) && (ux < simpleGeom.x2))) && ((enemyColLocs.u.y > simpleGeom.y1) && (enemyColLocs.u.y < simpleGeom.y2))) {
              enemyColObj.up.t = true;
            }
            if ((enemyColLocs.d.x.some(dx => (dx > simpleGeom.x1) && (dx < simpleGeom.x2))) && ((enemyColLocs.d.y > simpleGeom.y1) && (enemyColLocs.d.y < simpleGeom.y2))) {
              enemyColObj.down.t = true;
            }
            if (((enemyColLocs.l.x > simpleGeom.x1) && (enemyColLocs.l.x < simpleGeom.x2)) && (enemyColLocs.l.y.some(lx => (lx > simpleGeom.y1) && (lx < simpleGeom.y2)))) {
              enemyColObj.left.t = true;
            }
            if (((enemyColLocs.r.x > simpleGeom.x1) && (enemyColLocs.r.x < simpleGeom.x2)) && (enemyColLocs.r.y.some(rx => (rx > simpleGeom.y1) && (rx < simpleGeom.y2)))) {
              enemyColObj.right.t = true;
            }
          }
        }
        game.maps[game.data.map].enemies[enemyno].cols = enemyColObj;
      }
    }

    game.data.player.cols = colObj;
  },
  update:function () {
    //remove previous textbox
    game.renderpoints.textbox = {
      x:0,
      y:0,
      text: "",
      font: "",
      width: 0,
      height: 0,
      singleHeight:0,
      bg: "",
      fg: "",
      pad: 0,
      enabled: false
    };
    //if mapscroll then STOP (return)!
    if (game.rp.mapScroll.enabled) return;
    //else,
    //controlls stuff
    if ((game.gamepads[0].sticks.l.x > 0.5) || (game.gamepads[0].sticks.l.x< -0.5) || (game.gamepads[0].sticks.l.y > 0.5) || (game.gamepads[0].sticks.l.y < -0.5)) {
      game.data.player.spd.x += game.gamepads[0].sticks.l.x;
      if (game.gamepads[0].buttons.b.pressed) {
        game.data.player.spd.x += game.gamepads[0].sticks.l.x * 2;
      }
    }
    if (game.gamepads[0].dpad.r.pressed) {game.data.player.spd.x += 1;}
    if (game.gamepads[0].dpad.l.pressed) {game.data.player.spd.x -= 1;}
    if ((game.gamepads[0].dpad.r.pressed) && (game.gamepads[0].buttons.b.pressed)) {game.data.player.x += 2;}
    if ((game.gamepads[0].dpad.l.pressed) && (game.gamepads[0].buttons.b.pressed)) {game.data.player.x -= 2;}
    if (game.gamepads[0].sticks.r.dist < 0.5) {game.data.player.wep.show = false;}
    else {game.data.player.wep.show = true;}
    if (game.data.player.mvs.attacking) {
      game.data.player.mvs.attackTimeout = 1;
      game.data.player.mvs.attacking = false;
    }
    if (game.data.player.mvs.attackTimeout > 0) {game.data.player.mvs.attackTimeout -= 0.1;}
    if ((game.gamepads[0].buttons.r1.pressed) && (!(game.gamepads[0].buttons.r1.pressedlf))) {
      game.data.player.mvs.attacking = true;
    }
    if (game.gamepads[0].buttons.l1.pressed) {game.screenfx.hud = true;}
    else {game.screenfx.hud = false;}
    if ((game.gamepads[0].buttons.r1.pressed) && (!game.gamepads[0].buttons.r1.pressedlf)) {
      game.data.player.mvs.attacking = true;
    }
    if ((game.gamepads[0].buttons.r2.pressed) && (!game.gamepads[0].buttons.r2.pressedlf)) {game.data.player.mvs.punch = true;}
    if ((game.gamepads[0].buttons.select.pressed) && (!game.gamepads[0].buttons.select.pressedlf)) {
      game.data.player.mvs.reloading = true;
    }
    if ((game.gamepads[0].buttons.a.pressed) && (!game.gamepads[0].buttons.a.pressedlf)) {
      game.data.player.mvs.jump = true;
    }
    if (game.gamepads[0].buttons.l1.pressed && !game.gamepads[0].buttons.l1.pressedlf) {
      switch (game.data.player.wep.bulletsMoving) {
        case true:
          game.data.player.wep.bulletsMoving = false;
          break;
        case false:
          game.data.player.wep.bulletsMoving = true;
          break;
      }
    }
    //player data < == > things

    if (game.data.player.hp <= 0) {
      game.data.player.hp = 10;
    }
    if ((game.gamepads[0].sticks.l.x < 0.5) && (game.gamepads[0].sticks.l.x > -0.5) && (game.data.player.spd.x > 0)) {
      game.data.player.spd.x -= 1;
    }
    else if ((game.gamepads[0].sticks.l.x > -0.5) && (game.gamepads[0].sticks.l.x < 0.5) && (game.data.player.spd.x < 0)) {
      game.data.player.spd.x += 1;
    }
    if (!game.gamepads[0].buttons.b.pressed) {
      if (game.data.player.spd.x >= 5) {
        game.data.player.spd.x = 5;
      }
      if (game.data.player.spd.x <= -5) {
        game.data.player.spd.x = -5;
      }
    }
    else {
      if (game.data.player.spd.x >= 10) {
        game.data.player.spd.x = 10;
      }
      if (game.data.player.spd.x <= -10) {
        game.data.player.spd.x = -10;
      }
    }
    if (game.data.player.spd.y <= -10) {
      game.data.player.spd.y = -10;
    }
    if (!game.gamepads[0].buttons.a.pressed) {
      if (game.data.player.spd.y >= 10) {
        game.data.player.spd.y = 10;
      }
    }
    else {
      if (game.data.player.spd.y >= 2) {
        game.data.player.spd.y = 2;
      }
    }
    if (game.data.player.x > game.canv.width) {
      if ("right" in game.maps[game.data.map].sides) {
        if (game.maps[game.data.map].sides.right !== "finish") {
          game.renderpoints.mapScroll.enabled = true;
          game.renderpoints.mapScroll.direction = "right";
          game.data.player.x = 0;
        }
        else {
          window.close();
        }
      }
      else {
        game.data.player.x = game.canv.width
      }
    }
    if (game.data.player.x < 0) {
      if ("left" in game.maps[game.data.map].sides) {
        if (game.maps[game.data.map].sides.left !== "finish") {
          game.renderpoints.mapScroll.enabled = true;
          game.renderpoints.mapScroll.direction = "left";
          game.data.player.x = game.canv.width;
        }
        else {
          window.close();
        }
      }
      else {
        game.data.player.x = 2;
      }

    }

    //collisions stuff?
    //textboxtriggers (remember to push to github)
    if ((game.data.player.cols.middle.touch === true) && (game.data.player.cols.middle.trigger.type === "textbox")) {
      //step 1: gwhst text,font,padding
      let gwhst = pregame.gwhst(game.data.player.cols.middle.trigger.textbox.text,game.data.player.cols.middle.trigger.textbox.font, 5);
      //step 2: create the textbox and put into renderpoints x,y,font,text,padding,fg,bg,enabled
      if (game.data.player.cols.middle.trigger.textbox.location === "RelativeMinusHalf") {
        alert(gwhst.width + " x " + gwhst.height);
        game.renderpoints.textbox = pregame.textboxTemplate(game.data.player.x - (gwhst.width / 2), game.data.player.y - (gwhst.height + game.data.player.height), game.data.player.cols.middle.trigger.textbox.font, game.data.player.cols.middle.trigger.textbox.text, 5, game.data.player.cols.middle.trigger.textbox.fg, game.data.player.cols.middle.trigger.textbox.bg, true);
      }
    }
    else if ((game.data.player.cols.middle.touch === true) && (typeof game.data.player.cols.middle.trigger.onetime !== "undefined")) {
      if (game.data.player.cols.middle.trigger.onetime.on === true) {
        game.maps[game.data.map].triggers[game.data.player.cols.middle.tnum].onetime.on = !game.data.player.cols.middle.trigger.onetime.on;
        game.data.player.cols.middle.trigger.func();
      }
    }
    else if (game.data.player.cols.middle.touch === true) {game.data.player.cols.middle.trigger.func();}
    game.data.player.gravity = true;
    if ((game.data.player.cols.all.left.t) && (game.data.player.spd.x < 0)) {
      game.data.player.spd.x = 0;
    }
    if ((game.data.player.cols.all.right.t) && (game.data.player.spd.x > 0)) {
      game.data.player.spd.x = 0;
    }
    if ((game.data.player.cols.up.t) && (game.data.player.spd.y < 0)) {
      game.data.player.spd.y = 0;
    }
    if ((game.data.player.cols.down.t) && (game.data.player.spd.y > 0)) {
      game.data.player.spd.y = -0.1;
    }
    if (game.data.player.cols.down.t) {
      game.data.player.gravity = false;
      game.data.player.mvs.jumps = 1;
    }

    //change speeds
    if (game.data.player.gravity) {
      game.data.player.spd.y++
    }

    //actions stuff
    if (game.data.player.mvs.attacking && (game.data.player.clip !== 0) && game.data.player.wep.show) {
      game.data.player.clip--;
      game.data.player.wep.bullets.push(game.bulletTemplate(game.gamepads[0].sticks.r.x * 4,game.gamepads[0].sticks.r.y * 4));
      game.data.player.mvs.attacking = false;
    }
    if (game.data.player.mvs.punch && game.data.player.wep.show) {
      game.data.player.wep.bullets.push(game.bulletTemplate(game.gamepads[0].sticks.r.x * 4,game.gamepads[0].sticks.r.y * 4,true));
      game.data.player.mvs.punch = false;
    }
    if (game.data.player.mvs.reloading && (game.data.player.reloads !== 0)) {
      game.data.player.clip = 20;
      game.data.player.reloads--;
      game.data.player.mvs.reloading = false;
    }
    if ((game.data.player.mvs.jump) && (game.data.player.mvs.jumps !== 0)) {
      game.data.player.spd.y -= 10;
      game.data.player.mvs.jumps--;
      game.data.player.mvs.jump = false;
    }
    //bullets be moving and lifespan down if punch
    for (var bulletno = 0;bulletno < game.data.player.wep.bullets.length;bulletno++) {
      if (typeof game.data.player.wep.bullets[bulletno] !== "undefined") {
        if (typeof game.data.player.wep.bullets[bulletno].pos !== "undefined") {
          if (game.data.player.wep.bulletsMoving){
            game.data.player.wep.bullets[bulletno].pos.x += game.data.player.wep.bullets[bulletno].speeds.x;
            game.data.player.wep.bullets[bulletno].pos.y += game.data.player.wep.bullets[bulletno].speeds.y;
          }
          if ((game.data.player.wep.bullets[bulletno].punch) && (typeof game.data.player.wep.bullets[bulletno].lifespan !== "undefined")) {
            game.data.player.wep.bullets[bulletno].lifespan--;
          }
        }
      }
    }

    //kill bullets if touch geom or life none
    for (var geomno = 0;geomno < game.maps[game.data.map].geoms.length;geomno++) {
      var simpleGeom = game.maps[game.data.map].geoms[geomno];
      for (var bulletno = game.data.player.wep.bullets.length - 1;bulletno >= 0;bulletno--) {
        if (typeof game.data.player.wep.bullets[bulletno] !== "undefined") {
          if (simpleGeom.type === "rect") {
            if (((game.data.player.wep.bullets[bulletno].pos.x > simpleGeom.x1) && (game.data.player.wep.bullets[bulletno].pos.x < simpleGeom.x2)) && ((game.data.player.wep.bullets[bulletno].pos.y > simpleGeom.y1) && (game.data.player.wep.bullets[bulletno].pos.y < simpleGeom.y2))) {
              game.data.player.wep.bullets.splice(bulletno, 1);
              continue;
            }
          }
          if (game.data.player.wep.bullets[bulletno].lifespan === 0) {
            game.data.player.wep.bullets.splice(bulletno, 1);
          }
        }

      }

    }

    //speedstuff
    game.data.player.x += game.data.player.spd.x;
    game.data.player.y += game.data.player.spd.y;

    //enemyupdate
    if ("enemies" in game.maps[game.data.map]) {
      for (var enemyno = game.maps[game.data.map].enemies.length - 1;enemyno >= 0;enemyno--){
        var simpleEnemy = game.maps[game.data.map].enemies[enemyno];
        //colls
        game.maps[game.data.map].enemies[enemyno].gravity = !game.maps[game.data.map].enemies[enemyno].cols.down.t;

        simpleEnemy = game.maps[game.data.map].enemies[enemyno];
        //speedchange
        if (game.maps[game.data.map].enemies[enemyno].gravity) {
          game.maps[game.data.map].enemies[enemyno].spd.y++;
        }
        if ((game.maps[game.data.map].enemies[enemyno].spd.y > 0) && (!game.maps[game.data.map].enemies[enemyno].gravity)) {game.maps[game.data.map].enemies[enemyno].spd.y = -0.1;}
        simpleEnemy = game.maps[game.data.map].enemies[enemyno];
        //movement
        game.maps[game.data.map].enemies[enemyno].x += game.maps[game.data.map].enemies[enemyno].spd.x;
        game.maps[game.data.map].enemies[enemyno].y += game.maps[game.data.map].enemies[enemyno].spd.y;
        //hp-1 if touch bullet and bullet die as well
        for (var bulletno = game.data.player.wep.bullets.length - 1;bulletno >= 0;bulletno--) {
          if ((typeof game.data.player.wep.bullets[bulletno] !== "undefined") && (typeof game.maps[game.data.map].enemies[enemyno] !== "undefined")) {
            if (((game.data.player.wep.bullets[bulletno].pos.x > (game.maps[game.data.map].enemies[enemyno].x - 8)) && (game.data.player.wep.bullets[bulletno].pos.x < game.maps[game.data.map].enemies[enemyno].x + 8)) && ((game.data.player.wep.bullets[bulletno].pos.y > game.maps[game.data.map].enemies[enemyno].y - 8) && (game.data.player.wep.bullets[bulletno].pos.y < game.maps[game.data.map].enemies[enemyno].y + 8))) {
              game.data.player.wep.bullets.splice(bulletno, 1);
              game.maps[game.data.map].enemies[enemyno].hp--;
            }
          }
        }


        //die if hp === 0;

        if (game.maps[game.data.map].enemies[enemyno].hp === 0) {
          game.maps[game.data.map].enemies.splice(enemyno, 1);
        }
      }
    }

  },
  updateGamepads:function () {
    game.rawpads = navigator.getGamepads();

    for (gpn = 0; gpn < game.rawpads.length; gpn++) {
      if (typeof game.rawpads[gpn] !== 'undefined' && gamepad.rawpads[gpn] !== null) {
        if (game.gamepads[gpn].buttons.l1.pressed) {game.gamepads[gpn].buttons.l1.pressedlf = true;}
        else {game.gamepads[gpn].buttons.l1.pressedlf = false;}
        if (game.gamepads[gpn].buttons.r1.pressed) {game.gamepads[gpn].buttons.r1.pressedlf = true;}
        else {game.gamepads[gpn].buttons.r1.pressedlf = false;}
        if (game.gamepads[gpn].buttons.a.pressed) {game.gamepads[gpn].buttons.a.pressedlf = true;}
        else {game.gamepads[gpn].buttons.a.pressedlf = false;}
        game.gamepads[gpn].buttons.x.pressedlf = game.rawpads[gpn].buttons[2].pressed;
        game.gamepads[gpn].buttons.select.pressedlf = game.gamepads[gpn].buttons.select.pressed;
        game.gamepads[gpn].buttons.y.pressedlf = game.gamepads[gpn].buttons.y.pressed;
        game.gamepads[gpn].buttons.l2.pressedlf = game.gamepads[gpn].buttons.l2.pressed;
        game.gamepads[gpn].buttons.r2.pressedlf = game.gamepads[gpn].buttons.r2.pressed;
        game.gamepads[gpn].buttons.a.pressed = game.rawpads[gpn].buttons[0].pressed;
        game.gamepads[gpn].buttons.x.pressed = game.rawpads[gpn].buttons[2].pressed;
        game.gamepads[gpn].buttons.b.pressed = game.rawpads[gpn].buttons[1].pressed;
        game.gamepads[gpn].buttons.y.pressed = game.rawpads[gpn].buttons[3].pressed;
        game.gamepads[gpn].sticks.l.x = game.rawpads[gpn].axes[0];
        game.gamepads[gpn].sticks.l.y = game.rawpads[gpn].axes[1];
        game.gamepads[gpn].sticks.r.x = game.rawpads[gpn].axes[2];
        game.gamepads[gpn].sticks.r.y = game.rawpads[gpn].axes[3];
        game.gamepads[gpn].sticks.l.rot = (Math.atan2(game.gamepads[gpn].sticks.l.x, game.gamepads[gpn].sticks.l.y) * -1) + Math.PI / 2;
        game.gamepads[gpn].sticks.r.rot = (Math.atan2(game.gamepads[gpn].sticks.r.x, game.gamepads[gpn].sticks.r.y) * -1) + Math.PI / 2;
        game.gamepads[gpn].sticks.l.dist = Math.sqrt(Math.pow(game.gamepads[gpn].sticks.l.x, 2) + Math.pow(game.gamepads[gpn].sticks.l.y, 2));
        if (game.gamepads[gpn].sticks.l.dist > 1) {
          game.gamepads[gpn].sticks.l.dist = 1;
        }
        game.gamepads[gpn].sticks.r.dist = Math.sqrt(Math.pow(game.gamepads[gpn].sticks.r.x, 2) + Math.pow(game.gamepads[gpn].sticks.r.y, 2));
        if (game.gamepads[gpn].sticks.r.dist > 1) {
          game.gamepads[gpn].sticks.r.dist = 1;
        }
        game.gamepads[gpn].buttonsraw = game.rawpads[gpn].buttons;
        game.gamepads[gpn].axesraw = game.rawpads[gpn].axes;
        game.gamepads[gpn].dpad.u.pressed = game.rawpads[gpn].buttons[12].pressed;
        game.gamepads[gpn].dpad.d.pressed = game.rawpads[gpn].buttons[13].pressed;
        game.gamepads[gpn].dpad.l.pressed = game.rawpads[gpn].buttons[14].pressed;
        game.gamepads[gpn].dpad.r.pressed = game.rawpads[gpn].buttons[15].pressed;
        game.gamepads[gpn].buttons.l1.pressed = game.rawpads[gpn].buttons[4].pressed;
        game.gamepads[gpn].buttons.r1.pressed = game.rawpads[gpn].buttons[5].pressed;
        // 6 -- 7
        game.gamepads[gpn].buttons.l2.value = game.rawpads[gpn].buttons[6].value;
        game.gamepads[gpn].buttons.r2.value = game.rawpads[gpn].buttons[7].value;
        game.gamepads[gpn].buttons.l2.pressed = game.gamepads[gpn].buttons.l2.value > 0.5;
        game.gamepads[gpn].buttons.r2.pressed = game.gamepads[gpn].buttons.r2.value > 0.5;
        game.gamepads[gpn].buttons.select.pressed = game.rawpads[gpn].buttons[8].pressed;
      }
    }

    if (typeof game.rawpads[0] === "undefined") {
      game.gamepads[0].sticks.r.rot = game.mouse.rotation();
      game.gamepads[0].sticks.r.dist = 1;
      if (game.gamepads[0].buttons.l1.pressed) {game.gamepads[0].buttons.l1.pressedlf = true;}
      else {game.gamepads[0].buttons.l1.pressedlf = false;}
      if (game.gamepads[0].buttons.a.pressed) {game.gamepads[0].buttons.a.pressedlf = true;}
      else {game.gamepads[0].buttons.a.pressedlf = false;}
      game.gamepads[0].buttons.x.pressedlf = game.gamepads[0].buttons.x.pressed;
      game.gamepads[0].buttons.select.pressedlf = game.gamepads[0].buttons.select.pressed;
      game.gamepads[0].buttons.y.pressedlf = game.gamepads[0].buttons.y.pressed;
      game.gamepads[0].buttons.l2.pressedlf = game.gamepads[0].buttons.l2.pressed;
      game.gamepads[0].buttons.r2.pressedlf = game.gamepads[0].buttons.r2.pressed;
      game.gamepads[0].dpad.u.pressed = game.keyboard.dpad.u.pressed;
      game.gamepads[0].dpad.d.pressed = game.keyboard.dpad.d.pressed;
      game.gamepads[0].dpad.l.pressed = game.keyboard.dpad.l.pressed;
      game.gamepads[0].dpad.r.pressed = game.keyboard.dpad.r.pressed;
      game.gamepads[0].buttons.a.pressed = game.keyboard.buttons.a.pressed;
      game.gamepads[0].buttons.l1.pressed = game.keyboard.buttons.l1.pressed;
    }
  },
  render: function () {
    game.draw.fillStyle = "#0ce4ff";
    game.draw.fillRect(0, 0, game.canv.width, game.canv.height);
    //render anonos
    if (game.options.renderAnons === true) {
      for (anon = 0; anon < game.renderpoints.anons.length; anon++) {
        var anono = game.renderpoints.anons[anon];
        game.draw.fillStyle = anono.drawData.color;
        if (anono.method === "circle") {
          game.draw.beginPath();
          game.draw.moveTo(anono.drawData.x, anono.drawData.y);
          game.draw.arc(anono.drawData.x,anono.drawData.y,anono.drawData.diam/2,0,2*Math.PI);
          game.draw.fill();
        }
        if (anono.method === "rect") {
          game.draw.fillRect(anono.drawData.x, anono.drawData.y, anono.drawData.w, anono.drawData.h);
        }
        if (anono.method === "text") {
          game.draw.font = anono.drawData.font;
          game.draw.fillText(anono.drawData.text, anono.drawData.x, anono.drawData.y);
        }
      }
    }
    if (game.rp.mapScroll.enabled) {
      if (game.rp.mapScroll.start) {
        game.makebgx2();
      }
      if (game.rp.mapScroll.direction === "right") {
        if (game.rp.mapScroll.start) {
          game.renderpoints.mapScroll.playerx = game.canv.width - 1;
          game.renderpoints.mapScroll.start = false;
        }
        //render both maps and offset
        //map before
        for (var geomno = 0;geomno < game.maps[game.data.map].geoms.length;geomno++) {
          var simpleGeom = game.maps[game.data.map].geoms[geomno];
          game.draw.fillStyle = simpleGeom.color;
          if (simpleGeom.type === "rect") {
            game.draw.fillRect(simpleGeom.x1 - game.rp.mapScroll.offset,simpleGeom.y1,simpleGeom.x2 - simpleGeom.x1,simpleGeom.y2 - simpleGeom.y1);
          }
        }
        //map after
        for (var geomno = 0;geomno < game.maps[game.maps[game.data.map].sides.right].geoms.length;geomno++) {
          var simpleGeom = game.maps[game.maps[game.data.map].sides.right].geoms[geomno];
          game.draw.fillStyle = simpleGeom.color;
          if (simpleGeom.type === "rect") {
            game.draw.fillRect((simpleGeom.x1 - game.rp.mapScroll.offset) + game.canv.width,simpleGeom.y1,simpleGeom.x2 - simpleGeom.x1,simpleGeom.y2 - simpleGeom.y1);
          }
        }
        //player transition and offsetting here
        game.draw.fillStyle = game.renderpoints.player.color;
        game.draw.fillRect((game.renderpoints.mapScroll.playerx - game.renderpoints.player.width / 2) - game.rp.mapScroll.playeroffset,game.renderpoints.player.y - game.renderpoints.player.height / 2,game.renderpoints.player.width,game.renderpoints.player.height);
        //enemies and hp and offsetting
        //current
        if ("enemies" in game.maps[game.data.map]) {
          for (let enemyno = 0;enemyno < game.maps[game.data.map].enemies.length;enemyno++) {
            game.draw.fillStyle = "#56090d";
            game.draw.fillRect((game.maps[game.data.map].enemies[enemyno].x - 8) - game.rp.mapScroll.offset, game.maps[game.data.map].enemies[enemyno].y - 8, 16, 16);
            game.draw.fillStyle = "#2a2840";
            game.draw.fillRect((game.maps[game.data.map].enemies[enemyno].x - 16) - game.rp.mapScroll.offset,game.maps[game.data.map].enemies[enemyno].y - 16,32,4);
            if (game.maps[game.data.map].enemies[enemyno].hp < game.maps[game.data.map].enemies[enemyno].maxhp / 2) {
              game.draw.fillStyle = "#f58905";
            }
            else if (game.maps[game.data.map].enemies[enemyno].hp === 1) {
              game.draw.fillStyle = pregame.colorFlash.retr("warn");
            }
            else {
              game.draw.fillStyle = "#0ee81c";
            }
            game.draw.fillRect((game.maps[game.data.map].enemies[enemyno].x - 15) - game.rp.mapScroll.offset,game.maps[game.data.map].enemies[enemyno].y - 15,(30 / game.maps[game.data.map].enemies[enemyno].maxhp) * game.maps[game.data.map].enemies[enemyno].hp,2)
          }
        }
        //after

        if ("enemies" in game.maps[game.maps[game.data.map].sides.right]) {
          for (let enemyno = 0;enemyno < game.maps[game.maps[game.data.map].sides.right].enemies.length;enemyno++) {
            //draw enemy
            game.draw.fillStyle = "#56090d";
            game.draw.fillRect(((game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].x - 8) - game.rp.mapScroll.offset) + game.canv.width, game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].y - 8, 16, 16);

            game.draw.fillStyle = "#2a2840";
            game.draw.fillRect(((game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].x - 16) - game.rp.mapScroll.offset) + game.canv.width,game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].y - 16,32,4);
            if (game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].hp < game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].maxhp / 2) {
              game.draw.fillStyle = "#f58905";
            }
            else if (game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].hp === 1) {
              game.draw.fillStyle = pregame.colorFlash.retr("warn");
            }
            else {
              game.draw.fillStyle = "#0ee81c";
            }
            game.draw.fillRect(((game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].x - 15) + game.canv.width) - game.rp.mapScroll.offset,game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].y - 15,(30 / game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].maxhp) * game.maps[game.maps[game.data.map].sides.right].enemies[enemyno].hp,2)
          }
        }
        //render clouds (and set next bg?)
        game.draw.fillStyle = "rgba(200,200,200,0.8)";
        for (var cloudnum = game.renderpoints.background.clouds.length - 1;cloudnum >= 0;cloudnum--) {
          var cloud = game.renderpoints.background.clouds[cloudnum];
          game.draw.fillRect(cloud.x - game.rp.mapScroll.offset,cloud.y,cloud.w,cloud.h);
          if (game.renderpoints.mapScroll.offset === game.canv.width) {
            if (cloud.x < game.canv.width) {
              game.renderpoints.background.clouds.splice(cloudnum,1);
            }
          }
        }
      }
      //left
      if (game.rp.mapScroll.direction === "left") {
        if (game.rp.mapScroll.start) {
          game.renderpoints.mapScroll.playerx = 1;
          game.renderpoints.mapScroll.start = false;
        }
        //render both maps and offset
        //map before
        for (var geomno = 0;geomno < game.maps[game.data.map].geoms.length;geomno++) {
          var simpleGeom = game.maps[game.data.map].geoms[geomno];
          game.draw.fillStyle = simpleGeom.color;
          if (simpleGeom.type === "rect") {
            game.draw.fillRect(simpleGeom.x1 + game.rp.mapScroll.offset,simpleGeom.y1,simpleGeom.x2 - simpleGeom.x1,simpleGeom.y2 - simpleGeom.y1);
          }
        }
        //map after
        for (var geomno = 0;geomno < game.maps[game.maps[game.data.map].sides.left].geoms.length;geomno++) {
          var simpleGeom = game.maps[game.maps[game.data.map].sides.left].geoms[geomno];
          game.draw.fillStyle = simpleGeom.color;
          if (simpleGeom.type === "rect") {
            game.draw.fillRect((simpleGeom.x1 + game.rp.mapScroll.offset) - game.canv.width,simpleGeom.y1,simpleGeom.x2 - simpleGeom.x1,simpleGeom.y2 - simpleGeom.y1);
          }
        }
        //player transition and offsetting
        game.draw.fillStyle = game.renderpoints.player.color;
        game.draw.fillRect((game.renderpoints.mapScroll.playerx - game.renderpoints.player.width / 2) + game.rp.mapScroll.playeroffset,game.renderpoints.player.y - game.renderpoints.player.height / 2,game.renderpoints.player.width,game.renderpoints.player.height);
        //enemies, hp and offsetting
        //current
        if ("enemies" in game.maps[game.data.map]) {
          for (var enemyno = 0;enemyno < game.maps[game.data.map].enemies.length;enemyno++) {
            game.draw.fillStyle = "#56090d";
            game.draw.fillRect((game.maps[game.data.map].enemies[enemyno].x - 8) + game.rp.mapScroll.offset, game.maps[game.data.map].enemies[enemyno].y - 8, 16, 16);
            game.draw.fillStyle = "#2a2840";
            game.draw.fillRect((game.maps[game.data.map].enemies[enemyno].x - 16) + game.rp.mapScroll.offset,game.maps[game.data.map].enemies[enemyno].y - 16,32,4);
            if (game.maps[game.data.map].enemies[enemyno].hp < game.maps[game.data.map].enemies[enemyno].maxhp / 2) {
              game.draw.fillStyle = "#f58905";
            }
            else if (game.maps[game.data.map].enemies[enemyno].hp === 1) {
              game.draw.fillStyle = pregame.colorFlash.retr("warn");
            }
            else {
              game.draw.fillStyle = "#0ee81c";
            }
            game.draw.fillRect((game.maps[game.data.map].enemies[enemyno].x - 15) + game.rp.mapScroll.offset,game.maps[game.data.map].enemies[enemyno].y - 15,(30 / game.maps[game.data.map].enemies[enemyno].maxhp) * game.maps[game.data.map].enemies[enemyno].hp,2)
          }
        }
        //after

        if ("enemies" in game.maps[game.maps[game.data.map].sides.left]) {
          for (let enemyno = 0;enemyno < game.maps[game.maps[game.data.map].sides.left].enemies.length;enemyno++) {
            //draw enemy
            game.draw.fillStyle = "#56090d";
            game.draw.fillRect(((game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].x - 8) + game.rp.mapScroll.offset) - game.canv.width, game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].y - 8, 16, 16);

            game.draw.fillStyle = "#2a2840";
            game.draw.fillRect(((game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].x - 16) + game.rp.mapScroll.offset) - game.canv.width,game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].y - 16,32,4);
            if (game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].hp < game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].maxhp / 2) {
              game.draw.fillStyle = "#f58905";
            }
            else if (game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].hp === 1) {
              game.draw.fillStyle = pregame.colorFlash.retr("warn");
            }
            else {
              game.draw.fillStyle = "#0ee81c";
            }
            game.draw.fillRect(((game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].x - 15) - game.canv.width) + game.rp.mapScroll.offset,game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].y - 15,(30 / game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].maxhp) * game.maps[game.maps[game.data.map].sides.left].enemies[enemyno].hp,2)
          }
        }

        //render clouds (and set next bg?)
        game.draw.fillStyle = "rgba(200,200,200,0.8)";
        for (var cloudnum = game.renderpoints.background.clouds.length - 1;cloudnum >= 0;cloudnum--) {
          var cloud = game.renderpoints.background.clouds[cloudnum];
          game.draw.fillRect(cloud.x + game.rp.mapScroll.offset,cloud.y,cloud.w,cloud.h);
          if (game.renderpoints.mapScroll.offset === game.canv.width) {
            if (cloud.x > game.canv.width) {
              game.renderpoints.background.clouds.splice(cloudnum,1);
            }
          }
        }

      }
      if (game.renderpoints.mapScroll.offset === game.canv.width) {
        game.renderpoints.mapScroll.enabled = false;
        game.renderpoints.mapScroll.offset = 0;
        game.renderpoints.mapScroll.playeroffset = 0;
        game.renderpoints.mapScroll.start = true;
        if (game.rp.mapScroll.direction === "right") game.data.map = game.maps[game.data.map].sides.right;
        if (game.rp.mapScroll.direction === "left") game.data.map = game.maps[game.data.map].sides.left;
      }
      else {game.renderpoints.mapScroll.offset += 10;game.renderpoints.mapScroll.playeroffset += 10;}
      //render bullets
      game.draw.fillStyle = "rgba(0,0,0,0.8)";
      for (var bulletno = 0;bulletno < game.data.player.wep.bullets.length;bulletno++) {
        if (typeof game.data.player.wep.bullets[bulletno].pos !== "undefined") {
          game.draw.fillRect(game.data.player.wep.bullets[bulletno].pos.x - 2, game.data.player.wep.bullets[bulletno].pos.y - 2, 4, 4);
        }
      }
      //render hud
      game.draw.fillStyle = "rgba(100,100,100,0.8)";
      game.draw.fillRect(8, 480 - 40, 100, 32);
      game.draw.fillRect(360 - 8, 480 - 40, 100, 32);
      game.draw.fillRect(480 - 8, 480 - 40, 100, 32);
      game.draw.fillStyle = game.renderpoints.hud.hptxt.color;
      game.draw.font = game.renderpoints.hud.hptxt.font;
      game.draw.fillText(game.renderpoints.hud.hptxt.text,game.renderpoints.hud.hptxt.x,game.renderpoints.hud.hptxt.y);
      game.draw.fillStyle = game.renderpoints.hud.cliptxt.color;
      game.draw.font = game.renderpoints.hud.cliptxt.font;
      game.draw.fillText(game.renderpoints.hud.cliptxt.text,game.renderpoints.hud.cliptxt.x,game.renderpoints.hud.cliptxt.y);
      game.draw.font = game.renderpoints.hud.reloadstxt.font;
      game.draw.fillText(game.renderpoints.hud.reloadstxt.text,game.renderpoints.hud.reloadstxt.x,game.renderpoints.hud.reloadstxt.y);
      return;
    }
    //render map
    //render geoms
    for (var geomno = 0;geomno < game.maps[game.data.map].geoms.length;geomno++) {
      var simpleGeom = game.maps[game.data.map].geoms[geomno];
      game.draw.fillStyle = simpleGeom.color;
      if (simpleGeom.type === "rect") {
        game.draw.fillRect(simpleGeom.x1,simpleGeom.y1,simpleGeom.x2 - simpleGeom.x1,simpleGeom.y2 - simpleGeom.y1);
      }
    }
    //render clouds and move them and if under view, tp to screen width
    game.draw.fillStyle = "rgba(200,200,200,0.8)";
    for (var cloudnum = 0;cloudnum < game.renderpoints.background.clouds.length;cloudnum++) {
      var cloud = game.renderpoints.background.clouds[cloudnum];
      game.draw.fillRect(cloud.x,cloud.y,cloud.w,cloud.h);
      game.renderpoints.background.clouds[cloudnum].x--;
      if ((game.renderpoints.background.clouds[cloudnum].x + game.renderpoints.background.clouds[cloudnum].w) < 0) game.renderpoints.background.clouds[cloudnum].x = game.canv.width
    }
    //render square which is player
    game.draw.fillStyle = game.renderpoints.player.color;
    game.draw.fillRect(game.renderpoints.player.x - game.renderpoints.player.width / 2,game.renderpoints.player.y - game.renderpoints.player.height / 2,game.renderpoints.player.width,game.renderpoints.player.height);
    //render your weapon if showing
    if (game.renderpoints.player.weapon.show) {
      game.draw.fillStyle = game.renderpoints.player.weapon.color;
      game.draw.fillRect(game.renderpoints.player.weapon.x - game.renderpoints.player.weapon.width / 2, game.renderpoints.player.weapon.y - game.renderpoints.player.weapon.height / 2, game.renderpoints.player.weapon.width, game.renderpoints.player.weapon.height);
    }
    //render enemies and their hp
    if ("enemies" in game.maps[game.data.map]) {
      for (var enemyno = 0;enemyno < game.maps[game.data.map].enemies.length;enemyno++) {
        game.draw.fillStyle = "#56090d";
        game.draw.fillRect(game.maps[game.data.map].enemies[enemyno].x - 8, game.maps[game.data.map].enemies[enemyno].y - 8, 16, 16);
        game.draw.fillStyle = "#2a2840";
        game.draw.fillRect(game.maps[game.data.map].enemies[enemyno].x - 16,game.maps[game.data.map].enemies[enemyno].y - 16,32,4);
        if (game.maps[game.data.map].enemies[enemyno].hp < game.maps[game.data.map].enemies[enemyno].maxhp / 2) {
          game.draw.fillStyle = "#f58905";
        }
        else if (game.maps[game.data.map].enemies[enemyno].hp === 1) {
          game.draw.fillStyle = pregame.colorFlash.retr("warn");
        }
        else {
          game.draw.fillStyle = "#0ee81c";
        }
        game.draw.fillRect(game.maps[game.data.map].enemies[enemyno].x - 15,game.maps[game.data.map].enemies[enemyno].y - 15,(30 / game.maps[game.data.map].enemies[enemyno].maxhp) * game.maps[game.data.map].enemies[enemyno].hp,2)
      }
    }

    //render bullets except if punch
    game.draw.fillStyle = "#000000";
    for (var bulletno = 0;bulletno < game.data.player.wep.bullets.length;bulletno++) {
      if ((typeof game.data.player.wep.bullets[bulletno].pos !== "undefined") && (!game.data.player.wep.bullets[bulletno].punch)) {
        game.draw.fillRect(game.data.player.wep.bullets[bulletno].pos.x - 2, game.data.player.wep.bullets[bulletno].pos.y - 2, 4, 4);
      }
    }
    //render hud.

    game.draw.fillStyle = "rgba(100,100,100,0.8)";
    game.draw.fillRect(8, 480 - 40, 100, 32);
    game.draw.fillRect(360 - 8, 480 - 40, 100, 32);
    game.draw.fillRect(480 - 8, 480 - 40, 100, 32);
    game.draw.fillStyle = game.renderpoints.hud.hptxt.color;
    game.draw.font = game.renderpoints.hud.hptxt.font;
    game.draw.fillText(game.renderpoints.hud.hptxt.text,game.renderpoints.hud.hptxt.x,game.renderpoints.hud.hptxt.y);
    game.draw.fillStyle = game.renderpoints.hud.cliptxt.color;
    game.draw.font = game.renderpoints.hud.cliptxt.font;
    game.draw.fillText(game.renderpoints.hud.cliptxt.text,game.renderpoints.hud.cliptxt.x,game.renderpoints.hud.cliptxt.y);
    game.draw.font = game.renderpoints.hud.reloadstxt.font;
    game.draw.fillText(game.renderpoints.hud.reloadstxt.text,game.renderpoints.hud.reloadstxt.x,game.renderpoints.hud.reloadstxt.y);

    //rendertextbox if enabled
    if (game.renderpoints.textbox.enabled) {
      var temptb = game.renderpoints.textbox;
      game.draw.fillStyle = temptb.bg;
      game.draw.fillRect(temptb.x,temptb.y,temptb.width,temptb.height);
      var startx = temptb.x + temptb.pad;
      var starty = temptb.y + temptb.pad;
      var curry = starty;
      game.draw.fillStyle = temptb.fg;
      game.draw.textBaseline = "hanging";
      game.draw.font = temptb.font;
      if (Array.isArray(temptb.text)) {
         for (var t = 0;t < temptb.text.length;t++) {
           curry = starty + (t * temptb.singleHeight);
           game.draw.fillText(temptb.text[t],startx,curry);
         }
      }
      if (typeof temptb.text === "string") {
        game.draw.fillText(temptb.text,startx,starty);
      }
    }
    game.draw.textBaseline = "alphabetic";
  }
};
game.init();
