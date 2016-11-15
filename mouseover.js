
function writeMessage(canvas, message) {
    $("#game-messages").text(message);
};

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
};

$(document).ready(function () { 
    var canvas = $('body > canvas')[0];
    var context = canvas.getContext('2d');

    canvas.addEventListener('mousemove', function(evt) {
        var mousePos = getMousePos(canvas, evt);
        var tile_x = Math.floor(mousePos.x/Game.display_options.tileWidth);
        var tile_y = Math.floor(mousePos.y/Game.display_options.tileHeight);
        var tile_name = capitalizeFirstLetter(Game.map.list[tile_x][tile_y].display_name);
        var message = tile_name + ': (' + tile_x + ', ' + tile_y + ')';
        writeMessage(canvas, message);
    }, false);
});
