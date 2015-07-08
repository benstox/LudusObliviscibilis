var Tile = function(ch, col, col_dark, bg, bg_dark, x, y, walkable, transparent) {
    var that = this;
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
    this.blocked = false; //something is blocking the square, regardless of walkability
    this.explored = false;
    this.items = [];
    this.being = null;
    //tile_type is used to check for example if a square is a door (then moving onto it opens it, etc.)
    this.tile_type = null;
    this.message = null;
    //amount by which colour can vary
    this.colvar = 10;
    //this.colvar = 0;
    
    //find out if this tile is lit by a light source
    this.isThisLit = function() {
        return(that.x + '_' + that.y in Game.map.lit_tiles);
    };
    
    //draw the tile
    this.draw = function() {
        if (that.being) {
            //DRAW THE BEING (top priority)
            that.being.draw();
        } else if (0 < that.items.length) {//this checks if there are any items in array
            //DRAW THE ITEM
            that.items[that.items.length - 1].draw();
        } else {
            //DRAW THE TILE
            if (that.isThisLit()) {
                //the tile is lit, draw its normal colours
                Game.display.draw(that.x, that.y, that.ch, that.col, that.bg);
            } else {
                //the tile is in darkness, draw its darkened colours
                Game.display.draw(that.x, that.y, that.ch, that.col_dark, that.bg_dark);
            };
        };
    };
};

// FLOOR TILES

var FloorTile = function(ch, col, col_dark, bg, bg_dark, x, y) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, true, true]);
    
    this.tile_type = 'floor';
};

var RLFloorTile = function(x, y) {
    FloorTile.apply(this, ['.', 'rgb(255, 255, 255)',
                               'rgb(127, 127, 127)',
                               'rgb(24, 24, 24)',
                               'rgb(16, 16, 16)', x, y]);
};

var CaveFloor = function(x, y) {
    RLFloorTile.apply(this, [x, y]);
    
    var colour = 100; //180 in python rl
    var r = colour + randInt(-this.colvar, this.colvar);
    var g = colour + randInt(-this.colvar, this.colvar);
    var b = colour + randInt(-this.colvar, this.colvar);
    
    this.ch = ' ';

    this.bg = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.bg_dark = 'rgb(' + Math.floor(r/3) + ', ' + Math.floor(g/3) + ', ' + (Math.floor(b/3) + 20) + ')';

    //amount that any characters drawn on the tile will stand out by
    this.stand_out = 30
    this.stand_out_dark = 10
    this.col = addRGBToColour(this.bg, this.stand_out);
    this.col_dark = addRGBToColour(this.bg_dark, this.stand_out_dark);

};

var CaveFloorHiero = function(x, y) {
    CaveFloor.apply(this, [x, y]);

    this.ch = "hiero" + randInt(16*16);
};

var CaveFloorSpecialChar = function(x, y, ch) {
    CaveFloor.apply(this, [x, y]);

    this.ch = ch;
};

var RLMessageFloor = function(x, y, message) {
    RLFloorTile.apply(this, [x, y]);

    this.ch = ',';
    this.message = message;
};

var FloorTomb = function(x, y) {
    CaveFloor.apply(this, [x, y]);
    
    this.ch = '0';

    this.message = 'An inscription reads, "Hic jacet Arthurus rex Britannorum cujus animae propitietur Deus. Amen."';
};

// WALL TILES

var WallTile = function(ch, col, col_dark, bg, bg_dark, x, y) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, false, false]);
    
    this.tile_type = 'wall';
};

var RLWallTile = function(x, y) {
    //rgb(24, 24, 24) = #181818
    WallTile.apply(this, ['#', 'rgb(255, 255, 255)',
                               'rgb(127, 127, 127)',
                               'rgb(24, 24, 24)',
                               'rgb(16, 16, 16)', x, y]);
};

var CaveWall = function(x, y) {
    RLWallTile.apply(this, [x, y]);
    
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

// DOOR TILES

//a door tile that starts closed
var DoorTile = function(ch, col, col_dark, bg, bg_dark, x, y, startopen) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, false, false]);
    
    this.closed = true;

    this.tile_type = 'door';

    this.open = function() {
        this.ch = '/';
        this.walkable = true;
        this.transparent = true;
        this.closed = false;
        //opening a door could change the lighting
        Game.map.calculateLitAreas();
    };
    
    this.close = function() {
        this.ch = '+';
        this.walkable = false;
        this.transparent = false;
        this.closed = true;
        //closing a door could change the lighting
        Game.map.calculateLitAreas();
    };

    if (startopen) {
        this.open();
    };
};

//a door tile that starts closed, brown with black background
var RLDoorTile = function(x, y, startopen) {
    DoorTile.apply(this, ['+',
                      'rgb(165, 42, 42)',
                      'rgb(82, 21, 21)',
                      '#181818',
                      'rgb(16, 16, 16)', x, y, startopen]);
};

var CaveDoorTile = function(x, y, startopen) {
    RLDoorTile.apply(this, [x, y, startopen]);

    var colour = 100; //180 in python rl
    var r = colour + randInt(-this.colvar, this.colvar);
    var g = colour + randInt(-this.colvar, this.colvar);
    var b = colour + randInt(-this.colvar, this.colvar);
    
    this.bg = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.bg_dark = 'rgb(' + Math.floor(r/3) + ', ' + Math.floor(g/3) + ', ' + (Math.floor(b/3) + 20) + ')';
};

