var pitchShift = require('pitch-shift');
var pool = require('typedarray-pool');

function PitchShiftNode(context, shiftOffset, options) {
    var queue = [];

    options = options || {};
    options.frameSize = options.frameSize || 512;
    options.hopSize = options.hopSize || options.frameSize / 4;

    var shifter = pitchShift(onData, onTune, options);

    var scriptNode = context.createScriptProcessor(options.frameSize, 1, 1);
    scriptNode.onaudioprocess = function(e) {
        shift(e.inputBuffer.getChannelData(0));
        var out = e.outputBuffer.getChannelData(0);
        var q = queue[0];
        queue.shift();
        out.set(q);
        pool.freeFloat32(q);
    };
    scriptNode.shiftOffset = shiftOffset;

    //Enque some garbage to buffer stuff
    shift(new Float32Array(options.frameSize));
    shift(new Float32Array(options.frameSize));
    shift(new Float32Array(options.frameSize));
    shift(new Float32Array(options.frameSize));
    shift(new Float32Array(options.frameSize));

    return scriptNode;

    function shift(frame) {
        shifter(frame);
    }

    function onData(data) {
        var buf = pool.mallocFloat32(data.length);
        buf.set(data);
        queue.push(buf);
    }

    function onTune(t, pitch) {
        return scriptNode.shiftOffset;
    }
}


module.exports = PitchShiftNode;