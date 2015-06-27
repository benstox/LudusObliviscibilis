var Tile = function(ch, col, col_dark, bg, bg_dark, x, y, walkable) {
    var that = this;
    this.x = x;
    this.y = y;
    this.ch = ch;
    this.col = col;
    this.col_dark = col_dark;
    this.bg = bg;
    this.bg_dark = bg_dark;
    this.walkable = walkable;
    this.blocked = false; //something is blocking the square, regardless of walkability
    this.items = [];
    this.being = null;
    //tile_type is used to check for example if a square is a door (then moving onto it opens it, etc.)
    this.tile_type = null;
    this.message = null;
    //amount by which colour can vary
    this.colvar = 10;
    //this.colvar = 0;
    
    //draw the tile
    this.draw = function() {
        if (that.being) {
            //console.log('draw being');
            that.being.draw();
            //console.log(that.being.ch, that.being.col, that.being.bg);
        } else if (0 < that.items.length) {//this checks if there are any items in array
            //console.log('draw item');
            that.items[that.items.length - 1].draw();
            //console.log(that.items[that.items.length - 1].ch, that.items[that.items.length - 1].col, that.items[that.items.length - 1].bg);
        } else {
            //console.log('draw tile');
            Game.display.draw(that.x, that.y, that.ch, that.col, that.bg);
            //console.log(that.ch, that.col, that.bg);
        };
    };
};

// FLOOR TILES

var FloorTile = function(ch, col, col_dark, bg, bg_dark, x, y) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, true]);
    
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
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, false]);
    
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
    this.col_dark = 'rgb(' + Math.floor(r/4) + ', ' + Math.floor(g/4) + ', ' + Math.floor(b/4) + 20 + ')';
    this.bg = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    this.bg_dark = 'rgb(' + Math.floor(r/4) + ', ' + Math.floor(g/4) + ', ' + Math.floor(b/4) + 20 + ')';
};

// DOOR TILES

//a door tile that starts closed
var DoorTile = function(ch, col, col_dark, bg, bg_dark, x, y, startopen) {
    Tile.apply(this, [ch, col, col_dark, bg, bg_dark, x, y, false]);
    
    this.closed = true;

    this.tile_type = 'door';

    this.open = function() {
        this.ch = '/';
        this.walkable = true;
        this.closed = false;
    };
    
    this.close = function() {
        this.ch = '+';
        this.walkable = false;
        this.closed = true;
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

//Map of just floor tiles
var Map = function(tile_for_floor, tile_for_wall) {
    var that = this;
    this.width = Game.screen_width;
    this.height = Game.screen_height;
    this.list = [];
    this.flicker_items = [];
    
    //set tile to be at coordinates
    this.set_tile = function(x, y, tile, extra_arg) {
        extra_arg = extra_arg || null;
        //console.log(extra_arg)
        if (extra_arg == null) {
            that.list[x][y] = new tile(x, y);
            //console.log(x, y)
        } else {
            that.list[x][y] = new tile(x, y, extra_arg);
            //console.log(x, y, extra_arg)
        };
    };

    //set a verticle line to be all some tile (create a wall where x = constant)
    this.set_v_line = function(x, y0, wall_length, tile, extra_arg) {
        for (var i = y0; i < y0 + wall_length; i++) {
            that.set_tile(x, i, tile, extra_arg);
        };
    };

    //set a horizontal line to be all some tile (create a wall where y = constant)
    this.set_h_line = function(x0, y, wall_length, tile, extra_arg) {
        for (var i = x0; i < x0 + wall_length; i++) {
            that.set_tile(i, y, tile, extra_arg);
        };
    };

    //set a rectangular area to be all some tile
    this.set_rectangle = function(x, y, w, h, tile, extra_arg) {
        for (var i = 0; i < w; i++) {
            that.set_v_line( x+i, y, h, tile , extra_arg );
        };
    };
    
    //draw the map
    this.draw = function() {
        for (var j = 0; j < that.height; j++) {
            for(var i = 0; i < that.width; i++) {
                //Game.display.draw(i, j, that.list[i][j].ch, that.list[i][j].col, that.list[i][j].bg);
                that.list[i][j].draw();
            };
        };
    };
    
    //redraw an area
    this.redraw = function(x, y, w, h) {
        for (var j = 0; j < h; j++) {
            for (var i = 0; i < w; i++) {
                that.list[x+i][y+j].draw();
            };
        };
    };
    
    //initialise the map
    this.createMap = function() {
        for(var i = 0; i < that.width; i++) {
            that.list.push([]);
            for (var j = 0; j < that.height; j++) {
                //put a floor tile in each square
                that.list[i].push(new tile_for_floor(i, j));
            };
        };
    };
};

//Map with some random wall tiles, old roguelike tiles '#', etc
var Map_RandomRLWallTiles = function() {
    var that = this;
    Map.apply(this, [RLFloorTile, RLWallTile]);
    
    //initialise the map
    this.createMap = function() {
        //create a floor tile map with some random walls in it
        for(var i = 0; i < that.width; i++) {
            that.list.push([]);
            for (var j = 0; j < that.height; j++) {
                //put a floor tile in each square
                if (randInt(10) === 0) {
                    that.list[i].push(new RLWallTile(i, j));
                } else { //but sometimes put a wall
                    that.list[i].push(new RLFloorTile(i, j));
                };
            };
        };
        //build a little house
        var house_corner_x = 20 + randInt(20);
        var house_corner_y = 5 + randInt(5);
        for (var i = 0; i < 8; i++) {
            that.set_tile(i + house_corner_x, house_corner_y, RLWallTile);
            that.set_tile(i + house_corner_x, house_corner_y + 7, RLWallTile);
        };
        for (var j = 0; j < 8; j++) {
            if (j < 3 || j > 5) {
                that.set_tile(house_corner_x, j + house_corner_y, RLWallTile);
            } else if (j == 3 || j == 4) {
                that.set_tile(house_corner_x, j + house_corner_y, DoorTile);
            } else if (j == 5) {
                that.set_tile(house_corner_x, j + house_corner_y, DoorTileOpen);
            };
            that.set_tile(house_corner_x + 7, j + house_corner_y, RLWallTile);
        };
        //put a ruby or two in the house, plus a torch and a loose tile
        for (var i = 0; i < 4; i++) {
            rubyx = randInt(6);
            rubyy = randInt(6);
            if (isThisWalkable(house_corner_x + rubyx + 1, house_corner_y + rubyy + 1)) {
                if (i == 2) {
                    new Torch(house_corner_x + rubyx + 1, house_corner_y + rubyy + 1);
                } else if (i == 3) {
                    that.set_tile(house_corner_x + rubyx + 1, house_corner_y + rubyy + 1, RLMessageFloor, "There is a loose tile here underfoot.");
                } else {
                    new Ruby(house_corner_x + rubyx + 1, house_corner_y + rubyy + 1);
                };
            };
        };
        //put a brazier in the top left corner
        if (isThisWalkable(house_corner_x + 1, house_corner_y + 1)) {
            new Brazier(house_corner_x + 1, house_corner_y + 1);
        };
        //put a throne in the bottom right corner
        if (isThisWalkable(house_corner_x + 6, house_corner_y + 6)) {
            new Ruby(house_corner_x + 6, house_corner_y + 6);
            new Throne(house_corner_x + 6, house_corner_y + 6);
        };
    };
};

//Map with a large room in centre
var Map_LargeRoomInCentre = function() {
    var that = this;
    var plan = 
    Map.apply(this, [CaveFloor, CaveWall]);
    this.createMap();
    
    this.createMap = function() {
        var wall_start_y = Math.floor( 2 * Game.screen_height / 5 );
        var wall_start_x = Math.floor( Game.screen_width / 3 );
        var throne_x = wall_start_x+Math.floor( Game.screen_width / 2 ) - 1;
        var throne_y = wall_start_y-3;

        that.set_v_line( wall_start_x, wall_start_y, 7, CaveWall ); //wall with brazier next to it
        that.set_v_line( wall_start_x, wall_start_y+7+1, 3, CaveWall ); //short section to bottom left corner
        that.set_h_line( wall_start_x, wall_start_y+7+4, Math.floor( Game.screen_width / 2 ), CaveWall ); //long section east from bottom left corner
        that.set_tile( wall_start_x, wall_start_y-1, CaveDoorTile ); //doors
        that.set_tile( wall_start_x, wall_start_y-2, CaveDoorTile ); //doors
        that.set_tile( wall_start_x, wall_start_y-3, CaveDoorTile, true ); //doors, start open
        that.set_tile( wall_start_x, wall_start_y-5, CaveDoorTile ); //doors
        that.set_v_line( wall_start_x, 3, wall_start_y-5-3, CaveWall ); //vertical part at top left corner
        that.set_h_line( wall_start_x, 3, Math.floor( Game.screen_width / 4 ), CaveWall ); //horizontal part at top left corner
        that.set_v_line( wall_start_x+Math.floor( Game.screen_width / 2 ), 3 , wall_start_y+7+5-3, CaveWall ); //east wall
        that.set_h_line( wall_start_x+Math.floor( Game.screen_width / 2 )-7, 3, 4, CaveWall ); //isolated bit on north wall

        //decorated floor around throne
        that.set_rectangle( throne_x-1, throne_y-4, 2, 9, CaveFloorHiero );
        that.set_v_line( throne_x-2, throne_y-4, 9, CaveFloorSpecialChar, 'single_v' );
        that.set_h_line( throne_x-1, throne_y-5, 2, CaveFloorSpecialChar, 'single_h' );
        that.set_h_line( throne_x-1, throne_y+5, 2, CaveFloorSpecialChar, 'single_h' );
        that.set_tile( throne_x-2, throne_y-5, CaveFloorSpecialChar, 'single_corner_tl' );
        that.set_tile( throne_x-2, throne_y+5, CaveFloorSpecialChar, 'single_corner_bl' );

        new Brazier( wall_start_x+Math.floor( Game.screen_width / 2 ) - 1, wall_start_y );
        new Brazier( wall_start_x+Math.floor( Game.screen_width / 2 ) - 1, wall_start_y-6 );
        new Torch( 15, 14 )
        new Throne( throne_x, throne_y );
        new Ruby( wall_start_x+Math.floor( Game.screen_width / 4 ) + 3, wall_start_y+7+3 )
        new Ruby( wall_start_x+Math.floor( Game.screen_width / 4 ) + 6, wall_start_y+7+3 )

        that.set_tile( wall_start_x + 1, wall_start_y + Math.floor(Game.screen_height / 10), FloorTomb );
    };
};


