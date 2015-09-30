"use strict";

var Game = {
    tileset: null,
    screen_width: null,
    screen_height: null,
    screen_spacing: null,
    display_options: null,
    display: null,
    player: null,
    scheduler: null,
    flicker_scheduler: null,
    engine: null,
    flicker_engine: null,
    beesrampu: null,
    james: null,
    map: null,
    fov: null,
    
    
    main: function() {
        this.first_turn = true;
        //load the image for the tileset
        this.tileset = document.createElement("img");
        this.tileset.src = "terminalglyphs12x12_alpha.png";
        //set up the 'TV', the screen on which the game is drawn
        this.screen_width = 65;
        this.screen_height = 35;
        //default dimensions of popup messages
        this.message_default_x = Math.floor(this.screen_width/4);
        this.message_default_y = Math.floor(this.screen_height/4);
        this.message_default_w = Math.floor(this.screen_width/2);
        this.message_default_h = Math.floor(this.screen_height/2);
        //not sure what the spacing does yet
        this.screen_spacing = 1.1; //doesn't do anything now?
        //put these all together with some options for the display
        this.display_options = {
            layout: 'tile',
            tileWidth: 12,
            tileHeight: 12,
            tileSet: this.tileset,
            tileColorize: true,
            tileMap: createTileMap(),
            width: this.screen_width,
            height: this.screen_height
        };
        
        //the display
        this.display = new ROT.Display(this.display_options);
        document.body.appendChild(this.display.getContainer());
        
        //something
        this.scheduler = new ROT.Scheduler.Simple();
        this.flicker_scheduler = new ROT.Scheduler.Simple();
        this.nation = new NationName();
        //this.map = new Map_RandomRLWallTiles();
        this.map = new Map_LargeRoomInCentre();
        this.map.createMap();
        this.player = new Player(15, 13);
        this.beesrampu = new BeesRampu(0, 0);
        //this.james = new James(20, 20); //teleporting guy
        this.wormigee = new Wormigee(0, 17);
        this.fov = new ROT.FOV.PreciseShadowcasting( function(x, y) {
            if (isThisOnMap(x, y)) {
                return Game.map.list[x][y].transparent;
            } else {
                return false;
            };
        } );
        
        //initialise the list of tiles lit by a light source
        this.map.calculateLitAreas();
        
        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();
        
        for (var flickid = 0; flickid < 3; flickid++) {
            this['flicker' + flickid] = setInterval( flicker, randInt(1000, 3000), flickid );
        };
        
        //start the map off
        setTimeout(this.map.draw, 1000);
        //this.map.draw();
        //console.log('Map drawn');
    }
};


Game.main();