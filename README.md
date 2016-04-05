# pitch-shift-node
Pitch shift node for WebAudioApi.
Using the  [pitch-shift](https://github.com/mikolalysenko/pitch-shift) library to do the shifting.

Living exmaple can be find [here](http://chenmachluf.github.io/pitch-shift-node/examples/) 

# Install
```
npm install pitchshiftnode
```

#API

```javascript
var PitchShiftNode = require('pitchshiftnode')
```

##PitchShiftNode(audioContext,pitchShift,options)
create and return an AudioNode instance

* `audioContext` WebAudioApi audio context
* `pitchShift` number to scale the samples by
* `options` An object full of options to pass to the pitch shifter
    + `frameSize` size of frame to process (default `512`)
    + `hopSize` the distance between frames in samples.  Must divide frame size.  (default `frameSize/4`)
    + `dataSize` maximal allowable size of a data frame (default `frameSize`)
    + `sampleRate` Conversion factor from samples to seconds. (default `44100`)
    + `analysiWindow` analysis window.  must be a typed array with length equl to frame size (defaults to Hann window)
    + `synthesisWindow` synthesis window.  must be a typed array with length equal to frame size (defaults to Hann window)
    + `threshold` peak detection threshold.  Set to 1.0 to always take maximum, otherwise set lower to detect half tones.  (default `0.9`)
    + `minPeriod` Minimal resolvable period.  (default `sampleRate/400`)

# Example
Here is a simple example of using the pitch node.

```javascript
var PitchShiftNode = require('pitch-shift-node');

var source = context.createBufferSource();
source.buffer = myBuffer;

//Create pitch shift node that scale samples by 1.25
var pitchNode = new PitchShiftNode(context,1.25);

source.connect(pitchNode);
pitchNode.connect(context.destination);
```

#Test And Play
```
# First install all the NPM tools:
npm install
```

Then run npm scripts:
```
#Building the example page
npm run build

#Host build example on port 3000
npm run example
```

#Credits
(c) 2016 Chen Machluf. MIT License

Gettysburg adress reading by Britton Rea. Recording obtained from the Internet archive. http://archive.org/details/GettysburgAddress