var Message = function(text, x, y, w, h) {
    var that = this;
    x = x || Game.message_default_x;
    y = y || Game.message_default_y;
    w = w || Game.message_default_w;
    h = h || Game.message_default_h;
    this.text = text;
    // dimensions and positions of the message box
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    // when something triggers the popup message do this:
    this.trigger = function() {
        // draw a black background
        for (var h = 0; h < that.h; h++) {
            for (var i = 0; i < that.w; i++) {
                Game.display.draw(that.x + i, that.y + h, ' ', 'black', 'black');
                Game.display.drawText(that.x + 1, that.y + 1, that.text, that.w - 2);
            };
        };
        
        // check whether any flickering items should be covered by the message
        // (they will continue to redraw themselves otherwise)
        for (var i = 0; i < Game.map.flicker_items.length; i++) {
            if (Game.map.flicker_items[i].x >= that.x &&
                Game.map.flicker_items[i].y >= that.y &&
                Game.map.flicker_items[i].x <= that.x + that.w - 1 &&
                Game.map.flicker_items[i].y <= that.y + that.h - 1
            ) {
                Game.map.flicker_items[i].hidden_behind_message = true;
            };
        };
    };
    
    // redraw just the area hidden by the message
    this.redrawMapBehind = function() {
        Game.map.redraw(that.x, that.y, that.w, that.h);
    };
};

var OpenInventory = function() {
    // open the inventory window
    Game.player.handler_mode = 'message'; //tells handler what to do with inputs
    var original_message_text = '  INVENTORY  ';
    var message_text = original_message_text;
    
    // create the ----%%---- design that goes alongside the word INVENTORY
    for (var i = 0; i < (Game.message_default_w - original_message_text.length - 4) / 2; i++) {
        if ( i == Math.floor( (Game.message_default_w - original_message_text.length - 4) / 4 ) || i == Math.ceil( (Game.message_default_w - original_message_text.length - 4) / 4 ) ) {
            message_text = '%' + message_text + '%';
        } else {
            message_text = '-' + message_text + '-';
        };
    };
    
    var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p']
    var pieces_of_equipment = 0; // keep track of how many inventory items are equipped equipment (for the alphabet)
    for (var key in Game.player.equipment) {
        if (Game.player.equipment[key] != null) {
            message_text = message_text + '\n' + alphabet[pieces_of_equipment] + ') ' + Game.player.equipment[key].name + ' (' + key + ')';
            pieces_of_equipment++;
        };
    };
    for (var i = 0; i < Game.player.inventory.length; i++) {
        message_text = message_text + '\n' + alphabet[i + pieces_of_equipment] + ') ' + Game.player.inventory[i].name;
    };
    var message = new Message(message_text);
    message.trigger()
    return(message);
};
