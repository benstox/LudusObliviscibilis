//Map of just floor tiles
var Map = function(tile_for_floor, tile_for_wall) {
    var that = this;
    this.width = Game.screen_width;
    this.height = Game.screen_height;
    this.list = []; //this is the array of tiles on the map
    this.flicker_items = []; //the map keeps track of any items that give off light
    this.lit_tiles = {}; //the map keeps track of any lit tiles
    
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
    
    //this function will calculate all the tiles
    //of the map lit by a light source
    this.calculateLitAreas = function() {
        that.lit_tiles = {};
        for (var i = 0; i < that.flicker_items.length; i++) {
            //add all tiles within the light source's radius to the map's list of lit tiles
            Game.fov.compute(
                that.flicker_items[i].x, that.flicker_items[i].y, that.flicker_items[i].light_radius,
                function(x, y, r, transparency) {
                    if (isThisOnMap(x, y)) {
                        that.lit_tiles[x + '_' + y] = true;
                        Game.map.list[x][y].draw();
                    };
                }
            );
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


