// https://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/
// https://www.sitepoint.com/creating-accurate-timers-in-javascript/
// http://stackoverflow.com/questions/196027/is-there-a-more-accurate-way-to-create-a-javascript-timer-than-settimeout
// https://www.html5rocks.com/en/tutorials/audio/scheduling/
// http://tangiblejs.com/posts/web-midi-music-and-show-control-in-the-browser

// variables from the tutorial
var log = console.log.bind(console);
var keyData = $('#key_data');
var deviceInfoInputs = $('#inputs');
var deviceInfoOutputs = $('#outputs');
var midi;
var AudioContext = AudioContext || webkitAudioContext; // for ios/safari
var context = new AudioContext();
var activeNotes = [];
var btnBox = $('#content');
var btn = $('.button');
var data;
var cmd;
var channel;
var type;
var note;
var velocity;

var play_button = $("#play-button");
var stop_button = $("#stop-button");
var melody_timeouts = [];
var melody_time_intervals = [];

// set up the instrument
var instrument = "celesta-mp3";
var notes = _.mapValues({
    c: {name: "C4"},
    d: {name: "D4"},
    e: {name: "E4"},
    f: {name: "F4"},
    g: {name: "G4"},
    h: {name: "A4"},
    i: {name: "B4"},
    ix: {name: "Bb4"},
    j: {name: "C5"},
    k: {name: "D5"},
    l: {name: "E5"},
    m: {name: "F5"},
    n: {name: "G5"},
    o: {name: "A5"}}, function(v) {
        return(_.set(v, "source", "midi/audio/" + instrument + "/" + v.name + ".mp3"));
    }
);
var melody_speed = 1.1;

var markov_order = 4;

var melodies_data = {
    VI: MODE_VI,
    VII: MODE_VII,
};

var processed_melodies = _.mapValues(melodies_data, function(x) {return(load_melody_data(x, markov_order));});

var mode_repeat_at_least = 3; // how many times to generate a new melody of the same mode before possibly switching

// user interaction --------------------------------------------------------------
var clickPlayOn = function(e) {
    
};

var clickPlayOff = function(e) {
    var mode = randChoice(_.keys(melodies_data));
    play_markov_melody(mode, mode_repeat_at_least);
};

var clickStopOn = function(e) {
    
};

var clickStopOff = function(e) {
    stop_music();
};

var keyController = function(e) {
    if(e.type == "keydown") {
        switch(e.keyCode) {
            case 81:
                $("#play-button").addClass('active');
                play_markov_melody();
                break;
            case 87:
                $("#stop-button").addClass('active');
                stop_music();
                break;  
            default:
                //console.log(e);
        };
    } else if(e.type == "keyup") {
        switch(e.keyCode) {
            case 81:
                $("#play-button").removeClass('active');
                break;
            case 87:
                $("#stop-button").removeClass('active');
                break;
            default:
                //console.log(e.keyCode);
        };
    };
};

// midi functions --------------------------------------------------------------
var onMIDISuccess = function(midiAccess) {
    midi = midiAccess;
    var inputs = midi.inputs.values();
    // loop through all inputs
    for(var input = inputs.next(); input && !input.done; input = inputs.next()){
        // listen for midi messages
        input.value.onmidimessage = onMIDIMessage;

        listInputs(input);
    }
    // listen for connect/disconnect message
    midi.onstatechange = onStateChange;

    showMIDIPorts(midi);
};

var onMIDIMessage = function(event) {
    data = event.data,
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0, // channel agnostic message type. Thanks, Phil Burk.
    note = data[1],
    velocity = data[2];
    // with pressure and tilt off
    // note off: 128, cmd: 8 
    // note on: 144, cmd: 9
    // pressure / tilt on
    // pressure: 176, cmd 11: 
    // bend: 224, cmd: 14
    log('MIDI data', data);
    switch(type) {
        case 144: // noteOn message 
            noteOn(note, velocity);
            break;
        case 128: // noteOff message 
            noteOff(note, velocity);
            break;
    };
    
    //log('data', data, 'cmd', cmd, 'channel', channel);
    logger(keyData, 'key data', data);
};

var onStateChange = function(event) {
    showMIDIPorts(midi);
    var port = event.port, state = port.state, name = port.name, type = port.type;
    if(type == "input"){
            log("name", name, "port", port, "state", state);}
};

var listInputs = function(inputs) {
    var input = inputs.value;
        log("Input port : [ type:'" + input.type + "' id: '" + input.id + 
                "' manufacturer: '" + input.manufacturer + "' name: '" + input.name + 
                "' version: '" + input.version + "']");
};

var noteOn = function(midiNote, velocity) {
    player(midiNote, velocity);
};

var noteOff = function(midiNote, velocity) {
    player(midiNote, velocity);
};

var player = function(note, velocity) {
    var sample = sampleMap['key'+note];
    if(sample) {
        if(type == (0x80 & 0xf0) || velocity == 0) { // needs to be fixed for QuNexus, which always returns 144
            btn[sample - 1].classList.remove('active');
            return;
        };
        btn[sample - 1].classList.add('active');
        btn[sample - 1].play(velocity);
    };
};

var onMIDIFailure = function(e) {
    log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
};

// MIDI utility functions --------------------------------------------------------------
var showMIDIPorts = function(midiAccess) {
    var inputs = midiAccess.inputs,
            outputs = midiAccess.outputs, 
            html;
    html = '<h4>MIDI Inputs:</h4><div class="info">';
    inputs.forEach(function(port){
        html += '<p>' + port.name + '<p>';
        html += '<p class="small">connection: ' + port.connection + '</p>';
        html += '<p class="small">state: ' + port.state + '</p>';
        html += '<p class="small">manufacturer: ' + port.manufacturer + '</p>';
        if(port.version){
            html += '<p class="small">version: ' + port.version + '</p>';
        }
    });
    deviceInfoInputs.innerHTML = html + '</div>';

    html = '<h4>MIDI Outputs:</h4><div class="info">';
    outputs.forEach(function(port){
        html += '<p>' + port.name + '<br>';
        html += '<p class="small">manufacturer: ' + port.manufacturer + '</p>';
        if(port.version){
            html += '<p class="small">version: ' + port.version + '</p>';
        }
    });
    deviceInfoOutputs.innerHTML = html + '</div>';
};

// audio functions --------------------------------------------------------------
var loadAudio = function(object, url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function(){
        context.decodeAudioData(request.response, function(buffer){
            object.buffer = buffer;
        });
    }
    request.send();
};

var addAudioProperties = function(object) {
    loadAudio(object, object.source);
    object.play = function(volume) {
        var s = context.createBufferSource();
        var g = context.createGain();
        var v;
        s.buffer = object.buffer;
        // s.playbackRate.value = randomRange(0.5, 2); // random pitch
        s.playbackRate.value = 1;
        if (volume) {
            v = rangeMap(volume, 1, 127, 0.2, 2);
            s.connect(g);
            g.gain.value = v * v;
            g.connect(context.destination);
        } else {
            s.connect(context.destination); 
        };
        
        s.start();
        object.s = s;
    };

    object.stop = function() {
        if(object.s) {
            object.s.stop();
        };
    };
};

var play_markov_melody = function(mode, at_least_times) {
    // time to choose a new mode?
    if (at_least_times < 1 && randChoice([true, false])) {
        mode = randChoice(_.keys(melodies_data));
        at_least_times = mode_repeat_at_least;
    } else {
        at_least_times = at_least_times - 1;
    };
    // get a Markov melody!
    score = generate_markov(processed_melodies[mode], markov_order);

    // turn the Markov score into a list of notes and durations
    melody = process_markov_score(score);

    // work out the temporal position of each note in the melody
    // based on cummulative durations
    var starting_position = 300; // position of the first note (may not be best as zero)
    melody = _.reduce(
        melody,
        function (acc, n) {
            acc.push(
                _.set(n, "position", (acc.length > 0 ? acc[acc.length-1].position + acc[acc.length-1].duration : starting_position)));
            return(acc);
        }, []);

    // note scheduler
    var schedule_notes_in_interval = function() {
        var current_time = new Date().getTime();
        var interval_start = current_time - start_time;
        var interval_end = interval_start + scheduler_interval;
        if (interval_start > melody[melody.length-1].position + (2000*melody_speed)) {
            // the melody has finished
            // kill the schedulers and start a new melody
            _.forEach(melody_time_intervals, function(timeout_id) {
                clearInterval(timeout_id);
            });
            _.forEach(melody_timeouts, function(timeout_id) {
                clearTimeout(timeout_id);
            });
            melody_timeouts = [];
            melody_time_intervals = [];
            play_markov_melody(mode, at_least_times);
        } else {
            // notes whose position is within the interval for this scheduler
            var notes_in_interval = _.filter(melody, function(x) {
                return(x.position >= interval_start && x.position < interval_end);
            });
            // schedule those notes
            _.forEach(notes_in_interval, function(note_to_play) {
                melody_timeouts.push(setTimeout(
                    function() {notes[note_to_play.shorthand].play(note_to_play.velocity);},
                    note_to_play.position - interval_start
                ));
            });
        };
    };

    // set up key numbers
    var lookahead_time = 100; // how far ahead a scheduler will look in order to play a note (ms)
    var scheduler_interval = 25; // how far apart each scheduler is in theory (ms)
    var start_time = new Date().getTime();
    // play the melody!!
    melody_time_intervals.push(setInterval(schedule_notes_in_interval, scheduler_interval));
};

var stop_music = function() {
    _.forEach(notes, function(note) {
        note.stop();
    });
    _.forEach(melody_time_intervals, function(timeout_id) {
        clearInterval(timeout_id);
    });
    _.forEach(melody_timeouts, function(timeout_id) {
        clearTimeout(timeout_id);
    });
    melody_timeouts = [];
    melody_time_intervals = [];
};

var rangeMap = function(x, a1, a2, b1, b2) {
    return ((x - a1)/(a2-a1)) * (b2 - b1) + b1;
};

var frequencyFromNoteNumber = function(note) {
    return 440 * Math.pow(2,(note-69)/12);
};

var logger = function(container, label, data) {
    messages = label + " [channel: " + (data[0] & 0xf) + ", cmd: " + (data[0] >> 4) + ", type: " + (data[0] & 0xf0) + " , note: " + data[1] + " , velocity: " + data[2] + "]";
    container.textContent = messages;
};

// add event listeners
$(document).ready(function() {
    // request MIDI access
    if(navigator.requestMIDIAccess){
        navigator.requestMIDIAccess({sysex: false}).then(onMIDISuccess, onMIDIFailure);
    }
    else {
        alert("No MIDI support in your browser.");
    }

    // prepare audio files
    _.forEach(notes, addAudioProperties);

    $("#play-music").mouseup(clickPlayOff);
    $("#stop-music").mouseup(clickStopOff);
});
