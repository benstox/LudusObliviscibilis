var Tile = function(ch, col, col_dark, bg, bg_dark, x, y, walkable, transparent) {
    this.x = x;
    this.y = y;
    this.coords = this.x + '_' + this.y;
    this.ch = ch;
    this.col = col;
    this.col_dark = col_dark;
    this.bg = bg;
    this.bg_dark = bg_dark;
    this.walkable = walkable;
    this.transparent = transparent;
    this.blocked = false; // something is blocking the square, regardless of walkability
    this.explored = false;
    this.items = [];
    this.being = null;
    // tile_type is used to check for example if a square is a door (then moving onto it opens it, etc.)
    this.tile_type = null;
    this.message = null;
    // amount by which colour can vary
    this.colvar = 10;
    // this.colvar = 0;
    this.display_name = "a blank tile";
};
    

// find out if this tile is lit by a light source
Tile.prototype.isThisLit = function() {
    return(this.x + '_' + this.y in Game.map.lit_tiles);
};

// get a sentence saying what items are here on this tile
Tile.prototype.getDisplayItems = function() {
    var item_counts = getArrayItemCounts(this.items.map(function(x) {return([x.name, x.plural])}));
    var articled = Object.keys(item_counts).map(function(x) {
        if (item_counts[x] == 1 && startsWithVowel(x)) {
            // singular
            var quantity = "an";
            var name = x.split(",")[0];
        } else if (item_counts[x] == 1) {
            // singular
            var quantity = "a";
            var name = x.split(",")[0];
        } else {
            // plural
            var quantity = item_counts[x];
            var name = x.split(",")[1];
        };
        return(quantity + " " + name);
    });

    if (this.items.length == 0) {
        return("");
    } else if (this.items.length == 1) {
        return(capitalizeFirstLetter(articled[0]) + " is here.");
    } else {
        var last_item = articled.pop();
        var joined = articled.join(", ") + " and " + last_item + " are here.";
        return(capitalizeFirstLetter(joined));
    };
};

// string to display for this tile in the mouseover
Tile.prototype.getDisplayString = function() {
    var tile_name = capitalizeFirstLetter(this.display_name) + ".";
    var coords = "(" + this.x + ", " + this.y + ")";
    var display = [coords, tile_name];
    if (this.being) {
        display.push(capitalizeFirstLetter(this.being.name) + " is here.");
    };
    if (this.items.length != 0) {
        display.push(this.getDisplayItems());
    };
    var display_string = display.join(" ");
    return(display_string);
};

// draw the tile
Tile.prototype.draw = function() {
    if (this.being) {
        // DRAW THE BEING (top priority)
        this.being.draw();
    } else if (0 < this.items.length) {// this checks if there are any items in array
        // DRAW THE ITEM
        this.items[this.items.length - 1].draw();
    } else {
        // DRAW THE TILE
        if (this.isThisLit()) {
            // the tile is lit, draw its normal colours
            Game.display.draw(this.x, this.y, this.ch, this.col, this.bg);
        } else {
            // the tile is in darkness, draw its darkened colours
            Game.display.draw(this.x, this.y, this.ch, this.col_dark, this.bg_dark);
        };
    };
};


// FLOOR TILES


var FloorTile = function(ch, col, col_dark, bg, bg_dark, x, y) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, true, true]);
    
    this.display_name = "a blank floor tile";
    this.tile_type = 'floor';
};
FloorTile.prototype = Object.create(Tile.prototype);
FloorTile.prototype.constructor = FloorTile;


var RLFloorTile = function(x, y) {
    FloorTile.apply(this, ['.', 'rgb(255, 255, 255)',
                               'rgb(127, 127, 127)',
                               'rgb(24, 24, 24)',
                               'rgb(16, 16, 16)', x, y]);
};
RLFloorTile.prototype = Object.create(FloorTile.prototype);
RLFloorTile.prototype.constructor = RLFloorTile;


var GrassFloor = function(x, y) {
    RLFloorTile.apply(this, [x, y]);
    
    var r = 40 + randInt(-this.colvar, this.colvar);
    var g = 125 + randInt(-this.colvar, this.colvar);
    var b = 40 + randInt(-this.colvar, this.colvar);
    
    this.display_name = "grass";
    this.ch = ' ';

    this.bg = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.bg_dark = 'rgb(' + Math.floor(r/3) + ', ' + Math.floor(g/3) + ', ' + (Math.floor(b/3) + 20) + ')';

    // amount that any characters drawn on the tile will stand out by
    this.stand_out = 30;
    this.stand_out_dark = 10;
    this.col = addRGBToColour(this.bg, this.stand_out);
    this.col_dark = addRGBToColour(this.bg_dark, this.stand_out_dark);
};
GrassFloor.prototype = Object.create(RLFloorTile.prototype);
GrassFloor.prototype.constructor = GrassFloor;


var CaveFloor = function(x, y) {
    RLFloorTile.apply(this, [x, y]);
    
    var colour = 100; //180 in python rl
    var r = colour + randInt(-this.colvar, this.colvar);
    var g = colour + randInt(-this.colvar, this.colvar);
    var b = colour + randInt(-this.colvar, this.colvar);
    
    this.display_name = "hard stone floor";
    this.ch = ' ';

    this.bg = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.bg_dark = 'rgb(' + Math.floor(r/3) + ', ' + Math.floor(g/3) + ', ' + (Math.floor(b/3) + 20) + ')';

    //amount that any characters drawn on the tile will stand out by
    this.stand_out = 30;
    this.stand_out_dark = 10;
    this.col = addRGBToColour(this.bg, this.stand_out);
    this.col_dark = addRGBToColour(this.bg_dark, this.stand_out_dark);
};
CaveFloor.prototype = Object.create(RLFloorTile.prototype);
CaveFloor.prototype.constructor = CaveFloor;


var CaveFloorHiero = function(x, y) {
    CaveFloor.apply(this, [x, y]);

    this.display_name = "A stone floor with a curious symbol";
    this.ch = "hiero" + randInt(16*16);
};
CaveFloorHiero.prototype = Object.create(CaveFloor.prototype);
CaveFloorHiero.prototype.constructor = CaveFloorHiero;


var CaveFloorSpecialChar = function(x, y, ch) {
    CaveFloor.apply(this, [x, y]);

    this.ch = ch;
};
CaveFloorSpecialChar.prototype = Object.create(CaveFloor.prototype);
CaveFloorSpecialChar.prototype.constructor = CaveFloorSpecialChar;


var RLMessageFloor = function(x, y, message) {
    RLFloorTile.apply(this, [x, y]);

    this.ch = ',';
    this.message = message;
};
RLMessageFloor.prototype = Object.create(RLFloorTile.prototype);
RLMessageFloor.prototype.constructor = RLMessageFloor;


var FloorTomb = function(x, y, message, material, social_class) {
    CaveFloor.apply(this, [x, y]);
    this.display_name = "a tomb";
    this.ch = '0';
    this.material = material || null;
    this.grave = new Grave(1, material, "floor", social_class);
    this.message = message || this.grave.inscription;
    if(this.grave.material.nom == 'marmor') {
        this.stand_out = 3 * this.stand_out;
        this.stand_out_dark = 1.5 * this.stand_out_dark;
        this.col = addRGBToColour(this.bg, this.stand_out);
        this.col_dark = addRGBToColour(this.bg_dark, this.stand_out_dark);
    };
};
FloorTomb.prototype = Object.create(CaveFloor.prototype);
FloorTomb.prototype.constructor = FloorTomb;


// WALL TILES


var WallTile = function(ch, col, col_dark, bg, bg_dark, x, y) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, false, false]);
    this.display_name = "a blank wall tile";
    this.tile_type = 'wall';
};
WallTile.prototype = Object.create(Tile.prototype);
WallTile.prototype.constructor = WallTile;


var RLWallTile = function(x, y) {
    //rgb(24, 24, 24) = #181818
    WallTile.apply(this, ['#', 'rgb(255, 255, 255)',
                               'rgb(127, 127, 127)',
                               'rgb(24, 24, 24)',
                               'rgb(16, 16, 16)', x, y]);
};
RLWallTile.prototype = Object.create(WallTile.prototype);
RLWallTile.prototype.constructor = RLWallTile;


var CaveWall = function(x, y) {
    RLWallTile.apply(this, [x, y]);
    
    this.display_name = "a stone wall";

    var colour = 180; //110 in python rl
    var r = colour + randInt(-this.colvar, this.colvar);
    var g = colour + randInt(-this.colvar, this.colvar);
    var b = colour + randInt(-this.colvar, this.colvar);
                               
    //this.ch = ' ';
    this.col = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.col_dark = 'rgb(' + Math.floor(r/4) + ', ' + Math.floor(g/4) + ', ' + (Math.floor(b/4) + 20) + ')';
    this.bg = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.bg_dark = 'rgb(' + Math.floor(r/4) + ', ' + Math.floor(g/4) + ', ' + (Math.floor(b/4) + 20) + ')';
};
CaveWall.prototype = Object.create(RLWallTile.prototype);
CaveWall.prototype.constructor = CaveWall;


// DOOR TILES


//a door tile that starts closed
var DoorTile = function(ch, col, col_dark, bg, bg_dark, x, y, startopen) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, false, false]);
    
    this.closed = true;

    this.display_name = "a closed door";
    this.tile_type = 'door';
    
    if (startopen) {
        this.open();
    };
};
DoorTile.prototype = Object.create(Tile.prototype);
DoorTile.prototype.constructor = DoorTile;


DoorTile.prototype.open = function() {
    this.display_name = "an open door";
    this.ch = '/';
    this.walkable = true;
    this.transparent = true;
    this.closed = false;
    //opening a door could change the lighting
    Game.map.calculateLitAreas();
};


DoorTile.prototype.close = function() {
    this.display_name = "a closed door";
    this.ch = '+';
    this.walkable = false;
    this.transparent = false;
    this.closed = true;
    //closing a door could change the lighting
    Game.map.calculateLitAreas();
};


//a door tile that starts closed, brown with black background
var RLDoorTile = function(x, y, startopen) {
    DoorTile.apply(this, ['+',
                      'rgb(165, 42, 42)',
                      'rgb(82, 21, 21)',
                      '#181818',
                      'rgb(16, 16, 16)', x, y, startopen]);
};
RLDoorTile.prototype = Object.create(DoorTile.prototype);
RLDoorTile.prototype.constructor = RLDoorTile;


var CaveDoorTile = function(x, y, startopen) {
    RLDoorTile.apply(this, [x, y, startopen]);

    var colour = 100; //180 in python rl
    var r = colour + randInt(-this.colvar, this.colvar);
    var g = colour + randInt(-this.colvar, this.colvar);
    var b = colour + randInt(-this.colvar, this.colvar);
    
    this.bg = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.bg_dark = 'rgb(' + Math.floor(r/3) + ', ' + Math.floor(g/3) + ', ' + (Math.floor(b/3) + 20) + ')';
};
CaveDoorTile.prototype = Object.create(RLDoorTile.prototype);
CaveDoorTile.prototype.constructor = CaveDoorTile;
