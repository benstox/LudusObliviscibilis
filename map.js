// Map of just floor tiles
var Map = function(tile_for_floor, tile_for_wall) {
    var that = this;
    this.width = Game.screen_width;
    this.height = Game.screen_height;
    this.list = []; // this is the array of tiles on the map
    this.flicker_items = []; // the map keeps track of any items that give off light
    this.lit_tiles = {}; // the map keeps track of any lit tiles

    // initialise the map
    for(var i = 0; i < this.width; i++) {
        this.list.push([]);
        for (var j = 0; j < this.height; j++) {
            // put a floor tile in each square
            this.list[i].push(new tile_for_floor(i, j));
        };
    };
    
    // set tile to be at coordinates
    this.set_tile = function(x, y, tile) {
        // any number of arguments can now be passed to the tile
        var extra_args = [];
        for (var i = 0; i < arguments.length; i++) {
            if (i > 2) {
                extra_args.push(arguments[i]);
            };
        };
        // some ugly javascript that passes the arguments properly
        that.list[x][y] = new (Function.prototype.bind.apply( tile, [null, x, y].concat(extra_args) ));
    };

    // set a verticle line to be all some tile (create a wall where x = constant)
    this.set_v_line = function(x, y0, wall_length, tile, extra_arg) {
        for (var i = y0; i < y0 + wall_length; i++) {
            that.set_tile(x, i, tile, extra_arg);
        };
    };

    // set a horizontal line to be all some tile (create a wall where y = constant)
    this.set_h_line = function(x0, y, wall_length, tile, extra_arg) {
        for (var i = x0; i < x0 + wall_length; i++) {
            that.set_tile(i, y, tile, extra_arg);
        };
    };

    // set a rectangular area to be all some tile
    this.set_rectangle = function(x, y, w, h, tile, extra_arg) {
        for (var i = 0; i < w; i++) {
            that.set_v_line( x+i, y, h, tile , extra_arg );
        };
    };

    // set tiles within a verticle line to be randomly converted to some other tile;
    // 0 < chance < 1
    this.set_v_line_randomly = function(x, y0, wall_length, tile, chance, extra_arg) {
        for (var i = y0; i < y0 + wall_length; i++) {
            if (Math.random() < chance) {
                that.set_tile(x, i, tile, extra_arg);
            };
        };
    };

    // set tiles within a rectangular area to be randomly converted to some other tile;
    // 0 < chance < 1
    this.set_rectangle_randomly = function(x, y, w, h, tile, chance, extra_arg) {
        for (var i = 0; i < w; i++) {
            that.set_v_line_randomly( x+i, y, h, tile , chance, extra_arg );
        };
    };
    
    // draw the map
    this.draw = function() {
        for (var j = 0; j < that.height; j++) {
            for(var i = 0; i < that.width; i++) {
                that.list[i][j].draw();
            };
        };
    };
    
    // redraw an area
    this.redraw = function(x, y, w, h) {
        for (var j = 0; j < h; j++) {
            for (var i = 0; i < w; i++) {
                that.list[x+i][y+j].draw();
            };
        };
    };

    // this function will calculate all the tiles
    // of the map lit by a light source
    this.calculateLitAreas = function() {
        // get a list of all the "flicker items", plus any scheduled beings with a light source equipped 
        var all_light_sources = that.flicker_items.concat(
            Game.scheduler._repeat.filter(function(x) {return(x.equippedLightSource());}));
        that.lit_tiles = {};
        for (var i = 0; i < all_light_sources.length; i++) {
            // add all tiles within the light source's radius to the map's list of lit tiles
            Game.fov.compute(
                all_light_sources[i].x, all_light_sources[i].y, all_light_sources[i].light_radius || all_light_sources[i].getLightRadius(),
                function(x, y, r, transparency) {
                    if (isThisOnMap(x, y)) {
                        that.lit_tiles[x + '_' + y] = true;
                    };
                }
            );
        };
        // let's also keep a list of all the visible tiles
        var visible_tiles = {};
        // draw and explore tiles in player's field of vision (Game.player.vision_radius)
        Game.fov.compute(Game.player.x, Game.player.y, Game.player.vision_radius, function(x, y, r, transparency) {
            if (isThisOnMap(x, y)) {
                that.list[x][y].explored = true;
                that.list[x][y].draw();
                visible_tiles[x + "_" + y] = true;
                // check for any torches etc
                // if there are any set in_line_of_sight property to true
                // then the correct backgrount (light/dark) can be drawn for them
            };
        });
        // draw and explore lit tiles in player's line of sight
        Game.fov.compute(Game.player.x, Game.player.y, 50, function(x, y, r, transparency) {
            if (isThisOnMap(x, y) && that.list[x][y].isThisLit()) {
                that.list[x][y].explored = true;
                that.list[x][y].draw();
                visible_tiles[x + "_" + y] = true;
                // check for any torches etc
                // if there are any set in_line_of_sight property to true
                // then the correct backgrount (light/dark) can be drawn for them
                var light_giving = that.list[x][y].items.filter(function(z) {return(z.light_giving);});
            };
        });
        // draw the tiles that aren't visible!
        // return(this.x + '_' + this.y in Game.map.lit_tiles);
        for (var i = 0; i < that.width; i++) {
            for (var j = 0; j < that.height; j++) {
                if (i + "_" + j in visible_tiles == false) {
                    that.list[i][j].drawNotVisible();
                    // check for any torches etc
                    // if there are any set in_line_of_sight property to false
                    // then the correct backgrount (light/dark) can be drawn for them
                    var light_giving = that.list[i][j].items.filter(function(z) {return(z.light_giving);});
                };
            };
        };
    };

    this.redrawAreaWithinRadius = function(x, y, r) {
        for (var i = 0; i < ((r*2) + 1); i++) {
            for (var j = 0; j < ((r*2) + 1); j++) {
                var tile_x = x - r + i;
                var tile_y = y - r + j;
                if (isThisOnMap(tile_x, tile_y)) {
                    that.list[tile_x][tile_y].draw();
                    var light_giving = that.list[x][y].items.filter(function(z) {return(z.light_giving);});
                };
            };
        };
    };
};

// Map with some random wall tiles, old roguelike tiles '#', etc
var Map_RandomRLWallTiles = function() {
    var that = this;
    Map.apply(this, [RLFloorTile, RLWallTile]);
    
    // initialise the map
    this.createMap = function() {
        // create a floor tile map with some random walls in it
        for(var i = 0; i < that.width; i++) {
            that.list.push([]);
            for (var j = 0; j < that.height; j++) {
                // put a floor tile in each square
                if (randInt(10) === 0) {
                    that.list[i].push(new RLWallTile(i, j));
                } else { // but sometimes put a wall
                    that.list[i].push(new RLFloorTile(i, j));
                };
            };
        };
        // build a little house
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
        // put a ruby or two in the house, plus a torch and a loose tile
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
        // put a brazier in the top left corner
        if (isThisWalkable(house_corner_x + 1, house_corner_y + 1)) {
            new Brazier(house_corner_x + 1, house_corner_y + 1);
        };
        // put a throne in the bottom right corner
        if (isThisWalkable(house_corner_x + 6, house_corner_y + 6)) {
            new Ruby(house_corner_x + 6, house_corner_y + 6);
            new Throne(house_corner_x + 6, house_corner_y + 6);
        };
    };
};

// Map with a large room in centre
var Map_LargeRoomInCentre = function() {
    var that = this;
    Map.apply(this, [GrassFloor, CaveWall]);
    // this.createMap();
    
    this.createMap = function() {
        var wall_start_y = Math.floor( 2 * Game.screen_height / 5 );
        var wall_start_x = Math.floor( Game.screen_width / 3 );
        var east_wall_x = wall_start_x+Math.floor( Game.screen_width / 2 );
        var wall_w = east_wall_x - wall_start_x + 1;
        var throne_x = wall_start_x+Math.floor( Game.screen_width / 2 ) - 1;
        var throne_y = wall_start_y-3;

        // interior floor
        that.set_rectangle(wall_start_x, 3, wall_w, wall_start_y+7+5-3, CaveFloor);

        // walls
        that.set_v_line( wall_start_x, wall_start_y, 7, CaveWall ); // wall with brazier next to it
        that.set_v_line( wall_start_x, wall_start_y+7+1, 3, CaveWall ); // short section to bottom left corner
        that.set_h_line( wall_start_x, wall_start_y+7+4, wall_w, CaveWall ); // long section east from bottom left corner
        that.set_tile( wall_start_x, wall_start_y-1, CaveDoorTile ); // doors
        that.set_tile( wall_start_x, wall_start_y-2, CaveDoorTile ); // doors
        that.set_tile( wall_start_x, throne_y, CaveDoorTile, true ); // doors, start open
        that.set_tile( wall_start_x, wall_start_y-5, CaveDoorTile ); // doors
        that.set_v_line( wall_start_x, 3, wall_start_y-5-3, CaveWall ); // vertical part at top left corner
        that.set_h_line( wall_start_x, 3, Math.floor( Game.screen_width / 4 ), CaveWall ); // horizontal part at top left corner
        that.set_v_line( east_wall_x, 3 , wall_start_y+7+5-3, CaveWall ); // east wall
        that.set_h_line( east_wall_x-7, 3, 4, CaveWall ); // isolated bit on north wall

        // path
        var path_start_x = Math.floor(wall_start_x/2);
        that.set_rectangle_randomly(path_start_x, throne_y-2, wall_start_x-path_start_x, 5, CaveFloor, 0.5);
        for (var i = 0; i < path_start_x; i++) {
            that.set_v_line_randomly(i, throne_y-2+path_start_x-i, 5, CaveFloor, 0.5);
        };

        // decorated floor around throne
        that.set_rectangle( throne_x-1, throne_y-4, 2, 9, CaveFloorHiero );
        that.set_v_line( throne_x-2, throne_y-4, 9, CaveFloorSpecialChar, 'single_v' );
        that.set_h_line( throne_x-1, throne_y-5, 2, CaveFloorSpecialChar, 'single_h' );
        that.set_h_line( throne_x-1, throne_y+5, 2, CaveFloorSpecialChar, 'single_h' );
        that.set_tile( throne_x-2, throne_y-5, CaveFloorSpecialChar, 'single_corner_tl' );
        that.set_tile( throne_x-2, throne_y+5, CaveFloorSpecialChar, 'single_corner_bl' );

        // items, furniture
        new Brazier( wall_start_x+Math.floor( Game.screen_width / 2 ) - 1, wall_start_y );
        new Brazier( wall_start_x+Math.floor( Game.screen_width / 2 ) - 1, wall_start_y-6 );
        new Torch( 15, 14 )
        new Throne( throne_x, throne_y );
        new Ruby( wall_start_x+Math.floor( Game.screen_width / 4 ) + 3, wall_start_y+7+3 )
        new Ruby( wall_start_x+Math.floor( Game.screen_width / 4 ) + 6, wall_start_y+7+3 )

        // tombs
        // var arthur_message = 'An inscription reads, "Hic jacet Arthurus rex Britannorum cujus animae propitietur Deus. Amen."';
        var marble = MATERIALS[1];
        // that.set_tile( wall_start_x + 1, wall_start_y + Math.floor(Game.screen_height / 10), FloorTomb, arthur_message, marble );
        that.set_tile( wall_start_x + -3, wall_start_y + Math.floor(Game.screen_height / 10) + 2, FloorTomb, null, null, "commoner" );
        that.set_tile( wall_start_x + -3, wall_start_y + Math.floor(Game.screen_height / 10), FloorTomb, null, null, "commoner" );
        that.set_tile( wall_start_x + -1, wall_start_y + Math.floor(Game.screen_height / 10), FloorTomb, null, null, "commoner" );
        that.set_tile( wall_start_x + 1, wall_start_y + Math.floor(Game.screen_height / 10), FloorTomb, null, marble, "monarch" );
        that.set_tile( wall_start_x + 1, wall_start_y + Math.floor(Game.screen_height / 10) + 2, FloorTomb, null, marble, "royal" );
        that.set_tile( wall_start_x + 1, wall_start_y + Math.floor(Game.screen_height / 10) + 4, FloorTomb, null, marble, "aristocrat" );
        that.set_tile( wall_start_x + 1, wall_start_y + Math.floor(Game.screen_height / 10) + 7, FloorTomb, null, null, "ecclesiastic" );
        that.set_tile( wall_start_x + 3, wall_start_y + Math.floor(Game.screen_height / 10) + 7, FloorTomb, null, null, "ecclesiastic" );
        that.set_tile( wall_start_x + 5, wall_start_y + Math.floor(Game.screen_height / 10) + 7, FloorTomb, null, null, "ecclesiastic" );
    };
};
