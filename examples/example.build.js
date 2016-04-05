/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var pitchShiftNode = __webpack_require__(1);
	
	window.requestAnimFrame = (function() {
	
	    return (window.requestAnimationFrame ||
	        window.webkitRequestAnimationFrame ||
	        window.mozRequestAnimationFrame ||
	        function(callback) {
	            window.setTimeout(callback, 1000 / 60);
	        });
	})();
	
	
	window.addEventListener("DOMContentLoaded", Start, true);
	
	function Start() {
	
	    var audioContext = new AudioContext(),
	        audioSource,
	        pitchNode,
	        spectrumAudioAnalyser,
	        sonogramAudioAnalyser,
	        canvas,
	        canvasContext,
	        barGradient,
	        waveGradient;
	
	    var audioVisualisationNames = ['Spectrum', 'Wave', 'Sonogram'],
	        audioVisualisationIndex = 0,
	        pitchRatio = 1.0,
	        playbackRate = 1.0,
	        spectrumFFTSize = 256,
	        spectrumSmoothing = 0.8,
	        sonogramFFTSize = 1024,
	        sonogramSmoothing = 0;
	
	    init();
	
	    function init() {
	        spectrumAudioAnalyser = audioContext.createAnalyser();
	        spectrumAudioAnalyser.fftSize = spectrumFFTSize;
	        spectrumAudioAnalyser.smoothingTimeConstant = spectrumSmoothing;
	
	        sonogramAudioAnalyser = audioContext.createAnalyser();
	        sonogramAudioAnalyser.fftSize = sonogramFFTSize;
	        sonogramAudioAnalyser.smoothingTimeConstant = sonogramSmoothing;
	
	        initPitchNode();
	        loadAudio();
	        initSliders();
	        initCanvas();
	        window.requestAnimFrame(renderCanvas);
	    }
	
	    function loadAudio() {
	        var request = new XMLHttpRequest();
	        request.open("GET", 'audio/gettysburg_address_64kb.mp3', true);
	        request.responseType = "arraybuffer";
	
	        var loader = this;
	        request.onload = function() {
	
	            // Asynchronously decode the audio file data in request.response
	            audioContext.decodeAudioData(
	
	                request.response,
	
	                function(buffer) {
	                    if (!buffer) {
	                        alert('error decoding file data');
	                        return;
	                    }
	
	                    audioSource = audioContext.createBufferSource();
	                    audioSource.buffer = buffer;
	                    audioSource.loop = true;
	                    audioSource.playbackRate.value = playbackRate;
	                    audioSource.start(0);
	                    if (pitchNode) {
	                        audioSource.connect(pitchNode);
	                    }
	                },
	
	                function(error) {
	                    console.error('decodeAudioData error', error);
	                }
	            );
	        }
	
	        request.onerror = function() {
	            alert('BufferLoader: XHR error');
	        }
	
	        request.send();
	    }
	
	    function initPitchNode() {
	        if (pitchNode) {
	            pitchNode.disconnect();
	            if (audioSource) {
	                audioSource.disconnect();
	            }
	        }
	
	        pitchNode = new pitchShiftNode(audioContext, pitchRatio);
	
	        if (audioSource) {
	            audioSource.connect(pitchNode);
	        }
	
	        pitchNode.connect(spectrumAudioAnalyser);
	        pitchNode.connect(sonogramAudioAnalyser);
	        pitchNode.connect(audioContext.destination);
	    }
	
	    function initSliders() {
	        $("#pitchRatioSlider").slider({
	            orientation: "horizontal",
	            min: 0.5,
	            max: 2,
	            step: 0.001,
	            range: 'min',
	            value: pitchRatio,
	            slide: function(event, ui) {
	                pitchRatio = ui.value;
	                pitchNode.shiftOffset = pitchRatio;
	                $("#pitchRatioDisplay").text(pitchRatio);
	            }
	        });
	
	        $("#audioVisualisationSlider").slider({
	            orientation: "horizontal",
	            min: 0,
	            max: audioVisualisationNames.length - 1,
	            step: 1,
	            value: audioVisualisationIndex,
	            slide: function(event, ui) {
	                audioVisualisationIndex = ui.value;
	                $("#audioVisualisationDisplay").text(audioVisualisationNames[audioVisualisationIndex]);
	            }
	        });
	
	        $("#playbackRateSlider").slider({
	            orientation: "horizontal",
	            min: 0.5,
	            max: 2,
	            step: 0.001,
	            range: 'min',
	            value: playbackRate,
	            slide: function(event, ui) {
	                playbackRate = ui.value;
	                if (audioSource) {
	                    audioSource.playbackRate.value = playbackRate;
	                }
	                $("#playbackRateDisplay").text(playbackRate);
	            }
	        });
	
	        $("#pitchRatioDisplay").text(pitchRatio);
	        $("#audioVisualisationDisplay").text(audioVisualisationNames[audioVisualisationIndex]);
	        $("#playbackRateDisplay").text(playbackRate);
	    }
	
	    function initCanvas() {
	
	        canvas = document.querySelector('canvas');
	        canvasContext = canvas.getContext('2d');
	
	        barGradient = canvasContext.createLinearGradient(0, 0, 1, canvas.height - 1);
	        barGradient.addColorStop(0, '#550000');
	        barGradient.addColorStop(0.995, '#AA5555');
	        barGradient.addColorStop(1, '#555555');
	
	        waveGradient = canvasContext.createLinearGradient(canvas.width - 2, 0, canvas.width - 1, canvas.height - 1);
	        waveGradient.addColorStop(0, '#FFFFFF');
	        waveGradient.addColorStop(0.75, '#550000');
	        waveGradient.addColorStop(0.75, '#555555');
	        waveGradient.addColorStop(0.76, '#AA5555');
	        waveGradient.addColorStop(1, '#FFFFFF');
	    }
	
	    function renderCanvas() {
	        switch (audioVisualisationIndex) {
	
	            case 0:
	
	                var frequencyData = new Uint8Array(spectrumAudioAnalyser.frequencyBinCount);
	                spectrumAudioAnalyser.getByteFrequencyData(frequencyData);
	
	                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	                canvasContext.fillStyle = barGradient;
	
	                var barWidth = canvas.width / frequencyData.length;
	                for (i = 0; i < frequencyData.length; i++) {
	                    var magnitude = frequencyData[i];
	                    canvasContext.fillRect(barWidth * i, canvas.height, barWidth - 1, -magnitude - 1);
	                }
	
	                break;
	
	            case 1:
	
	                var timeData = new Uint8Array(spectrumAudioAnalyser.frequencyBinCount);
	                spectrumAudioAnalyser.getByteTimeDomainData(timeData);
	                var amplitude = 0.0;
	                for (i = 0; i < timeData.length; i++) {
	                    amplitude += timeData[i];
	                }
	                amplitude = Math.abs(amplitude / timeData.length - 128) * 5 + 1;
	
	                var previousImage = canvasContext.getImageData(1, 0, canvas.width - 1, canvas.height);
	                canvasContext.putImageData(previousImage, 0, 0);
	
	                var axisY = canvas.height * 3 / 4;
	                canvasContext.fillStyle = '#FFFFFF';
	                canvasContext.fillRect(canvas.width - 1, 0, 1, canvas.height);
	                canvasContext.fillStyle = waveGradient;
	                canvasContext.fillRect(canvas.width - 1, axisY, 1, -amplitude);
	                canvasContext.fillRect(canvas.width - 1, axisY, 1, amplitude / 2);
	
	                break;
	
	            case 2:
	
	                frequencyData = new Uint8Array(sonogramAudioAnalyser.frequencyBinCount);
	                sonogramAudioAnalyser.getByteFrequencyData(frequencyData);
	
	                previousImage = canvasContext.getImageData(1, 0, canvas.width - 1, canvas.height);
	                canvasContext.putImageData(previousImage, 0, 0);
	
	                var bandHeight = canvas.height / frequencyData.length;
	                for (var i = 0, y = canvas.height - 1; i < frequencyData.length; i++, y -= bandHeight) {
	
	                    var color = frequencyData[i] << 16;
	                    canvasContext.fillStyle = '#' + color.toString(16);
	                    canvasContext.fillRect(canvas.width - 1, y, 1, -bandHeight);
	                }
	
	                break;
	        }
	
	        window.requestAnimFrame(renderCanvas);
	    }
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var pitchShift = __webpack_require__(2);
	var pool = __webpack_require__(30);
	
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var frameHop = __webpack_require__(3)
	var overlapAdd = __webpack_require__(4)
	var detectPitch = __webpack_require__(5)
	var pool = __webpack_require__(7)
	
	function createWindow(n) {
	  var result = new Float32Array(n)
	  for(var i=0; i<n; ++i) {
	    var t = i / (n-1)
	    result[i] = 0.5 * (1.0 - Math.cos(2.0*Math.PI * t))
	  }
	  return result
	}
	
	function normalizeWindow(w, hop_size) {
	  var n = w.length
	  var nh = (n / hop_size)|0
	  var scale = pool.mallocFloat32(n)
	  for(var i=0; i<n; ++i) {
	    var s = 0.0
	    for(var j=0; j<nh; ++j) {
	      s += w[(i + j*hop_size)%n]
	    }
	    scale[i] = s
	  }
	  for(var i=0; i<n; ++i) {
	    w[i] /= scale[i]
	  }
	  pool.freeFloat32(scale)
	}
	
	//Applies window to signal
	function applyWindow(X, W, frame) {
	  var i, n = frame.length
	  for(i=0; i<n; ++i) {
	    X[i] = W[i] * frame[i]
	  }
	}
	
	//Performs the actual pitch scaling
	function scalePitch(out, x, nx, period, scale, shift, w) {
	  var no = out.length
	  for(var i=0; i<no; ++i) {
	    var t  = i * scale + shift
	    var ti = Math.floor(t)|0
	    var tf = t - ti
	    var x1 = x[ti%nx]
	    var x2 = x[(ti+1)%nx]
	    var v = (1.0 - tf) * x1 + tf * x2
	    out[i] = w[i] * v
	  }
	}
	
	//Match start/end points of signal to avoid popping artefacts
	function findMatch(x, start, step) {
	  var a = x[0], b = x[step], c = x[2*step]
	  var n = x.length
	  var best_d = 8
	  var best_i = start
	  for(var i=start; i<n-2*step; ++i) {
	    var s = x[i]-a, t = x[i+step]-b, u=x[i+2*step]-c
	    var d = s*s + t*t + u*u
	    if( d < best_d ) {
	      best_d = d
	      best_i = i
	    }
	  }
	  return best_i
	}
	
	function pitchShift(onData, onTune, options) {
	  options = options || {}
	  
	  var frame_size  = options.frameSize || 2048
	  var hop_size    = options.hopSize || (frame_size>>>2)
	  var sample_rate = options.sampleRate || 44100
	  var data_size   = options.maxDataSize || undefined
	  var a_window    = options.analysisWindow || createWindow(frame_size)
	  var s_window    = options.synthesisWindow || createWindow(frame_size)
	  var threshold   = options.freqThreshold || 0.9
	  var start_bin   = options.minPeriod || Math.min(hop_size, Math.max(16, Math.round(sample_rate / 400)))|0
	  
	  var detect_params = {
	    threshold: threshold,
	    start_bin: start_bin
	  }
	  
	  var t           = 0
	  var cur         = new Float32Array(frame_size)
	  
	  if(frame_size % hop_size !== 0) {
	    throw new Error("Hop size must divide frame size")
	  }
	  
	  //Normalize synthesis window
	  normalizeWindow(s_window, hop_size)
	  
	  var addFrame = overlapAdd(frame_size, hop_size, onData)
	  var delay = 0
	  
	  function doPitchShift(frame) {
	
	    //Apply window
	    applyWindow(cur, a_window, frame)
	    
	    //Compute pitch, period and sample rate
	    var period = detectPitch(cur, detect_params)
	    var pitch = 0.0
	    if(period > 0) {
	      pitch = sample_rate / period
	    }
	    var scale_f = onTune(t / sample_rate, pitch)
	    
	    //Calculate frame size
	    var fsize = frame_size>>1
	    if(period > 0) {
	      fsize = (Math.max(1, Math.floor(0.5*frame_size/period)) * period)|0
	    }    
	    fsize = findMatch(frame, fsize|0, Math.max(1, period/20)|0)
	    
	    //Apply scaling
	    delay = ((delay % fsize) + fsize) % fsize
	    scalePitch(cur, frame, fsize, period|0, scale_f, delay, s_window)
	    
	    //Update counters
	    delay += hop_size * (scale_f - 1.0)
	    t += hop_size
	    
	    //Add frame
	    addFrame(cur)
	  }
	  
	  return frameHop(frame_size, hop_size, doPitchShift, data_size)
	}
	module.exports = pitchShift
	


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	// Slices a stream of frames into a stream of overlapping windows
	// The size of each frame is the same as the size o
	function createHopStream(frame_size, hop_size, onFrame, max_data_size) {
	  if(hop_size > frame_size) {
	    throw new Error("Hop size must be smaller than frame size")
	  }
	  max_data_size     = max_data_size || frame_size
	  var buffer        = new Float32Array(frame_size + max_data_size)
	  var ptr           = 0
	  var frame_slices  = []
	  for(var j=0; j+frame_size<=buffer.length; j+=hop_size) {
	    frame_slices.push(buffer.subarray(j, j+frame_size))
	  }
	  return function processHopData(data) {
	    var i, j, k
	    buffer.set(data, ptr)
	    ptr += data.length
	    for(i=0, j=0; j+frame_size<=ptr; ++i, j+=hop_size) {
	      onFrame(frame_slices[i])
	    }
	    for(k=0; j<ptr; ) {
	      buffer.set(frame_slices[i], k)
	      var nhops = Math.ceil((k+frame_size) / hop_size)|0
	      var nptr  = nhops * hop_size
	      if(nptr !== k+frame_size) {
	        nhops -= 1
	        nptr -= hop_size
	      }
	      i += nhops
	      j += (nptr - k)
	      k  = nptr
	    }
	    ptr += k - j
	  }
	}
	
	module.exports = createHopStream
	


/***/ },
/* 4 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	function overlapAdd(frame_size, hop_size, onFrame) {
	  if(hop_size > frame_size) {
	    throw new Error("Hop size must be smaller than frame size")
	  }
	  var buffer = new Float32Array(2 * frame_size)
	  var first_slice = buffer.subarray(0, frame_size)
	  var second_slice = buffer.subarray(frame_size)
	  var sptr = 0, eptr = 0
	  return function processOverlapAdd(data) {
	    var n = frame_size
	    var i, j, k
	    var B = buffer
	    
	    //Add data to frame
	    k = eptr
	    for(i=0, j=sptr; j<k && i<n; ++i, ++j) {
	      B[j] += data[i]
	    }
	    for(; i<n; ++i, ++j) {
	      B[j] = data[i]
	    }
	    sptr += hop_size
	    eptr = j
	    
	    //Emit frame if necessary
	    if(sptr >= frame_size) {
	      onFrame(first_slice)
	      first_slice.set(second_slice)
	      sptr -= frame_size
	      eptr -= frame_size
	    }
	  }
	}
	
	module.exports = overlapAdd


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var bits = __webpack_require__(6)
	var pool = __webpack_require__(7)
	var ndarray = __webpack_require__(10)
	var ops = __webpack_require__(13)
	var fft = __webpack_require__(20)
	
	function zero(arr, lo, hi) {
	  for(var i=lo; i<hi; ++i) {
	    arr[i] = 0.0
	  }
	}
	
	function square(x, y) {
	  var n = x.length, n2 = Math.ceil(0.5*n)|0
	  x[0] = y[0] = 0.0
	  for(var i=1; i<n2; ++i) {
	    var a = x[i], b = y[i]
	    x[n-i] = x[i] = a*a + b*b
	    y[n-i] = y[i] = 0.0
	  }
	}
	
	function findPeriod(x, lo, hi, scale_f) {
	  //1st pass compute best val
	  var loc_m = 0.0
	  for(var i=lo; i<hi; ++i) {
	    loc_m = Math.max(loc_m, x[i])
	  }
	  //2nd pass compute max
	  var threshold = loc_m * scale_f
	  for(var i=lo; i<hi; ++i) {
	    if(x[i] > threshold) {
	      var best = x[i]
	      var r = i
	      for(var j=i; j < hi && x[j] > threshold; ++j) {
	        if(x[j] > best) {
	          best = x[j]
	          r = j
	        }
	      }
	      var y0 = x[r-1], y1 = x[r], y2 = x[r+1]
	      var denom = y2 - y1 + y0
	      if(Math.abs(denom) < 1e-6) {
	        return r
	      }
	      var numer = y0 - y2
	      return r + 0.5 * numer / denom
	    }
	  }
	  return 0
	}
	
	function detectPitch(signal, options) {
	  options = options || {}
	  var xs
	  if(signal.shape) {
	    xs = signal.shape[0]
	  } else {
	    xs = signal.length
	  }
	  
	  var i, j, k
	  var n = bits.nextPow2(2*xs)
	  var re_arr = pool.mallocFloat(n)
	  var im_arr = pool.mallocFloat(n)
	  var X = ndarray.ctor(re_arr, [n], [1], 0)
	  var Y = ndarray.ctor(im_arr, [n], [1], 0)
	  
	  //Initialize array depending on if it is a typed array
	  if(signal.shape) {
	    X.shape[0] = xs
	    ops.assign(X, signal)
	    X.shape[0] = n
	  } else {
	    re_arr.set(signal)
	  }
	  zero(re_arr, xs, n)
	  zero(im_arr, 0, n)
	  
	  //Autocorrelate
	  fft(1, X, Y)
	  square(re_arr, im_arr)
	  fft(-1, X, Y)
	  
	  //Detect pitch
	  var threshold = options.threshold || 0.9
	  var period = findPeriod(
	          re_arr,
	          options.start_bin || 16,
	          xs>>>1,
	          threshold)
	  
	  //Free temporary arrays
	  pool.freeFloat(re_arr)
	  pool.freeFloat(im_arr)
	  
	  return period
	}
	module.exports = detectPitch


/***/ },
/* 6 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	/**
	 * Bit twiddling hacks for JavaScript.
	 *
	 * Author: Mikola Lysenko
	 *
	 * Ported from Stanford bit twiddling hack library:
	 *    http://graphics.stanford.edu/~seander/bithacks.html
	 */
	
	"use strict"; "use restrict";
	
	//Number of bits in an integer
	var INT_BITS = 32;
	
	//Constants
	exports.INT_BITS  = INT_BITS;
	exports.INT_MAX   =  0x7fffffff;
	exports.INT_MIN   = -1<<(INT_BITS-1);
	
	//Returns -1, 0, +1 depending on sign of x
	exports.sign = function(v) {
	  return (v > 0) - (v < 0);
	}
	
	//Computes absolute value of integer
	exports.abs = function(v) {
	  var mask = v >> (INT_BITS-1);
	  return (v ^ mask) - mask;
	}
	
	//Computes minimum of integers x and y
	exports.min = function(x, y) {
	  return y ^ ((x ^ y) & -(x < y));
	}
	
	//Computes maximum of integers x and y
	exports.max = function(x, y) {
	  return x ^ ((x ^ y) & -(x < y));
	}
	
	//Checks if a number is a power of two
	exports.isPow2 = function(v) {
	  return !(v & (v-1)) && (!!v);
	}
	
	//Computes log base 2 of v
	exports.log2 = function(v) {
	  var r, shift;
	  r =     (v > 0xFFFF) << 4; v >>>= r;
	  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
	  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
	  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
	  return r | (v >> 1);
	}
	
	//Computes log base 10 of v
	exports.log10 = function(v) {
	  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
	          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
	          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
	}
	
	//Counts number of bits
	exports.popCount = function(v) {
	  v = v - ((v >>> 1) & 0x55555555);
	  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
	}
	
	//Counts number of trailing zeros
	function countTrailingZeros(v) {
	  var c = 32;
	  v &= -v;
	  if (v) c--;
	  if (v & 0x0000FFFF) c -= 16;
	  if (v & 0x00FF00FF) c -= 8;
	  if (v & 0x0F0F0F0F) c -= 4;
	  if (v & 0x33333333) c -= 2;
	  if (v & 0x55555555) c -= 1;
	  return c;
	}
	exports.countTrailingZeros = countTrailingZeros;
	
	//Rounds to next power of 2
	exports.nextPow2 = function(v) {
	  v += v === 0;
	  --v;
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v + 1;
	}
	
	//Rounds down to previous power of 2
	exports.prevPow2 = function(v) {
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v - (v>>>1);
	}
	
	//Computes parity of word
	exports.parity = function(v) {
	  v ^= v >>> 16;
	  v ^= v >>> 8;
	  v ^= v >>> 4;
	  v &= 0xf;
	  return (0x6996 >>> v) & 1;
	}
	
	var REVERSE_TABLE = new Array(256);
	
	(function(tab) {
	  for(var i=0; i<256; ++i) {
	    var v = i, r = i, s = 7;
	    for (v >>>= 1; v; v >>>= 1) {
	      r <<= 1;
	      r |= v & 1;
	      --s;
	    }
	    tab[i] = (r << s) & 0xff;
	  }
	})(REVERSE_TABLE);
	
	//Reverse bits in a 32 bit word
	exports.reverse = function(v) {
	  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
	          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
	          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
	           REVERSE_TABLE[(v >>> 24) & 0xff];
	}
	
	//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
	exports.interleave2 = function(x, y) {
	  x &= 0xFFFF;
	  x = (x | (x << 8)) & 0x00FF00FF;
	  x = (x | (x << 4)) & 0x0F0F0F0F;
	  x = (x | (x << 2)) & 0x33333333;
	  x = (x | (x << 1)) & 0x55555555;
	
	  y &= 0xFFFF;
	  y = (y | (y << 8)) & 0x00FF00FF;
	  y = (y | (y << 4)) & 0x0F0F0F0F;
	  y = (y | (y << 2)) & 0x33333333;
	  y = (y | (y << 1)) & 0x55555555;
	
	  return x | (y << 1);
	}
	
	//Extracts the nth interleaved component
	exports.deinterleave2 = function(v, n) {
	  v = (v >>> n) & 0x55555555;
	  v = (v | (v >>> 1))  & 0x33333333;
	  v = (v | (v >>> 2))  & 0x0F0F0F0F;
	  v = (v | (v >>> 4))  & 0x00FF00FF;
	  v = (v | (v >>> 16)) & 0x000FFFF;
	  return (v << 16) >> 16;
	}
	
	
	//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
	exports.interleave3 = function(x, y, z) {
	  x &= 0x3FF;
	  x  = (x | (x<<16)) & 4278190335;
	  x  = (x | (x<<8))  & 251719695;
	  x  = (x | (x<<4))  & 3272356035;
	  x  = (x | (x<<2))  & 1227133513;
	
	  y &= 0x3FF;
	  y  = (y | (y<<16)) & 4278190335;
	  y  = (y | (y<<8))  & 251719695;
	  y  = (y | (y<<4))  & 3272356035;
	  y  = (y | (y<<2))  & 1227133513;
	  x |= (y << 1);
	  
	  z &= 0x3FF;
	  z  = (z | (z<<16)) & 4278190335;
	  z  = (z | (z<<8))  & 251719695;
	  z  = (z | (z<<4))  & 3272356035;
	  z  = (z | (z<<2))  & 1227133513;
	  
	  return x | (z << 2);
	}
	
	//Extracts nth interleaved component of a 3-tuple
	exports.deinterleave3 = function(v, n) {
	  v = (v >>> n)       & 1227133513;
	  v = (v | (v>>>2))   & 3272356035;
	  v = (v | (v>>>4))   & 251719695;
	  v = (v | (v>>>8))   & 4278190335;
	  v = (v | (v>>>16))  & 0x3FF;
	  return (v<<22)>>22;
	}
	
	//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
	exports.nextCombination = function(v) {
	  var t = v | (v - 1);
	  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
	}
	
	


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var bits = __webpack_require__(8)
	var dup = __webpack_require__(9)
	if(!global.__TYPEDARRAY_POOL) {
	  global.__TYPEDARRAY_POOL = {
	      UINT8   : dup([32, 0])
	    , UINT16  : dup([32, 0])
	    , UINT32  : dup([32, 0])
	    , INT8    : dup([32, 0])
	    , INT16   : dup([32, 0])
	    , INT32   : dup([32, 0])
	    , FLOAT   : dup([32, 0])
	    , DOUBLE  : dup([32, 0])
	    , DATA    : dup([32, 0])
	  }
	}
	var POOL = global.__TYPEDARRAY_POOL
	var UINT8   = POOL.UINT8
	  , UINT16  = POOL.UINT16
	  , UINT32  = POOL.UINT32
	  , INT8    = POOL.INT8
	  , INT16   = POOL.INT16
	  , INT32   = POOL.INT32
	  , FLOAT   = POOL.FLOAT
	  , DOUBLE  = POOL.DOUBLE
	  , DATA    = POOL.DATA
	
	exports.free = function free(array) {
	  if(array instanceof ArrayBuffer) {
	    var n = array.byteLength|0
	      , log_n = bits.log2(n)
	    DATA[log_n].push(array)
	  } else {
	    var n = array.length|0
	      , log_n = bits.log2(n)
	    if(array instanceof Uint8Array) {
	      UINT8[log_n].push(array)
	    } else if(array instanceof Uint16Array) {
	      UINT16[log_n].push(array)
	    } else if(array instanceof Uint32Array) {
	      UINT32[log_n].push(array)
	    } else if(array instanceof Int8Array) {
	      INT8[log_n].push(array)
	    } else if(array instanceof Int16Array) {
	      INT16[log_n].push(array)
	    } else if(array instanceof Int32Array) {
	      INT32[log_n].push(array)
	    } else if(array instanceof Float32Array) {
	      FLOAT[log_n].push(array)
	    } else if(array instanceof Float64Array) {
	      DOUBLE[log_n].push(array)
	    }
	  }
	}
	
	exports.freeUint8 = function freeUint8(array) {
	  UINT8[bits.log2(array.length)].push(array)
	}
	
	exports.freeUint16 = function freeUint16(array) {
	  UINT16[bits.log2(array.length)].push(array)
	}
	
	exports.freeUint32 = function freeUint32(array) {
	  UINT32[bits.log2(array.length)].push(array)
	}
	
	exports.freeInt8 = function freeInt8(array) {
	  INT8[bits.log2(array.length)].push(array)
	}
	
	exports.freeInt16 = function freeInt16(array) {
	  INT16[bits.log2(array.length)].push(array)
	}
	
	exports.freeInt32 = function freeInt32(array) {
	  INT32[bits.log2(array.length)].push(array)
	}
	
	exports.freeFloat32 = exports.freeFloat = function freeFloat(array) {
	  FLOAT[bits.log2(array.length)].push(array)
	}
	
	exports.freeFloat64 = exports.freeDouble = function freeDouble(array) {
	  DOUBLE[bits.log2(array.length)].push(array)
	}
	
	exports.freeArrayBuffer = function freeArrayBuffer(array) {
	  DATA[bits.log2(array.length)].push(array)
	}
	
	exports.malloc = function malloc(n, dtype) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  if(dtype === undefined) {
	    var d = DATA[log_n]
	    if(d.length > 0) {
	      var r = d[d.length-1]
	      d.pop()
	      return r
	    }
	    return new ArrayBuffer(n)
	  } else {
	    switch(dtype) {
	      case "uint8":
	        var u8 = UINT8[log_n]
	        if(u8.length > 0) {
	          return u8.pop()
	        }
	        return new Uint8Array(n)
	      break
	
	      case "uint16":
	        var u16 = UINT16[log_n]
	        if(u16.length > 0) {
	          return u16.pop()
	        }
	        return new Uint16Array(n)
	      break
	
	      case "uint32":
	        var u32 = UINT32[log_n]
	        if(u32.length > 0) {
	          return u32.pop()
	        }
	        return new Uint32Array(n)
	      break
	
	      case "int8":
	        var i8 = INT8[log_n]
	        if(i8.length > 0) {
	          return i8.pop()
	        }
	        return new Int8Array(n)
	      break
	
	      case "int16":
	        var i16 = INT16[log_n]
	        if(i16.length > 0) {
	          return i16.pop()
	        }
	        return new Int16Array(n)
	      break
	
	      case "int32":
	        var i32 = INT32[log_n]
	        if(i32.length > 0) {
	          return i32.pop()
	        }
	        return new Int32Array(n)
	      break
	
	      case "float":
	      case "float32":
	        var f = FLOAT[log_n]
	        if(f.length > 0) {
	          return f.pop()
	        }
	        return new Float32Array(n)
	      break
	
	      case "double":
	      case "float64":
	        var dd = DOUBLE[log_n]
	        if(dd.length > 0) {
	          return dd.pop()
	        }
	        return new Float64Array(n)
	      break
	
	      default:
	        return null
	    }
	  }
	  return null
	}
	
	exports.mallocUint8 = function mallocUint8(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = UINT8[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Uint8Array(n)
	}
	
	exports.mallocUint16 = function mallocUint16(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = UINT16[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Uint16Array(n)
	}
	
	exports.mallocUint32 = function mallocUint32(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = UINT32[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Uint32Array(n)
	}
	
	exports.mallocInt8 = function mallocInt8(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = INT8[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Int8Array(n)
	}
	
	exports.mallocInt16 = function mallocInt16(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = INT16[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Int16Array(n)
	}
	
	exports.mallocInt32 = function mallocInt32(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = INT32[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Int32Array(n)
	}
	
	exports.mallocFloat32 = exports.mallocFloat = function mallocFloat(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = FLOAT[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Float32Array(n)
	}
	
	exports.mallocFloat64 = exports.mallocDouble = function mallocDouble(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = DOUBLE[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Float64Array(n)
	}
	
	exports.mallocArrayBuffer = function mallocArrayBuffer(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = DATA[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new ArrayBuffer(n)
	}
	
	exports.clearCache = function clearCache() {
	  for(var i=0; i<32; ++i) {
	    UINT8[i].length = 0
	    UINT16[i].length = 0
	    UINT32[i].length = 0
	    INT8[i].length = 0
	    INT16[i].length = 0
	    INT32[i].length = 0
	    FLOAT[i].length = 0
	    DOUBLE[i].length = 0
	    DATA[i].length = 0
	  }
	}
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 8 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	/**
	 * Bit twiddling hacks for JavaScript.
	 *
	 * Author: Mikola Lysenko
	 *
	 * Ported from Stanford bit twiddling hack library:
	 *    http://graphics.stanford.edu/~seander/bithacks.html
	 */
	
	"use strict"; "use restrict";
	
	//Number of bits in an integer
	var INT_BITS = 32;
	
	//Constants
	exports.INT_BITS  = INT_BITS;
	exports.INT_MAX   =  0x7fffffff;
	exports.INT_MIN   = -1<<(INT_BITS-1);
	
	//Returns -1, 0, +1 depending on sign of x
	exports.sign = function(v) {
	  return (v > 0) - (v < 0);
	}
	
	//Computes absolute value of integer
	exports.abs = function(v) {
	  var mask = v >> (INT_BITS-1);
	  return (v ^ mask) - mask;
	}
	
	//Computes minimum of integers x and y
	exports.min = function(x, y) {
	  return y ^ ((x ^ y) & -(x < y));
	}
	
	//Computes maximum of integers x and y
	exports.max = function(x, y) {
	  return x ^ ((x ^ y) & -(x < y));
	}
	
	//Checks if a number is a power of two
	exports.isPow2 = function(v) {
	  return !(v & (v-1)) && (!!v);
	}
	
	//Computes log base 2 of v
	exports.log2 = function(v) {
	  var r, shift;
	  r =     (v > 0xFFFF) << 4; v >>>= r;
	  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
	  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
	  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
	  return r | (v >> 1);
	}
	
	//Computes log base 10 of v
	exports.log10 = function(v) {
	  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
	          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
	          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
	}
	
	//Counts number of bits
	exports.popCount = function(v) {
	  v = v - ((v >>> 1) & 0x55555555);
	  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
	}
	
	//Counts number of trailing zeros
	function countTrailingZeros(v) {
	  var c = 32;
	  v &= -v;
	  if (v) c--;
	  if (v & 0x0000FFFF) c -= 16;
	  if (v & 0x00FF00FF) c -= 8;
	  if (v & 0x0F0F0F0F) c -= 4;
	  if (v & 0x33333333) c -= 2;
	  if (v & 0x55555555) c -= 1;
	  return c;
	}
	exports.countTrailingZeros = countTrailingZeros;
	
	//Rounds to next power of 2
	exports.nextPow2 = function(v) {
	  v += v === 0;
	  --v;
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v + 1;
	}
	
	//Rounds down to previous power of 2
	exports.prevPow2 = function(v) {
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v - (v>>>1);
	}
	
	//Computes parity of word
	exports.parity = function(v) {
	  v ^= v >>> 16;
	  v ^= v >>> 8;
	  v ^= v >>> 4;
	  v &= 0xf;
	  return (0x6996 >>> v) & 1;
	}
	
	var REVERSE_TABLE = new Array(256);
	
	(function(tab) {
	  for(var i=0; i<256; ++i) {
	    var v = i, r = i, s = 7;
	    for (v >>>= 1; v; v >>>= 1) {
	      r <<= 1;
	      r |= v & 1;
	      --s;
	    }
	    tab[i] = (r << s) & 0xff;
	  }
	})(REVERSE_TABLE);
	
	//Reverse bits in a 32 bit word
	exports.reverse = function(v) {
	  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
	          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
	          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
	           REVERSE_TABLE[(v >>> 24) & 0xff];
	}
	
	//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
	exports.interleave2 = function(x, y) {
	  x &= 0xFFFF;
	  x = (x | (x << 8)) & 0x00FF00FF;
	  x = (x | (x << 4)) & 0x0F0F0F0F;
	  x = (x | (x << 2)) & 0x33333333;
	  x = (x | (x << 1)) & 0x55555555;
	
	  y &= 0xFFFF;
	  y = (y | (y << 8)) & 0x00FF00FF;
	  y = (y | (y << 4)) & 0x0F0F0F0F;
	  y = (y | (y << 2)) & 0x33333333;
	  y = (y | (y << 1)) & 0x55555555;
	
	  return x | (y << 1);
	}
	
	//Extracts the nth interleaved component
	exports.deinterleave2 = function(v, n) {
	  v = (v >>> n) & 0x55555555;
	  v = (v | (v >>> 1))  & 0x33333333;
	  v = (v | (v >>> 2))  & 0x0F0F0F0F;
	  v = (v | (v >>> 4))  & 0x00FF00FF;
	  v = (v | (v >>> 16)) & 0x000FFFF;
	  return (v << 16) >> 16;
	}
	
	
	//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
	exports.interleave3 = function(x, y, z) {
	  x &= 0x3FF;
	  x  = (x | (x<<16)) & 4278190335;
	  x  = (x | (x<<8))  & 251719695;
	  x  = (x | (x<<4))  & 3272356035;
	  x  = (x | (x<<2))  & 1227133513;
	
	  y &= 0x3FF;
	  y  = (y | (y<<16)) & 4278190335;
	  y  = (y | (y<<8))  & 251719695;
	  y  = (y | (y<<4))  & 3272356035;
	  y  = (y | (y<<2))  & 1227133513;
	  x |= (y << 1);
	  
	  z &= 0x3FF;
	  z  = (z | (z<<16)) & 4278190335;
	  z  = (z | (z<<8))  & 251719695;
	  z  = (z | (z<<4))  & 3272356035;
	  z  = (z | (z<<2))  & 1227133513;
	  
	  return x | (z << 2);
	}
	
	//Extracts nth interleaved component of a 3-tuple
	exports.deinterleave3 = function(v, n) {
	  v = (v >>> n)       & 1227133513;
	  v = (v | (v>>>2))   & 3272356035;
	  v = (v | (v>>>4))   & 251719695;
	  v = (v | (v>>>8))   & 4278190335;
	  v = (v | (v>>>16))  & 0x3FF;
	  return (v<<22)>>22;
	}
	
	//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
	exports.nextCombination = function(v) {
	  var t = v | (v - 1);
	  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
	}
	
	


/***/ },
/* 9 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	function dupe_array(count, value, i) {
	  var c = count[i]|0
	  if(c <= 0) {
	    return []
	  }
	  var result = new Array(c), j
	  if(i === count.length-1) {
	    for(j=0; j<c; ++j) {
	      result[j] = value
	    }
	  } else {
	    for(j=0; j<c; ++j) {
	      result[j] = dupe_array(count, value, i+1)
	    }
	  }
	  return result
	}
	
	function dupe_number(count, value) {
	  var result, i
	  result = new Array(count)
	  for(i=0; i<count; ++i) {
	    result[i] = value
	  }
	  return result
	}
	
	function dupe(count, value) {
	  if(typeof value === "undefined") {
	    value = 0
	  }
	  switch(typeof count) {
	    case "number":
	      if(count > 0) {
	        return dupe_number(count|0, value)
	      }
	    break
	    case "object":
	      if(typeof (count.length) === "number") {
	        return dupe_array(count, value, 0)
	      }
	    break
	  }
	  return []
	}
	
	module.exports = dupe


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var tools = __webpack_require__(11)
	var makeView = __webpack_require__(12)
	
	function arrayDType(data) {
	  if(data instanceof Float64Array) {
	    return "float64";
	  } else if(data instanceof Float32Array) {
	    return "float32"
	  } else if(data instanceof Int32Array) {
	    return "int32"
	  } else if(data instanceof Uint32Array) {
	    return "uint32"
	  } else if(data instanceof Uint8Array) {
	    return "uint8"
	  } else if(data instanceof Uint16Array) {
	    return "uint16"
	  } else if(data instanceof Int16Array) {
	    return "int16"
	  } else if(data instanceof Int8Array) {
	    return "int8"
	  }
	  return null
	}
	
	function eor(shape, stride, offset) {
	  for(var i=0; i<shape.length; ++i) {
	    if(shape[i] === 0) {
	      return 0
	    }
	    offset += (shape[i]-1) * stride[i]
	  }
	  return offset
	}
	
	//Wraps a typed array as an ndarray
	function wrap(tarray, shape, stride, offset) {
	  if(!arrayDType(tarray)) {
	    throw new Error("Input is not a typed array")
	  }
	  if(!shape) {
	    shape = [ tarray.length ]
	  } else {
	    var tsz = 1
	    for(var i=0; i<shape.length; ++i) {
	      tsz *= shape[i]
	    }
	    if(tsz > tarray.length) {
	      throw new Error("Array shape out of bounds")
	    }
	  }
	  if(!stride) {
	    stride = new Array(shape.length)
	    var sz = 1
	    for(var i=shape.length-1; i>=0; --i) {
	      stride[i] = sz
	      sz *= shape[i]
	    }
	  } else if(stride.length !== shape.length) {
	    throw new Error("Bad stride length")
	  }
	  if(!offset) {
	    offset = 0
	  }
	  if(tarray.length > 0) {
	    if(offset < 0 || offset >= tarray.length) {
	      throw new Error("Offset out of range")
	    }
	    var e = eor(shape, stride, offset)
	    if(e < 0 || e >= tarray.length) {
	      throw new Error("Array shape out of bounds")
	    }
	  } else {
	    offset = 0
	  }
	  return makeView(tarray, shape, stride, offset)
	}
	
	function dtype(view) {
	  return arrayDType(view.data)
	}
	
	function zeros(shape, dtype, order) {
	  if(!dtype) {
	    dtype = "float64"
	  }
	  //Default row-major order
	  if(!order) {
	    order = new Array(shape.length)
	    for(var i=shape.length-1, j=0; i>=0; --i, ++j) {
	      order[j] = i
	    }
	  }
	  var stride =  new Array(shape.length)
	  var size = 1
	  for(var i=0; i<shape.length; ++i) {
	    stride[order[i]] = size
	    size *= shape[order[i]]
	  }
	  var buf
	  switch(dtype) {
	    case "int8":
	      buf = new Int8Array(size)
	    break
	    case "int16":
	      buf = new Int16Array(size)
	    break
	    case "int32":
	      buf = new Int32Array(size)
	    break
	    case "uint8":
	      buf = new Uint8Array(size)
	    break
	    case "uint16":
	      buf = new Uint16Array(size)
	    break
	    case "uint32":
	      buf = new Uint32Array(size)
	    break
	    case "float32":
	      buf = new Float32Array(size)
	    break
	    case "float64":
	      buf = new Float64Array(size)
	    break
	    default:
	      throw new Error("Invalid data type")
	    break
	  }
	  return makeView(buf, shape, stride, 0)
	}
	
	function order(view) {
	  return tools.order(view.stride)
	}
	
	function size(view) {
	  var shape = view.shape
	    , d = shape.length
	    , r = 1, i
	  if(d === 0) {
	    return 0
	  }
	  for(i=0; i<d; ++i) {
	    r *= shape[i]
	  }
	  return r
	}
	
	function pstride(shape, order) {
	  var i = 0, d = shape.length
	  var result = new Array(d), s = 1
	  if(order) {
	    for(i=0; i<d; ++i) {
	      result[order[i]] = s
	      s *= shape[order[i]]
	    }
	  } else {
	    for(var i=d-1; i>=0; --i) {
	      stride[i] = s
	      s *= shape[i]
	    }
	  }
	  return result
	}
	
	module.exports = wrap
	module.exports.zeros    = zeros
	module.exports.dtype    = dtype
	module.exports.order    = order
	module.exports.size     = size
	module.exports.stride   = pstride
	module.exports.ctor     = makeView


/***/ },
/* 11 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	
	function compare1st(a, b) {
	  return a[0] - b[0];
	}
	
	function order(stride) {
	  var terms = new Array(stride.length);
	  for(var i=0; i<terms.length; ++i) {
	    terms[i] = [Math.abs(stride[i]), i];
	  }
	  terms.sort(compare1st);
	  var result = new Array(terms.length);
	  for(var i=0; i<result.length; ++i) {
	    result[i] = terms[i][1];
	  }
	  return result;
	}
	
	exports.order = order;
	
	


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var tools = __webpack_require__(11)
	
	var RECURSION_LIMIT = 32
	
	function ViewN(data, shape, stride, offset) {
	  this.data = data
	  this.shape = shape
	  this.stride = stride
	  this.offset = offset
	}
	
	ViewN.prototype.get = function() {
	  var ptr = this.offset
	  for(var i=0; i<this.shape.length; ++i) {
	    ptr += arguments[i] * this.stride[i]
	  }
	  return this.data[ptr]
	}
	ViewN.prototype.set = function() {
	  var ptr = this.offset
	  for(var i=0; i<this.shape.length; ++i) {
	    ptr += arguments[i] * this.stride[i]
	  }
	  var v = arguments[this.shape.length]
	  this.data[ptr] = v
	  return v
	}
	ViewN.prototype.lo = function() {
	  var nshape = this.shape.slice(0)
	  var nstride = this.stride.slice(0)
	  var noffset = this.offset
	  for(var i=0; i<nshape.length; ++i) {
	    var x = arguments[i]
	    if(typeof x === "number") {
	      x |= 0
	      if(x < 0) {
	        x = nshape[i] + x
	      }
	      noffset += x * nstride[i]
	      nshape[i] -= x
	    }
	  }
	  return new this.constructor(this.data, nshape, nstride, noffset)
	}
	ViewN.prototype.hi = function() {
	  var nshape = new Array(this.shape.length)
	  for(var i=0; i<nshape.length; ++i) {
	    var x = arguments[i]
	    if(typeof x === "number") {
	      x |= 0
	      if(x < 0) {
	        x = this.shape[i] + x
	      }
	      nshape[i] = x
	    } else {
	      nshape[i] = this.shape[i]
	    }
	  }
	  return new this.constructor(this.data, nshape, this.stride.slice(0), this.offset)
	}
	ViewN.prototype.step = function() {
	  var nshape = this.shape.slice(0)
	  var nstride = this.stride.slice(0)
	  var noffset = this.offset
	  for(var i=0; i<nshape.length; ++i) {
	    var s = arguments[i]
	    nstride[i] *= s
	    if(s < 0) {
	      noffset += this.stride[i] * (this.shape[i] - 1)
	      nshape[i] = Math.ceil(-this.shape[i] / s)
	    } else if(s > 0) {
	      nshape[i] = Math.ceil(this.shape[i] / s)
	    }
	  }
	  return new this.constructor(this.data, nshape, nstride, noffset)
	}
	ViewN.prototype.transpose = function() {
	  var nshape = this.shape.slice(0)
	  var nstride = this.stride.slice(0)
	  var noffset = this.offset
	  for(var i=0; i<nshape.length; ++i) {
	    var ord = arguments[i]
	    nshape[i] = this.shape[ord]
	    nstride[i] = this.stride[ord]
	  }
	  return new this.constructor(this.data, nshape, nstride, noffset)
	}
	ViewN.prototype.pick = function() {
	  var nshape = []
	  var nstride = []
	  var noffset = this.offset
	  for(var i=0; i<this.shape.length; ++i) {
	    if(arguments[i] >= 0) {
	      noffset += this.stride[i] * arguments[i]
	    } else {
	      nshape.push(this.shape[i])
	      nstride.push(this.stride[i])
	    }
	  }
	  return CTOR(this.data, nshape, nstride, noffset)
	}
	
	ViewN.prototype.toString = function() {
	  var buffer = []
	  var index = new Array(this.shape.length)
	  for(var i=0; i<index.length; ++i) {
	    index[i] = 0
	  }
	  var ptr = this.offset
	  while(true) {
	    for(var i=index.length-1; i>=0; --i) {
	      if(index[i] === 0) {
	        buffer.push("[")
	      } else {
	        break
	      }
	    }
	    var i = this.shape.length-1
	    buffer.push(this.data[ptr])
	    while(i>=0) {
	      ptr += this.stride[i]
	      ++index[i]
	      if(index[i] >= this.shape[i]) {
	        buffer.push("]")
	        if(i === 0) {
	          return buffer.join("")
	        }
	        ptr -= this.stride[i] * this.shape[i]
	        index[i--] = 0
	      } else {
	        buffer.push(",")
	        break
	      }
	    }
	  }
	}
	
	function View0(data) {
	  this.data = data
	  this.shape = []
	  this.stride = []
	  this.offset = 0
	}
	View0.prototype.get =
	View0.prototype.set = function() {
	  return Number.NaN
	}
	View0.prototype.lo =
	View0.prototype.hi =
	View0.prototype.step =
	View0.prototype.transpose =
	View0.prototype.pick = function() {
	  return new View0(this.data)
	}
	View0.prototype.toString = function() {
	  return "[]"
	}
	
	
	function View1(data, shape, stride, offset) {
	  this.data = data
	  this.shape = shape
	  this.stride = stride
	  this.offset = offset
	}
	View1.prototype.get = function(i) {
	  return this.data[i * this.stride[0] + this.offset]
	}
	View1.prototype.set = function(i, v) {
	  this.data[i * this.stride[0] + this.offset] = v
	  return v
	}
	View1.prototype.lo = ViewN.prototype.lo
	View1.prototype.hi = ViewN.prototype.hi
	View1.prototype.step = ViewN.prototype.step
	View1.prototype.transpose = ViewN.prototype.transpose
	View1.prototype.pick = ViewN.prototype.pick
	View1.prototype.toString = ViewN.prototype.toString
	
	
	function View2(data, shape, stride, offset) {
	  this.data = data
	  this.shape = shape
	  this.stride = stride
	  this.offset = offset
	}
	View2.prototype.get = function(i, j) {
	  return this.data[this.offset + i * this.stride[0] + j * this.stride[1]]
	}
	View2.prototype.set = function(i, j, v) {
	  return this.data[this.offset + i * this.stride[0] + j * this.stride[1]] = v
	}
	View2.prototype.hi = ViewN.prototype.hi
	View2.prototype.lo = ViewN.prototype.lo
	View2.prototype.step = ViewN.prototype.step
	View2.prototype.transpose = ViewN.prototype.transpose
	View2.prototype.pick = ViewN.prototype.pick
	View2.prototype.toString = ViewN.prototype.toString
	
	
	function View3(data, shape, stride, offset) {
	  this.data = data
	  this.shape = shape
	  this.stride = stride
	  this.offset = offset
	}
	View3.prototype.get = function(i, j, k) {
	  return this.data[this.offset + i * this.stride[0] + j * this.stride[1] + k * this.stride[2]]
	}
	View3.prototype.set = function(i, j, k, v) {
	  return this.data[this.offset + i * this.stride[0] + j * this.stride[1] + k * this.stride[2]] = v
	}
	View3.prototype.hi = ViewN.prototype.hi
	View3.prototype.lo = ViewN.prototype.lo
	View3.prototype.step = ViewN.prototype.step
	View3.prototype.transpose = ViewN.prototype.transpose
	View3.prototype.pick = ViewN.prototype.pick
	View3.prototype.toString = ViewN.prototype.toString
	
	
	function CTOR(data, shape, stride, offset) {
	  switch(shape.length) {
	    case 0:   return new View0(data)
	    case 1:   return new View1(data, shape, stride, offset)
	    case 2:   return new View2(data, shape, stride, offset)
	    case 3:   return new View3(data, shape, stride, offset)
	    default:  return new ViewN(data, shape, stride, offset)
	  }
	}
	
	module.exports = CTOR
	


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var cwise = __webpack_require__(14)
	var ndarray = __webpack_require__(10)
	
	var assign_ops = {
	  add:  "+",
	  sub:  "-",
	  mul:  "*",
	  div:  "/",
	  mod:  "%",
	  band: "&",
	  bor:  "|",
	  bxor: "^",
	  lshift: "<<",
	  rshift: ">>",
	  rrshift: ">>>"
	};
	
	(function(){
	  for(var id in assign_ops) {
	    var op = assign_ops[id]
	    exports[id] = cwise({
	      args: ["array","array","array"],
	      body: Function("a","b","c","a=b"+op+"c")
	    })
	    exports[id+"eq"] = cwise({
	      args: ["array","array"],
	      body: Function("a","b","a"+op+"=b")
	    })
	    exports[id+"s"] = cwise({
	      args: ["array", "array", "scalar"],
	      body: Function("a","b","s","a=b"+op+"s")
	    })
	    exports[id+"seq"] = cwise({
	      args: ["array","scalar"],
	      body: Function("a","s","a"+op+"=s")
	    })
	  }
	})()
	
	var unary_ops = {
	  not: "!",
	  bnot: "~",
	  neg: "-",
	  recip: "1.0/"
	};
	
	(function(){
	  for(var id in unary_ops) {
	    var op = unary_ops[id]
	    exports[id] = cwise({
	      args: ["array", "array"],
	      body: Function("a","b","a="+op+"b")
	    })
	    exports[id+"eq"] = cwise({
	      args: ["array"],
	      body: Function("a","a="+op+"a")
	    })
	  }
	})()
	
	var binary_ops = {
	  and: "&&",
	  or: "||",
	  eq: "===",
	  neq: "!==",
	  lt: "<",
	  gt: ">",
	  leq: "<=",
	  geq: ">="
	};
	
	(function() {
	  for(var id in binary_ops) {
	    var op = binary_ops[id]
	    exports[id] = cwise({
	      args: ["array","array","array"],
	      body: Function("a", "b", "c", "a=b"+op+"c")
	    })
	    exports[id+"s"] = cwise({
	      args: ["array","array","scalar"],
	      body: Function("a", "b", "s", "a=b"+op+"s")
	    })
	    exports[id+"eq"] = cwise({
	      args: ["array", "array"],
	      body: Function("a", "b", "a=a"+op+"b")
	    })
	    exports[id+"seq"] = cwise({
	      args: ["array", "scalar"],
	      body: Function("a", "s", "a=a"+op+"s")
	    })
	  }
	})()
	
	var math_unary = [
	  "abs",
	  "acos",
	  "asin",
	  "atan",
	  "ceil",
	  "cos",
	  "exp",
	  "floor",
	  "log",
	  "round",
	  "sin",
	  "sqrt",
	  "tan"
	];
	
	(function() {
	  for(var i=0; i<math_unary.length; ++i) {
	    var f = math_unary[i]
	    exports[f] = cwise({
	                    args: ["array", "array"],
	                    pre: Function("this.func=Math."+f),
	                    body: function(a,b) {
	                      a = this.func(b)
	                    }
	                  })
	    exports[f+"eq"] = cwise({
	                      args: ["array"],
	                      pre: Function("this.func=Math."+f),
	                      body: function(a) {
	                        a = this.func(a)
	                      }
	                    })
	  }
	})()
	
	var math_comm = [
	  "max",
	  "min"
	];
	(function(){
	  for(var i=0; i<math_comm.length; ++i) {
	    var f= math_comm[i]
	 
	    exports[f] = cwise({
	                  args:["array", "array", "array"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b,c) {
	                    a = this.func(b,c)
	                  }
	                })
	    exports[f+"s"] = cwise({
	                  args:["array", "array", "scalar"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b,c) {
	                    a = this.func(b,c)
	                  }})
	    exports[f+"eq"] = cwise({ args:["array", "array"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b) {
	                    a = this.func(a,b)
	                  }})
	 
	    exports[f+"seq"] = cwise({ args:["array", "scalar"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b) {
	                    a = this.func(a,b)
	                  }})
	  }
	})()
	
	var math_noncomm = [
	  "atan2",
	  "pow"
	];
	
	(function(){
	  for(var i=0; i<math_noncomm.length; ++i) {
	    var f= math_noncomm[i]
	    exports[f] = cwise({ args:["array", "array", "array"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b,c) {
	                    a = this.func(b,c)
	                  }})
	                  
	    exports[f+"s"] = cwise({ args:["array", "array", "scalar"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b,c) {
	                    a = this.func(b,c)
	                  }})
	                  
	    exports[f+"eq"] = cwise({ args:["array", "array"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b) {
	                    a = this.func(a,b)
	                  }})
	                  
	    exports[f+"seq"] = cwise({ args:["array", "scalar"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b) {
	                    a = this.func(a,b)
	                  }})
	                  
	    exports[f+"op"] = cwise({ args:["array", "array", "array"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b,c) {
	                    a = this.func(c,b)
	                  }})
	                  
	    exports[f+"ops"] = cwise({ args:["array", "array", "scalar"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b,c) {
	                    a = this.func(c,b)
	                  }})
	                  
	    exports[f+"opeq"] = cwise({ args:["array", "array"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b) {
	                    a = this.func(b,a)
	                  }})
	                  
	    exports[f+"opseq"] = cwise({ args:["array", "scalar"],
	                  pre: Function("this.func=Math."+f),
	                  body: function(a,b) {
	                    a = this.func(b,a)
	                  }})
	                  
	  }
	})()
	
	exports.any = cwise({ args:["array"],
	  body: function(a) {
	    if(a) {
	      return true
	    }
	  },
	  post: function() {
	    return false
	  }})
	  
	
	exports.all = cwise({ args:["array"],
	  body: function(a) {
	    if(!a) {
	      return false
	    }
	  },
	  post: function() {
	    return true
	  }})
	  
	
	exports.sum = cwise({ args:["array"],
	  pre: function() {
	    this.sum = 0
	  },
	  body: function(a) {
	    this.sum += a
	  },
	  post: function() {
	    return this.sum
	  }})
	  
	
	exports.prod = cwise({ args:["array"],
	  pre: function() {
	    this.prod = 1
	  },
	  body: function(a) {
	    this.prod *= a
	  },
	  post: function() {
	    return this.prod
	  }})
	  
	
	exports.norm2squared = cwise({ args:["array"],
	  pre: function() {
	    this.sum = 0
	  },
	  body: function(a) {
	    this.sum += a*a
	  },
	  post: function() {
	    return this.sum
	  }})
	  
	
	
	exports.norm2 = cwise({ args:["array"],
	  pre: function() {
	    this.sum = 0
	  },
	  body: function(a) {
	    this.sum += a*a
	  },
	  post: function() {
	    return Math.sqrt(this.sum)
	  }})
	  
	
	exports.norminf = cwise({ args:["array"],
	  pre: function() {
	    this.n = 0
	  },
	  body: function(a) {
	    if(a<0){
	      if(-a<this.n){
	        this.n=-a
	      }
	    } else if(a>this.n){
	      s=a
	    }
	  },
	  post: function() {
	    return this.n
	  }})
	  
	
	exports.norm1 = cwise({ args:["array"],
	  pre: function() {
	    this.sum = 0
	  },
	  body: function(a) {
	    this.sum += a < 0 ? -a : a
	  },
	  post: function() {
	    return this.sum
	  }})
	
	
	exports.sup = cwise({ args:["array"],
	  pre: function() {
	    this.hi = Number.NEGATIVE_INFINITY
	  },
	  body: function(a) {
	    if(a > this.hi) {
	      this.hi = a
	    }
	  },
	  post: function() {
	    return this.hi
	  }})
	  
	
	exports.inf = cwise({ args:["array"],
	  pre: function() {
	    this.lo = Number.POSITIVE_INFINITY
	  },
	  body: function(a) {
	    if(a < this.lo) {
	      this.lo = a
	    }
	  },
	  post: function() {
	    return this.lo
	  }})
	  
	
	exports.argmin = cwise({ args:["index", "array"],
	  pre: function(i) {
	    this.min_v = Number.POSITIVE_INFINITY
	    this.min_i = i.slice(0)
	  },
	  body: function(i, a) {
	    if(a < this.min_v) {
	      this.min_v = a
	      for(var k=0; k<i.length; ++k) {
	        this.min_i[k] = i[k]
	      }
	    }
	  },
	  post: function() {
	    return this.min_i
	  }})
	  
	
	exports.argmax = cwise({ args:["index", "array"],
	  pre: function(i) {
	    this.max_v = Number.NEGATIVE_INFINITY
	    this.max_i = i.slice(0)
	  },
	  body: function(i, a) {
	    if(a > this.max_v) {
	      this.max_v = a
	      for(var k=0; k<i.length; ++k) {
	        this.max_i[k] = i[k]
	      }
	    }
	  },
	  post: function() {
	    return this.max_i
	  }})
	  
	
	exports.random = cwise({ args:["array"],
	  pre: function() {
	    this.rnd = Math.random
	  },
	  body: function(a) {
	    a = this.rnd()
	  }})
	  
	
	exports.assign = cwise({ args:["array", "array"],
	  body: function(a,b) {
	    a = b
	  }})
	
	exports.assigns = cwise({ args:["array", "scalar"],
	  body: function(a,b) {
	    a = b
	  }})
	
	exports.clone = function(array) {
	  var stride = new Array(array.shape.length)
	  var tsz = 1;
	  for(var i=array.shape.length-1; i>=0; --i) {
	    stride[i] = tsz
	    tsz *= array.shape[i]
	  }
	  var ndata = new array.data.constructor(array.data.slice(0, tsz*array.data.BYTES_PER_ELEMENT))
	  var result = ndarray(ndata, array.shape.slice(0), stride, 0)
	  return exports.assign(result, array)
	}
	


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var Parser = __webpack_require__(15)
	  , createShim = __webpack_require__(18)
	
	var REQUIRED_FIELDS = [ "args", "body" ]
	var OPTIONAL_FIELDS = [ "pre", "post", "printCode" ]
	
	function CompiledProcedure() {
	  this.numArgs = 0
	  this.numArrayArgs = 0
	  this.numScalarArgs = 0
	  this.hasIndex = false
	  this.hasShape = false
	  this.hasReturn = false
	  this.pre = ""
	  this.body = ""
	  this.post = ""
	  this.unroll = 1
	  this.printCode = false
	}
	
	function compile(user_args) {
	  for(var id in user_args) {
	    if(REQUIRED_FIELDS.indexOf(id) < 0 &&
	       OPTIONAL_FIELDS.indexOf(id) < 0) {
	      throw new Error("Unknown argument '"+id+"' passed to expression compiler")
	    }
	  }
	  for(var i=0; i<REQUIRED_FIELDS.length; ++i) {
	    if(!user_args[REQUIRED_FIELDS[i]]) {
	      throw new Error("Missing argument: " + REQUIRED_FIELDS[i])
	    }
	  }
	  //Parse arguments
	  var proc = new CompiledProcedure()
	  var proc_args = user_args.args.slice(0)
	  var shim_args = []
	  for(var i=0; i<proc_args.length; ++i) {
	    switch(proc_args[i]) {
	      case "array":
	        shim_args.push("array" + proc.numArrayArgs)
	        proc_args[i] += (proc.numArrayArgs++)
	      break
	      case "scalar":
	        shim_args.push("scalar" + proc.numScalarArgs)
	        proc_args[i] += (proc.numScalarArgs++)
	      break
	      case "index":
	        proc.hasIndex = true
	      break
	      case "shape":
	        proc.hasShape = true
	      break
	      default:
	        throw new Error("Unknown argument types")
	    }
	  }
	  if(proc.numArrayArgs <= 0) {
	    throw new Error("No array arguments specified")
	  }
	  
	  //Parse blocks
	  var parser = new Parser(proc_args)
	    , pre = user_args.pre || null
	    , body = user_args.body
	    , post = user_args.post || null
	  parser.preprocess(pre)
	  parser.preprocess(body)
	  parser.preprocess(post)
	  proc.pre  = parser.preBlock() + "\n" + parser.process(pre)
	  proc.body = parser.process(body)
	  proc.post = parser.process(post) + "\n" + parser.postBlock()
	  proc.hasReturn = parser.hasReturn
	  
	  //Parse options
	  proc.printCode = user_args.printCode || false
	  
	  //Assemble shim
	  return createShim(shim_args, proc)
	}
	
	module.exports = compile
	


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var falafel = __webpack_require__(16)
	
	function isGlobal(identifier) {
	  if(typeof(window) !== "undefined") {
	    return identifier in window
	  } else if(typeof(GLOBAL) !== "undefined") {
	    return identifier in GLOBAL
	  } else {
	    return false
	  }
	}
	
	function getArgs(src) {
	  var args = []
	  falafel(src, function(node) {
	    var i
	    if(node.type === "FunctionExpression" &&
	       node.parent.parent.parent.type === "Program") {
	      args = new Array(node.params.length)
	      for(i=0; i<node.params.length; ++i) {
	        args[i] = node.params[i].name
	      }
	    }
	  })
	  return args
	}
	
	function Parser(args) {
	  this.args = args
	  this.this_vars = []
	  this.computed_this = false
	  this.prefix_count = 0
	  this.hasReturn = false
	}
	
	//Preprocessing pass is needed to explode the "this" object
	Parser.prototype.preprocess = function(func) {
	  if(!func || this.computed_this) {
	    return
	  }
	  var src = "(" + func + ")()"
	    , this_vars = this.this_vars
	    , computed_this = this.computed_this
	  falafel(src, function(node) {
	    var n
	    if(node.type === "ThisExpression") {
	      if(node.parent.type === "MemberExpression" && !node.parent.computed) {
	        n = node.parent.property.name
	        if(this_vars.indexOf(n) < 0) {
	          this_vars.push(n)
	        }
	      } else {
	        computed_this = true
	      }
	    }
	  })
	  if(computed_this) {
	    this.this_vars = []
	  }
	  this.computed_this = computed_this
	}
	
	Parser.prototype.process = function(func) {
	  if(!func) {
	    return ""
	  }
	  var label = this.prefix_count++
	    , src = "(" + func + ")()"
	    , block_args = getArgs(src)
	    , proc_args = this.args
	    , result = ""
	    , inline_prefix = "inline" + label + "_"
	    , hasReturn = this.hasReturn
	  falafel(src, function(node) {
	    var n, i, j
	    if(node.type === "FunctionExpression" &&
	       node.parent.parent.parent.type === "Program") {
	      result = node.body.source()
	    } else if(node.type === "Identifier") {
	      if(node.parent.type === "MemberExpression") {
	        if((node.parent.property === node && !node.parent.computed) ||
	           node.parent.object.type === "ThisExpression") {
	          return
	        }
	      }
	      n = node.name
	      i = block_args.indexOf(n)
	      if(i >= 0) {
	        if(i < proc_args.length) {
	          if(proc_args[i].indexOf("array") === 0) {
	            j = parseInt(proc_args[i].substr(5))
	            node.update("arr"+j+"[ptr"+j+"]")
	          } else if(proc_args[i] === "shape") {
	            node.update("inline_shape")
	          } else {
	            node.update(proc_args[i])
	          }
	        } else {
	          node.update(inline_prefix + node.source())
	        }
	      } else if(isGlobal(n)) {
	        return
	      } else {
	        node.update(inline_prefix + node.source())
	      }
	    } else if(node.type === "MemberExpression") {
	      if(node.object.type === "ThisExpression") {
	        node.update("this_" + node.property.source().trimLeft())
	      }
	    } else if(node.type === "ThisExpression") {
	      if(node.parent.type !== "MemberExpression") {
	        node.update("this_")
	      }
	    } else if(node.type === "ReturnStatement") {
	      hasReturn = true
	    }
	  })
	  this.hasReturn = hasReturn
	  var prefix = ""
	  for(var i=this.args.length; i<block_args.length; ++i) {
	    prefix += "var " + block_args[i] + "\n"
	  }
	  return prefix + result
	}
	
	Parser.prototype.preBlock = function() {
	  if(this.computed_this) {
	    return "var this_={}"
	  } else if(this.this_vars.length > 0) {
	    return "var this_" + this.this_vars.join(",this_")
	  } else {
	    return ""
	  }
	}
	
	Parser.prototype.postBlock = function() {
	  return ""
	}
	
	module.exports = Parser


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var parse = __webpack_require__(17).parse;
	var objectKeys = Object.keys || function (obj) {
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    return keys;
	};
	var forEach = function (xs, fn) {
	    if (xs.forEach) return xs.forEach(fn);
	    for (var i = 0; i < xs.length; i++) {
	        fn.call(xs, xs[i], i, xs);
	    }
	};
	
	var isArray = Array.isArray || function (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};
	
	module.exports = function (src, opts, fn) {
	    if (typeof opts === 'function') {
	        fn = opts;
	        opts = {};
	    }
	    if (typeof src === 'object') {
	        opts = src;
	        src = opts.source;
	        delete opts.source;
	    }
	    src = src === undefined ? opts.source : src;
	    opts.range = true;
	    if (typeof src !== 'string') src = String(src);
	    
	    var ast = parse(src, opts);
	    
	    var result = {
	        chunks : src.split(''),
	        toString : function () { return result.chunks.join('') },
	        inspect : function () { return result.toString() }
	    };
	    var index = 0;
	    
	    (function walk (node, parent) {
	        insertHelpers(node, parent, result.chunks);
	        
	        forEach(objectKeys(node), function (key) {
	            if (key === 'parent') return;
	            
	            var child = node[key];
	            if (isArray(child)) {
	                forEach(child, function (c) {
	                    if (c && typeof c.type === 'string') {
	                        walk(c, node);
	                    }
	                });
	            }
	            else if (child && typeof child.type === 'string') {
	                insertHelpers(child, node, result.chunks);
	                walk(child, node);
	            }
	        });
	        fn(node);
	    })(ast, undefined);
	    
	    return result;
	};
	 
	function insertHelpers (node, parent, chunks) {
	    if (!node.range) return;
	    
	    node.parent = parent;
	    
	    node.source = function () {
	        return chunks.slice(
	            node.range[0], node.range[1]
	        ).join('');
	    };
	    
	    if (node.update && typeof node.update === 'object') {
	        var prev = node.update;
	        forEach(objectKeys(prev), function (key) {
	            update[key] = prev[key];
	        });
	        node.update = update;
	    }
	    else {
	        node.update = update;
	    }
	    
	    function update (s) {
	        chunks[node.range[0]] = s;
	        for (var i = node.range[0] + 1; i < node.range[1]; i++) {
	            chunks[i] = '';
	        }
	    };
	}
	


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	/*
	  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
	  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
	  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
	  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
	  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
	  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
	
	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:
	
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	
	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/
	
	/*jslint bitwise:true plusplus:true */
	/*global esprima:true, define:true, exports:true, window: true,
	throwError: true, createLiteral: true, generateStatement: true,
	parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
	parseFunctionDeclaration: true, parseFunctionExpression: true,
	parseFunctionSourceElements: true, parseVariableIdentifier: true,
	parseLeftHandSideExpression: true,
	parseStatement: true, parseSourceElement: true */
	
	(function (root, factory) {
	    'use strict';
	
	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	    // Rhino, and plain browser loading.
	    if (typeof define === 'function' && define.amd) {
	        define(['exports'], factory);
	    } else if (true) {
	        factory(exports);
	    } else {
	        factory((root.esprima = {}));
	    }
	}(this, function (exports) {
	    'use strict';
	
	    var Token,
	        TokenName,
	        Syntax,
	        PropertyKind,
	        Messages,
	        Regex,
	        source,
	        strict,
	        index,
	        lineNumber,
	        lineStart,
	        length,
	        buffer,
	        state,
	        extra;
	
	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8
	    };
	
	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';
	
	    Syntax = {
	        AssignmentExpression: 'AssignmentExpression',
	        ArrayExpression: 'ArrayExpression',
	        BlockStatement: 'BlockStatement',
	        BinaryExpression: 'BinaryExpression',
	        BreakStatement: 'BreakStatement',
	        CallExpression: 'CallExpression',
	        CatchClause: 'CatchClause',
	        ConditionalExpression: 'ConditionalExpression',
	        ContinueStatement: 'ContinueStatement',
	        DoWhileStatement: 'DoWhileStatement',
	        DebuggerStatement: 'DebuggerStatement',
	        EmptyStatement: 'EmptyStatement',
	        ExpressionStatement: 'ExpressionStatement',
	        ForStatement: 'ForStatement',
	        ForInStatement: 'ForInStatement',
	        FunctionDeclaration: 'FunctionDeclaration',
	        FunctionExpression: 'FunctionExpression',
	        Identifier: 'Identifier',
	        IfStatement: 'IfStatement',
	        Literal: 'Literal',
	        LabeledStatement: 'LabeledStatement',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        NewExpression: 'NewExpression',
	        ObjectExpression: 'ObjectExpression',
	        Program: 'Program',
	        Property: 'Property',
	        ReturnStatement: 'ReturnStatement',
	        SequenceExpression: 'SequenceExpression',
	        SwitchStatement: 'SwitchStatement',
	        SwitchCase: 'SwitchCase',
	        ThisExpression: 'ThisExpression',
	        ThrowStatement: 'ThrowStatement',
	        TryStatement: 'TryStatement',
	        UnaryExpression: 'UnaryExpression',
	        UpdateExpression: 'UpdateExpression',
	        VariableDeclaration: 'VariableDeclaration',
	        VariableDeclarator: 'VariableDeclarator',
	        WhileStatement: 'WhileStatement',
	        WithStatement: 'WithStatement'
	    };
	
	    PropertyKind = {
	        Data: 1,
	        Get: 2,
	        Set: 4
	    };
	
	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken:  'Unexpected token %0',
	        UnexpectedNumber:  'Unexpected number',
	        UnexpectedString:  'Unexpected string',
	        UnexpectedIdentifier:  'Unexpected identifier',
	        UnexpectedReserved:  'Unexpected reserved word',
	        UnexpectedEOS:  'Unexpected end of input',
	        NewlineAfterThrow:  'Illegal newline after throw',
	        InvalidRegExp: 'Invalid regular expression',
	        UnterminatedRegExp:  'Invalid regular expression: missing /',
	        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
	        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
	        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
	        NoCatchOrFinally:  'Missing catch or finally after try',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared',
	        IllegalContinue: 'Illegal continue statement',
	        IllegalBreak: 'Illegal break statement',
	        IllegalReturn: 'Illegal return statement',
	        StrictModeWith:  'Strict mode code may not include a with statement',
	        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
	        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
	        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
	        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
	        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
	        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
	        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
	        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
	        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
	        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
	        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
	        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictReservedWord:  'Use of future reserved word in strict mode'
	    };
	
	    // See also tools/generate-unicode-regex.py.
	    Regex = {
	        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
	        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
	    };
	
	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.
	
	    function assert(condition, message) {
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }
	
	    function sliceSource(from, to) {
	        return source.slice(from, to);
	    }
	
	    if (typeof 'esprima'[0] === 'undefined') {
	        sliceSource = function sliceArraySource(from, to) {
	            return source.slice(from, to).join('');
	        };
	    }
	
	    function isDecimalDigit(ch) {
	        return '0123456789'.indexOf(ch) >= 0;
	    }
	
	    function isHexDigit(ch) {
	        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
	    }
	
	    function isOctalDigit(ch) {
	        return '01234567'.indexOf(ch) >= 0;
	    }
	
	
	    // 7.2 White Space
	
	    function isWhiteSpace(ch) {
	        return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
	            (ch === '\u000C') || (ch === '\u00A0') ||
	            (ch.charCodeAt(0) >= 0x1680 &&
	             '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(ch) >= 0);
	    }
	
	    // 7.3 Line Terminators
	
	    function isLineTerminator(ch) {
	        return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
	    }
	
	    // 7.6 Identifier Names and Identifiers
	
	    function isIdentifierStart(ch) {
	        return (ch === '$') || (ch === '_') || (ch === '\\') ||
	            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
	            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierStart.test(ch));
	    }
	
	    function isIdentifierPart(ch) {
	        return (ch === '$') || (ch === '_') || (ch === '\\') ||
	            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
	            ((ch >= '0') && (ch <= '9')) ||
	            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
	    }
	
	    // 7.6.1.2 Future Reserved Words
	
	    function isFutureReservedWord(id) {
	        switch (id) {
	
	        // Future reserved words.
	        case 'class':
	        case 'enum':
	        case 'export':
	        case 'extends':
	        case 'import':
	        case 'super':
	            return true;
	        }
	
	        return false;
	    }
	
	    function isStrictModeReservedWord(id) {
	        switch (id) {
	
	        // Strict Mode reserved words.
	        case 'implements':
	        case 'interface':
	        case 'package':
	        case 'private':
	        case 'protected':
	        case 'public':
	        case 'static':
	        case 'yield':
	        case 'let':
	            return true;
	        }
	
	        return false;
	    }
	
	    function isRestrictedWord(id) {
	        return id === 'eval' || id === 'arguments';
	    }
	
	    // 7.6.1.1 Keywords
	
	    function isKeyword(id) {
	        var keyword = false;
	        switch (id.length) {
	        case 2:
	            keyword = (id === 'if') || (id === 'in') || (id === 'do');
	            break;
	        case 3:
	            keyword = (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
	            break;
	        case 4:
	            keyword = (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with');
	            break;
	        case 5:
	            keyword = (id === 'while') || (id === 'break') || (id === 'catch') || (id === 'throw');
	            break;
	        case 6:
	            keyword = (id === 'return') || (id === 'typeof') || (id === 'delete') || (id === 'switch');
	            break;
	        case 7:
	            keyword = (id === 'default') || (id === 'finally');
	            break;
	        case 8:
	            keyword = (id === 'function') || (id === 'continue') || (id === 'debugger');
	            break;
	        case 10:
	            keyword = (id === 'instanceof');
	            break;
	        }
	
	        if (keyword) {
	            return true;
	        }
	
	        switch (id) {
	        // Future reserved words.
	        // 'const' is specialized as Keyword in V8.
	        case 'const':
	            return true;
	
	        // For compatiblity to SpiderMonkey and ES.next
	        case 'yield':
	        case 'let':
	            return true;
	        }
	
	        if (strict && isStrictModeReservedWord(id)) {
	            return true;
	        }
	
	        return isFutureReservedWord(id);
	    }
	
	    // 7.4 Comments
	
	    function skipComment() {
	        var ch, blockComment, lineComment;
	
	        blockComment = false;
	        lineComment = false;
	
	        while (index < length) {
	            ch = source[index];
	
	            if (lineComment) {
	                ch = source[index++];
	                if (isLineTerminator(ch)) {
	                    lineComment = false;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    lineStart = index;
	                }
	            } else if (blockComment) {
	                if (isLineTerminator(ch)) {
	                    if (ch === '\r' && source[index + 1] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    ++index;
	                    lineStart = index;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    ch = source[index++];
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                    if (ch === '*') {
	                        ch = source[index];
	                        if (ch === '/') {
	                            ++index;
	                            blockComment = false;
	                        }
	                    }
	                }
	            } else if (ch === '/') {
	                ch = source[index + 1];
	                if (ch === '/') {
	                    index += 2;
	                    lineComment = true;
	                } else if (ch === '*') {
	                    index += 2;
	                    blockComment = true;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    break;
	                }
	            } else if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch ===  '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	            } else {
	                break;
	            }
	        }
	    }
	
	    function scanHexEscape(prefix) {
	        var i, len, ch, code = 0;
	
	        len = (prefix === 'u') ? 4 : 2;
	        for (i = 0; i < len; ++i) {
	            if (index < length && isHexDigit(source[index])) {
	                ch = source[index++];
	                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	            } else {
	                return '';
	            }
	        }
	        return String.fromCharCode(code);
	    }
	
	    function scanIdentifier() {
	        var ch, start, id, restore;
	
	        ch = source[index];
	        if (!isIdentifierStart(ch)) {
	            return;
	        }
	
	        start = index;
	        if (ch === '\\') {
	            ++index;
	            if (source[index] !== 'u') {
	                return;
	            }
	            ++index;
	            restore = index;
	            ch = scanHexEscape('u');
	            if (ch) {
	                if (ch === '\\' || !isIdentifierStart(ch)) {
	                    return;
	                }
	                id = ch;
	            } else {
	                index = restore;
	                id = 'u';
	            }
	        } else {
	            id = source[index++];
	        }
	
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch)) {
	                break;
	            }
	            if (ch === '\\') {
	                ++index;
	                if (source[index] !== 'u') {
	                    return;
	                }
	                ++index;
	                restore = index;
	                ch = scanHexEscape('u');
	                if (ch) {
	                    if (ch === '\\' || !isIdentifierPart(ch)) {
	                        return;
	                    }
	                    id += ch;
	                } else {
	                    index = restore;
	                    id += 'u';
	                }
	            } else {
	                id += source[index++];
	            }
	        }
	
	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            return {
	                type: Token.Identifier,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (isKeyword(id)) {
	            return {
	                type: Token.Keyword,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // 7.8.1 Null Literals
	
	        if (id === 'null') {
	            return {
	                type: Token.NullLiteral,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // 7.8.2 Boolean Literals
	
	        if (id === 'true' || id === 'false') {
	            return {
	                type: Token.BooleanLiteral,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        return {
	            type: Token.Identifier,
	            value: id,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }
	
	    // 7.7 Punctuators
	
	    function scanPunctuator() {
	        var start = index,
	            ch1 = source[index],
	            ch2,
	            ch3,
	            ch4;
	
	        // Check for most common single-character punctuators.
	
	        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // Dot (.) can also start a floating-point number, hence the need
	        // to check the next character.
	
	        ch2 = source[index + 1];
	        if (ch1 === '.' && !isDecimalDigit(ch2)) {
	            return {
	                type: Token.Punctuator,
	                value: source[index++],
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // Peek more characters.
	
	        ch3 = source[index + 2];
	        ch4 = source[index + 3];
	
	        // 4-character punctuator: >>>=
	
	        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
	            if (ch4 === '=') {
	                index += 4;
	                return {
	                    type: Token.Punctuator,
	                    value: '>>>=',
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }
	
	        // 3-character punctuators: === !== >>> <<= >>=
	
	        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '===',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '!==',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>>',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '<<=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // 2-character punctuators: <= >= == != ++ -- << >> && ||
	        // += -= *= %= &= |= ^= /=
	
	        if (ch2 === '=') {
	            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
	                index += 2;
	                return {
	                    type: Token.Punctuator,
	                    value: ch1 + ch2,
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }
	
	        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
	            if ('+-<>&|'.indexOf(ch2) >= 0) {
	                index += 2;
	                return {
	                    type: Token.Punctuator,
	                    value: ch1 + ch2,
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }
	
	        // The remaining 1-character punctuators.
	
	        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
	            return {
	                type: Token.Punctuator,
	                value: source[index++],
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	    }
	
	    // 7.8.3 Numeric Literals
	
	    function scanNumericLiteral() {
	        var number, start, ch;
	
	        ch = source[index];
	        assert(isDecimalDigit(ch) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');
	
	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];
	
	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            if (number === '0') {
	                if (ch === 'x' || ch === 'X') {
	                    number += source[index++];
	                    while (index < length) {
	                        ch = source[index];
	                        if (!isHexDigit(ch)) {
	                            break;
	                        }
	                        number += source[index++];
	                    }
	
	                    if (number.length <= 2) {
	                        // only 0x
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	
	                    if (index < length) {
	                        ch = source[index];
	                        if (isIdentifierStart(ch)) {
	                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                        }
	                    }
	                    return {
	                        type: Token.NumericLiteral,
	                        value: parseInt(number, 16),
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };
	                } else if (isOctalDigit(ch)) {
	                    number += source[index++];
	                    while (index < length) {
	                        ch = source[index];
	                        if (!isOctalDigit(ch)) {
	                            break;
	                        }
	                        number += source[index++];
	                    }
	
	                    if (index < length) {
	                        ch = source[index];
	                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
	                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                        }
	                    }
	                    return {
	                        type: Token.NumericLiteral,
	                        value: parseInt(number, 8),
	                        octal: true,
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };
	                }
	
	                // decimal number starts with '0' such as '09' is illegal.
	                if (isDecimalDigit(ch)) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            }
	
	            while (index < length) {
	                ch = source[index];
	                if (!isDecimalDigit(ch)) {
	                    break;
	                }
	                number += source[index++];
	            }
	        }
	
	        if (ch === '.') {
	            number += source[index++];
	            while (index < length) {
	                ch = source[index];
	                if (!isDecimalDigit(ch)) {
	                    break;
	                }
	                number += source[index++];
	            }
	        }
	
	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];
	
	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	
	            ch = source[index];
	            if (isDecimalDigit(ch)) {
	                number += source[index++];
	                while (index < length) {
	                    ch = source[index];
	                    if (!isDecimalDigit(ch)) {
	                        break;
	                    }
	                    number += source[index++];
	                }
	            } else {
	                ch = 'character ' + ch;
	                if (index >= length) {
	                    ch = '<end>';
	                }
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }
	
	        if (index < length) {
	            ch = source[index];
	            if (isIdentifierStart(ch)) {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }
	
	    // 7.8.4 String Literals
	
	    function scanStringLiteral() {
	        var str = '', quote, start, ch, code, unescaped, restore, octal = false;
	
	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');
	
	        start = index;
	        ++index;
	
	        while (index < length) {
	            ch = source[index++];
	
	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!isLineTerminator(ch)) {
	                    switch (ch) {
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'u':
	                    case 'x':
	                        restore = index;
	                        unescaped = scanHexEscape(ch);
	                        if (unescaped) {
	                            str += unescaped;
	                        } else {
	                            index = restore;
	                            str += ch;
	                        }
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;
	
	                    default:
	                        if (isOctalDigit(ch)) {
	                            code = '01234567'.indexOf(ch);
	
	                            // \0 is not octal escape sequence
	                            if (code !== 0) {
	                                octal = true;
	                            }
	
	                            if (index < length && isOctalDigit(source[index])) {
	                                octal = true;
	                                code = code * 8 + '01234567'.indexOf(source[index++]);
	
	                                // 3 digits are only allowed when string starts
	                                // with 0, 1, 2, 3
	                                if ('0123'.indexOf(ch) >= 0 &&
	                                        index < length &&
	                                        isOctalDigit(source[index])) {
	                                    code = code * 8 + '01234567'.indexOf(source[index++]);
	                                }
	                            }
	                            str += String.fromCharCode(code);
	                        } else {
	                            str += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch ===  '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                }
	            } else if (isLineTerminator(ch)) {
	                break;
	            } else {
	                str += ch;
	            }
	        }
	
	        if (quote !== '') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }
	
	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }
	
	    function scanRegExp() {
	        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;
	
	        buffer = null;
	        skipComment();
	
	        start = index;
	        ch = source[index];
	        assert(ch === '/', 'Regular expression literal must start with a slash');
	        str = source[index++];
	
	        while (index < length) {
	            ch = source[index++];
	            str += ch;
	            if (ch === '\\') {
	                ch = source[index++];
	                // ECMA-262 7.8.5
	                if (isLineTerminator(ch)) {
	                    throwError({}, Messages.UnterminatedRegExp);
	                }
	                str += ch;
	            } else if (classMarker) {
	                if (ch === ']') {
	                    classMarker = false;
	                }
	            } else {
	                if (ch === '/') {
	                    terminated = true;
	                    break;
	                } else if (ch === '[') {
	                    classMarker = true;
	                } else if (isLineTerminator(ch)) {
	                    throwError({}, Messages.UnterminatedRegExp);
	                }
	            }
	        }
	
	        if (!terminated) {
	            throwError({}, Messages.UnterminatedRegExp);
	        }
	
	        // Exclude leading and trailing slash.
	        pattern = str.substr(1, str.length - 2);
	
	        flags = '';
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch)) {
	                break;
	            }
	
	            ++index;
	            if (ch === '\\' && index < length) {
	                ch = source[index];
	                if (ch === 'u') {
	                    ++index;
	                    restore = index;
	                    ch = scanHexEscape('u');
	                    if (ch) {
	                        flags += ch;
	                        str += '\\u';
	                        for (; restore < index; ++restore) {
	                            str += source[restore];
	                        }
	                    } else {
	                        index = restore;
	                        flags += 'u';
	                        str += '\\u';
	                    }
	                } else {
	                    str += '\\';
	                }
	            } else {
	                flags += ch;
	                str += ch;
	            }
	        }
	
	        try {
	            value = new RegExp(pattern, flags);
	        } catch (e) {
	            throwError({}, Messages.InvalidRegExp);
	        }
	
	        return {
	            literal: str,
	            value: value,
	            range: [start, index]
	        };
	    }
	
	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }
	
	    function advance() {
	        var ch, token;
	
	        skipComment();
	
	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [index, index]
	            };
	        }
	
	        token = scanPunctuator();
	        if (typeof token !== 'undefined') {
	            return token;
	        }
	
	        ch = source[index];
	
	        if (ch === '\'' || ch === '"') {
	            return scanStringLiteral();
	        }
	
	        if (ch === '.' || isDecimalDigit(ch)) {
	            return scanNumericLiteral();
	        }
	
	        token = scanIdentifier();
	        if (typeof token !== 'undefined') {
	            return token;
	        }
	
	        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	    }
	
	    function lex() {
	        var token;
	
	        if (buffer) {
	            index = buffer.range[1];
	            lineNumber = buffer.lineNumber;
	            lineStart = buffer.lineStart;
	            token = buffer;
	            buffer = null;
	            return token;
	        }
	
	        buffer = null;
	        return advance();
	    }
	
	    function lookahead() {
	        var pos, line, start;
	
	        if (buffer !== null) {
	            return buffer;
	        }
	
	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        buffer = advance();
	        index = pos;
	        lineNumber = line;
	        lineStart = start;
	
	        return buffer;
	    }
	
	    // Return true if there is a line terminator before the next token.
	
	    function peekLineTerminator() {
	        var pos, line, start, found;
	
	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        skipComment();
	        found = lineNumber !== line;
	        index = pos;
	        lineNumber = line;
	        lineStart = start;
	
	        return found;
	    }
	
	    // Throw an exception
	
	    function throwError(token, messageFormat) {
	        var error,
	            args = Array.prototype.slice.call(arguments, 2),
	            msg = messageFormat.replace(
	                /%(\d)/g,
	                function (whole, index) {
	                    return args[index] || '';
	                }
	            );
	
	        if (typeof token.lineNumber === 'number') {
	            error = new Error('Line ' + token.lineNumber + ': ' + msg);
	            error.index = token.range[0];
	            error.lineNumber = token.lineNumber;
	            error.column = token.range[0] - lineStart + 1;
	        } else {
	            error = new Error('Line ' + lineNumber + ': ' + msg);
	            error.index = index;
	            error.lineNumber = lineNumber;
	            error.column = index - lineStart + 1;
	        }
	
	        throw error;
	    }
	
	    function throwErrorTolerant() {
	        try {
	            throwError.apply(null, arguments);
	        } catch (e) {
	            if (extra.errors) {
	                extra.errors.push(e);
	            } else {
	                throw e;
	            }
	        }
	    }
	
	
	    // Throw an exception because of the token.
	
	    function throwUnexpected(token) {
	        if (token.type === Token.EOF) {
	            throwError(token, Messages.UnexpectedEOS);
	        }
	
	        if (token.type === Token.NumericLiteral) {
	            throwError(token, Messages.UnexpectedNumber);
	        }
	
	        if (token.type === Token.StringLiteral) {
	            throwError(token, Messages.UnexpectedString);
	        }
	
	        if (token.type === Token.Identifier) {
	            throwError(token, Messages.UnexpectedIdentifier);
	        }
	
	        if (token.type === Token.Keyword) {
	            if (isFutureReservedWord(token.value)) {
	                throwError(token, Messages.UnexpectedReserved);
	            } else if (strict && isStrictModeReservedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictReservedWord);
	                return;
	            }
	            throwError(token, Messages.UnexpectedToken, token.value);
	        }
	
	        // BooleanLiteral, NullLiteral, or Punctuator.
	        throwError(token, Messages.UnexpectedToken, token.value);
	    }
	
	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.
	
	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpected(token);
	        }
	    }
	
	    // Expect the next token to match the specified keyword.
	    // If not, an exception will be thrown.
	
	    function expectKeyword(keyword) {
	        var token = lex();
	        if (token.type !== Token.Keyword || token.value !== keyword) {
	            throwUnexpected(token);
	        }
	    }
	
	    // Return true if the next token matches the specified punctuator.
	
	    function match(value) {
	        var token = lookahead();
	        return token.type === Token.Punctuator && token.value === value;
	    }
	
	    // Return true if the next token matches the specified keyword
	
	    function matchKeyword(keyword) {
	        var token = lookahead();
	        return token.type === Token.Keyword && token.value === keyword;
	    }
	
	    // Return true if the next token is an assignment operator
	
	    function matchAssign() {
	        var token = lookahead(),
	            op = token.value;
	
	        if (token.type !== Token.Punctuator) {
	            return false;
	        }
	        return op === '=' ||
	            op === '*=' ||
	            op === '/=' ||
	            op === '%=' ||
	            op === '+=' ||
	            op === '-=' ||
	            op === '<<=' ||
	            op === '>>=' ||
	            op === '>>>=' ||
	            op === '&=' ||
	            op === '^=' ||
	            op === '|=';
	    }
	
	    function consumeSemicolon() {
	        var token, line;
	
	        // Catch the very common case first.
	        if (source[index] === ';') {
	            lex();
	            return;
	        }
	
	        line = lineNumber;
	        skipComment();
	        if (lineNumber !== line) {
	            return;
	        }
	
	        if (match(';')) {
	            lex();
	            return;
	        }
	
	        token = lookahead();
	        if (token.type !== Token.EOF && !match('}')) {
	            throwUnexpected(token);
	        }
	    }
	
	    // Return true if provided expression is LeftHandSideExpression
	
	    function isLeftHandSide(expr) {
	        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
	    }
	
	    // 11.1.4 Array Initialiser
	
	    function parseArrayInitialiser() {
	        var elements = [];
	
	        expect('[');
	
	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else {
	                elements.push(parseAssignmentExpression());
	
	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	        }
	
	        expect(']');
	
	        return {
	            type: Syntax.ArrayExpression,
	            elements: elements
	        };
	    }
	
	    // 11.1.5 Object Initialiser
	
	    function parsePropertyFunction(param, first) {
	        var previousStrict, body;
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (first && strict && isRestrictedWord(param[0].name)) {
	            throwErrorTolerant(first, Messages.StrictParamName);
	        }
	        strict = previousStrict;
	
	        return {
	            type: Syntax.FunctionExpression,
	            id: null,
	            params: param,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }
	
	    function parseObjectPropertyKey() {
	        var token = lex();
	
	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.
	
	        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                throwErrorTolerant(token, Messages.StrictOctalLiteral);
	            }
	            return createLiteral(token);
	        }
	
	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }
	
	    function parseObjectProperty() {
	        var token, key, id, param;
	
	        token = lookahead();
	
	        if (token.type === Token.Identifier) {
	
	            id = parseObjectPropertyKey();
	
	            // Property Assignment: Getter and Setter.
	
	            if (token.value === 'get' && !match(':')) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                expect(')');
	                return {
	                    type: Syntax.Property,
	                    key: key,
	                    value: parsePropertyFunction([]),
	                    kind: 'get'
	                };
	            } else if (token.value === 'set' && !match(':')) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                token = lookahead();
	                if (token.type !== Token.Identifier) {
	                    expect(')');
	                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
	                    return {
	                        type: Syntax.Property,
	                        key: key,
	                        value: parsePropertyFunction([]),
	                        kind: 'set'
	                    };
	                } else {
	                    param = [ parseVariableIdentifier() ];
	                    expect(')');
	                    return {
	                        type: Syntax.Property,
	                        key: key,
	                        value: parsePropertyFunction(param, token),
	                        kind: 'set'
	                    };
	                }
	            } else {
	                expect(':');
	                return {
	                    type: Syntax.Property,
	                    key: id,
	                    value: parseAssignmentExpression(),
	                    kind: 'init'
	                };
	            }
	        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
	            throwUnexpected(token);
	        } else {
	            key = parseObjectPropertyKey();
	            expect(':');
	            return {
	                type: Syntax.Property,
	                key: key,
	                value: parseAssignmentExpression(),
	                kind: 'init'
	            };
	        }
	    }
	
	    function parseObjectInitialiser() {
	        var properties = [], property, name, kind, map = {}, toString = String;
	
	        expect('{');
	
	        while (!match('}')) {
	            property = parseObjectProperty();
	
	            if (property.key.type === Syntax.Identifier) {
	                name = property.key.name;
	            } else {
	                name = toString(property.key.value);
	            }
	            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
	            if (Object.prototype.hasOwnProperty.call(map, name)) {
	                if (map[name] === PropertyKind.Data) {
	                    if (strict && kind === PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
	                    } else if (kind !== PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.AccessorDataProperty);
	                    }
	                } else {
	                    if (kind === PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.AccessorDataProperty);
	                    } else if (map[name] & kind) {
	                        throwErrorTolerant({}, Messages.AccessorGetSet);
	                    }
	                }
	                map[name] |= kind;
	            } else {
	                map[name] = kind;
	            }
	
	            properties.push(property);
	
	            if (!match('}')) {
	                expect(',');
	            }
	        }
	
	        expect('}');
	
	        return {
	            type: Syntax.ObjectExpression,
	            properties: properties
	        };
	    }
	
	    // 11.1.6 The Grouping Operator
	
	    function parseGroupExpression() {
	        var expr;
	
	        expect('(');
	
	        expr = parseExpression();
	
	        expect(')');
	
	        return expr;
	    }
	
	
	    // 11.1 Primary Expressions
	
	    function parsePrimaryExpression() {
	        var token = lookahead(),
	            type = token.type;
	
	        if (type === Token.Identifier) {
	            return {
	                type: Syntax.Identifier,
	                name: lex().value
	            };
	        }
	
	        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                throwErrorTolerant(token, Messages.StrictOctalLiteral);
	            }
	            return createLiteral(lex());
	        }
	
	        if (type === Token.Keyword) {
	            if (matchKeyword('this')) {
	                lex();
	                return {
	                    type: Syntax.ThisExpression
	                };
	            }
	
	            if (matchKeyword('function')) {
	                return parseFunctionExpression();
	            }
	        }
	
	        if (type === Token.BooleanLiteral) {
	            lex();
	            token.value = (token.value === 'true');
	            return createLiteral(token);
	        }
	
	        if (type === Token.NullLiteral) {
	            lex();
	            token.value = null;
	            return createLiteral(token);
	        }
	
	        if (match('[')) {
	            return parseArrayInitialiser();
	        }
	
	        if (match('{')) {
	            return parseObjectInitialiser();
	        }
	
	        if (match('(')) {
	            return parseGroupExpression();
	        }
	
	        if (match('/') || match('/=')) {
	            return createLiteral(scanRegExp());
	        }
	
	        return throwUnexpected(lex());
	    }
	
	    // 11.2 Left-Hand-Side Expressions
	
	    function parseArguments() {
	        var args = [];
	
	        expect('(');
	
	        if (!match(')')) {
	            while (index < length) {
	                args.push(parseAssignmentExpression());
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        return args;
	    }
	
	    function parseNonComputedProperty() {
	        var token = lex();
	
	        if (!isIdentifierName(token)) {
	            throwUnexpected(token);
	        }
	
	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }
	
	    function parseNonComputedMember() {
	        expect('.');
	
	        return parseNonComputedProperty();
	    }
	
	    function parseComputedMember() {
	        var expr;
	
	        expect('[');
	
	        expr = parseExpression();
	
	        expect(']');
	
	        return expr;
	    }
	
	    function parseNewExpression() {
	        var expr;
	
	        expectKeyword('new');
	
	        expr = {
	            type: Syntax.NewExpression,
	            callee: parseLeftHandSideExpression(),
	            'arguments': []
	        };
	
	        if (match('(')) {
	            expr['arguments'] = parseArguments();
	        }
	
	        return expr;
	    }
	
	    function parseLeftHandSideExpressionAllowCall() {
	        var expr;
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[') || match('(')) {
	            if (match('(')) {
	                expr = {
	                    type: Syntax.CallExpression,
	                    callee: expr,
	                    'arguments': parseArguments()
	                };
	            } else if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	            }
	        }
	
	        return expr;
	    }
	
	
	    function parseLeftHandSideExpression() {
	        var expr;
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[')) {
	            if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	            }
	        }
	
	        return expr;
	    }
	
	    // 11.3 Postfix Expressions
	
	    function parsePostfixExpression() {
	        var expr = parseLeftHandSideExpressionAllowCall(), token;
	
	        token = lookahead();
	        if (token.type !== Token.Punctuator) {
	            return expr;
	        }
	
	        if ((match('++') || match('--')) && !peekLineTerminator()) {
	            // 11.3.1, 11.3.2
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPostfix);
	            }
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }
	
	            expr = {
	                type: Syntax.UpdateExpression,
	                operator: lex().value,
	                argument: expr,
	                prefix: false
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.4 Unary Operators
	
	    function parseUnaryExpression() {
	        var token, expr;
	
	        token = lookahead();
	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return parsePostfixExpression();
	        }
	
	        if (match('++') || match('--')) {
	            token = lex();
	            expr = parseUnaryExpression();
	            // 11.4.4, 11.4.5
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPrefix);
	            }
	
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }
	
	            expr = {
	                type: Syntax.UpdateExpression,
	                operator: token.value,
	                argument: expr,
	                prefix: true
	            };
	            return expr;
	        }
	
	        if (match('+') || match('-') || match('~') || match('!')) {
	            expr = {
	                type: Syntax.UnaryExpression,
	                operator: lex().value,
	                argument: parseUnaryExpression(),
	                prefix: true
	            };
	            return expr;
	        }
	
	        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            expr = {
	                type: Syntax.UnaryExpression,
	                operator: lex().value,
	                argument: parseUnaryExpression(),
	                prefix: true
	            };
	            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
	                throwErrorTolerant({}, Messages.StrictDelete);
	            }
	            return expr;
	        }
	
	        return parsePostfixExpression();
	    }
	
	    // 11.5 Multiplicative Operators
	
	    function parseMultiplicativeExpression() {
	        var expr = parseUnaryExpression();
	
	        while (match('*') || match('/') || match('%')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseUnaryExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.6 Additive Operators
	
	    function parseAdditiveExpression() {
	        var expr = parseMultiplicativeExpression();
	
	        while (match('+') || match('-')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseMultiplicativeExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.7 Bitwise Shift Operators
	
	    function parseShiftExpression() {
	        var expr = parseAdditiveExpression();
	
	        while (match('<<') || match('>>') || match('>>>')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseAdditiveExpression()
	            };
	        }
	
	        return expr;
	    }
	    // 11.8 Relational Operators
	
	    function parseRelationalExpression() {
	        var expr, previousAllowIn;
	
	        previousAllowIn = state.allowIn;
	        state.allowIn = true;
	
	        expr = parseShiftExpression();
	
	        while (match('<') || match('>') || match('<=') || match('>=') || (previousAllowIn && matchKeyword('in')) || matchKeyword('instanceof')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseShiftExpression()
	            };
	        }
	
	        state.allowIn = previousAllowIn;
	        return expr;
	    }
	
	    // 11.9 Equality Operators
	
	    function parseEqualityExpression() {
	        var expr = parseRelationalExpression();
	
	        while (match('==') || match('!=') || match('===') || match('!==')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseRelationalExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.10 Binary Bitwise Operators
	
	    function parseBitwiseANDExpression() {
	        var expr = parseEqualityExpression();
	
	        while (match('&')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '&',
	                left: expr,
	                right: parseEqualityExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    function parseBitwiseXORExpression() {
	        var expr = parseBitwiseANDExpression();
	
	        while (match('^')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '^',
	                left: expr,
	                right: parseBitwiseANDExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    function parseBitwiseORExpression() {
	        var expr = parseBitwiseXORExpression();
	
	        while (match('|')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '|',
	                left: expr,
	                right: parseBitwiseXORExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.11 Binary Logical Operators
	
	    function parseLogicalANDExpression() {
	        var expr = parseBitwiseORExpression();
	
	        while (match('&&')) {
	            lex();
	            expr = {
	                type: Syntax.LogicalExpression,
	                operator: '&&',
	                left: expr,
	                right: parseBitwiseORExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    function parseLogicalORExpression() {
	        var expr = parseLogicalANDExpression();
	
	        while (match('||')) {
	            lex();
	            expr = {
	                type: Syntax.LogicalExpression,
	                operator: '||',
	                left: expr,
	                right: parseLogicalANDExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.12 Conditional Operator
	
	    function parseConditionalExpression() {
	        var expr, previousAllowIn, consequent;
	
	        expr = parseLogicalORExpression();
	
	        if (match('?')) {
	            lex();
	            previousAllowIn = state.allowIn;
	            state.allowIn = true;
	            consequent = parseAssignmentExpression();
	            state.allowIn = previousAllowIn;
	            expect(':');
	
	            expr = {
	                type: Syntax.ConditionalExpression,
	                test: expr,
	                consequent: consequent,
	                alternate: parseAssignmentExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.13 Assignment Operators
	
	    function parseAssignmentExpression() {
	        var token, expr;
	
	        token = lookahead();
	        expr = parseConditionalExpression();
	
	        if (matchAssign()) {
	            // LeftHandSideExpression
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }
	
	            // 11.13.1
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant(token, Messages.StrictLHSAssignment);
	            }
	
	            expr = {
	                type: Syntax.AssignmentExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseAssignmentExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.14 Comma Operator
	
	    function parseExpression() {
	        var expr = parseAssignmentExpression();
	
	        if (match(',')) {
	            expr = {
	                type: Syntax.SequenceExpression,
	                expressions: [ expr ]
	            };
	
	            while (index < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	                expr.expressions.push(parseAssignmentExpression());
	            }
	
	        }
	        return expr;
	    }
	
	    // 12.1 Block
	
	    function parseStatementList() {
	        var list = [],
	            statement;
	
	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            statement = parseSourceElement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            list.push(statement);
	        }
	
	        return list;
	    }
	
	    function parseBlock() {
	        var block;
	
	        expect('{');
	
	        block = parseStatementList();
	
	        expect('}');
	
	        return {
	            type: Syntax.BlockStatement,
	            body: block
	        };
	    }
	
	    // 12.2 Variable Statement
	
	    function parseVariableIdentifier() {
	        var token = lex();
	
	        if (token.type !== Token.Identifier) {
	            throwUnexpected(token);
	        }
	
	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }
	
	    function parseVariableDeclaration(kind) {
	        var id = parseVariableIdentifier(),
	            init = null;
	
	        // 12.2.1
	        if (strict && isRestrictedWord(id.name)) {
	            throwErrorTolerant({}, Messages.StrictVarName);
	        }
	
	        if (kind === 'const') {
	            expect('=');
	            init = parseAssignmentExpression();
	        } else if (match('=')) {
	            lex();
	            init = parseAssignmentExpression();
	        }
	
	        return {
	            type: Syntax.VariableDeclarator,
	            id: id,
	            init: init
	        };
	    }
	
	    function parseVariableDeclarationList(kind) {
	        var list = [];
	
	        do {
	            list.push(parseVariableDeclaration(kind));
	            if (!match(',')) {
	                break;
	            }
	            lex();
	        } while (index < length);
	
	        return list;
	    }
	
	    function parseVariableStatement() {
	        var declarations;
	
	        expectKeyword('var');
	
	        declarations = parseVariableDeclarationList();
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: declarations,
	            kind: 'var'
	        };
	    }
	
	    // kind may be `const` or `let`
	    // Both are experimental and not in the specification yet.
	    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
	    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
	    function parseConstLetDeclaration(kind) {
	        var declarations;
	
	        expectKeyword(kind);
	
	        declarations = parseVariableDeclarationList(kind);
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: declarations,
	            kind: kind
	        };
	    }
	
	    // 12.3 Empty Statement
	
	    function parseEmptyStatement() {
	        expect(';');
	
	        return {
	            type: Syntax.EmptyStatement
	        };
	    }
	
	    // 12.4 Expression Statement
	
	    function parseExpressionStatement() {
	        var expr = parseExpression();
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ExpressionStatement,
	            expression: expr
	        };
	    }
	
	    // 12.5 If statement
	
	    function parseIfStatement() {
	        var test, consequent, alternate;
	
	        expectKeyword('if');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        consequent = parseStatement();
	
	        if (matchKeyword('else')) {
	            lex();
	            alternate = parseStatement();
	        } else {
	            alternate = null;
	        }
	
	        return {
	            type: Syntax.IfStatement,
	            test: test,
	            consequent: consequent,
	            alternate: alternate
	        };
	    }
	
	    // 12.6 Iteration Statements
	
	    function parseDoWhileStatement() {
	        var body, test, oldInIteration;
	
	        expectKeyword('do');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        if (match(';')) {
	            lex();
	        }
	
	        return {
	            type: Syntax.DoWhileStatement,
	            body: body,
	            test: test
	        };
	    }
	
	    function parseWhileStatement() {
	        var test, body, oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        return {
	            type: Syntax.WhileStatement,
	            test: test,
	            body: body
	        };
	    }
	
	    function parseForVariableDeclaration() {
	        var token = lex();
	
	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: parseVariableDeclarationList(),
	            kind: token.value
	        };
	    }
	
	    function parseForStatement() {
	        var init, test, update, left, right, body, oldInIteration;
	
	        init = test = update = null;
	
	        expectKeyword('for');
	
	        expect('(');
	
	        if (match(';')) {
	            lex();
	        } else {
	            if (matchKeyword('var') || matchKeyword('let')) {
	                state.allowIn = false;
	                init = parseForVariableDeclaration();
	                state.allowIn = true;
	
	                if (init.declarations.length === 1 && matchKeyword('in')) {
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            } else {
	                state.allowIn = false;
	                init = parseExpression();
	                state.allowIn = true;
	
	                if (matchKeyword('in')) {
	                    // LeftHandSideExpression
	                    if (!isLeftHandSide(init)) {
	                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);
	                    }
	
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            }
	
	            if (typeof left === 'undefined') {
	                expect(';');
	            }
	        }
	
	        if (typeof left === 'undefined') {
	
	            if (!match(';')) {
	                test = parseExpression();
	            }
	            expect(';');
	
	            if (!match(')')) {
	                update = parseExpression();
	            }
	        }
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        if (typeof left === 'undefined') {
	            return {
	                type: Syntax.ForStatement,
	                init: init,
	                test: test,
	                update: update,
	                body: body
	            };
	        }
	
	        return {
	            type: Syntax.ForInStatement,
	            left: left,
	            right: right,
	            body: body,
	            each: false
	        };
	    }
	
	    // 12.7 The continue statement
	
	    function parseContinueStatement() {
	        var token, label = null;
	
	        expectKeyword('continue');
	
	        // Optimize the most common form: 'continue;'.
	        if (source[index] === ';') {
	            lex();
	
	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }
	
	            return {
	                type: Syntax.ContinueStatement,
	                label: null
	            };
	        }
	
	        if (peekLineTerminator()) {
	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }
	
	            return {
	                type: Syntax.ContinueStatement,
	                label: null
	            };
	        }
	
	        token = lookahead();
	        if (token.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !state.inIteration) {
	            throwError({}, Messages.IllegalContinue);
	        }
	
	        return {
	            type: Syntax.ContinueStatement,
	            label: label
	        };
	    }
	
	    // 12.8 The break statement
	
	    function parseBreakStatement() {
	        var token, label = null;
	
	        expectKeyword('break');
	
	        // Optimize the most common form: 'break;'.
	        if (source[index] === ';') {
	            lex();
	
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }
	
	            return {
	                type: Syntax.BreakStatement,
	                label: null
	            };
	        }
	
	        if (peekLineTerminator()) {
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }
	
	            return {
	                type: Syntax.BreakStatement,
	                label: null
	            };
	        }
	
	        token = lookahead();
	        if (token.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !(state.inIteration || state.inSwitch)) {
	            throwError({}, Messages.IllegalBreak);
	        }
	
	        return {
	            type: Syntax.BreakStatement,
	            label: label
	        };
	    }
	
	    // 12.9 The return statement
	
	    function parseReturnStatement() {
	        var token, argument = null;
	
	        expectKeyword('return');
	
	        if (!state.inFunctionBody) {
	            throwErrorTolerant({}, Messages.IllegalReturn);
	        }
	
	        // 'return' followed by a space and an identifier is very common.
	        if (source[index] === ' ') {
	            if (isIdentifierStart(source[index + 1])) {
	                argument = parseExpression();
	                consumeSemicolon();
	                return {
	                    type: Syntax.ReturnStatement,
	                    argument: argument
	                };
	            }
	        }
	
	        if (peekLineTerminator()) {
	            return {
	                type: Syntax.ReturnStatement,
	                argument: null
	            };
	        }
	
	        if (!match(';')) {
	            token = lookahead();
	            if (!match('}') && token.type !== Token.EOF) {
	                argument = parseExpression();
	            }
	        }
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ReturnStatement,
	            argument: argument
	        };
	    }
	
	    // 12.10 The with statement
	
	    function parseWithStatement() {
	        var object, body;
	
	        if (strict) {
	            throwErrorTolerant({}, Messages.StrictModeWith);
	        }
	
	        expectKeyword('with');
	
	        expect('(');
	
	        object = parseExpression();
	
	        expect(')');
	
	        body = parseStatement();
	
	        return {
	            type: Syntax.WithStatement,
	            object: object,
	            body: body
	        };
	    }
	
	    // 12.10 The swith statement
	
	    function parseSwitchCase() {
	        var test,
	            consequent = [],
	            statement;
	
	        if (matchKeyword('default')) {
	            lex();
	            test = null;
	        } else {
	            expectKeyword('case');
	            test = parseExpression();
	        }
	        expect(':');
	
	        while (index < length) {
	            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
	                break;
	            }
	            statement = parseStatement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            consequent.push(statement);
	        }
	
	        return {
	            type: Syntax.SwitchCase,
	            test: test,
	            consequent: consequent
	        };
	    }
	
	    function parseSwitchStatement() {
	        var discriminant, cases, clause, oldInSwitch, defaultFound;
	
	        expectKeyword('switch');
	
	        expect('(');
	
	        discriminant = parseExpression();
	
	        expect(')');
	
	        expect('{');
	
	        cases = [];
	
	        if (match('}')) {
	            lex();
	            return {
	                type: Syntax.SwitchStatement,
	                discriminant: discriminant,
	                cases: cases
	            };
	        }
	
	        oldInSwitch = state.inSwitch;
	        state.inSwitch = true;
	        defaultFound = false;
	
	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            clause = parseSwitchCase();
	            if (clause.test === null) {
	                if (defaultFound) {
	                    throwError({}, Messages.MultipleDefaultsInSwitch);
	                }
	                defaultFound = true;
	            }
	            cases.push(clause);
	        }
	
	        state.inSwitch = oldInSwitch;
	
	        expect('}');
	
	        return {
	            type: Syntax.SwitchStatement,
	            discriminant: discriminant,
	            cases: cases
	        };
	    }
	
	    // 12.13 The throw statement
	
	    function parseThrowStatement() {
	        var argument;
	
	        expectKeyword('throw');
	
	        if (peekLineTerminator()) {
	            throwError({}, Messages.NewlineAfterThrow);
	        }
	
	        argument = parseExpression();
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ThrowStatement,
	            argument: argument
	        };
	    }
	
	    // 12.14 The try statement
	
	    function parseCatchClause() {
	        var param;
	
	        expectKeyword('catch');
	
	        expect('(');
	        if (match(')')) {
	            throwUnexpected(lookahead());
	        }
	
	        param = parseVariableIdentifier();
	        // 12.14.1
	        if (strict && isRestrictedWord(param.name)) {
	            throwErrorTolerant({}, Messages.StrictCatchVariable);
	        }
	
	        expect(')');
	
	        return {
	            type: Syntax.CatchClause,
	            param: param,
	            body: parseBlock()
	        };
	    }
	
	    function parseTryStatement() {
	        var block, handlers = [], finalizer = null;
	
	        expectKeyword('try');
	
	        block = parseBlock();
	
	        if (matchKeyword('catch')) {
	            handlers.push(parseCatchClause());
	        }
	
	        if (matchKeyword('finally')) {
	            lex();
	            finalizer = parseBlock();
	        }
	
	        if (handlers.length === 0 && !finalizer) {
	            throwError({}, Messages.NoCatchOrFinally);
	        }
	
	        return {
	            type: Syntax.TryStatement,
	            block: block,
	            guardedHandlers: [],
	            handlers: handlers,
	            finalizer: finalizer
	        };
	    }
	
	    // 12.15 The debugger statement
	
	    function parseDebuggerStatement() {
	        expectKeyword('debugger');
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.DebuggerStatement
	        };
	    }
	
	    // 12 Statements
	
	    function parseStatement() {
	        var token = lookahead(),
	            expr,
	            labeledBody;
	
	        if (token.type === Token.EOF) {
	            throwUnexpected(token);
	        }
	
	        if (token.type === Token.Punctuator) {
	            switch (token.value) {
	            case ';':
	                return parseEmptyStatement();
	            case '{':
	                return parseBlock();
	            case '(':
	                return parseExpressionStatement();
	            default:
	                break;
	            }
	        }
	
	        if (token.type === Token.Keyword) {
	            switch (token.value) {
	            case 'break':
	                return parseBreakStatement();
	            case 'continue':
	                return parseContinueStatement();
	            case 'debugger':
	                return parseDebuggerStatement();
	            case 'do':
	                return parseDoWhileStatement();
	            case 'for':
	                return parseForStatement();
	            case 'function':
	                return parseFunctionDeclaration();
	            case 'if':
	                return parseIfStatement();
	            case 'return':
	                return parseReturnStatement();
	            case 'switch':
	                return parseSwitchStatement();
	            case 'throw':
	                return parseThrowStatement();
	            case 'try':
	                return parseTryStatement();
	            case 'var':
	                return parseVariableStatement();
	            case 'while':
	                return parseWhileStatement();
	            case 'with':
	                return parseWithStatement();
	            default:
	                break;
	            }
	        }
	
	        expr = parseExpression();
	
	        // 12.12 Labelled Statements
	        if ((expr.type === Syntax.Identifier) && match(':')) {
	            lex();
	
	            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
	                throwError({}, Messages.Redeclaration, 'Label', expr.name);
	            }
	
	            state.labelSet[expr.name] = true;
	            labeledBody = parseStatement();
	            delete state.labelSet[expr.name];
	
	            return {
	                type: Syntax.LabeledStatement,
	                label: expr,
	                body: labeledBody
	            };
	        }
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ExpressionStatement,
	            expression: expr
	        };
	    }
	
	    // 13 Function Definition
	
	    function parseFunctionSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted,
	            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;
	
	        expect('{');
	
	        while (index < length) {
	            token = lookahead();
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }
	
	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        oldLabelSet = state.labelSet;
	        oldInIteration = state.inIteration;
	        oldInSwitch = state.inSwitch;
	        oldInFunctionBody = state.inFunctionBody;
	
	        state.labelSet = {};
	        state.inIteration = false;
	        state.inSwitch = false;
	        state.inFunctionBody = true;
	
	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }
	
	        expect('}');
	
	        state.labelSet = oldLabelSet;
	        state.inIteration = oldInIteration;
	        state.inSwitch = oldInSwitch;
	        state.inFunctionBody = oldInFunctionBody;
	
	        return {
	            type: Syntax.BlockStatement,
	            body: sourceElements
	        };
	    }
	
	    function parseFunctionDeclaration() {
	        var id, param, params = [], body, token, stricted, firstRestricted, message, previousStrict, paramSet;
	
	        expectKeyword('function');
	        token = lookahead();
	        id = parseVariableIdentifier();
	        if (strict) {
	            if (isRestrictedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictFunctionName);
	            }
	        } else {
	            if (isRestrictedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictFunctionName;
	            } else if (isStrictModeReservedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictReservedWord;
	            }
	        }
	
	        expect('(');
	
	        if (!match(')')) {
	            paramSet = {};
	            while (index < length) {
	                token = lookahead();
	                param = parseVariableIdentifier();
	                if (strict) {
	                    if (isRestrictedWord(token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamName;
	                    }
	                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                } else if (!firstRestricted) {
	                    if (isRestrictedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamName;
	                    } else if (isStrictModeReservedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictReservedWord;
	                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                }
	                params.push(param);
	                paramSet[param.name] = true;
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            throwErrorTolerant(stricted, message);
	        }
	        strict = previousStrict;
	
	        return {
	            type: Syntax.FunctionDeclaration,
	            id: id,
	            params: params,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }
	
	    function parseFunctionExpression() {
	        var token, id = null, stricted, firstRestricted, message, param, params = [], body, previousStrict, paramSet;
	
	        expectKeyword('function');
	
	        if (!match('(')) {
	            token = lookahead();
	            id = parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    throwErrorTolerant(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }
	
	        expect('(');
	
	        if (!match(')')) {
	            paramSet = {};
	            while (index < length) {
	                token = lookahead();
	                param = parseVariableIdentifier();
	                if (strict) {
	                    if (isRestrictedWord(token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamName;
	                    }
	                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                } else if (!firstRestricted) {
	                    if (isRestrictedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamName;
	                    } else if (isStrictModeReservedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictReservedWord;
	                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                }
	                params.push(param);
	                paramSet[param.name] = true;
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            throwErrorTolerant(stricted, message);
	        }
	        strict = previousStrict;
	
	        return {
	            type: Syntax.FunctionExpression,
	            id: id,
	            params: params,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }
	
	    // 14 Program
	
	    function parseSourceElement() {
	        var token = lookahead();
	
	        if (token.type === Token.Keyword) {
	            switch (token.value) {
	            case 'const':
	            case 'let':
	                return parseConstLetDeclaration(token.value);
	            case 'function':
	                return parseFunctionDeclaration();
	            default:
	                return parseStatement();
	            }
	        }
	
	        if (token.type !== Token.EOF) {
	            return parseStatement();
	        }
	    }
	
	    function parseSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted;
	
	        while (index < length) {
	            token = lookahead();
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }
	
	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        while (index < length) {
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }
	        return sourceElements;
	    }
	
	    function parseProgram() {
	        var program;
	        strict = false;
	        program = {
	            type: Syntax.Program,
	            body: parseSourceElements()
	        };
	        return program;
	    }
	
	    // The following functions are needed only when the option to preserve
	    // the comments is active.
	
	    function addComment(type, value, start, end, loc) {
	        assert(typeof start === 'number', 'Comment must have valid position');
	
	        // Because the way the actual token is scanned, often the comments
	        // (if any) are skipped twice during the lexical analysis.
	        // Thus, we need to skip adding a comment if the comment array already
	        // handled it.
	        if (extra.comments.length > 0) {
	            if (extra.comments[extra.comments.length - 1].range[1] > start) {
	                return;
	            }
	        }
	
	        extra.comments.push({
	            type: type,
	            value: value,
	            range: [start, end],
	            loc: loc
	        });
	    }
	
	    function scanComment() {
	        var comment, ch, loc, start, blockComment, lineComment;
	
	        comment = '';
	        blockComment = false;
	        lineComment = false;
	
	        while (index < length) {
	            ch = source[index];
	
	            if (lineComment) {
	                ch = source[index++];
	                if (isLineTerminator(ch)) {
	                    loc.end = {
	                        line: lineNumber,
	                        column: index - lineStart - 1
	                    };
	                    lineComment = false;
	                    addComment('Line', comment, start, index - 1, loc);
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    lineStart = index;
	                    comment = '';
	                } else if (index >= length) {
	                    lineComment = false;
	                    comment += ch;
	                    loc.end = {
	                        line: lineNumber,
	                        column: length - lineStart
	                    };
	                    addComment('Line', comment, start, length, loc);
	                } else {
	                    comment += ch;
	                }
	            } else if (blockComment) {
	                if (isLineTerminator(ch)) {
	                    if (ch === '\r' && source[index + 1] === '\n') {
	                        ++index;
	                        comment += '\r\n';
	                    } else {
	                        comment += ch;
	                    }
	                    ++lineNumber;
	                    ++index;
	                    lineStart = index;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    ch = source[index++];
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                    comment += ch;
	                    if (ch === '*') {
	                        ch = source[index];
	                        if (ch === '/') {
	                            comment = comment.substr(0, comment.length - 1);
	                            blockComment = false;
	                            ++index;
	                            loc.end = {
	                                line: lineNumber,
	                                column: index - lineStart
	                            };
	                            addComment('Block', comment, start, index, loc);
	                            comment = '';
	                        }
	                    }
	                }
	            } else if (ch === '/') {
	                ch = source[index + 1];
	                if (ch === '/') {
	                    loc = {
	                        start: {
	                            line: lineNumber,
	                            column: index - lineStart
	                        }
	                    };
	                    start = index;
	                    index += 2;
	                    lineComment = true;
	                    if (index >= length) {
	                        loc.end = {
	                            line: lineNumber,
	                            column: index - lineStart
	                        };
	                        lineComment = false;
	                        addComment('Line', comment, start, index, loc);
	                    }
	                } else if (ch === '*') {
	                    start = index;
	                    index += 2;
	                    blockComment = true;
	                    loc = {
	                        start: {
	                            line: lineNumber,
	                            column: index - lineStart - 2
	                        }
	                    };
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    break;
	                }
	            } else if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch ===  '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	            } else {
	                break;
	            }
	        }
	    }
	
	    function filterCommentLocation() {
	        var i, entry, comment, comments = [];
	
	        for (i = 0; i < extra.comments.length; ++i) {
	            entry = extra.comments[i];
	            comment = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (extra.range) {
	                comment.range = entry.range;
	            }
	            if (extra.loc) {
	                comment.loc = entry.loc;
	            }
	            comments.push(comment);
	        }
	
	        extra.comments = comments;
	    }
	
	    function collectToken() {
	        var start, loc, token, range, value;
	
	        skipComment();
	        start = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        token = extra.advance();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        if (token.type !== Token.EOF) {
	            range = [token.range[0], token.range[1]];
	            value = sliceSource(token.range[0], token.range[1]);
	            extra.tokens.push({
	                type: TokenName[token.type],
	                value: value,
	                range: range,
	                loc: loc
	            });
	        }
	
	        return token;
	    }
	
	    function collectRegex() {
	        var pos, loc, regex, token;
	
	        skipComment();
	
	        pos = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        regex = extra.scanRegExp();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        // Pop the previous token, which is likely '/' or '/='
	        if (extra.tokens.length > 0) {
	            token = extra.tokens[extra.tokens.length - 1];
	            if (token.range[0] === pos && token.type === 'Punctuator') {
	                if (token.value === '/' || token.value === '/=') {
	                    extra.tokens.pop();
	                }
	            }
	        }
	
	        extra.tokens.push({
	            type: 'RegularExpression',
	            value: regex.literal,
	            range: [pos, index],
	            loc: loc
	        });
	
	        return regex;
	    }
	
	    function filterTokenLocation() {
	        var i, entry, token, tokens = [];
	
	        for (i = 0; i < extra.tokens.length; ++i) {
	            entry = extra.tokens[i];
	            token = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (extra.range) {
	                token.range = entry.range;
	            }
	            if (extra.loc) {
	                token.loc = entry.loc;
	            }
	            tokens.push(token);
	        }
	
	        extra.tokens = tokens;
	    }
	
	    function createLiteral(token) {
	        return {
	            type: Syntax.Literal,
	            value: token.value
	        };
	    }
	
	    function createRawLiteral(token) {
	        return {
	            type: Syntax.Literal,
	            value: token.value,
	            raw: sliceSource(token.range[0], token.range[1])
	        };
	    }
	
	    function createLocationMarker() {
	        var marker = {};
	
	        marker.range = [index, index];
	        marker.loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            },
	            end: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        marker.end = function () {
	            this.range[1] = index;
	            this.loc.end.line = lineNumber;
	            this.loc.end.column = index - lineStart;
	        };
	
	        marker.applyGroup = function (node) {
	            if (extra.range) {
	                node.groupRange = [this.range[0], this.range[1]];
	            }
	            if (extra.loc) {
	                node.groupLoc = {
	                    start: {
	                        line: this.loc.start.line,
	                        column: this.loc.start.column
	                    },
	                    end: {
	                        line: this.loc.end.line,
	                        column: this.loc.end.column
	                    }
	                };
	            }
	        };
	
	        marker.apply = function (node) {
	            if (extra.range) {
	                node.range = [this.range[0], this.range[1]];
	            }
	            if (extra.loc) {
	                node.loc = {
	                    start: {
	                        line: this.loc.start.line,
	                        column: this.loc.start.column
	                    },
	                    end: {
	                        line: this.loc.end.line,
	                        column: this.loc.end.column
	                    }
	                };
	            }
	        };
	
	        return marker;
	    }
	
	    function trackGroupExpression() {
	        var marker, expr;
	
	        skipComment();
	        marker = createLocationMarker();
	        expect('(');
	
	        expr = parseExpression();
	
	        expect(')');
	
	        marker.end();
	        marker.applyGroup(expr);
	
	        return expr;
	    }
	
	    function trackLeftHandSideExpression() {
	        var marker, expr;
	
	        skipComment();
	        marker = createLocationMarker();
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[')) {
	            if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            }
	        }
	
	        return expr;
	    }
	
	    function trackLeftHandSideExpressionAllowCall() {
	        var marker, expr;
	
	        skipComment();
	        marker = createLocationMarker();
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[') || match('(')) {
	            if (match('(')) {
	                expr = {
	                    type: Syntax.CallExpression,
	                    callee: expr,
	                    'arguments': parseArguments()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            }
	        }
	
	        return expr;
	    }
	
	    function filterGroup(node) {
	        var n, i, entry;
	
	        n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
	        for (i in node) {
	            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
	                entry = node[i];
	                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
	                    n[i] = entry;
	                } else {
	                    n[i] = filterGroup(entry);
	                }
	            }
	        }
	        return n;
	    }
	
	    function wrapTrackingFunction(range, loc) {
	
	        return function (parseFunction) {
	
	            function isBinary(node) {
	                return node.type === Syntax.LogicalExpression ||
	                    node.type === Syntax.BinaryExpression;
	            }
	
	            function visit(node) {
	                var start, end;
	
	                if (isBinary(node.left)) {
	                    visit(node.left);
	                }
	                if (isBinary(node.right)) {
	                    visit(node.right);
	                }
	
	                if (range) {
	                    if (node.left.groupRange || node.right.groupRange) {
	                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
	                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
	                        node.range = [start, end];
	                    } else if (typeof node.range === 'undefined') {
	                        start = node.left.range[0];
	                        end = node.right.range[1];
	                        node.range = [start, end];
	                    }
	                }
	                if (loc) {
	                    if (node.left.groupLoc || node.right.groupLoc) {
	                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
	                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
	                        node.loc = {
	                            start: start,
	                            end: end
	                        };
	                    } else if (typeof node.loc === 'undefined') {
	                        node.loc = {
	                            start: node.left.loc.start,
	                            end: node.right.loc.end
	                        };
	                    }
	                }
	            }
	
	            return function () {
	                var marker, node;
	
	                skipComment();
	
	                marker = createLocationMarker();
	                node = parseFunction.apply(null, arguments);
	                marker.end();
	
	                if (range && typeof node.range === 'undefined') {
	                    marker.apply(node);
	                }
	
	                if (loc && typeof node.loc === 'undefined') {
	                    marker.apply(node);
	                }
	
	                if (isBinary(node)) {
	                    visit(node);
	                }
	
	                return node;
	            };
	        };
	    }
	
	    function patch() {
	
	        var wrapTracking;
	
	        if (extra.comments) {
	            extra.skipComment = skipComment;
	            skipComment = scanComment;
	        }
	
	        if (extra.raw) {
	            extra.createLiteral = createLiteral;
	            createLiteral = createRawLiteral;
	        }
	
	        if (extra.range || extra.loc) {
	
	            extra.parseGroupExpression = parseGroupExpression;
	            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
	            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
	            parseGroupExpression = trackGroupExpression;
	            parseLeftHandSideExpression = trackLeftHandSideExpression;
	            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;
	
	            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);
	
	            extra.parseAdditiveExpression = parseAdditiveExpression;
	            extra.parseAssignmentExpression = parseAssignmentExpression;
	            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
	            extra.parseBitwiseORExpression = parseBitwiseORExpression;
	            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
	            extra.parseBlock = parseBlock;
	            extra.parseFunctionSourceElements = parseFunctionSourceElements;
	            extra.parseCatchClause = parseCatchClause;
	            extra.parseComputedMember = parseComputedMember;
	            extra.parseConditionalExpression = parseConditionalExpression;
	            extra.parseConstLetDeclaration = parseConstLetDeclaration;
	            extra.parseEqualityExpression = parseEqualityExpression;
	            extra.parseExpression = parseExpression;
	            extra.parseForVariableDeclaration = parseForVariableDeclaration;
	            extra.parseFunctionDeclaration = parseFunctionDeclaration;
	            extra.parseFunctionExpression = parseFunctionExpression;
	            extra.parseLogicalANDExpression = parseLogicalANDExpression;
	            extra.parseLogicalORExpression = parseLogicalORExpression;
	            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
	            extra.parseNewExpression = parseNewExpression;
	            extra.parseNonComputedProperty = parseNonComputedProperty;
	            extra.parseObjectProperty = parseObjectProperty;
	            extra.parseObjectPropertyKey = parseObjectPropertyKey;
	            extra.parsePostfixExpression = parsePostfixExpression;
	            extra.parsePrimaryExpression = parsePrimaryExpression;
	            extra.parseProgram = parseProgram;
	            extra.parsePropertyFunction = parsePropertyFunction;
	            extra.parseRelationalExpression = parseRelationalExpression;
	            extra.parseStatement = parseStatement;
	            extra.parseShiftExpression = parseShiftExpression;
	            extra.parseSwitchCase = parseSwitchCase;
	            extra.parseUnaryExpression = parseUnaryExpression;
	            extra.parseVariableDeclaration = parseVariableDeclaration;
	            extra.parseVariableIdentifier = parseVariableIdentifier;
	
	            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
	            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
	            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
	            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
	            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
	            parseBlock = wrapTracking(extra.parseBlock);
	            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
	            parseCatchClause = wrapTracking(extra.parseCatchClause);
	            parseComputedMember = wrapTracking(extra.parseComputedMember);
	            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
	            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
	            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
	            parseExpression = wrapTracking(extra.parseExpression);
	            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
	            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
	            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
	            parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
	            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
	            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
	            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
	            parseNewExpression = wrapTracking(extra.parseNewExpression);
	            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
	            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
	            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
	            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
	            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
	            parseProgram = wrapTracking(extra.parseProgram);
	            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
	            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
	            parseStatement = wrapTracking(extra.parseStatement);
	            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
	            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
	            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
	            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
	            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
	        }
	
	        if (typeof extra.tokens !== 'undefined') {
	            extra.advance = advance;
	            extra.scanRegExp = scanRegExp;
	
	            advance = collectToken;
	            scanRegExp = collectRegex;
	        }
	    }
	
	    function unpatch() {
	        if (typeof extra.skipComment === 'function') {
	            skipComment = extra.skipComment;
	        }
	
	        if (extra.raw) {
	            createLiteral = extra.createLiteral;
	        }
	
	        if (extra.range || extra.loc) {
	            parseAdditiveExpression = extra.parseAdditiveExpression;
	            parseAssignmentExpression = extra.parseAssignmentExpression;
	            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
	            parseBitwiseORExpression = extra.parseBitwiseORExpression;
	            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
	            parseBlock = extra.parseBlock;
	            parseFunctionSourceElements = extra.parseFunctionSourceElements;
	            parseCatchClause = extra.parseCatchClause;
	            parseComputedMember = extra.parseComputedMember;
	            parseConditionalExpression = extra.parseConditionalExpression;
	            parseConstLetDeclaration = extra.parseConstLetDeclaration;
	            parseEqualityExpression = extra.parseEqualityExpression;
	            parseExpression = extra.parseExpression;
	            parseForVariableDeclaration = extra.parseForVariableDeclaration;
	            parseFunctionDeclaration = extra.parseFunctionDeclaration;
	            parseFunctionExpression = extra.parseFunctionExpression;
	            parseGroupExpression = extra.parseGroupExpression;
	            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
	            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
	            parseLogicalANDExpression = extra.parseLogicalANDExpression;
	            parseLogicalORExpression = extra.parseLogicalORExpression;
	            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
	            parseNewExpression = extra.parseNewExpression;
	            parseNonComputedProperty = extra.parseNonComputedProperty;
	            parseObjectProperty = extra.parseObjectProperty;
	            parseObjectPropertyKey = extra.parseObjectPropertyKey;
	            parsePrimaryExpression = extra.parsePrimaryExpression;
	            parsePostfixExpression = extra.parsePostfixExpression;
	            parseProgram = extra.parseProgram;
	            parsePropertyFunction = extra.parsePropertyFunction;
	            parseRelationalExpression = extra.parseRelationalExpression;
	            parseStatement = extra.parseStatement;
	            parseShiftExpression = extra.parseShiftExpression;
	            parseSwitchCase = extra.parseSwitchCase;
	            parseUnaryExpression = extra.parseUnaryExpression;
	            parseVariableDeclaration = extra.parseVariableDeclaration;
	            parseVariableIdentifier = extra.parseVariableIdentifier;
	        }
	
	        if (typeof extra.scanRegExp === 'function') {
	            advance = extra.advance;
	            scanRegExp = extra.scanRegExp;
	        }
	    }
	
	    function stringToArray(str) {
	        var length = str.length,
	            result = [],
	            i;
	        for (i = 0; i < length; ++i) {
	            result[i] = str.charAt(i);
	        }
	        return result;
	    }
	
	    function parse(code, options) {
	        var program, toString;
	
	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }
	
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        length = source.length;
	        buffer = null;
	        state = {
	            allowIn: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false
	        };
	
	        extra = {};
	        if (typeof options !== 'undefined') {
	            extra.range = (typeof options.range === 'boolean') && options.range;
	            extra.loc = (typeof options.loc === 'boolean') && options.loc;
	            extra.raw = (typeof options.raw === 'boolean') && options.raw;
	            if (typeof options.tokens === 'boolean' && options.tokens) {
	                extra.tokens = [];
	            }
	            if (typeof options.comment === 'boolean' && options.comment) {
	                extra.comments = [];
	            }
	            if (typeof options.tolerant === 'boolean' && options.tolerant) {
	                extra.errors = [];
	            }
	        }
	
	        if (length > 0) {
	            if (typeof source[0] === 'undefined') {
	                // Try first to convert to a string. This is good as fast path
	                // for old IE which understands string indexing for string
	                // literals only and not for string object.
	                if (code instanceof String) {
	                    source = code.valueOf();
	                }
	
	                // Force accessing the characters via an array.
	                if (typeof source[0] === 'undefined') {
	                    source = stringToArray(code);
	                }
	            }
	        }
	
	        patch();
	        try {
	            program = parseProgram();
	            if (typeof extra.comments !== 'undefined') {
	                filterCommentLocation();
	                program.comments = extra.comments;
	            }
	            if (typeof extra.tokens !== 'undefined') {
	                filterTokenLocation();
	                program.tokens = extra.tokens;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                program.errors = extra.errors;
	            }
	            if (extra.range || extra.loc) {
	                program.body = filterGroup(program.body);
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            unpatch();
	            extra = {};
	        }
	
	        return program;
	    }
	
	    // Sync with package.json.
	    exports.version = '1.0.4';
	
	    exports.parse = parse;
	
	    // Deep copy.
	    exports.Syntax = (function () {
	        var name, types = {};
	
	        if (typeof Object.create === 'function') {
	            types = Object.create(null);
	        }
	
	        for (name in Syntax) {
	            if (Syntax.hasOwnProperty(name)) {
	                types[name] = Syntax[name];
	            }
	        }
	
	        if (typeof Object.freeze === 'function') {
	            Object.freeze(types);
	        }
	
	        return types;
	    }());
	
	}));
	/* vim: set sw=4 ts=4 et tw=80 : */
	


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var generate = __webpack_require__(19)
	
	//Reuse stack across all shims
	var STACK = new Int32Array(1024)
	
	function Shim(procedure) {
	  this.memoized = {}
	  this.procedure = procedure
	}
	
	Shim.prototype.checkShape = function(a, b) {
	  if(a.length !== b.length) {
	    throw new Error("Shape mismatch")
	  }
	  for(var i=a.length-1; i>=0; --i) {
	    if(a[i] !== b[i]) {
	      throw new Error("Shape mismatch")
	    }
	  }
	}
	
	Shim.prototype.getStack = function(size) {
	  if(size < STACK.length) {
	    return STACK
	  }
	  STACK = new Int32Array(size)
	  return STACK
	}
	
	function compare1st(a,b) { return a[0] - b[0]; }
	
	Shim.prototype.getOrder = function(stride) {
	  var zipped = new Array(stride.length)
	  for(var i=0; i<stride.length; ++i) {
	    zipped[i] = [Math.abs(stride[i]), i]
	  }
	  zipped.sort(compare1st)
	  var unzipped = new Array(stride.length)
	  for(var i=0; i<stride.length; ++i) {
	    unzipped[i] = zipped[i][1]
	  }
	  return unzipped
	}
	
	Shim.prototype.getProc = function(orders) {
	  var proc_name = orders.join("|")
	    , proc = this.memoized[proc_name]
	  if(!proc) {
	    proc = generate(orders, this.procedure)
	    this.memoized[proc_name] = proc
	  }
	  return proc
	}
	
	function createShim(shim_args, procedure) {
	  var code = ["\"use strict\""], i
	  //Check shapes
	  for(i=1; i<procedure.numArrayArgs; ++i) {
	    code.push("this.checkShape(array0.shape,array"+i+".shape)")
	  }
	  //Load/lazily generate procedure based on array ordering
	  code.push("var proc = this.getProc([")
	  for(i=0; i<procedure.numArrayArgs; ++i) {
	    code.push((i>0 ? "," : "") + "this.getOrder(array"+i+".stride)")
	  }
	  code.push("])")
	  //Call procedure
	  if(procedure.hasReturn) {
	    code.push("return proc(")
	  } else {
	    code.push("proc(")
	  }
	  code.push("this.getStack(" + procedure.numArrayArgs + "*(array0.shape.length*32)), array0.shape.slice(0)")
	  //Bind array arguments
	  for(i=0; i<procedure.numArrayArgs; ++i) {
	    code.push(",array" + i + ".data")
	    code.push(",array" + i + ".offset")
	    code.push(",array" + i + ".stride")
	  }
	  //Bind scalar arguments
	  for(var i=0; i<procedure.numScalarArgs; ++i) {
	    code.push(",scalar"+i)
	  }
	  code.push(")")
	  if(!procedure.hasReturn) {
	    code.push("return array0")
	  }
	  //Create the shim
	  shim_args.push(code.join("\n"))
	  var result = Function.apply(null, shim_args)
	  if(procedure.printCode) {
	    console.log("Generated shim:", result + "")
	  }
	  return result.bind(new Shim(procedure))
	}
	
	module.exports = createShim
	
	


/***/ },
/* 19 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var RECURSION_LIMIT = 32
	
	function innerFill(order, procedure) {
	  var dimension = order.length
	    , nargs = procedure.numArrayArgs
	    , has_index = procedure.hasIndex
	    , code = []
	    , idx=0, pidx=0, i, j
	  for(i=0; i<dimension; ++i) {
	    code.push("var i"+i+"=0;")
	  }
	  //Compute scan deltas
	  for(j=0; j<nargs; ++j) {
	    for(i=0; i<dimension; ++i) {
	      pidx = idx
	      idx = order[i]
	      if(i === 0) {
	        code.push("var d"+j+"s"+i+"=stride"+j+"["+idx+"]|0;")
	      } else {
	        code.push("var d"+j+"s"+i+"=(stride"+j+"["+idx+"]-shape["+pidx+"]*stride"+j+"["+pidx+"])|0;")
	      }
	    }
	  }
	  //Outer scan loop
	  for(i=dimension-1; i>=0; --i) {
	    idx = order[i]
	    code.push("for(i"+i+"=shape["+idx+"]|0;--i"+i+">=0;){")
	  }
	  //Push body of inner loop
	  code.push(procedure.body)
	  //Advance scan pointers
	  for(i=0; i<dimension; ++i) {
	    pidx = idx
	    idx = order[i]
	    for(j=0; j<nargs; ++j) {
	      code.push("ptr"+j+"+=d"+j+"s"+i)
	    }
	    if(has_index) {
	      if(i > 0) {
	        code.push("index["+pidx+"]-=shape["+pidx+"]")
	      }
	      code.push("++index["+idx+"]")
	    }
	    code.push("}")
	  }
	  return code.join("\n")
	}
	
	function outerFill(matched, order, procedure) {
	  var dimension = order.length
	    , nargs = procedure.numArrayArgs
	    , has_index = procedure.hasIndex
	    , code = []
	    , static_args = dimension
	    , index_start = nargs + static_args
	    , frame_size = index_start + (has_index ? dimension : 0)
	    , i
	  
	  //Initiaize variables
	  code.push("var i=0,l=0,v=0,d=0,sp=0")
	  
	  //Begin recursion
	  code.push("while(true){")
	    
	    //Walk over runs to get bounds
	    code.push("l="+RECURSION_LIMIT)
	    code.push("v="+RECURSION_LIMIT)
	    code.push("d="+matched)
	  
	    for(i=matched; i<dimension; ++i) {
	      code.push("if(shape["+i+"]>l){")
	        code.push("v=l|0")
	        code.push("l=shape["+i+"]|0")
	        code.push("d="+i+"|0")
	      code.push("}else if(shape["+i+"]>v){")
	        code.push("v=shape["+i+"]|0")
	      code.push("}")
	    }
	  
	    code.push("if(l<="+RECURSION_LIMIT+"){")
	      code.push(innerFill(order, procedure))
	    code.push("} else {")
	  
	      //Round v to previous power of 2
	      code.push("v=(v>>>1)-1")
	      code.push("for(i=1;i<=16;i<<=1){v|=v>>>i}")
	      code.push("++v")
	      code.push("if(v<"+RECURSION_LIMIT+") v="+RECURSION_LIMIT)
	  
	      //Set shape
	      code.push("i=shape[d]")
	      code.push("shape[d]=v")
	  
	      //Fill across row
	      code.push("for(;i>=v;i-=v){")
	        for(i=0; i<dimension; ++i) {
	          code.push("STACK[sp+"+i+"]=shape["+i+"]")
	        }
	        for(i=0; i<nargs; ++i) {
	          code.push("STACK[sp+"+(i+static_args)+"]=ptr"+i+"|0")
	        }
	        if(has_index) {
	          for(i=0; i<dimension; ++i) {
	            code.push("STACK[sp+"+(i+index_start)+"]=index["+i+"]")
	          }
	          code.push("index[d]+=v")
	        }
	        for(i=0; i<nargs; ++i) {
	          code.push("ptr"+i+"+=(v*stride"+i+"[d])|0")
	        }
	        code.push("sp+="+frame_size)
	      code.push("}")
	  
	      //Handle edge case
	      code.push("if(i>0){")
	        code.push("shape[d]=i")
	        for(i=0; i<dimension; ++i) {
	          code.push("STACK[sp+"+i+"]=shape["+i+"]")
	        }
	        for(i=0; i<nargs; ++i) {
	          code.push("STACK[sp+"+(i+static_args)+"]=ptr"+i+"|0")
	        }
	        if(has_index) {
	          for(i=0; i<dimension; ++i) {
	            code.push("STACK[sp+"+(i+index_start)+"]=index["+i+"]")
	          }
	        }
	        code.push("sp+="+frame_size)
	      code.push("}")
	    code.push("}")
	  
	    //Pop previous state
	    code.push("if(sp<=0){")
	      code.push("break")
	    code.push("}")
	    code.push("sp-="+frame_size)
	    for(i=0; i<dimension; ++i) {
	      code.push("shape["+i+"]=STACK[sp+"+i+"]")
	    }
	    for(i=0; i<nargs; ++i) {
	      code.push("ptr"+i+"=STACK[sp+"+(i+static_args)+"]")
	    }
	    if(has_index) {
	      for(i=0; i<dimension; ++i) {
	        code.push("index["+i+"]=STACK[sp+"+(i+index_start)+"]")
	      }
	    }
	 code.push("}")
	 return code.join("\n")
	}
	
	function majorOrder(orders) {
	  return orders[0]
	}
	
	function generate(orders, procedure) {
	  var order = majorOrder(orders)
	    , dimension = orders[0].length
	    , nargs = procedure.numArrayArgs
	    , code = ['"use strict"']
	    , matched, i, j
	    , arglist = [ "STACK", "shape" ]
	  //Create procedure arguments
	  for(i = 0; i<nargs; ++i) {
	    arglist.push("arr" + i)
	    arglist.push("ptr" + i)
	    arglist.push("stride" + i)
	    code.push("ptr"+i+"|=0")
	    for(j = 0; j<dimension; ++j) {
	      code.push("stride"+i+"["+j+"]|=0")
	    }
	  }
	  for(i = 0; i<dimension; ++i) {
	    code.push("shape["+i+"]|=0")
	  }
	  for(i = 0; i<procedure.numScalarArgs; ++i) {
	    arglist.push("scalar"+i)
	  }
	  if(procedure.hasIndex) {
	    code.push("var index=[")
	    for(i=0; i<dimension; ++i) {
	      code.push((i > 0) ? ",0":"0")
	    }
	    code.push("]")
	  }
	  if(procedure.hasShape) {
	    code.push("var inline_shape=shape.slice(0)")
	  }
	  //Compute number of matching orders
	  matched = 0;
	matched_loop:
	  while(matched < dimension) {
	    for(j=1; j<nargs; ++j) {
	      if(orders[j][matched] !== orders[0][matched]) {
	        break matched_loop;
	      }
	    }
	    ++matched;
	  }
	  //Generate code
	  code.push(procedure.pre)
	  if(matched === dimension) {
	    code.push(innerFill(order, procedure))
	  } else {
	    code.push(outerFill(matched, order, procedure))
	  }
	  code.push(procedure.post)
	  arglist.push(code.join("\n"))
	  //Return result
	  var result = Function.apply(null, arglist)
	  if(procedure.printCode) {
	    console.log("For order:", orders, "Generated code: \n", result+"")
	  }
	  return result
	}
	
	module.exports = generate


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var ops = __webpack_require__(13)
	var cwise = __webpack_require__(21)
	var ndarray = __webpack_require__(10)
	var fftm = __webpack_require__(27)
	var pool = __webpack_require__(28)
	
	function ndfft(dir, x, y) {
	  var shape = x.shape
	    , d = shape.length
	    , size = 1
	    , stride = new Array(d)
	    , pad = 0
	    , i, j
	  for(i=d-1; i>=0; --i) {
	    stride[i] = size
	    size *= shape[i]
	    pad = Math.max(pad, fftm.scratchMemory(shape[i]))
	    if(x.shape[i] !== y.shape[i]) {
	      throw new Error("Shape mismatch, real and imaginary arrays must have same size")
	    }
	  }
	  var buffer = pool.malloc(4 * size + pad, "double")
	  var x1 = ndarray(buffer, shape.slice(0), stride, 0)
	    , y1 = ndarray(buffer, shape.slice(0), stride.slice(0), size)
	    , x2 = ndarray(buffer, shape.slice(0), stride.slice(0), 2*size)
	    , y2 = ndarray(buffer, shape.slice(0), stride.slice(0), 3*size)
	    , tmp, n, s1, s2
	    , scratch_ptr = 4 * size
	  
	  //Copy into x1/y1
	  ops.assign(x1, x)
	  ops.assign(y1, y)
	  
	  for(i=d-1; i>=0; --i) {
	    fftm(dir, size/shape[i], shape[i], buffer, x1.offset, y1.offset, scratch_ptr)
	    if(i === 0) {
	      break
	    }
	    
	    //Compute new stride for x2/y2
	    n = 1
	    s1 = x2.stride
	    s2 = y2.stride
	    for(j=i-1; j<d; ++j) {
	      s2[j] = s1[j] = n
	      n *= shape[j]
	    }
	    for(j=i-2; j>=0; --j) {
	      s2[j] = s1[j] = n
	      n *= shape[j]
	    }
	    
	    //Transpose
	    ops.assign(x2, x1)
	    ops.assign(y2, y1)
	    
	    //Swap buffers
	    tmp = x1
	    x1 = x2
	    x2 = tmp
	    tmp = y1
	    y1 = y2
	    y2 = tmp
	  }
	  
	  //Copy result back into x
	  ops.assign(x, x1)
	  ops.assign(y, y1)
	  
	  pool.free(buffer)
	}
	
	module.exports = ndfft
	


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var Parser = __webpack_require__(22)
	  , createShim = __webpack_require__(25)
	
	var REQUIRED_FIELDS = [ "args", "body" ]
	var OPTIONAL_FIELDS = [ "pre", "post", "printCode" ]
	
	function CompiledProcedure() {
	  this.numArgs = 0
	  this.numArrayArgs = 0
	  this.numScalarArgs = 0
	  this.hasIndex = false
	  this.hasShape = false
	  this.hasReturn = false
	  this.pre = ""
	  this.body = ""
	  this.post = ""
	  this.unroll = 1
	  this.printCode = false
	}
	
	function compile(user_args) {
	  for(var id in user_args) {
	    if(REQUIRED_FIELDS.indexOf(id) < 0 &&
	       OPTIONAL_FIELDS.indexOf(id) < 0) {
	      throw new Error("Unknown argument '"+id+"' passed to expression compiler")
	    }
	  }
	  for(var i=0; i<REQUIRED_FIELDS.length; ++i) {
	    if(!user_args[REQUIRED_FIELDS[i]]) {
	      throw new Error("Missing argument: " + REQUIRED_FIELDS[i])
	    }
	  }
	  //Parse arguments
	  var proc = new CompiledProcedure()
	  var proc_args = user_args.args.slice(0)
	  var shim_args = []
	  for(var i=0; i<proc_args.length; ++i) {
	    switch(proc_args[i]) {
	      case "array":
	        shim_args.push("array" + proc.numArrayArgs)
	        proc_args[i] += (proc.numArrayArgs++)
	      break
	      case "scalar":
	        shim_args.push("scalar" + proc.numScalarArgs)
	        proc_args[i] += (proc.numScalarArgs++)
	      break
	      case "index":
	        proc.hasIndex = true
	      break
	      case "shape":
	        proc.hasShape = true
	      break
	      default:
	        throw new Error("Unknown argument types")
	    }
	  }
	  if(proc.numArrayArgs <= 0) {
	    throw new Error("No array arguments specified")
	  }
	  
	  //Parse blocks
	  var parser = new Parser(proc_args)
	    , pre = user_args.pre || null
	    , body = user_args.body
	    , post = user_args.post || null
	  parser.preprocess(pre)
	  parser.preprocess(body)
	  parser.preprocess(post)
	  proc.pre  = parser.preBlock() + "\n" + parser.process(pre)
	  proc.body = parser.process(body)
	  proc.post = parser.process(post) + "\n" + parser.postBlock()
	  proc.hasReturn = parser.hasReturn
	  
	  //Parse options
	  proc.printCode = user_args.printCode || false
	  
	  //Assemble shim
	  return createShim(shim_args, proc)
	}
	
	module.exports = compile
	


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var falafel = __webpack_require__(23)
	
	function isGlobal(identifier) {
	  if(typeof(window) !== "undefined") {
	    return identifier in window
	  } else if(typeof(GLOBAL) !== "undefined") {
	    return identifier in GLOBAL
	  } else {
	    return false
	  }
	}
	
	function getArgs(src) {
	  var args = []
	  falafel(src, function(node) {
	    var i
	    if(node.type === "FunctionExpression" &&
	       node.parent.parent.parent.type === "Program") {
	      args = new Array(node.params.length)
	      for(i=0; i<node.params.length; ++i) {
	        args[i] = node.params[i].name
	      }
	    }
	  })
	  return args
	}
	
	function Parser(args) {
	  this.args = args
	  this.this_vars = []
	  this.computed_this = false
	  this.prefix_count = 0
	  this.hasReturn = false
	}
	
	//Preprocessing pass is needed to explode the "this" object
	Parser.prototype.preprocess = function(func) {
	  if(!func || this.computed_this) {
	    return
	  }
	  var src = "(" + func + ")()"
	    , this_vars = this.this_vars
	    , computed_this = this.computed_this
	  falafel(src, function(node) {
	    var n
	    if(node.type === "ThisExpression") {
	      if(node.parent.type === "MemberExpression" && !node.parent.computed) {
	        n = node.parent.property.name
	        if(this_vars.indexOf(n) < 0) {
	          this_vars.push(n)
	        }
	      } else {
	        computed_this = true
	      }
	    }
	  })
	  if(computed_this) {
	    this.this_vars = []
	  }
	  this.computed_this = computed_this
	}
	
	Parser.prototype.process = function(func) {
	  if(!func) {
	    return ""
	  }
	  var label = this.prefix_count++
	    , src = "(" + func + ")()"
	    , block_args = getArgs(src)
	    , proc_args = this.args
	    , result = ""
	    , inline_prefix = "inline" + label + "_"
	    , hasReturn = this.hasReturn
	  falafel(src, function(node) {
	    var n, i, j
	    if(node.type === "FunctionExpression" &&
	       node.parent.parent.parent.type === "Program") {
	      result = node.body.source()
	    } else if(node.type === "Identifier") {
	      if(node.parent.type === "MemberExpression") {
	        if((node.parent.property === node && !node.parent.computed) ||
	           node.parent.object.type === "ThisExpression") {
	          return
	        }
	      }
	      n = node.name
	      i = block_args.indexOf(n)
	      if(i >= 0) {
	        if(i < proc_args.length) {
	          if(proc_args[i].indexOf("array") === 0) {
	            j = parseInt(proc_args[i].substr(5))
	            node.update("arr"+j+"[ptr"+j+"]")
	          } else if(proc_args[i] === "shape") {
	            node.update("inline_shape")
	          } else {
	            node.update(proc_args[i])
	          }
	        } else {
	          node.update(inline_prefix + node.source())
	        }
	      } else if(isGlobal(n)) {
	        return
	      } else {
	        node.update(inline_prefix + node.source())
	      }
	    } else if(node.type === "MemberExpression") {
	      if(node.object.type === "ThisExpression") {
	        node.update("this_" + node.property.source().trimLeft())
	      }
	    } else if(node.type === "ThisExpression") {
	      if(node.parent.type !== "MemberExpression") {
	        node.update("this_")
	      }
	    } else if(node.type === "ReturnStatement") {
	      hasReturn = true
	    }
	  })
	  this.hasReturn = hasReturn
	  var prefix = ""
	  for(var i=this.args.length; i<block_args.length; ++i) {
	    prefix += "var " + block_args[i] + "\n"
	  }
	  return prefix + result
	}
	
	Parser.prototype.preBlock = function() {
	  if(this.computed_this) {
	    return "var this_={}"
	  } else if(this.this_vars.length > 0) {
	    return "var this_" + this.this_vars.join(",this_")
	  } else {
	    return ""
	  }
	}
	
	Parser.prototype.postBlock = function() {
	  return ""
	}
	
	module.exports = Parser


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var parse = __webpack_require__(24).parse;
	var objectKeys = Object.keys || function (obj) {
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    return keys;
	};
	var forEach = function (xs, fn) {
	    if (xs.forEach) return xs.forEach(fn);
	    for (var i = 0; i < xs.length; i++) {
	        fn.call(xs, xs[i], i, xs);
	    }
	};
	
	var isArray = Array.isArray || function (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};
	
	module.exports = function (src, opts, fn) {
	    if (typeof opts === 'function') {
	        fn = opts;
	        opts = {};
	    }
	    if (typeof src === 'object') {
	        opts = src;
	        src = opts.source;
	        delete opts.source;
	    }
	    src = src === undefined ? opts.source : src;
	    opts.range = true;
	    if (typeof src !== 'string') src = String(src);
	    
	    var ast = parse(src, opts);
	    
	    var result = {
	        chunks : src.split(''),
	        toString : function () { return result.chunks.join('') },
	        inspect : function () { return result.toString() }
	    };
	    var index = 0;
	    
	    (function walk (node, parent) {
	        insertHelpers(node, parent, result.chunks);
	        
	        forEach(objectKeys(node), function (key) {
	            if (key === 'parent') return;
	            
	            var child = node[key];
	            if (isArray(child)) {
	                forEach(child, function (c) {
	                    if (c && typeof c.type === 'string') {
	                        walk(c, node);
	                    }
	                });
	            }
	            else if (child && typeof child.type === 'string') {
	                insertHelpers(child, node, result.chunks);
	                walk(child, node);
	            }
	        });
	        fn(node);
	    })(ast, undefined);
	    
	    return result;
	};
	 
	function insertHelpers (node, parent, chunks) {
	    if (!node.range) return;
	    
	    node.parent = parent;
	    
	    node.source = function () {
	        return chunks.slice(
	            node.range[0], node.range[1]
	        ).join('');
	    };
	    
	    if (node.update && typeof node.update === 'object') {
	        var prev = node.update;
	        forEach(objectKeys(prev), function (key) {
	            update[key] = prev[key];
	        });
	        node.update = update;
	    }
	    else {
	        node.update = update;
	    }
	    
	    function update (s) {
	        chunks[node.range[0]] = s;
	        for (var i = node.range[0] + 1; i < node.range[1]; i++) {
	            chunks[i] = '';
	        }
	    };
	}
	


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	/*
	  Copyright (C) 2012 Ariya Hidayat <ariya.hidayat@gmail.com>
	  Copyright (C) 2012 Mathias Bynens <mathias@qiwi.be>
	  Copyright (C) 2012 Joost-Wim Boekesteijn <joost-wim@boekesteijn.nl>
	  Copyright (C) 2012 Kris Kowal <kris.kowal@cixar.com>
	  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
	  Copyright (C) 2012 Arpad Borsos <arpad.borsos@googlemail.com>
	  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>
	
	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:
	
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	
	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/
	
	/*jslint bitwise:true plusplus:true */
	/*global esprima:true, define:true, exports:true, window: true,
	throwError: true, createLiteral: true, generateStatement: true,
	parseAssignmentExpression: true, parseBlock: true, parseExpression: true,
	parseFunctionDeclaration: true, parseFunctionExpression: true,
	parseFunctionSourceElements: true, parseVariableIdentifier: true,
	parseLeftHandSideExpression: true,
	parseStatement: true, parseSourceElement: true */
	
	(function (root, factory) {
	    'use strict';
	
	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	    // Rhino, and plain browser loading.
	    if (typeof define === 'function' && define.amd) {
	        define(['exports'], factory);
	    } else if (true) {
	        factory(exports);
	    } else {
	        factory((root.esprima = {}));
	    }
	}(this, function (exports) {
	    'use strict';
	
	    var Token,
	        TokenName,
	        Syntax,
	        PropertyKind,
	        Messages,
	        Regex,
	        source,
	        strict,
	        index,
	        lineNumber,
	        lineStart,
	        length,
	        buffer,
	        state,
	        extra;
	
	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8
	    };
	
	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';
	
	    Syntax = {
	        AssignmentExpression: 'AssignmentExpression',
	        ArrayExpression: 'ArrayExpression',
	        BlockStatement: 'BlockStatement',
	        BinaryExpression: 'BinaryExpression',
	        BreakStatement: 'BreakStatement',
	        CallExpression: 'CallExpression',
	        CatchClause: 'CatchClause',
	        ConditionalExpression: 'ConditionalExpression',
	        ContinueStatement: 'ContinueStatement',
	        DoWhileStatement: 'DoWhileStatement',
	        DebuggerStatement: 'DebuggerStatement',
	        EmptyStatement: 'EmptyStatement',
	        ExpressionStatement: 'ExpressionStatement',
	        ForStatement: 'ForStatement',
	        ForInStatement: 'ForInStatement',
	        FunctionDeclaration: 'FunctionDeclaration',
	        FunctionExpression: 'FunctionExpression',
	        Identifier: 'Identifier',
	        IfStatement: 'IfStatement',
	        Literal: 'Literal',
	        LabeledStatement: 'LabeledStatement',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        NewExpression: 'NewExpression',
	        ObjectExpression: 'ObjectExpression',
	        Program: 'Program',
	        Property: 'Property',
	        ReturnStatement: 'ReturnStatement',
	        SequenceExpression: 'SequenceExpression',
	        SwitchStatement: 'SwitchStatement',
	        SwitchCase: 'SwitchCase',
	        ThisExpression: 'ThisExpression',
	        ThrowStatement: 'ThrowStatement',
	        TryStatement: 'TryStatement',
	        UnaryExpression: 'UnaryExpression',
	        UpdateExpression: 'UpdateExpression',
	        VariableDeclaration: 'VariableDeclaration',
	        VariableDeclarator: 'VariableDeclarator',
	        WhileStatement: 'WhileStatement',
	        WithStatement: 'WithStatement'
	    };
	
	    PropertyKind = {
	        Data: 1,
	        Get: 2,
	        Set: 4
	    };
	
	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken:  'Unexpected token %0',
	        UnexpectedNumber:  'Unexpected number',
	        UnexpectedString:  'Unexpected string',
	        UnexpectedIdentifier:  'Unexpected identifier',
	        UnexpectedReserved:  'Unexpected reserved word',
	        UnexpectedEOS:  'Unexpected end of input',
	        NewlineAfterThrow:  'Illegal newline after throw',
	        InvalidRegExp: 'Invalid regular expression',
	        UnterminatedRegExp:  'Invalid regular expression: missing /',
	        InvalidLHSInAssignment:  'Invalid left-hand side in assignment',
	        InvalidLHSInForIn:  'Invalid left-hand side in for-in',
	        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
	        NoCatchOrFinally:  'Missing catch or finally after try',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared',
	        IllegalContinue: 'Illegal continue statement',
	        IllegalBreak: 'Illegal break statement',
	        IllegalReturn: 'Illegal return statement',
	        StrictModeWith:  'Strict mode code may not include a with statement',
	        StrictCatchVariable:  'Catch variable may not be eval or arguments in strict mode',
	        StrictVarName:  'Variable name may not be eval or arguments in strict mode',
	        StrictParamName:  'Parameter name eval or arguments is not allowed in strict mode',
	        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
	        StrictFunctionName:  'Function name may not be eval or arguments in strict mode',
	        StrictOctalLiteral:  'Octal literals are not allowed in strict mode.',
	        StrictDelete:  'Delete of an unqualified identifier in strict mode.',
	        StrictDuplicateProperty:  'Duplicate data property in object literal not allowed in strict mode',
	        AccessorDataProperty:  'Object literal may not have data and accessor property with the same name',
	        AccessorGetSet:  'Object literal may not have multiple get/set accessors with the same name',
	        StrictLHSAssignment:  'Assignment to eval or arguments is not allowed in strict mode',
	        StrictLHSPostfix:  'Postfix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictLHSPrefix:  'Prefix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictReservedWord:  'Use of future reserved word in strict mode'
	    };
	
	    // See also tools/generate-unicode-regex.py.
	    Regex = {
	        NonAsciiIdentifierStart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]'),
	        NonAsciiIdentifierPart: new RegExp('[\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0\u08a2-\u08ac\u08e4-\u08fe\u0900-\u0963\u0966-\u096f\u0971-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7\u09c8\u09cb-\u09ce\u09d7\u09dc\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5c\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c58\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1\u0cf2\u0d02\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772\u1773\u1780-\u17d3\u17d7\u17dc\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19d9\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1d00-\u1de6\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u200c\u200d\u203f\u2040\u2054\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u2e2f\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099\u309a\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua697\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a\uaa7b\uaa80-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabea\uabec\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]')
	    };
	
	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.
	
	    function assert(condition, message) {
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }
	
	    function sliceSource(from, to) {
	        return source.slice(from, to);
	    }
	
	    if (typeof 'esprima'[0] === 'undefined') {
	        sliceSource = function sliceArraySource(from, to) {
	            return source.slice(from, to).join('');
	        };
	    }
	
	    function isDecimalDigit(ch) {
	        return '0123456789'.indexOf(ch) >= 0;
	    }
	
	    function isHexDigit(ch) {
	        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
	    }
	
	    function isOctalDigit(ch) {
	        return '01234567'.indexOf(ch) >= 0;
	    }
	
	
	    // 7.2 White Space
	
	    function isWhiteSpace(ch) {
	        return (ch === ' ') || (ch === '\u0009') || (ch === '\u000B') ||
	            (ch === '\u000C') || (ch === '\u00A0') ||
	            (ch.charCodeAt(0) >= 0x1680 &&
	             '\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF'.indexOf(ch) >= 0);
	    }
	
	    // 7.3 Line Terminators
	
	    function isLineTerminator(ch) {
	        return (ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029');
	    }
	
	    // 7.6 Identifier Names and Identifiers
	
	    function isIdentifierStart(ch) {
	        return (ch === '$') || (ch === '_') || (ch === '\\') ||
	            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
	            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierStart.test(ch));
	    }
	
	    function isIdentifierPart(ch) {
	        return (ch === '$') || (ch === '_') || (ch === '\\') ||
	            (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') ||
	            ((ch >= '0') && (ch <= '9')) ||
	            ((ch.charCodeAt(0) >= 0x80) && Regex.NonAsciiIdentifierPart.test(ch));
	    }
	
	    // 7.6.1.2 Future Reserved Words
	
	    function isFutureReservedWord(id) {
	        switch (id) {
	
	        // Future reserved words.
	        case 'class':
	        case 'enum':
	        case 'export':
	        case 'extends':
	        case 'import':
	        case 'super':
	            return true;
	        }
	
	        return false;
	    }
	
	    function isStrictModeReservedWord(id) {
	        switch (id) {
	
	        // Strict Mode reserved words.
	        case 'implements':
	        case 'interface':
	        case 'package':
	        case 'private':
	        case 'protected':
	        case 'public':
	        case 'static':
	        case 'yield':
	        case 'let':
	            return true;
	        }
	
	        return false;
	    }
	
	    function isRestrictedWord(id) {
	        return id === 'eval' || id === 'arguments';
	    }
	
	    // 7.6.1.1 Keywords
	
	    function isKeyword(id) {
	        var keyword = false;
	        switch (id.length) {
	        case 2:
	            keyword = (id === 'if') || (id === 'in') || (id === 'do');
	            break;
	        case 3:
	            keyword = (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
	            break;
	        case 4:
	            keyword = (id === 'this') || (id === 'else') || (id === 'case') || (id === 'void') || (id === 'with');
	            break;
	        case 5:
	            keyword = (id === 'while') || (id === 'break') || (id === 'catch') || (id === 'throw');
	            break;
	        case 6:
	            keyword = (id === 'return') || (id === 'typeof') || (id === 'delete') || (id === 'switch');
	            break;
	        case 7:
	            keyword = (id === 'default') || (id === 'finally');
	            break;
	        case 8:
	            keyword = (id === 'function') || (id === 'continue') || (id === 'debugger');
	            break;
	        case 10:
	            keyword = (id === 'instanceof');
	            break;
	        }
	
	        if (keyword) {
	            return true;
	        }
	
	        switch (id) {
	        // Future reserved words.
	        // 'const' is specialized as Keyword in V8.
	        case 'const':
	            return true;
	
	        // For compatiblity to SpiderMonkey and ES.next
	        case 'yield':
	        case 'let':
	            return true;
	        }
	
	        if (strict && isStrictModeReservedWord(id)) {
	            return true;
	        }
	
	        return isFutureReservedWord(id);
	    }
	
	    // 7.4 Comments
	
	    function skipComment() {
	        var ch, blockComment, lineComment;
	
	        blockComment = false;
	        lineComment = false;
	
	        while (index < length) {
	            ch = source[index];
	
	            if (lineComment) {
	                ch = source[index++];
	                if (isLineTerminator(ch)) {
	                    lineComment = false;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    lineStart = index;
	                }
	            } else if (blockComment) {
	                if (isLineTerminator(ch)) {
	                    if (ch === '\r' && source[index + 1] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    ++index;
	                    lineStart = index;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    ch = source[index++];
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                    if (ch === '*') {
	                        ch = source[index];
	                        if (ch === '/') {
	                            ++index;
	                            blockComment = false;
	                        }
	                    }
	                }
	            } else if (ch === '/') {
	                ch = source[index + 1];
	                if (ch === '/') {
	                    index += 2;
	                    lineComment = true;
	                } else if (ch === '*') {
	                    index += 2;
	                    blockComment = true;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    break;
	                }
	            } else if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch ===  '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	            } else {
	                break;
	            }
	        }
	    }
	
	    function scanHexEscape(prefix) {
	        var i, len, ch, code = 0;
	
	        len = (prefix === 'u') ? 4 : 2;
	        for (i = 0; i < len; ++i) {
	            if (index < length && isHexDigit(source[index])) {
	                ch = source[index++];
	                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	            } else {
	                return '';
	            }
	        }
	        return String.fromCharCode(code);
	    }
	
	    function scanIdentifier() {
	        var ch, start, id, restore;
	
	        ch = source[index];
	        if (!isIdentifierStart(ch)) {
	            return;
	        }
	
	        start = index;
	        if (ch === '\\') {
	            ++index;
	            if (source[index] !== 'u') {
	                return;
	            }
	            ++index;
	            restore = index;
	            ch = scanHexEscape('u');
	            if (ch) {
	                if (ch === '\\' || !isIdentifierStart(ch)) {
	                    return;
	                }
	                id = ch;
	            } else {
	                index = restore;
	                id = 'u';
	            }
	        } else {
	            id = source[index++];
	        }
	
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch)) {
	                break;
	            }
	            if (ch === '\\') {
	                ++index;
	                if (source[index] !== 'u') {
	                    return;
	                }
	                ++index;
	                restore = index;
	                ch = scanHexEscape('u');
	                if (ch) {
	                    if (ch === '\\' || !isIdentifierPart(ch)) {
	                        return;
	                    }
	                    id += ch;
	                } else {
	                    index = restore;
	                    id += 'u';
	                }
	            } else {
	                id += source[index++];
	            }
	        }
	
	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            return {
	                type: Token.Identifier,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (isKeyword(id)) {
	            return {
	                type: Token.Keyword,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // 7.8.1 Null Literals
	
	        if (id === 'null') {
	            return {
	                type: Token.NullLiteral,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // 7.8.2 Boolean Literals
	
	        if (id === 'true' || id === 'false') {
	            return {
	                type: Token.BooleanLiteral,
	                value: id,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        return {
	            type: Token.Identifier,
	            value: id,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }
	
	    // 7.7 Punctuators
	
	    function scanPunctuator() {
	        var start = index,
	            ch1 = source[index],
	            ch2,
	            ch3,
	            ch4;
	
	        // Check for most common single-character punctuators.
	
	        if (ch1 === ';' || ch1 === '{' || ch1 === '}') {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === ',' || ch1 === '(' || ch1 === ')') {
	            ++index;
	            return {
	                type: Token.Punctuator,
	                value: ch1,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // Dot (.) can also start a floating-point number, hence the need
	        // to check the next character.
	
	        ch2 = source[index + 1];
	        if (ch1 === '.' && !isDecimalDigit(ch2)) {
	            return {
	                type: Token.Punctuator,
	                value: source[index++],
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // Peek more characters.
	
	        ch3 = source[index + 2];
	        ch4 = source[index + 3];
	
	        // 4-character punctuator: >>>=
	
	        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
	            if (ch4 === '=') {
	                index += 4;
	                return {
	                    type: Token.Punctuator,
	                    value: '>>>=',
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }
	
	        // 3-character punctuators: === !== >>> <<= >>=
	
	        if (ch1 === '=' && ch2 === '=' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '===',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '!' && ch2 === '=' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '!==',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '>' && ch2 === '>' && ch3 === '>') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>>',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '<' && ch2 === '<' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '<<=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        if (ch1 === '>' && ch2 === '>' && ch3 === '=') {
	            index += 3;
	            return {
	                type: Token.Punctuator,
	                value: '>>=',
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	
	        // 2-character punctuators: <= >= == != ++ -- << >> && ||
	        // += -= *= %= &= |= ^= /=
	
	        if (ch2 === '=') {
	            if ('<>=!+-*%&|^/'.indexOf(ch1) >= 0) {
	                index += 2;
	                return {
	                    type: Token.Punctuator,
	                    value: ch1 + ch2,
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }
	
	        if (ch1 === ch2 && ('+-<>&|'.indexOf(ch1) >= 0)) {
	            if ('+-<>&|'.indexOf(ch2) >= 0) {
	                index += 2;
	                return {
	                    type: Token.Punctuator,
	                    value: ch1 + ch2,
	                    lineNumber: lineNumber,
	                    lineStart: lineStart,
	                    range: [start, index]
	                };
	            }
	        }
	
	        // The remaining 1-character punctuators.
	
	        if ('[]<>+-*%&|^!~?:=/'.indexOf(ch1) >= 0) {
	            return {
	                type: Token.Punctuator,
	                value: source[index++],
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [start, index]
	            };
	        }
	    }
	
	    // 7.8.3 Numeric Literals
	
	    function scanNumericLiteral() {
	        var number, start, ch;
	
	        ch = source[index];
	        assert(isDecimalDigit(ch) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');
	
	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];
	
	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            if (number === '0') {
	                if (ch === 'x' || ch === 'X') {
	                    number += source[index++];
	                    while (index < length) {
	                        ch = source[index];
	                        if (!isHexDigit(ch)) {
	                            break;
	                        }
	                        number += source[index++];
	                    }
	
	                    if (number.length <= 2) {
	                        // only 0x
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	
	                    if (index < length) {
	                        ch = source[index];
	                        if (isIdentifierStart(ch)) {
	                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                        }
	                    }
	                    return {
	                        type: Token.NumericLiteral,
	                        value: parseInt(number, 16),
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };
	                } else if (isOctalDigit(ch)) {
	                    number += source[index++];
	                    while (index < length) {
	                        ch = source[index];
	                        if (!isOctalDigit(ch)) {
	                            break;
	                        }
	                        number += source[index++];
	                    }
	
	                    if (index < length) {
	                        ch = source[index];
	                        if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
	                            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                        }
	                    }
	                    return {
	                        type: Token.NumericLiteral,
	                        value: parseInt(number, 8),
	                        octal: true,
	                        lineNumber: lineNumber,
	                        lineStart: lineStart,
	                        range: [start, index]
	                    };
	                }
	
	                // decimal number starts with '0' such as '09' is illegal.
	                if (isDecimalDigit(ch)) {
	                    throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                }
	            }
	
	            while (index < length) {
	                ch = source[index];
	                if (!isDecimalDigit(ch)) {
	                    break;
	                }
	                number += source[index++];
	            }
	        }
	
	        if (ch === '.') {
	            number += source[index++];
	            while (index < length) {
	                ch = source[index];
	                if (!isDecimalDigit(ch)) {
	                    break;
	                }
	                number += source[index++];
	            }
	        }
	
	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];
	
	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	
	            ch = source[index];
	            if (isDecimalDigit(ch)) {
	                number += source[index++];
	                while (index < length) {
	                    ch = source[index];
	                    if (!isDecimalDigit(ch)) {
	                        break;
	                    }
	                    number += source[index++];
	                }
	            } else {
	                ch = 'character ' + ch;
	                if (index >= length) {
	                    ch = '<end>';
	                }
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }
	
	        if (index < length) {
	            ch = source[index];
	            if (isIdentifierStart(ch)) {
	                throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	            }
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }
	
	    // 7.8.4 String Literals
	
	    function scanStringLiteral() {
	        var str = '', quote, start, ch, code, unescaped, restore, octal = false;
	
	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');
	
	        start = index;
	        ++index;
	
	        while (index < length) {
	            ch = source[index++];
	
	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!isLineTerminator(ch)) {
	                    switch (ch) {
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'u':
	                    case 'x':
	                        restore = index;
	                        unescaped = scanHexEscape(ch);
	                        if (unescaped) {
	                            str += unescaped;
	                        } else {
	                            index = restore;
	                            str += ch;
	                        }
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;
	
	                    default:
	                        if (isOctalDigit(ch)) {
	                            code = '01234567'.indexOf(ch);
	
	                            // \0 is not octal escape sequence
	                            if (code !== 0) {
	                                octal = true;
	                            }
	
	                            if (index < length && isOctalDigit(source[index])) {
	                                octal = true;
	                                code = code * 8 + '01234567'.indexOf(source[index++]);
	
	                                // 3 digits are only allowed when string starts
	                                // with 0, 1, 2, 3
	                                if ('0123'.indexOf(ch) >= 0 &&
	                                        index < length &&
	                                        isOctalDigit(source[index])) {
	                                    code = code * 8 + '01234567'.indexOf(source[index++]);
	                                }
	                            }
	                            str += String.fromCharCode(code);
	                        } else {
	                            str += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch ===  '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                }
	            } else if (isLineTerminator(ch)) {
	                break;
	            } else {
	                str += ch;
	            }
	        }
	
	        if (quote !== '') {
	            throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	        }
	
	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            range: [start, index]
	        };
	    }
	
	    function scanRegExp() {
	        var str, ch, start, pattern, flags, value, classMarker = false, restore, terminated = false;
	
	        buffer = null;
	        skipComment();
	
	        start = index;
	        ch = source[index];
	        assert(ch === '/', 'Regular expression literal must start with a slash');
	        str = source[index++];
	
	        while (index < length) {
	            ch = source[index++];
	            str += ch;
	            if (ch === '\\') {
	                ch = source[index++];
	                // ECMA-262 7.8.5
	                if (isLineTerminator(ch)) {
	                    throwError({}, Messages.UnterminatedRegExp);
	                }
	                str += ch;
	            } else if (classMarker) {
	                if (ch === ']') {
	                    classMarker = false;
	                }
	            } else {
	                if (ch === '/') {
	                    terminated = true;
	                    break;
	                } else if (ch === '[') {
	                    classMarker = true;
	                } else if (isLineTerminator(ch)) {
	                    throwError({}, Messages.UnterminatedRegExp);
	                }
	            }
	        }
	
	        if (!terminated) {
	            throwError({}, Messages.UnterminatedRegExp);
	        }
	
	        // Exclude leading and trailing slash.
	        pattern = str.substr(1, str.length - 2);
	
	        flags = '';
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch)) {
	                break;
	            }
	
	            ++index;
	            if (ch === '\\' && index < length) {
	                ch = source[index];
	                if (ch === 'u') {
	                    ++index;
	                    restore = index;
	                    ch = scanHexEscape('u');
	                    if (ch) {
	                        flags += ch;
	                        str += '\\u';
	                        for (; restore < index; ++restore) {
	                            str += source[restore];
	                        }
	                    } else {
	                        index = restore;
	                        flags += 'u';
	                        str += '\\u';
	                    }
	                } else {
	                    str += '\\';
	                }
	            } else {
	                flags += ch;
	                str += ch;
	            }
	        }
	
	        try {
	            value = new RegExp(pattern, flags);
	        } catch (e) {
	            throwError({}, Messages.InvalidRegExp);
	        }
	
	        return {
	            literal: str,
	            value: value,
	            range: [start, index]
	        };
	    }
	
	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }
	
	    function advance() {
	        var ch, token;
	
	        skipComment();
	
	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                range: [index, index]
	            };
	        }
	
	        token = scanPunctuator();
	        if (typeof token !== 'undefined') {
	            return token;
	        }
	
	        ch = source[index];
	
	        if (ch === '\'' || ch === '"') {
	            return scanStringLiteral();
	        }
	
	        if (ch === '.' || isDecimalDigit(ch)) {
	            return scanNumericLiteral();
	        }
	
	        token = scanIdentifier();
	        if (typeof token !== 'undefined') {
	            return token;
	        }
	
	        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	    }
	
	    function lex() {
	        var token;
	
	        if (buffer) {
	            index = buffer.range[1];
	            lineNumber = buffer.lineNumber;
	            lineStart = buffer.lineStart;
	            token = buffer;
	            buffer = null;
	            return token;
	        }
	
	        buffer = null;
	        return advance();
	    }
	
	    function lookahead() {
	        var pos, line, start;
	
	        if (buffer !== null) {
	            return buffer;
	        }
	
	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        buffer = advance();
	        index = pos;
	        lineNumber = line;
	        lineStart = start;
	
	        return buffer;
	    }
	
	    // Return true if there is a line terminator before the next token.
	
	    function peekLineTerminator() {
	        var pos, line, start, found;
	
	        pos = index;
	        line = lineNumber;
	        start = lineStart;
	        skipComment();
	        found = lineNumber !== line;
	        index = pos;
	        lineNumber = line;
	        lineStart = start;
	
	        return found;
	    }
	
	    // Throw an exception
	
	    function throwError(token, messageFormat) {
	        var error,
	            args = Array.prototype.slice.call(arguments, 2),
	            msg = messageFormat.replace(
	                /%(\d)/g,
	                function (whole, index) {
	                    return args[index] || '';
	                }
	            );
	
	        if (typeof token.lineNumber === 'number') {
	            error = new Error('Line ' + token.lineNumber + ': ' + msg);
	            error.index = token.range[0];
	            error.lineNumber = token.lineNumber;
	            error.column = token.range[0] - lineStart + 1;
	        } else {
	            error = new Error('Line ' + lineNumber + ': ' + msg);
	            error.index = index;
	            error.lineNumber = lineNumber;
	            error.column = index - lineStart + 1;
	        }
	
	        throw error;
	    }
	
	    function throwErrorTolerant() {
	        try {
	            throwError.apply(null, arguments);
	        } catch (e) {
	            if (extra.errors) {
	                extra.errors.push(e);
	            } else {
	                throw e;
	            }
	        }
	    }
	
	
	    // Throw an exception because of the token.
	
	    function throwUnexpected(token) {
	        if (token.type === Token.EOF) {
	            throwError(token, Messages.UnexpectedEOS);
	        }
	
	        if (token.type === Token.NumericLiteral) {
	            throwError(token, Messages.UnexpectedNumber);
	        }
	
	        if (token.type === Token.StringLiteral) {
	            throwError(token, Messages.UnexpectedString);
	        }
	
	        if (token.type === Token.Identifier) {
	            throwError(token, Messages.UnexpectedIdentifier);
	        }
	
	        if (token.type === Token.Keyword) {
	            if (isFutureReservedWord(token.value)) {
	                throwError(token, Messages.UnexpectedReserved);
	            } else if (strict && isStrictModeReservedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictReservedWord);
	                return;
	            }
	            throwError(token, Messages.UnexpectedToken, token.value);
	        }
	
	        // BooleanLiteral, NullLiteral, or Punctuator.
	        throwError(token, Messages.UnexpectedToken, token.value);
	    }
	
	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.
	
	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpected(token);
	        }
	    }
	
	    // Expect the next token to match the specified keyword.
	    // If not, an exception will be thrown.
	
	    function expectKeyword(keyword) {
	        var token = lex();
	        if (token.type !== Token.Keyword || token.value !== keyword) {
	            throwUnexpected(token);
	        }
	    }
	
	    // Return true if the next token matches the specified punctuator.
	
	    function match(value) {
	        var token = lookahead();
	        return token.type === Token.Punctuator && token.value === value;
	    }
	
	    // Return true if the next token matches the specified keyword
	
	    function matchKeyword(keyword) {
	        var token = lookahead();
	        return token.type === Token.Keyword && token.value === keyword;
	    }
	
	    // Return true if the next token is an assignment operator
	
	    function matchAssign() {
	        var token = lookahead(),
	            op = token.value;
	
	        if (token.type !== Token.Punctuator) {
	            return false;
	        }
	        return op === '=' ||
	            op === '*=' ||
	            op === '/=' ||
	            op === '%=' ||
	            op === '+=' ||
	            op === '-=' ||
	            op === '<<=' ||
	            op === '>>=' ||
	            op === '>>>=' ||
	            op === '&=' ||
	            op === '^=' ||
	            op === '|=';
	    }
	
	    function consumeSemicolon() {
	        var token, line;
	
	        // Catch the very common case first.
	        if (source[index] === ';') {
	            lex();
	            return;
	        }
	
	        line = lineNumber;
	        skipComment();
	        if (lineNumber !== line) {
	            return;
	        }
	
	        if (match(';')) {
	            lex();
	            return;
	        }
	
	        token = lookahead();
	        if (token.type !== Token.EOF && !match('}')) {
	            throwUnexpected(token);
	        }
	    }
	
	    // Return true if provided expression is LeftHandSideExpression
	
	    function isLeftHandSide(expr) {
	        return expr.type === Syntax.Identifier || expr.type === Syntax.MemberExpression;
	    }
	
	    // 11.1.4 Array Initialiser
	
	    function parseArrayInitialiser() {
	        var elements = [];
	
	        expect('[');
	
	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else {
	                elements.push(parseAssignmentExpression());
	
	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	        }
	
	        expect(']');
	
	        return {
	            type: Syntax.ArrayExpression,
	            elements: elements
	        };
	    }
	
	    // 11.1.5 Object Initialiser
	
	    function parsePropertyFunction(param, first) {
	        var previousStrict, body;
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (first && strict && isRestrictedWord(param[0].name)) {
	            throwErrorTolerant(first, Messages.StrictParamName);
	        }
	        strict = previousStrict;
	
	        return {
	            type: Syntax.FunctionExpression,
	            id: null,
	            params: param,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }
	
	    function parseObjectPropertyKey() {
	        var token = lex();
	
	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.
	
	        if (token.type === Token.StringLiteral || token.type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                throwErrorTolerant(token, Messages.StrictOctalLiteral);
	            }
	            return createLiteral(token);
	        }
	
	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }
	
	    function parseObjectProperty() {
	        var token, key, id, param;
	
	        token = lookahead();
	
	        if (token.type === Token.Identifier) {
	
	            id = parseObjectPropertyKey();
	
	            // Property Assignment: Getter and Setter.
	
	            if (token.value === 'get' && !match(':')) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                expect(')');
	                return {
	                    type: Syntax.Property,
	                    key: key,
	                    value: parsePropertyFunction([]),
	                    kind: 'get'
	                };
	            } else if (token.value === 'set' && !match(':')) {
	                key = parseObjectPropertyKey();
	                expect('(');
	                token = lookahead();
	                if (token.type !== Token.Identifier) {
	                    expect(')');
	                    throwErrorTolerant(token, Messages.UnexpectedToken, token.value);
	                    return {
	                        type: Syntax.Property,
	                        key: key,
	                        value: parsePropertyFunction([]),
	                        kind: 'set'
	                    };
	                } else {
	                    param = [ parseVariableIdentifier() ];
	                    expect(')');
	                    return {
	                        type: Syntax.Property,
	                        key: key,
	                        value: parsePropertyFunction(param, token),
	                        kind: 'set'
	                    };
	                }
	            } else {
	                expect(':');
	                return {
	                    type: Syntax.Property,
	                    key: id,
	                    value: parseAssignmentExpression(),
	                    kind: 'init'
	                };
	            }
	        } else if (token.type === Token.EOF || token.type === Token.Punctuator) {
	            throwUnexpected(token);
	        } else {
	            key = parseObjectPropertyKey();
	            expect(':');
	            return {
	                type: Syntax.Property,
	                key: key,
	                value: parseAssignmentExpression(),
	                kind: 'init'
	            };
	        }
	    }
	
	    function parseObjectInitialiser() {
	        var properties = [], property, name, kind, map = {}, toString = String;
	
	        expect('{');
	
	        while (!match('}')) {
	            property = parseObjectProperty();
	
	            if (property.key.type === Syntax.Identifier) {
	                name = property.key.name;
	            } else {
	                name = toString(property.key.value);
	            }
	            kind = (property.kind === 'init') ? PropertyKind.Data : (property.kind === 'get') ? PropertyKind.Get : PropertyKind.Set;
	            if (Object.prototype.hasOwnProperty.call(map, name)) {
	                if (map[name] === PropertyKind.Data) {
	                    if (strict && kind === PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.StrictDuplicateProperty);
	                    } else if (kind !== PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.AccessorDataProperty);
	                    }
	                } else {
	                    if (kind === PropertyKind.Data) {
	                        throwErrorTolerant({}, Messages.AccessorDataProperty);
	                    } else if (map[name] & kind) {
	                        throwErrorTolerant({}, Messages.AccessorGetSet);
	                    }
	                }
	                map[name] |= kind;
	            } else {
	                map[name] = kind;
	            }
	
	            properties.push(property);
	
	            if (!match('}')) {
	                expect(',');
	            }
	        }
	
	        expect('}');
	
	        return {
	            type: Syntax.ObjectExpression,
	            properties: properties
	        };
	    }
	
	    // 11.1.6 The Grouping Operator
	
	    function parseGroupExpression() {
	        var expr;
	
	        expect('(');
	
	        expr = parseExpression();
	
	        expect(')');
	
	        return expr;
	    }
	
	
	    // 11.1 Primary Expressions
	
	    function parsePrimaryExpression() {
	        var token = lookahead(),
	            type = token.type;
	
	        if (type === Token.Identifier) {
	            return {
	                type: Syntax.Identifier,
	                name: lex().value
	            };
	        }
	
	        if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            if (strict && token.octal) {
	                throwErrorTolerant(token, Messages.StrictOctalLiteral);
	            }
	            return createLiteral(lex());
	        }
	
	        if (type === Token.Keyword) {
	            if (matchKeyword('this')) {
	                lex();
	                return {
	                    type: Syntax.ThisExpression
	                };
	            }
	
	            if (matchKeyword('function')) {
	                return parseFunctionExpression();
	            }
	        }
	
	        if (type === Token.BooleanLiteral) {
	            lex();
	            token.value = (token.value === 'true');
	            return createLiteral(token);
	        }
	
	        if (type === Token.NullLiteral) {
	            lex();
	            token.value = null;
	            return createLiteral(token);
	        }
	
	        if (match('[')) {
	            return parseArrayInitialiser();
	        }
	
	        if (match('{')) {
	            return parseObjectInitialiser();
	        }
	
	        if (match('(')) {
	            return parseGroupExpression();
	        }
	
	        if (match('/') || match('/=')) {
	            return createLiteral(scanRegExp());
	        }
	
	        return throwUnexpected(lex());
	    }
	
	    // 11.2 Left-Hand-Side Expressions
	
	    function parseArguments() {
	        var args = [];
	
	        expect('(');
	
	        if (!match(')')) {
	            while (index < length) {
	                args.push(parseAssignmentExpression());
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        return args;
	    }
	
	    function parseNonComputedProperty() {
	        var token = lex();
	
	        if (!isIdentifierName(token)) {
	            throwUnexpected(token);
	        }
	
	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }
	
	    function parseNonComputedMember() {
	        expect('.');
	
	        return parseNonComputedProperty();
	    }
	
	    function parseComputedMember() {
	        var expr;
	
	        expect('[');
	
	        expr = parseExpression();
	
	        expect(']');
	
	        return expr;
	    }
	
	    function parseNewExpression() {
	        var expr;
	
	        expectKeyword('new');
	
	        expr = {
	            type: Syntax.NewExpression,
	            callee: parseLeftHandSideExpression(),
	            'arguments': []
	        };
	
	        if (match('(')) {
	            expr['arguments'] = parseArguments();
	        }
	
	        return expr;
	    }
	
	    function parseLeftHandSideExpressionAllowCall() {
	        var expr;
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[') || match('(')) {
	            if (match('(')) {
	                expr = {
	                    type: Syntax.CallExpression,
	                    callee: expr,
	                    'arguments': parseArguments()
	                };
	            } else if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	            }
	        }
	
	        return expr;
	    }
	
	
	    function parseLeftHandSideExpression() {
	        var expr;
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[')) {
	            if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	            }
	        }
	
	        return expr;
	    }
	
	    // 11.3 Postfix Expressions
	
	    function parsePostfixExpression() {
	        var expr = parseLeftHandSideExpressionAllowCall(), token;
	
	        token = lookahead();
	        if (token.type !== Token.Punctuator) {
	            return expr;
	        }
	
	        if ((match('++') || match('--')) && !peekLineTerminator()) {
	            // 11.3.1, 11.3.2
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPostfix);
	            }
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }
	
	            expr = {
	                type: Syntax.UpdateExpression,
	                operator: lex().value,
	                argument: expr,
	                prefix: false
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.4 Unary Operators
	
	    function parseUnaryExpression() {
	        var token, expr;
	
	        token = lookahead();
	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return parsePostfixExpression();
	        }
	
	        if (match('++') || match('--')) {
	            token = lex();
	            expr = parseUnaryExpression();
	            // 11.4.4, 11.4.5
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant({}, Messages.StrictLHSPrefix);
	            }
	
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }
	
	            expr = {
	                type: Syntax.UpdateExpression,
	                operator: token.value,
	                argument: expr,
	                prefix: true
	            };
	            return expr;
	        }
	
	        if (match('+') || match('-') || match('~') || match('!')) {
	            expr = {
	                type: Syntax.UnaryExpression,
	                operator: lex().value,
	                argument: parseUnaryExpression(),
	                prefix: true
	            };
	            return expr;
	        }
	
	        if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            expr = {
	                type: Syntax.UnaryExpression,
	                operator: lex().value,
	                argument: parseUnaryExpression(),
	                prefix: true
	            };
	            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
	                throwErrorTolerant({}, Messages.StrictDelete);
	            }
	            return expr;
	        }
	
	        return parsePostfixExpression();
	    }
	
	    // 11.5 Multiplicative Operators
	
	    function parseMultiplicativeExpression() {
	        var expr = parseUnaryExpression();
	
	        while (match('*') || match('/') || match('%')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseUnaryExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.6 Additive Operators
	
	    function parseAdditiveExpression() {
	        var expr = parseMultiplicativeExpression();
	
	        while (match('+') || match('-')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseMultiplicativeExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.7 Bitwise Shift Operators
	
	    function parseShiftExpression() {
	        var expr = parseAdditiveExpression();
	
	        while (match('<<') || match('>>') || match('>>>')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseAdditiveExpression()
	            };
	        }
	
	        return expr;
	    }
	    // 11.8 Relational Operators
	
	    function parseRelationalExpression() {
	        var expr, previousAllowIn;
	
	        previousAllowIn = state.allowIn;
	        state.allowIn = true;
	
	        expr = parseShiftExpression();
	
	        while (match('<') || match('>') || match('<=') || match('>=') || (previousAllowIn && matchKeyword('in')) || matchKeyword('instanceof')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseShiftExpression()
	            };
	        }
	
	        state.allowIn = previousAllowIn;
	        return expr;
	    }
	
	    // 11.9 Equality Operators
	
	    function parseEqualityExpression() {
	        var expr = parseRelationalExpression();
	
	        while (match('==') || match('!=') || match('===') || match('!==')) {
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseRelationalExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.10 Binary Bitwise Operators
	
	    function parseBitwiseANDExpression() {
	        var expr = parseEqualityExpression();
	
	        while (match('&')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '&',
	                left: expr,
	                right: parseEqualityExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    function parseBitwiseXORExpression() {
	        var expr = parseBitwiseANDExpression();
	
	        while (match('^')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '^',
	                left: expr,
	                right: parseBitwiseANDExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    function parseBitwiseORExpression() {
	        var expr = parseBitwiseXORExpression();
	
	        while (match('|')) {
	            lex();
	            expr = {
	                type: Syntax.BinaryExpression,
	                operator: '|',
	                left: expr,
	                right: parseBitwiseXORExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.11 Binary Logical Operators
	
	    function parseLogicalANDExpression() {
	        var expr = parseBitwiseORExpression();
	
	        while (match('&&')) {
	            lex();
	            expr = {
	                type: Syntax.LogicalExpression,
	                operator: '&&',
	                left: expr,
	                right: parseBitwiseORExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    function parseLogicalORExpression() {
	        var expr = parseLogicalANDExpression();
	
	        while (match('||')) {
	            lex();
	            expr = {
	                type: Syntax.LogicalExpression,
	                operator: '||',
	                left: expr,
	                right: parseLogicalANDExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.12 Conditional Operator
	
	    function parseConditionalExpression() {
	        var expr, previousAllowIn, consequent;
	
	        expr = parseLogicalORExpression();
	
	        if (match('?')) {
	            lex();
	            previousAllowIn = state.allowIn;
	            state.allowIn = true;
	            consequent = parseAssignmentExpression();
	            state.allowIn = previousAllowIn;
	            expect(':');
	
	            expr = {
	                type: Syntax.ConditionalExpression,
	                test: expr,
	                consequent: consequent,
	                alternate: parseAssignmentExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.13 Assignment Operators
	
	    function parseAssignmentExpression() {
	        var token, expr;
	
	        token = lookahead();
	        expr = parseConditionalExpression();
	
	        if (matchAssign()) {
	            // LeftHandSideExpression
	            if (!isLeftHandSide(expr)) {
	                throwErrorTolerant({}, Messages.InvalidLHSInAssignment);
	            }
	
	            // 11.13.1
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                throwErrorTolerant(token, Messages.StrictLHSAssignment);
	            }
	
	            expr = {
	                type: Syntax.AssignmentExpression,
	                operator: lex().value,
	                left: expr,
	                right: parseAssignmentExpression()
	            };
	        }
	
	        return expr;
	    }
	
	    // 11.14 Comma Operator
	
	    function parseExpression() {
	        var expr = parseAssignmentExpression();
	
	        if (match(',')) {
	            expr = {
	                type: Syntax.SequenceExpression,
	                expressions: [ expr ]
	            };
	
	            while (index < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	                expr.expressions.push(parseAssignmentExpression());
	            }
	
	        }
	        return expr;
	    }
	
	    // 12.1 Block
	
	    function parseStatementList() {
	        var list = [],
	            statement;
	
	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            statement = parseSourceElement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            list.push(statement);
	        }
	
	        return list;
	    }
	
	    function parseBlock() {
	        var block;
	
	        expect('{');
	
	        block = parseStatementList();
	
	        expect('}');
	
	        return {
	            type: Syntax.BlockStatement,
	            body: block
	        };
	    }
	
	    // 12.2 Variable Statement
	
	    function parseVariableIdentifier() {
	        var token = lex();
	
	        if (token.type !== Token.Identifier) {
	            throwUnexpected(token);
	        }
	
	        return {
	            type: Syntax.Identifier,
	            name: token.value
	        };
	    }
	
	    function parseVariableDeclaration(kind) {
	        var id = parseVariableIdentifier(),
	            init = null;
	
	        // 12.2.1
	        if (strict && isRestrictedWord(id.name)) {
	            throwErrorTolerant({}, Messages.StrictVarName);
	        }
	
	        if (kind === 'const') {
	            expect('=');
	            init = parseAssignmentExpression();
	        } else if (match('=')) {
	            lex();
	            init = parseAssignmentExpression();
	        }
	
	        return {
	            type: Syntax.VariableDeclarator,
	            id: id,
	            init: init
	        };
	    }
	
	    function parseVariableDeclarationList(kind) {
	        var list = [];
	
	        do {
	            list.push(parseVariableDeclaration(kind));
	            if (!match(',')) {
	                break;
	            }
	            lex();
	        } while (index < length);
	
	        return list;
	    }
	
	    function parseVariableStatement() {
	        var declarations;
	
	        expectKeyword('var');
	
	        declarations = parseVariableDeclarationList();
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: declarations,
	            kind: 'var'
	        };
	    }
	
	    // kind may be `const` or `let`
	    // Both are experimental and not in the specification yet.
	    // see http://wiki.ecmascript.org/doku.php?id=harmony:const
	    // and http://wiki.ecmascript.org/doku.php?id=harmony:let
	    function parseConstLetDeclaration(kind) {
	        var declarations;
	
	        expectKeyword(kind);
	
	        declarations = parseVariableDeclarationList(kind);
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: declarations,
	            kind: kind
	        };
	    }
	
	    // 12.3 Empty Statement
	
	    function parseEmptyStatement() {
	        expect(';');
	
	        return {
	            type: Syntax.EmptyStatement
	        };
	    }
	
	    // 12.4 Expression Statement
	
	    function parseExpressionStatement() {
	        var expr = parseExpression();
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ExpressionStatement,
	            expression: expr
	        };
	    }
	
	    // 12.5 If statement
	
	    function parseIfStatement() {
	        var test, consequent, alternate;
	
	        expectKeyword('if');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        consequent = parseStatement();
	
	        if (matchKeyword('else')) {
	            lex();
	            alternate = parseStatement();
	        } else {
	            alternate = null;
	        }
	
	        return {
	            type: Syntax.IfStatement,
	            test: test,
	            consequent: consequent,
	            alternate: alternate
	        };
	    }
	
	    // 12.6 Iteration Statements
	
	    function parseDoWhileStatement() {
	        var body, test, oldInIteration;
	
	        expectKeyword('do');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        if (match(';')) {
	            lex();
	        }
	
	        return {
	            type: Syntax.DoWhileStatement,
	            body: body,
	            test: test
	        };
	    }
	
	    function parseWhileStatement() {
	        var test, body, oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        return {
	            type: Syntax.WhileStatement,
	            test: test,
	            body: body
	        };
	    }
	
	    function parseForVariableDeclaration() {
	        var token = lex();
	
	        return {
	            type: Syntax.VariableDeclaration,
	            declarations: parseVariableDeclarationList(),
	            kind: token.value
	        };
	    }
	
	    function parseForStatement() {
	        var init, test, update, left, right, body, oldInIteration;
	
	        init = test = update = null;
	
	        expectKeyword('for');
	
	        expect('(');
	
	        if (match(';')) {
	            lex();
	        } else {
	            if (matchKeyword('var') || matchKeyword('let')) {
	                state.allowIn = false;
	                init = parseForVariableDeclaration();
	                state.allowIn = true;
	
	                if (init.declarations.length === 1 && matchKeyword('in')) {
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            } else {
	                state.allowIn = false;
	                init = parseExpression();
	                state.allowIn = true;
	
	                if (matchKeyword('in')) {
	                    // LeftHandSideExpression
	                    if (!isLeftHandSide(init)) {
	                        throwErrorTolerant({}, Messages.InvalidLHSInForIn);
	                    }
	
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                }
	            }
	
	            if (typeof left === 'undefined') {
	                expect(';');
	            }
	        }
	
	        if (typeof left === 'undefined') {
	
	            if (!match(';')) {
	                test = parseExpression();
	            }
	            expect(';');
	
	            if (!match(')')) {
	                update = parseExpression();
	            }
	        }
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        if (typeof left === 'undefined') {
	            return {
	                type: Syntax.ForStatement,
	                init: init,
	                test: test,
	                update: update,
	                body: body
	            };
	        }
	
	        return {
	            type: Syntax.ForInStatement,
	            left: left,
	            right: right,
	            body: body,
	            each: false
	        };
	    }
	
	    // 12.7 The continue statement
	
	    function parseContinueStatement() {
	        var token, label = null;
	
	        expectKeyword('continue');
	
	        // Optimize the most common form: 'continue;'.
	        if (source[index] === ';') {
	            lex();
	
	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }
	
	            return {
	                type: Syntax.ContinueStatement,
	                label: null
	            };
	        }
	
	        if (peekLineTerminator()) {
	            if (!state.inIteration) {
	                throwError({}, Messages.IllegalContinue);
	            }
	
	            return {
	                type: Syntax.ContinueStatement,
	                label: null
	            };
	        }
	
	        token = lookahead();
	        if (token.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !state.inIteration) {
	            throwError({}, Messages.IllegalContinue);
	        }
	
	        return {
	            type: Syntax.ContinueStatement,
	            label: label
	        };
	    }
	
	    // 12.8 The break statement
	
	    function parseBreakStatement() {
	        var token, label = null;
	
	        expectKeyword('break');
	
	        // Optimize the most common form: 'break;'.
	        if (source[index] === ';') {
	            lex();
	
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }
	
	            return {
	                type: Syntax.BreakStatement,
	                label: null
	            };
	        }
	
	        if (peekLineTerminator()) {
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError({}, Messages.IllegalBreak);
	            }
	
	            return {
	                type: Syntax.BreakStatement,
	                label: null
	            };
	        }
	
	        token = lookahead();
	        if (token.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, label.name)) {
	                throwError({}, Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !(state.inIteration || state.inSwitch)) {
	            throwError({}, Messages.IllegalBreak);
	        }
	
	        return {
	            type: Syntax.BreakStatement,
	            label: label
	        };
	    }
	
	    // 12.9 The return statement
	
	    function parseReturnStatement() {
	        var token, argument = null;
	
	        expectKeyword('return');
	
	        if (!state.inFunctionBody) {
	            throwErrorTolerant({}, Messages.IllegalReturn);
	        }
	
	        // 'return' followed by a space and an identifier is very common.
	        if (source[index] === ' ') {
	            if (isIdentifierStart(source[index + 1])) {
	                argument = parseExpression();
	                consumeSemicolon();
	                return {
	                    type: Syntax.ReturnStatement,
	                    argument: argument
	                };
	            }
	        }
	
	        if (peekLineTerminator()) {
	            return {
	                type: Syntax.ReturnStatement,
	                argument: null
	            };
	        }
	
	        if (!match(';')) {
	            token = lookahead();
	            if (!match('}') && token.type !== Token.EOF) {
	                argument = parseExpression();
	            }
	        }
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ReturnStatement,
	            argument: argument
	        };
	    }
	
	    // 12.10 The with statement
	
	    function parseWithStatement() {
	        var object, body;
	
	        if (strict) {
	            throwErrorTolerant({}, Messages.StrictModeWith);
	        }
	
	        expectKeyword('with');
	
	        expect('(');
	
	        object = parseExpression();
	
	        expect(')');
	
	        body = parseStatement();
	
	        return {
	            type: Syntax.WithStatement,
	            object: object,
	            body: body
	        };
	    }
	
	    // 12.10 The swith statement
	
	    function parseSwitchCase() {
	        var test,
	            consequent = [],
	            statement;
	
	        if (matchKeyword('default')) {
	            lex();
	            test = null;
	        } else {
	            expectKeyword('case');
	            test = parseExpression();
	        }
	        expect(':');
	
	        while (index < length) {
	            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
	                break;
	            }
	            statement = parseStatement();
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            consequent.push(statement);
	        }
	
	        return {
	            type: Syntax.SwitchCase,
	            test: test,
	            consequent: consequent
	        };
	    }
	
	    function parseSwitchStatement() {
	        var discriminant, cases, clause, oldInSwitch, defaultFound;
	
	        expectKeyword('switch');
	
	        expect('(');
	
	        discriminant = parseExpression();
	
	        expect(')');
	
	        expect('{');
	
	        cases = [];
	
	        if (match('}')) {
	            lex();
	            return {
	                type: Syntax.SwitchStatement,
	                discriminant: discriminant,
	                cases: cases
	            };
	        }
	
	        oldInSwitch = state.inSwitch;
	        state.inSwitch = true;
	        defaultFound = false;
	
	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            clause = parseSwitchCase();
	            if (clause.test === null) {
	                if (defaultFound) {
	                    throwError({}, Messages.MultipleDefaultsInSwitch);
	                }
	                defaultFound = true;
	            }
	            cases.push(clause);
	        }
	
	        state.inSwitch = oldInSwitch;
	
	        expect('}');
	
	        return {
	            type: Syntax.SwitchStatement,
	            discriminant: discriminant,
	            cases: cases
	        };
	    }
	
	    // 12.13 The throw statement
	
	    function parseThrowStatement() {
	        var argument;
	
	        expectKeyword('throw');
	
	        if (peekLineTerminator()) {
	            throwError({}, Messages.NewlineAfterThrow);
	        }
	
	        argument = parseExpression();
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ThrowStatement,
	            argument: argument
	        };
	    }
	
	    // 12.14 The try statement
	
	    function parseCatchClause() {
	        var param;
	
	        expectKeyword('catch');
	
	        expect('(');
	        if (match(')')) {
	            throwUnexpected(lookahead());
	        }
	
	        param = parseVariableIdentifier();
	        // 12.14.1
	        if (strict && isRestrictedWord(param.name)) {
	            throwErrorTolerant({}, Messages.StrictCatchVariable);
	        }
	
	        expect(')');
	
	        return {
	            type: Syntax.CatchClause,
	            param: param,
	            body: parseBlock()
	        };
	    }
	
	    function parseTryStatement() {
	        var block, handlers = [], finalizer = null;
	
	        expectKeyword('try');
	
	        block = parseBlock();
	
	        if (matchKeyword('catch')) {
	            handlers.push(parseCatchClause());
	        }
	
	        if (matchKeyword('finally')) {
	            lex();
	            finalizer = parseBlock();
	        }
	
	        if (handlers.length === 0 && !finalizer) {
	            throwError({}, Messages.NoCatchOrFinally);
	        }
	
	        return {
	            type: Syntax.TryStatement,
	            block: block,
	            guardedHandlers: [],
	            handlers: handlers,
	            finalizer: finalizer
	        };
	    }
	
	    // 12.15 The debugger statement
	
	    function parseDebuggerStatement() {
	        expectKeyword('debugger');
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.DebuggerStatement
	        };
	    }
	
	    // 12 Statements
	
	    function parseStatement() {
	        var token = lookahead(),
	            expr,
	            labeledBody;
	
	        if (token.type === Token.EOF) {
	            throwUnexpected(token);
	        }
	
	        if (token.type === Token.Punctuator) {
	            switch (token.value) {
	            case ';':
	                return parseEmptyStatement();
	            case '{':
	                return parseBlock();
	            case '(':
	                return parseExpressionStatement();
	            default:
	                break;
	            }
	        }
	
	        if (token.type === Token.Keyword) {
	            switch (token.value) {
	            case 'break':
	                return parseBreakStatement();
	            case 'continue':
	                return parseContinueStatement();
	            case 'debugger':
	                return parseDebuggerStatement();
	            case 'do':
	                return parseDoWhileStatement();
	            case 'for':
	                return parseForStatement();
	            case 'function':
	                return parseFunctionDeclaration();
	            case 'if':
	                return parseIfStatement();
	            case 'return':
	                return parseReturnStatement();
	            case 'switch':
	                return parseSwitchStatement();
	            case 'throw':
	                return parseThrowStatement();
	            case 'try':
	                return parseTryStatement();
	            case 'var':
	                return parseVariableStatement();
	            case 'while':
	                return parseWhileStatement();
	            case 'with':
	                return parseWithStatement();
	            default:
	                break;
	            }
	        }
	
	        expr = parseExpression();
	
	        // 12.12 Labelled Statements
	        if ((expr.type === Syntax.Identifier) && match(':')) {
	            lex();
	
	            if (Object.prototype.hasOwnProperty.call(state.labelSet, expr.name)) {
	                throwError({}, Messages.Redeclaration, 'Label', expr.name);
	            }
	
	            state.labelSet[expr.name] = true;
	            labeledBody = parseStatement();
	            delete state.labelSet[expr.name];
	
	            return {
	                type: Syntax.LabeledStatement,
	                label: expr,
	                body: labeledBody
	            };
	        }
	
	        consumeSemicolon();
	
	        return {
	            type: Syntax.ExpressionStatement,
	            expression: expr
	        };
	    }
	
	    // 13 Function Definition
	
	    function parseFunctionSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted,
	            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;
	
	        expect('{');
	
	        while (index < length) {
	            token = lookahead();
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }
	
	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        oldLabelSet = state.labelSet;
	        oldInIteration = state.inIteration;
	        oldInSwitch = state.inSwitch;
	        oldInFunctionBody = state.inFunctionBody;
	
	        state.labelSet = {};
	        state.inIteration = false;
	        state.inSwitch = false;
	        state.inFunctionBody = true;
	
	        while (index < length) {
	            if (match('}')) {
	                break;
	            }
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }
	
	        expect('}');
	
	        state.labelSet = oldLabelSet;
	        state.inIteration = oldInIteration;
	        state.inSwitch = oldInSwitch;
	        state.inFunctionBody = oldInFunctionBody;
	
	        return {
	            type: Syntax.BlockStatement,
	            body: sourceElements
	        };
	    }
	
	    function parseFunctionDeclaration() {
	        var id, param, params = [], body, token, stricted, firstRestricted, message, previousStrict, paramSet;
	
	        expectKeyword('function');
	        token = lookahead();
	        id = parseVariableIdentifier();
	        if (strict) {
	            if (isRestrictedWord(token.value)) {
	                throwErrorTolerant(token, Messages.StrictFunctionName);
	            }
	        } else {
	            if (isRestrictedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictFunctionName;
	            } else if (isStrictModeReservedWord(token.value)) {
	                firstRestricted = token;
	                message = Messages.StrictReservedWord;
	            }
	        }
	
	        expect('(');
	
	        if (!match(')')) {
	            paramSet = {};
	            while (index < length) {
	                token = lookahead();
	                param = parseVariableIdentifier();
	                if (strict) {
	                    if (isRestrictedWord(token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamName;
	                    }
	                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                } else if (!firstRestricted) {
	                    if (isRestrictedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamName;
	                    } else if (isStrictModeReservedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictReservedWord;
	                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                }
	                params.push(param);
	                paramSet[param.name] = true;
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            throwErrorTolerant(stricted, message);
	        }
	        strict = previousStrict;
	
	        return {
	            type: Syntax.FunctionDeclaration,
	            id: id,
	            params: params,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }
	
	    function parseFunctionExpression() {
	        var token, id = null, stricted, firstRestricted, message, param, params = [], body, previousStrict, paramSet;
	
	        expectKeyword('function');
	
	        if (!match('(')) {
	            token = lookahead();
	            id = parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    throwErrorTolerant(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }
	
	        expect('(');
	
	        if (!match(')')) {
	            paramSet = {};
	            while (index < length) {
	                token = lookahead();
	                param = parseVariableIdentifier();
	                if (strict) {
	                    if (isRestrictedWord(token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamName;
	                    }
	                    if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        stricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                } else if (!firstRestricted) {
	                    if (isRestrictedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamName;
	                    } else if (isStrictModeReservedWord(token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictReservedWord;
	                    } else if (Object.prototype.hasOwnProperty.call(paramSet, token.value)) {
	                        firstRestricted = token;
	                        message = Messages.StrictParamDupe;
	                    }
	                }
	                params.push(param);
	                paramSet[param.name] = true;
	                if (match(')')) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwError(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            throwErrorTolerant(stricted, message);
	        }
	        strict = previousStrict;
	
	        return {
	            type: Syntax.FunctionExpression,
	            id: id,
	            params: params,
	            defaults: [],
	            body: body,
	            rest: null,
	            generator: false,
	            expression: false
	        };
	    }
	
	    // 14 Program
	
	    function parseSourceElement() {
	        var token = lookahead();
	
	        if (token.type === Token.Keyword) {
	            switch (token.value) {
	            case 'const':
	            case 'let':
	                return parseConstLetDeclaration(token.value);
	            case 'function':
	                return parseFunctionDeclaration();
	            default:
	                return parseStatement();
	            }
	        }
	
	        if (token.type !== Token.EOF) {
	            return parseStatement();
	        }
	    }
	
	    function parseSourceElements() {
	        var sourceElement, sourceElements = [], token, directive, firstRestricted;
	
	        while (index < length) {
	            token = lookahead();
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }
	
	            sourceElement = parseSourceElement();
	            sourceElements.push(sourceElement);
	            if (sourceElement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = sliceSource(token.range[0] + 1, token.range[1] - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    throwErrorTolerant(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        while (index < length) {
	            sourceElement = parseSourceElement();
	            if (typeof sourceElement === 'undefined') {
	                break;
	            }
	            sourceElements.push(sourceElement);
	        }
	        return sourceElements;
	    }
	
	    function parseProgram() {
	        var program;
	        strict = false;
	        program = {
	            type: Syntax.Program,
	            body: parseSourceElements()
	        };
	        return program;
	    }
	
	    // The following functions are needed only when the option to preserve
	    // the comments is active.
	
	    function addComment(type, value, start, end, loc) {
	        assert(typeof start === 'number', 'Comment must have valid position');
	
	        // Because the way the actual token is scanned, often the comments
	        // (if any) are skipped twice during the lexical analysis.
	        // Thus, we need to skip adding a comment if the comment array already
	        // handled it.
	        if (extra.comments.length > 0) {
	            if (extra.comments[extra.comments.length - 1].range[1] > start) {
	                return;
	            }
	        }
	
	        extra.comments.push({
	            type: type,
	            value: value,
	            range: [start, end],
	            loc: loc
	        });
	    }
	
	    function scanComment() {
	        var comment, ch, loc, start, blockComment, lineComment;
	
	        comment = '';
	        blockComment = false;
	        lineComment = false;
	
	        while (index < length) {
	            ch = source[index];
	
	            if (lineComment) {
	                ch = source[index++];
	                if (isLineTerminator(ch)) {
	                    loc.end = {
	                        line: lineNumber,
	                        column: index - lineStart - 1
	                    };
	                    lineComment = false;
	                    addComment('Line', comment, start, index - 1, loc);
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    ++lineNumber;
	                    lineStart = index;
	                    comment = '';
	                } else if (index >= length) {
	                    lineComment = false;
	                    comment += ch;
	                    loc.end = {
	                        line: lineNumber,
	                        column: length - lineStart
	                    };
	                    addComment('Line', comment, start, length, loc);
	                } else {
	                    comment += ch;
	                }
	            } else if (blockComment) {
	                if (isLineTerminator(ch)) {
	                    if (ch === '\r' && source[index + 1] === '\n') {
	                        ++index;
	                        comment += '\r\n';
	                    } else {
	                        comment += ch;
	                    }
	                    ++lineNumber;
	                    ++index;
	                    lineStart = index;
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    ch = source[index++];
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                    comment += ch;
	                    if (ch === '*') {
	                        ch = source[index];
	                        if (ch === '/') {
	                            comment = comment.substr(0, comment.length - 1);
	                            blockComment = false;
	                            ++index;
	                            loc.end = {
	                                line: lineNumber,
	                                column: index - lineStart
	                            };
	                            addComment('Block', comment, start, index, loc);
	                            comment = '';
	                        }
	                    }
	                }
	            } else if (ch === '/') {
	                ch = source[index + 1];
	                if (ch === '/') {
	                    loc = {
	                        start: {
	                            line: lineNumber,
	                            column: index - lineStart
	                        }
	                    };
	                    start = index;
	                    index += 2;
	                    lineComment = true;
	                    if (index >= length) {
	                        loc.end = {
	                            line: lineNumber,
	                            column: index - lineStart
	                        };
	                        lineComment = false;
	                        addComment('Line', comment, start, index, loc);
	                    }
	                } else if (ch === '*') {
	                    start = index;
	                    index += 2;
	                    blockComment = true;
	                    loc = {
	                        start: {
	                            line: lineNumber,
	                            column: index - lineStart - 2
	                        }
	                    };
	                    if (index >= length) {
	                        throwError({}, Messages.UnexpectedToken, 'ILLEGAL');
	                    }
	                } else {
	                    break;
	                }
	            } else if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                ++index;
	                if (ch ===  '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	            } else {
	                break;
	            }
	        }
	    }
	
	    function filterCommentLocation() {
	        var i, entry, comment, comments = [];
	
	        for (i = 0; i < extra.comments.length; ++i) {
	            entry = extra.comments[i];
	            comment = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (extra.range) {
	                comment.range = entry.range;
	            }
	            if (extra.loc) {
	                comment.loc = entry.loc;
	            }
	            comments.push(comment);
	        }
	
	        extra.comments = comments;
	    }
	
	    function collectToken() {
	        var start, loc, token, range, value;
	
	        skipComment();
	        start = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        token = extra.advance();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        if (token.type !== Token.EOF) {
	            range = [token.range[0], token.range[1]];
	            value = sliceSource(token.range[0], token.range[1]);
	            extra.tokens.push({
	                type: TokenName[token.type],
	                value: value,
	                range: range,
	                loc: loc
	            });
	        }
	
	        return token;
	    }
	
	    function collectRegex() {
	        var pos, loc, regex, token;
	
	        skipComment();
	
	        pos = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        regex = extra.scanRegExp();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        // Pop the previous token, which is likely '/' or '/='
	        if (extra.tokens.length > 0) {
	            token = extra.tokens[extra.tokens.length - 1];
	            if (token.range[0] === pos && token.type === 'Punctuator') {
	                if (token.value === '/' || token.value === '/=') {
	                    extra.tokens.pop();
	                }
	            }
	        }
	
	        extra.tokens.push({
	            type: 'RegularExpression',
	            value: regex.literal,
	            range: [pos, index],
	            loc: loc
	        });
	
	        return regex;
	    }
	
	    function filterTokenLocation() {
	        var i, entry, token, tokens = [];
	
	        for (i = 0; i < extra.tokens.length; ++i) {
	            entry = extra.tokens[i];
	            token = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (extra.range) {
	                token.range = entry.range;
	            }
	            if (extra.loc) {
	                token.loc = entry.loc;
	            }
	            tokens.push(token);
	        }
	
	        extra.tokens = tokens;
	    }
	
	    function createLiteral(token) {
	        return {
	            type: Syntax.Literal,
	            value: token.value
	        };
	    }
	
	    function createRawLiteral(token) {
	        return {
	            type: Syntax.Literal,
	            value: token.value,
	            raw: sliceSource(token.range[0], token.range[1])
	        };
	    }
	
	    function createLocationMarker() {
	        var marker = {};
	
	        marker.range = [index, index];
	        marker.loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            },
	            end: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        marker.end = function () {
	            this.range[1] = index;
	            this.loc.end.line = lineNumber;
	            this.loc.end.column = index - lineStart;
	        };
	
	        marker.applyGroup = function (node) {
	            if (extra.range) {
	                node.groupRange = [this.range[0], this.range[1]];
	            }
	            if (extra.loc) {
	                node.groupLoc = {
	                    start: {
	                        line: this.loc.start.line,
	                        column: this.loc.start.column
	                    },
	                    end: {
	                        line: this.loc.end.line,
	                        column: this.loc.end.column
	                    }
	                };
	            }
	        };
	
	        marker.apply = function (node) {
	            if (extra.range) {
	                node.range = [this.range[0], this.range[1]];
	            }
	            if (extra.loc) {
	                node.loc = {
	                    start: {
	                        line: this.loc.start.line,
	                        column: this.loc.start.column
	                    },
	                    end: {
	                        line: this.loc.end.line,
	                        column: this.loc.end.column
	                    }
	                };
	            }
	        };
	
	        return marker;
	    }
	
	    function trackGroupExpression() {
	        var marker, expr;
	
	        skipComment();
	        marker = createLocationMarker();
	        expect('(');
	
	        expr = parseExpression();
	
	        expect(')');
	
	        marker.end();
	        marker.applyGroup(expr);
	
	        return expr;
	    }
	
	    function trackLeftHandSideExpression() {
	        var marker, expr;
	
	        skipComment();
	        marker = createLocationMarker();
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[')) {
	            if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            }
	        }
	
	        return expr;
	    }
	
	    function trackLeftHandSideExpressionAllowCall() {
	        var marker, expr;
	
	        skipComment();
	        marker = createLocationMarker();
	
	        expr = matchKeyword('new') ? parseNewExpression() : parsePrimaryExpression();
	
	        while (match('.') || match('[') || match('(')) {
	            if (match('(')) {
	                expr = {
	                    type: Syntax.CallExpression,
	                    callee: expr,
	                    'arguments': parseArguments()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else if (match('[')) {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: true,
	                    object: expr,
	                    property: parseComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            } else {
	                expr = {
	                    type: Syntax.MemberExpression,
	                    computed: false,
	                    object: expr,
	                    property: parseNonComputedMember()
	                };
	                marker.end();
	                marker.apply(expr);
	            }
	        }
	
	        return expr;
	    }
	
	    function filterGroup(node) {
	        var n, i, entry;
	
	        n = (Object.prototype.toString.apply(node) === '[object Array]') ? [] : {};
	        for (i in node) {
	            if (node.hasOwnProperty(i) && i !== 'groupRange' && i !== 'groupLoc') {
	                entry = node[i];
	                if (entry === null || typeof entry !== 'object' || entry instanceof RegExp) {
	                    n[i] = entry;
	                } else {
	                    n[i] = filterGroup(entry);
	                }
	            }
	        }
	        return n;
	    }
	
	    function wrapTrackingFunction(range, loc) {
	
	        return function (parseFunction) {
	
	            function isBinary(node) {
	                return node.type === Syntax.LogicalExpression ||
	                    node.type === Syntax.BinaryExpression;
	            }
	
	            function visit(node) {
	                var start, end;
	
	                if (isBinary(node.left)) {
	                    visit(node.left);
	                }
	                if (isBinary(node.right)) {
	                    visit(node.right);
	                }
	
	                if (range) {
	                    if (node.left.groupRange || node.right.groupRange) {
	                        start = node.left.groupRange ? node.left.groupRange[0] : node.left.range[0];
	                        end = node.right.groupRange ? node.right.groupRange[1] : node.right.range[1];
	                        node.range = [start, end];
	                    } else if (typeof node.range === 'undefined') {
	                        start = node.left.range[0];
	                        end = node.right.range[1];
	                        node.range = [start, end];
	                    }
	                }
	                if (loc) {
	                    if (node.left.groupLoc || node.right.groupLoc) {
	                        start = node.left.groupLoc ? node.left.groupLoc.start : node.left.loc.start;
	                        end = node.right.groupLoc ? node.right.groupLoc.end : node.right.loc.end;
	                        node.loc = {
	                            start: start,
	                            end: end
	                        };
	                    } else if (typeof node.loc === 'undefined') {
	                        node.loc = {
	                            start: node.left.loc.start,
	                            end: node.right.loc.end
	                        };
	                    }
	                }
	            }
	
	            return function () {
	                var marker, node;
	
	                skipComment();
	
	                marker = createLocationMarker();
	                node = parseFunction.apply(null, arguments);
	                marker.end();
	
	                if (range && typeof node.range === 'undefined') {
	                    marker.apply(node);
	                }
	
	                if (loc && typeof node.loc === 'undefined') {
	                    marker.apply(node);
	                }
	
	                if (isBinary(node)) {
	                    visit(node);
	                }
	
	                return node;
	            };
	        };
	    }
	
	    function patch() {
	
	        var wrapTracking;
	
	        if (extra.comments) {
	            extra.skipComment = skipComment;
	            skipComment = scanComment;
	        }
	
	        if (extra.raw) {
	            extra.createLiteral = createLiteral;
	            createLiteral = createRawLiteral;
	        }
	
	        if (extra.range || extra.loc) {
	
	            extra.parseGroupExpression = parseGroupExpression;
	            extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
	            extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
	            parseGroupExpression = trackGroupExpression;
	            parseLeftHandSideExpression = trackLeftHandSideExpression;
	            parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;
	
	            wrapTracking = wrapTrackingFunction(extra.range, extra.loc);
	
	            extra.parseAdditiveExpression = parseAdditiveExpression;
	            extra.parseAssignmentExpression = parseAssignmentExpression;
	            extra.parseBitwiseANDExpression = parseBitwiseANDExpression;
	            extra.parseBitwiseORExpression = parseBitwiseORExpression;
	            extra.parseBitwiseXORExpression = parseBitwiseXORExpression;
	            extra.parseBlock = parseBlock;
	            extra.parseFunctionSourceElements = parseFunctionSourceElements;
	            extra.parseCatchClause = parseCatchClause;
	            extra.parseComputedMember = parseComputedMember;
	            extra.parseConditionalExpression = parseConditionalExpression;
	            extra.parseConstLetDeclaration = parseConstLetDeclaration;
	            extra.parseEqualityExpression = parseEqualityExpression;
	            extra.parseExpression = parseExpression;
	            extra.parseForVariableDeclaration = parseForVariableDeclaration;
	            extra.parseFunctionDeclaration = parseFunctionDeclaration;
	            extra.parseFunctionExpression = parseFunctionExpression;
	            extra.parseLogicalANDExpression = parseLogicalANDExpression;
	            extra.parseLogicalORExpression = parseLogicalORExpression;
	            extra.parseMultiplicativeExpression = parseMultiplicativeExpression;
	            extra.parseNewExpression = parseNewExpression;
	            extra.parseNonComputedProperty = parseNonComputedProperty;
	            extra.parseObjectProperty = parseObjectProperty;
	            extra.parseObjectPropertyKey = parseObjectPropertyKey;
	            extra.parsePostfixExpression = parsePostfixExpression;
	            extra.parsePrimaryExpression = parsePrimaryExpression;
	            extra.parseProgram = parseProgram;
	            extra.parsePropertyFunction = parsePropertyFunction;
	            extra.parseRelationalExpression = parseRelationalExpression;
	            extra.parseStatement = parseStatement;
	            extra.parseShiftExpression = parseShiftExpression;
	            extra.parseSwitchCase = parseSwitchCase;
	            extra.parseUnaryExpression = parseUnaryExpression;
	            extra.parseVariableDeclaration = parseVariableDeclaration;
	            extra.parseVariableIdentifier = parseVariableIdentifier;
	
	            parseAdditiveExpression = wrapTracking(extra.parseAdditiveExpression);
	            parseAssignmentExpression = wrapTracking(extra.parseAssignmentExpression);
	            parseBitwiseANDExpression = wrapTracking(extra.parseBitwiseANDExpression);
	            parseBitwiseORExpression = wrapTracking(extra.parseBitwiseORExpression);
	            parseBitwiseXORExpression = wrapTracking(extra.parseBitwiseXORExpression);
	            parseBlock = wrapTracking(extra.parseBlock);
	            parseFunctionSourceElements = wrapTracking(extra.parseFunctionSourceElements);
	            parseCatchClause = wrapTracking(extra.parseCatchClause);
	            parseComputedMember = wrapTracking(extra.parseComputedMember);
	            parseConditionalExpression = wrapTracking(extra.parseConditionalExpression);
	            parseConstLetDeclaration = wrapTracking(extra.parseConstLetDeclaration);
	            parseEqualityExpression = wrapTracking(extra.parseEqualityExpression);
	            parseExpression = wrapTracking(extra.parseExpression);
	            parseForVariableDeclaration = wrapTracking(extra.parseForVariableDeclaration);
	            parseFunctionDeclaration = wrapTracking(extra.parseFunctionDeclaration);
	            parseFunctionExpression = wrapTracking(extra.parseFunctionExpression);
	            parseLeftHandSideExpression = wrapTracking(parseLeftHandSideExpression);
	            parseLogicalANDExpression = wrapTracking(extra.parseLogicalANDExpression);
	            parseLogicalORExpression = wrapTracking(extra.parseLogicalORExpression);
	            parseMultiplicativeExpression = wrapTracking(extra.parseMultiplicativeExpression);
	            parseNewExpression = wrapTracking(extra.parseNewExpression);
	            parseNonComputedProperty = wrapTracking(extra.parseNonComputedProperty);
	            parseObjectProperty = wrapTracking(extra.parseObjectProperty);
	            parseObjectPropertyKey = wrapTracking(extra.parseObjectPropertyKey);
	            parsePostfixExpression = wrapTracking(extra.parsePostfixExpression);
	            parsePrimaryExpression = wrapTracking(extra.parsePrimaryExpression);
	            parseProgram = wrapTracking(extra.parseProgram);
	            parsePropertyFunction = wrapTracking(extra.parsePropertyFunction);
	            parseRelationalExpression = wrapTracking(extra.parseRelationalExpression);
	            parseStatement = wrapTracking(extra.parseStatement);
	            parseShiftExpression = wrapTracking(extra.parseShiftExpression);
	            parseSwitchCase = wrapTracking(extra.parseSwitchCase);
	            parseUnaryExpression = wrapTracking(extra.parseUnaryExpression);
	            parseVariableDeclaration = wrapTracking(extra.parseVariableDeclaration);
	            parseVariableIdentifier = wrapTracking(extra.parseVariableIdentifier);
	        }
	
	        if (typeof extra.tokens !== 'undefined') {
	            extra.advance = advance;
	            extra.scanRegExp = scanRegExp;
	
	            advance = collectToken;
	            scanRegExp = collectRegex;
	        }
	    }
	
	    function unpatch() {
	        if (typeof extra.skipComment === 'function') {
	            skipComment = extra.skipComment;
	        }
	
	        if (extra.raw) {
	            createLiteral = extra.createLiteral;
	        }
	
	        if (extra.range || extra.loc) {
	            parseAdditiveExpression = extra.parseAdditiveExpression;
	            parseAssignmentExpression = extra.parseAssignmentExpression;
	            parseBitwiseANDExpression = extra.parseBitwiseANDExpression;
	            parseBitwiseORExpression = extra.parseBitwiseORExpression;
	            parseBitwiseXORExpression = extra.parseBitwiseXORExpression;
	            parseBlock = extra.parseBlock;
	            parseFunctionSourceElements = extra.parseFunctionSourceElements;
	            parseCatchClause = extra.parseCatchClause;
	            parseComputedMember = extra.parseComputedMember;
	            parseConditionalExpression = extra.parseConditionalExpression;
	            parseConstLetDeclaration = extra.parseConstLetDeclaration;
	            parseEqualityExpression = extra.parseEqualityExpression;
	            parseExpression = extra.parseExpression;
	            parseForVariableDeclaration = extra.parseForVariableDeclaration;
	            parseFunctionDeclaration = extra.parseFunctionDeclaration;
	            parseFunctionExpression = extra.parseFunctionExpression;
	            parseGroupExpression = extra.parseGroupExpression;
	            parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
	            parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
	            parseLogicalANDExpression = extra.parseLogicalANDExpression;
	            parseLogicalORExpression = extra.parseLogicalORExpression;
	            parseMultiplicativeExpression = extra.parseMultiplicativeExpression;
	            parseNewExpression = extra.parseNewExpression;
	            parseNonComputedProperty = extra.parseNonComputedProperty;
	            parseObjectProperty = extra.parseObjectProperty;
	            parseObjectPropertyKey = extra.parseObjectPropertyKey;
	            parsePrimaryExpression = extra.parsePrimaryExpression;
	            parsePostfixExpression = extra.parsePostfixExpression;
	            parseProgram = extra.parseProgram;
	            parsePropertyFunction = extra.parsePropertyFunction;
	            parseRelationalExpression = extra.parseRelationalExpression;
	            parseStatement = extra.parseStatement;
	            parseShiftExpression = extra.parseShiftExpression;
	            parseSwitchCase = extra.parseSwitchCase;
	            parseUnaryExpression = extra.parseUnaryExpression;
	            parseVariableDeclaration = extra.parseVariableDeclaration;
	            parseVariableIdentifier = extra.parseVariableIdentifier;
	        }
	
	        if (typeof extra.scanRegExp === 'function') {
	            advance = extra.advance;
	            scanRegExp = extra.scanRegExp;
	        }
	    }
	
	    function stringToArray(str) {
	        var length = str.length,
	            result = [],
	            i;
	        for (i = 0; i < length; ++i) {
	            result[i] = str.charAt(i);
	        }
	        return result;
	    }
	
	    function parse(code, options) {
	        var program, toString;
	
	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }
	
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        length = source.length;
	        buffer = null;
	        state = {
	            allowIn: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false
	        };
	
	        extra = {};
	        if (typeof options !== 'undefined') {
	            extra.range = (typeof options.range === 'boolean') && options.range;
	            extra.loc = (typeof options.loc === 'boolean') && options.loc;
	            extra.raw = (typeof options.raw === 'boolean') && options.raw;
	            if (typeof options.tokens === 'boolean' && options.tokens) {
	                extra.tokens = [];
	            }
	            if (typeof options.comment === 'boolean' && options.comment) {
	                extra.comments = [];
	            }
	            if (typeof options.tolerant === 'boolean' && options.tolerant) {
	                extra.errors = [];
	            }
	        }
	
	        if (length > 0) {
	            if (typeof source[0] === 'undefined') {
	                // Try first to convert to a string. This is good as fast path
	                // for old IE which understands string indexing for string
	                // literals only and not for string object.
	                if (code instanceof String) {
	                    source = code.valueOf();
	                }
	
	                // Force accessing the characters via an array.
	                if (typeof source[0] === 'undefined') {
	                    source = stringToArray(code);
	                }
	            }
	        }
	
	        patch();
	        try {
	            program = parseProgram();
	            if (typeof extra.comments !== 'undefined') {
	                filterCommentLocation();
	                program.comments = extra.comments;
	            }
	            if (typeof extra.tokens !== 'undefined') {
	                filterTokenLocation();
	                program.tokens = extra.tokens;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                program.errors = extra.errors;
	            }
	            if (extra.range || extra.loc) {
	                program.body = filterGroup(program.body);
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            unpatch();
	            extra = {};
	        }
	
	        return program;
	    }
	
	    // Sync with package.json.
	    exports.version = '1.0.4';
	
	    exports.parse = parse;
	
	    // Deep copy.
	    exports.Syntax = (function () {
	        var name, types = {};
	
	        if (typeof Object.create === 'function') {
	            types = Object.create(null);
	        }
	
	        for (name in Syntax) {
	            if (Syntax.hasOwnProperty(name)) {
	                types[name] = Syntax[name];
	            }
	        }
	
	        if (typeof Object.freeze === 'function') {
	            Object.freeze(types);
	        }
	
	        return types;
	    }());
	
	}));
	/* vim: set sw=4 ts=4 et tw=80 : */
	


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var generate = __webpack_require__(26)
	
	//Reuse stack across all shims
	var STACK = new Int32Array(1024)
	
	function Shim(procedure) {
	  this.memoized = {}
	  this.procedure = procedure
	}
	
	Shim.prototype.checkShape = function(a, b) {
	  if(a.length !== b.length) {
	    throw new Error("Shape mismatch")
	  }
	  for(var i=a.length-1; i>=0; --i) {
	    if(a[i] !== b[i]) {
	      throw new Error("Shape mismatch")
	    }
	  }
	}
	
	Shim.prototype.getStack = function(size) {
	  if(size < STACK.length) {
	    return STACK
	  }
	  STACK = new Int32Array(size)
	  return STACK
	}
	
	function compare1st(a,b) { return a[0] - b[0]; }
	
	Shim.prototype.getOrder = function(stride) {
	  var zipped = new Array(stride.length)
	  for(var i=0; i<stride.length; ++i) {
	    zipped[i] = [Math.abs(stride[i]), i]
	  }
	  zipped.sort(compare1st)
	  var unzipped = new Array(stride.length)
	  for(var i=0; i<stride.length; ++i) {
	    unzipped[i] = zipped[i][1]
	  }
	  return unzipped
	}
	
	Shim.prototype.getProc = function(orders) {
	  var proc_name = orders.join("|")
	    , proc = this.memoized[proc_name]
	  if(!proc) {
	    proc = generate(orders, this.procedure)
	    this.memoized[proc_name] = proc
	  }
	  return proc
	}
	
	function createShim(shim_args, procedure) {
	  var code = ["\"use strict\""], i
	  //Check shapes
	  for(i=1; i<procedure.numArrayArgs; ++i) {
	    code.push("this.checkShape(array0.shape,array"+i+".shape)")
	  }
	  //Load/lazily generate procedure based on array ordering
	  code.push("var proc = this.getProc([")
	  for(i=0; i<procedure.numArrayArgs; ++i) {
	    code.push((i>0 ? "," : "") + "this.getOrder(array"+i+".stride)")
	  }
	  code.push("])")
	  //Call procedure
	  if(procedure.hasReturn) {
	    code.push("return proc(")
	  } else {
	    code.push("proc(")
	  }
	  code.push("this.getStack(" + procedure.numArrayArgs + "*(array0.shape.length*32)), array0.shape.slice(0)")
	  //Bind array arguments
	  for(i=0; i<procedure.numArrayArgs; ++i) {
	    code.push(",array" + i + ".data")
	    code.push(",array" + i + ".offset")
	    code.push(",array" + i + ".stride")
	  }
	  //Bind scalar arguments
	  for(var i=0; i<procedure.numScalarArgs; ++i) {
	    code.push(",scalar"+i)
	  }
	  code.push(")")
	  if(!procedure.hasReturn) {
	    code.push("return array0")
	  }
	  //Create the shim
	  shim_args.push(code.join("\n"))
	  var result = Function.apply(null, shim_args)
	  if(procedure.printCode) {
	    console.log("Generated shim:", result + "")
	  }
	  return result.bind(new Shim(procedure))
	}
	
	module.exports = createShim
	
	


/***/ },
/* 26 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var RECURSION_LIMIT = 32
	
	function innerFill(order, procedure) {
	  var dimension = order.length
	    , nargs = procedure.numArrayArgs
	    , has_index = procedure.hasIndex
	    , code = []
	    , idx=0, pidx=0, i, j
	  for(i=0; i<dimension; ++i) {
	    code.push("var i"+i+"=0;")
	  }
	  //Compute scan deltas
	  for(j=0; j<nargs; ++j) {
	    for(i=0; i<dimension; ++i) {
	      pidx = idx
	      idx = order[i]
	      if(i === 0) {
	        code.push("var d"+j+"s"+i+"=stride"+j+"["+idx+"]|0;")
	      } else {
	        code.push("var d"+j+"s"+i+"=(stride"+j+"["+idx+"]-shape["+pidx+"]*stride"+j+"["+pidx+"])|0;")
	      }
	    }
	  }
	  //Outer scan loop
	  for(i=dimension-1; i>=0; --i) {
	    idx = order[i]
	    code.push("for(i"+i+"=shape["+idx+"]|0;--i"+i+">=0;){")
	  }
	  //Push body of inner loop
	  code.push(procedure.body)
	  //Advance scan pointers
	  for(i=0; i<dimension; ++i) {
	    pidx = idx
	    idx = order[i]
	    for(j=0; j<nargs; ++j) {
	      code.push("ptr"+j+"+=d"+j+"s"+i)
	    }
	    if(has_index) {
	      if(i > 0) {
	        code.push("index["+pidx+"]-=shape["+pidx+"]")
	      }
	      code.push("++index["+idx+"]")
	    }
	    code.push("}")
	  }
	  return code.join("\n")
	}
	
	function outerFill(matched, order, procedure) {
	  var dimension = order.length
	    , nargs = procedure.numArrayArgs
	    , has_index = procedure.hasIndex
	    , code = []
	    , static_args = dimension
	    , index_start = nargs + static_args
	    , frame_size = index_start + (has_index ? dimension : 0)
	    , i
	  
	  //Initiaize variables
	  code.push("var i=0,l=0,v=0,d=0,sp=0")
	  
	  //Begin recursion
	  code.push("while(true){")
	    
	    //Walk over runs to get bounds
	    code.push("l="+RECURSION_LIMIT)
	    code.push("v="+RECURSION_LIMIT)
	    code.push("d="+matched)
	  
	    for(i=matched; i<dimension; ++i) {
	      code.push("if(shape["+i+"]>l){")
	        code.push("v=l|0")
	        code.push("l=shape["+i+"]|0")
	        code.push("d="+i+"|0")
	      code.push("}else if(shape["+i+"]>v){")
	        code.push("v=shape["+i+"]|0")
	      code.push("}")
	    }
	  
	    code.push("if(l<="+RECURSION_LIMIT+"){")
	      code.push(innerFill(order, procedure))
	    code.push("} else {")
	  
	      //Round v to previous power of 2
	      code.push("v=(v>>>1)-1")
	      code.push("for(i=1;i<=16;i<<=1){v|=v>>>i}")
	      code.push("++v")
	      code.push("if(v<"+RECURSION_LIMIT+") v="+RECURSION_LIMIT)
	  
	      //Set shape
	      code.push("i=shape[d]")
	      code.push("shape[d]=v")
	  
	      //Fill across row
	      code.push("for(;i>=v;i-=v){")
	        for(i=0; i<dimension; ++i) {
	          code.push("STACK[sp+"+i+"]=shape["+i+"]")
	        }
	        for(i=0; i<nargs; ++i) {
	          code.push("STACK[sp+"+(i+static_args)+"]=ptr"+i+"|0")
	        }
	        if(has_index) {
	          for(i=0; i<dimension; ++i) {
	            code.push("STACK[sp+"+(i+index_start)+"]=index["+i+"]")
	          }
	          code.push("index[d]+=v")
	        }
	        for(i=0; i<nargs; ++i) {
	          code.push("ptr"+i+"+=(v*stride"+i+"[d])|0")
	        }
	        code.push("sp+="+frame_size)
	      code.push("}")
	  
	      //Handle edge case
	      code.push("if(i>0){")
	        code.push("shape[d]=i")
	        for(i=0; i<dimension; ++i) {
	          code.push("STACK[sp+"+i+"]=shape["+i+"]")
	        }
	        for(i=0; i<nargs; ++i) {
	          code.push("STACK[sp+"+(i+static_args)+"]=ptr"+i+"|0")
	        }
	        if(has_index) {
	          for(i=0; i<dimension; ++i) {
	            code.push("STACK[sp+"+(i+index_start)+"]=index["+i+"]")
	          }
	        }
	        code.push("sp+="+frame_size)
	      code.push("}")
	    code.push("}")
	  
	    //Pop previous state
	    code.push("if(sp<=0){")
	      code.push("break")
	    code.push("}")
	    code.push("sp-="+frame_size)
	    for(i=0; i<dimension; ++i) {
	      code.push("shape["+i+"]=STACK[sp+"+i+"]")
	    }
	    for(i=0; i<nargs; ++i) {
	      code.push("ptr"+i+"=STACK[sp+"+(i+static_args)+"]")
	    }
	    if(has_index) {
	      for(i=0; i<dimension; ++i) {
	        code.push("index["+i+"]=STACK[sp+"+(i+index_start)+"]")
	      }
	    }
	 code.push("}")
	 return code.join("\n")
	}
	
	function majorOrder(orders) {
	  return orders[0]
	}
	
	function generate(orders, procedure) {
	  var order = majorOrder(orders)
	    , dimension = orders[0].length
	    , nargs = procedure.numArrayArgs
	    , code = ['"use strict"']
	    , matched, i, j
	    , arglist = [ "STACK", "shape" ]
	  //Create procedure arguments
	  for(i = 0; i<nargs; ++i) {
	    arglist.push("arr" + i)
	    arglist.push("ptr" + i)
	    arglist.push("stride" + i)
	    code.push("ptr"+i+"|=0")
	    for(j = 0; j<dimension; ++j) {
	      code.push("stride"+i+"["+j+"]|=0")
	    }
	  }
	  for(i = 0; i<dimension; ++i) {
	    code.push("shape["+i+"]|=0")
	  }
	  for(i = 0; i<procedure.numScalarArgs; ++i) {
	    arglist.push("scalar"+i)
	  }
	  if(procedure.hasIndex) {
	    code.push("var index=[")
	    for(i=0; i<dimension; ++i) {
	      code.push((i > 0) ? ",0":"0")
	    }
	    code.push("]")
	  }
	  if(procedure.hasShape) {
	    code.push("var inline_shape=shape.slice(0)")
	  }
	  //Compute number of matching orders
	  matched = 0;
	matched_loop:
	  while(matched < dimension) {
	    for(j=1; j<nargs; ++j) {
	      if(orders[j][matched] !== orders[0][matched]) {
	        break matched_loop;
	      }
	    }
	    ++matched;
	  }
	  //Generate code
	  code.push(procedure.pre)
	  if(matched === dimension) {
	    code.push(innerFill(order, procedure))
	  } else {
	    code.push(outerFill(matched, order, procedure))
	  }
	  code.push(procedure.post)
	  arglist.push(code.join("\n"))
	  //Return result
	  var result = Function.apply(null, arglist)
	  if(procedure.printCode) {
	    console.log("For order:", orders, "Generated code: \n", result+"")
	  }
	  return result
	}
	
	module.exports = generate


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var bits = __webpack_require__(6)
	
	function fft(dir, nrows, ncols, buffer, x_ptr, y_ptr, scratch_ptr) {
	  dir |= 0
	  nrows |= 0
	  ncols |= 0
	  x_ptr |= 0
	  y_ptr |= 0
	  if(bits.isPow2(ncols)) {
	    fftRadix2(dir, nrows, ncols, buffer, x_ptr, y_ptr)
	  } else {
	    fftBluestein(dir, nrows, ncols, buffer, x_ptr, y_ptr, scratch_ptr)
	  }
	}
	module.exports = fft
	
	function scratchMemory(n) {
	  if(bits.isPow2(n)) {
	    return 0
	  }
	  return 2 * n + 4 * bits.nextPow2(2*n + 1)
	}
	module.exports.scratchMemory = scratchMemory
	
	
	//Radix 2 FFT Adapted from Paul Bourke's C Implementation
	function fftRadix2(dir, nrows, ncols, buffer, x_ptr, y_ptr) {
	  dir |= 0
	  nrows |= 0
	  ncols |= 0
	  x_ptr |= 0
	  y_ptr |= 0
	  var nn,i,i1,j,k,i2,l,l1,l2
	  var c1,c2,t,t1,t2,u1,u2,z,row,a,b,c,d,k1,k2,k3
	  
	  // Calculate the number of points
	  nn = ncols
	  m = bits.log2(nn)
	  
	  for(row=0; row<nrows; ++row) {  
	    // Do the bit reversal
	    i2 = nn >> 1;
	    j = 0;
	    for(i=0;i<nn-1;i++) {
	      if(i < j) {
	        t = buffer[x_ptr+i]
	        buffer[x_ptr+i] = buffer[x_ptr+j]
	        buffer[x_ptr+j] = t
	        t = buffer[y_ptr+i]
	        buffer[y_ptr+i] = buffer[y_ptr+j]
	        buffer[y_ptr+j] = t
	      }
	      k = i2
	      while(k <= j) {
	        j -= k
	        k >>= 1
	      }
	      j += k
	    }
	    
	    // Compute the FFT
	    c1 = -1.0
	    c2 = 0.0
	    l2 = 1
	    for(l=0;l<m;l++) {
	      l1 = l2
	      l2 <<= 1
	      u1 = 1.0
	      u2 = 0.0
	      for(j=0;j<l1;j++) {
	        for(i=j;i<nn;i+=l2) {
	          i1 = i + l1
	          a = buffer[x_ptr+i1]
	          b = buffer[y_ptr+i1]
	          c = buffer[x_ptr+i]
	          d = buffer[y_ptr+i]
	          k1 = u1 * (a + b)
	          k2 = a * (u2 - u1)
	          k3 = b * (u1 + u2)
	          t1 = k1 - k3
	          t2 = k1 + k2
	          buffer[x_ptr+i1] = c - t1
	          buffer[y_ptr+i1] = d - t2
	          buffer[x_ptr+i] += t1
	          buffer[y_ptr+i] += t2
	        }
	        k1 = c1 * (u1 + u2)
	        k2 = u1 * (c2 - c1)
	        k3 = u2 * (c1 + c2)
	        u1 = k1 - k3
	        u2 = k1 + k2
	      }
	      c2 = Math.sqrt((1.0 - c1) / 2.0)
	      if(dir < 0) {
	        c2 = -c2
	      }
	      c1 = Math.sqrt((1.0 + c1) / 2.0)
	    }
	    
	    // Scaling for inverse transform
	    if(dir < 0) {
	      var scale_f = 1.0 / nn
	      for(i=0;i<nn;i++) {
	        buffer[x_ptr+i] *= scale_f
	        buffer[y_ptr+i] *= scale_f
	      }
	    }
	    
	    // Advance pointers
	    x_ptr += ncols
	    y_ptr += ncols
	  }
	}
	
	// Use Bluestein algorithm for npot FFTs
	// Scratch memory required:  2 * ncols + 4 * bits.nextPow2(2*ncols + 1)
	function fftBluestein(dir, nrows, ncols, buffer, x_ptr, y_ptr, scratch_ptr) {
	  dir |= 0
	  nrows |= 0
	  ncols |= 0
	  x_ptr |= 0
	  y_ptr |= 0
	  scratch_ptr |= 0
	
	  // Initialize tables
	  var m = bits.nextPow2(2 * ncols + 1)
	    , cos_ptr = scratch_ptr
	    , sin_ptr = cos_ptr + ncols
	    , xs_ptr  = sin_ptr + ncols
	    , ys_ptr  = xs_ptr  + m
	    , cft_ptr = ys_ptr  + m
	    , sft_ptr = cft_ptr + m
	    , w = -dir * Math.PI / ncols
	    , row, a, b, c, d, k1, k2, k3
	    , i
	  for(i=0; i<ncols; ++i) {
	    a = w * ((i * i) % (ncols * 2))
	    c = Math.cos(a)
	    d = Math.sin(a)
	    buffer[cft_ptr+(m-i)] = buffer[cft_ptr+i] = buffer[cos_ptr+i] = c
	    buffer[sft_ptr+(m-i)] = buffer[sft_ptr+i] = buffer[sin_ptr+i] = d
	  }
	  for(i=ncols; i<=m-ncols; ++i) {
	    buffer[cft_ptr+i] = 0.0
	  }
	  for(i=ncols; i<=m-ncols; ++i) {
	    buffer[sft_ptr+i] = 0.0
	  }
	
	  fftRadix2(1, 1, m, buffer, cft_ptr, sft_ptr)
	  
	  //Compute scale factor
	  if(dir < 0) {
	    w = 1.0 / ncols
	  } else {
	    w = 1.0
	  }
	  
	  //Handle direction
	  for(row=0; row<nrows; ++row) {
	  
	    // Copy row into scratch memory, multiply weights
	    for(i=0; i<ncols; ++i) {
	      a = buffer[x_ptr+i]
	      b = buffer[y_ptr+i]
	      c = buffer[cos_ptr+i]
	      d = -buffer[sin_ptr+i]
	      k1 = c * (a + b)
	      k2 = a * (d - c)
	      k3 = b * (c + d)
	      buffer[xs_ptr+i] = k1 - k3
	      buffer[ys_ptr+i] = k1 + k2
	    }
	    //Zero out the rest
	    for(i=ncols; i<m; ++i) {
	      buffer[xs_ptr+i] = 0.0
	    }
	    for(i=ncols; i<m; ++i) {
	      buffer[ys_ptr+i] = 0.0
	    }
	    
	    // FFT buffer
	    fftRadix2(1, 1, m, buffer, xs_ptr, ys_ptr)
	    
	    // Apply multiplier
	    for(i=0; i<m; ++i) {
	      a = buffer[xs_ptr+i]
	      b = buffer[ys_ptr+i]
	      c = buffer[cft_ptr+i]
	      d = buffer[sft_ptr+i]
	      k1 = c * (a + b)
	      k2 = a * (d - c)
	      k3 = b * (c + d)
	      buffer[xs_ptr+i] = k1 - k3
	      buffer[ys_ptr+i] = k1 + k2
	    }
	    
	    // Inverse FFT buffer
	    fftRadix2(-1, 1, m, buffer, xs_ptr, ys_ptr)
	    
	    // Copy result back into x/y
	    for(i=0; i<ncols; ++i) {
	      a = buffer[xs_ptr+i]
	      b = buffer[ys_ptr+i]
	      c = buffer[cos_ptr+i]
	      d = -buffer[sin_ptr+i]
	      k1 = c * (a + b)
	      k2 = a * (d - c)
	      k3 = b * (c + d)
	      buffer[x_ptr+i] = w * (k1 - k3)
	      buffer[y_ptr+i] = w * (k1 + k2)
	    }
	    
	    x_ptr += ncols
	    y_ptr += ncols
	  }
	}
	


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	var bits = __webpack_require__(6)
	var dup = __webpack_require__(29)
	if(!global.__TYPEDARRAY_POOL) {
	  global.__TYPEDARRAY_POOL = {
	      UINT8   : dup([32, 0])
	    , UINT16  : dup([32, 0])
	    , UINT32  : dup([32, 0])
	    , INT8    : dup([32, 0])
	    , INT16   : dup([32, 0])
	    , INT32   : dup([32, 0])
	    , FLOAT   : dup([32, 0])
	    , DOUBLE  : dup([32, 0])
	    , DATA    : dup([32, 0])
	  }
	}
	var POOL = global.__TYPEDARRAY_POOL
	var UINT8   = POOL.UINT8
	  , UINT16  = POOL.UINT16
	  , UINT32  = POOL.UINT32
	  , INT8    = POOL.INT8
	  , INT16   = POOL.INT16
	  , INT32   = POOL.INT32
	  , FLOAT   = POOL.FLOAT
	  , DOUBLE  = POOL.DOUBLE
	  , DATA    = POOL.DATA
	
	function free(array) {
	  if(array instanceof ArrayBuffer) {
	    var n = array.byteLength|0
	      , log_n = bits.log2(n)
	    if(n < 32) {
	      return
	    }
	    DATA[log_n].push(array)
	  } else {
	    var n = array.length|0
	      , log_n = bits.log2(n)
	    if(n < 32) {
	      return
	    }
	    if(array instanceof Uint8Array) {
	      UINT8[log_n].push(array)
	    } else if(array instanceof Uint16Array) {
	      UINT16[log_n].push(array)
	    } else if(array instanceof Uint32Array) {
	      UINT32[log_n].push(array)
	    } else if(array instanceof Int8Array) {
	      INT8[log_n].push(array)
	    } else if(array instanceof Int16Array) {
	      INT16[log_n].push(array)
	    } else if(array instanceof Int32Array) {
	      INT32[log_n].push(array)
	    } else if(array instanceof Float32Array) {
	      FLOAT[log_n].push(array)
	    } else if(array instanceof Float64Array) {
	      DOUBLE[log_n].push(array)
	    }
	  }
	}
	exports.free = free
	
	function malloc(n, dtype) {
	  n = Math.max(bits.nextPow2(n), 32)
	  var log_n = bits.log2(n)
	  if(dtype === undefined) {
	    var d = DATA[log_n]
	    if(d.length > 0) {
	      var r = d[d.length-1]
	      d.pop()
	      return r
	    }
	    return new ArrayBuffer(n)
	  } else {
	    switch(dtype) {
	      case "uint8":
	        var u8 = UINT8[log_n]
	        if(u8.length > 0) {
	          var r8 = u8[u8.length-1]
	          u8.pop()
	          return r8
	        }
	        return new Uint8Array(n)
	      break
	      
	      case "uint16":
	        var u16 = UINT16[log_n]
	        if(u16.length > 0) {
	          var r16 = u16[u16.length-1]
	          u16.pop()
	          return r16
	        }
	        return new Uint16Array(n)
	      break
	      
	      case "uint32":
	        var u32 = UINT32[log_n]
	        if(u32.length > 0) {
	          var r32 = u32[u32.length-1]
	          u32.pop()
	          return r32
	        }
	        return new Uint32Array(n)
	      break
	      
	      case "int8":
	        var i8 = INT8[log_n]
	        if(i8.length > 0) {
	          var s8 = i8[i8.length-1]
	          i8.pop()
	          return s8
	        }
	        return new Int8Array(n)
	      break
	      
	      case "int16":
	        var i16 = INT16[log_n]
	        if(i16.length > 0) {
	          var s16 = i16[i16.length-1]
	          i16.pop()
	          return s16
	        }
	        return new Int16Array(n)
	      break
	      
	      case "int32":
	        var i32 = INT32[log_n]
	        if(i32.length > 0) {
	          var s32 = i32[i32.length-1]
	          i32.pop()
	          return s32
	        }
	        return new Int32Array(n)
	      break
	      
	      case "float":
	      case "float32":
	        var f = FLOAT[log_n]
	        if(f.length > 0) {
	          var q = f[f.length-1]
	          f.pop()
	          return q
	        }
	        return new Float32Array(n)
	      break
	      
	      case "double":
	      case "float64":
	        var dd = DOUBLE[log_n]
	        if(dd.length > 0) {
	          var p = dd[dd.length-1]
	          dd.pop()
	          return p
	        }
	        return new Float64Array(n)
	      break
	      
	      default:
	        return null
	    }
	  }
	  return null
	}
	exports.malloc = malloc
	
	
	function clearCache() {
	  for(var i=0; i<32; ++i) {
	    UINT8[i].length = 0
	    UINT16[i].length = 0
	    UINT32[i].length = 0
	    INT8[i].length = 0
	    INT16[i].length = 0
	    INT32[i].length = 0
	    FLOAT[i].length = 0
	    DOUBLE[i].length = 0
	    DATA[i].length = 0
	  }
	}
	exports.clearCache = clearCache
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 29 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	function dupe_array(count, value, i) {
	  var c = count[i]|0
	  if(c <= 0) {
	    return []
	  }
	  var result = new Array(c), j
	  if(i === count.length-1) {
	    for(j=0; j<c; ++j) {
	      result[j] = value
	    }
	  } else {
	    for(j=0; j<c; ++j) {
	      result[j] = dupe_array(count, value, i+1)
	    }
	  }
	  return result
	}
	
	function dupe_number(count, value) {
	  var result, i
	  result = new Array(count)
	  for(i=0; i<count; ++i) {
	    result[i] = value
	  }
	  return result
	}
	
	function dupe(count, value) {
	  if(typeof value === "undefined") {
	    value = 0
	  }
	  switch(typeof count) {
	    case "number":
	      if(count > 0) {
	        return dupe_number(count|0, value)
	      }
	    break
	    case "object":
	      if(typeof (count.length) === "number") {
	        return dupe_array(count, value, 0)
	      }
	    break
	  }
	  return []
	}
	
	module.exports = dupe


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	'use strict'
	
	var bits = __webpack_require__(35)
	var dup = __webpack_require__(36)
	
	//Legacy pool support
	if(!global.__TYPEDARRAY_POOL) {
	  global.__TYPEDARRAY_POOL = {
	      UINT8   : dup([32, 0])
	    , UINT16  : dup([32, 0])
	    , UINT32  : dup([32, 0])
	    , INT8    : dup([32, 0])
	    , INT16   : dup([32, 0])
	    , INT32   : dup([32, 0])
	    , FLOAT   : dup([32, 0])
	    , DOUBLE  : dup([32, 0])
	    , DATA    : dup([32, 0])
	    , UINT8C  : dup([32, 0])
	    , BUFFER  : dup([32, 0])
	  }
	}
	
	var hasUint8C = (typeof Uint8ClampedArray) !== 'undefined'
	var POOL = global.__TYPEDARRAY_POOL
	
	//Upgrade pool
	if(!POOL.UINT8C) {
	  POOL.UINT8C = dup([32, 0])
	}
	if(!POOL.BUFFER) {
	  POOL.BUFFER = dup([32, 0])
	}
	
	//New technique: Only allocate from ArrayBufferView and Buffer
	var DATA    = POOL.DATA
	  , BUFFER  = POOL.BUFFER
	
	exports.free = function free(array) {
	  if(Buffer.isBuffer(array)) {
	    BUFFER[bits.log2(array.length)].push(array)
	  } else {
	    if(Object.prototype.toString.call(array) !== '[object ArrayBuffer]') {
	      array = array.buffer
	    }
	    if(!array) {
	      return
	    }
	    var n = array.length || array.byteLength
	    var log_n = bits.log2(n)|0
	    DATA[log_n].push(array)
	  }
	}
	
	function freeArrayBuffer(buffer) {
	  if(!buffer) {
	    return
	  }
	  var n = buffer.length || buffer.byteLength
	  var log_n = bits.log2(n)
	  DATA[log_n].push(buffer)
	}
	
	function freeTypedArray(array) {
	  freeArrayBuffer(array.buffer)
	}
	
	exports.freeUint8 =
	exports.freeUint16 =
	exports.freeUint32 =
	exports.freeInt8 =
	exports.freeInt16 =
	exports.freeInt32 =
	exports.freeFloat32 = 
	exports.freeFloat =
	exports.freeFloat64 = 
	exports.freeDouble = 
	exports.freeUint8Clamped = 
	exports.freeDataView = freeTypedArray
	
	exports.freeArrayBuffer = freeArrayBuffer
	
	exports.freeBuffer = function freeBuffer(array) {
	  BUFFER[bits.log2(array.length)].push(array)
	}
	
	exports.malloc = function malloc(n, dtype) {
	  if(dtype === undefined || dtype === 'arraybuffer') {
	    return mallocArrayBuffer(n)
	  } else {
	    switch(dtype) {
	      case 'uint8':
	        return mallocUint8(n)
	      case 'uint16':
	        return mallocUint16(n)
	      case 'uint32':
	        return mallocUint32(n)
	      case 'int8':
	        return mallocInt8(n)
	      case 'int16':
	        return mallocInt16(n)
	      case 'int32':
	        return mallocInt32(n)
	      case 'float':
	      case 'float32':
	        return mallocFloat(n)
	      case 'double':
	      case 'float64':
	        return mallocDouble(n)
	      case 'uint8_clamped':
	        return mallocUint8Clamped(n)
	      case 'buffer':
	        return mallocBuffer(n)
	      case 'data':
	      case 'dataview':
	        return mallocDataView(n)
	
	      default:
	        return null
	    }
	  }
	  return null
	}
	
	function mallocArrayBuffer(n) {
	  var n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var d = DATA[log_n]
	  if(d.length > 0) {
	    return d.pop()
	  }
	  return new ArrayBuffer(n)
	}
	exports.mallocArrayBuffer = mallocArrayBuffer
	
	function mallocUint8(n) {
	  return new Uint8Array(mallocArrayBuffer(n), 0, n)
	}
	exports.mallocUint8 = mallocUint8
	
	function mallocUint16(n) {
	  return new Uint16Array(mallocArrayBuffer(2*n), 0, n)
	}
	exports.mallocUint16 = mallocUint16
	
	function mallocUint32(n) {
	  return new Uint32Array(mallocArrayBuffer(4*n), 0, n)
	}
	exports.mallocUint32 = mallocUint32
	
	function mallocInt8(n) {
	  return new Int8Array(mallocArrayBuffer(n), 0, n)
	}
	exports.mallocInt8 = mallocInt8
	
	function mallocInt16(n) {
	  return new Int16Array(mallocArrayBuffer(2*n), 0, n)
	}
	exports.mallocInt16 = mallocInt16
	
	function mallocInt32(n) {
	  return new Int32Array(mallocArrayBuffer(4*n), 0, n)
	}
	exports.mallocInt32 = mallocInt32
	
	function mallocFloat(n) {
	  return new Float32Array(mallocArrayBuffer(4*n), 0, n)
	}
	exports.mallocFloat32 = exports.mallocFloat = mallocFloat
	
	function mallocDouble(n) {
	  return new Float64Array(mallocArrayBuffer(8*n), 0, n)
	}
	exports.mallocFloat64 = exports.mallocDouble = mallocDouble
	
	function mallocUint8Clamped(n) {
	  if(hasUint8C) {
	    return new Uint8ClampedArray(mallocArrayBuffer(n), 0, n)
	  } else {
	    return mallocUint8(n)
	  }
	}
	exports.mallocUint8Clamped = mallocUint8Clamped
	
	function mallocDataView(n) {
	  return new DataView(mallocArrayBuffer(n), 0, n)
	}
	exports.mallocDataView = mallocDataView
	
	function mallocBuffer(n) {
	  n = bits.nextPow2(n)
	  var log_n = bits.log2(n)
	  var cache = BUFFER[log_n]
	  if(cache.length > 0) {
	    return cache.pop()
	  }
	  return new Buffer(n)
	}
	exports.mallocBuffer = mallocBuffer
	
	exports.clearCache = function clearCache() {
	  for(var i=0; i<32; ++i) {
	    POOL.UINT8[i].length = 0
	    POOL.UINT16[i].length = 0
	    POOL.UINT32[i].length = 0
	    POOL.INT8[i].length = 0
	    POOL.INT16[i].length = 0
	    POOL.INT32[i].length = 0
	    POOL.FLOAT[i].length = 0
	    POOL.DOUBLE[i].length = 0
	    POOL.UINT8C[i].length = 0
	    DATA[i].length = 0
	    BUFFER[i].length = 0
	  }
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(31).Buffer))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	'use strict'
	
	var base64 = __webpack_require__(32)
	var ieee754 = __webpack_require__(33)
	var isArray = __webpack_require__(34)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation
	
	var rootParent = {}
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }
	
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }
	
	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }
	
	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }
	
	  // Unusual.
	  return fromObject(this, arg)
	}
	
	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'
	
	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)
	
	  that.write(string, encoding)
	  return that
	}
	
	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)
	
	  if (isArray(object)) return fromArray(that, object)
	
	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }
	
	  if (object.length) return fromArrayLike(that, object)
	
	  return fromJsonObject(that, object)
	}
	
	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}
	
	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0
	
	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)
	
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}
	
	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }
	
	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent
	
	  return that
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)
	
	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break
	
	    ++i
	  }
	
	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')
	
	  if (list.length === 0) {
	    return new Buffer(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }
	
	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}
	
	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0
	
	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'binary':
	        return binarySlice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0
	
	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1
	
	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)
	
	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }
	
	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}
	
	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'binary':
	        return binaryWrite(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  if (newBuf.length) newBuf.parent = this.parent || this
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }
	
	  return len
	}
	
	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length
	
	  if (end < start) throw new RangeError('end < start')
	
	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return
	
	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')
	
	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var BP = Buffer.prototype
	
	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true
	
	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set
	
	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set
	
	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer
	
	  return arr
	}
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(31).Buffer, (function() { return this; }())))

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	
	;(function (exports) {
		'use strict';
	
	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array
	
		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)
	
		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}
	
		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr
	
			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}
	
			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0
	
			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)
	
			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length
	
			var L = 0
	
			function push (v) {
				arr[L++] = v
			}
	
			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}
	
			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}
	
			return arr
		}
	
		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length
	
			function encode (num) {
				return lookup.charAt(num)
			}
	
			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}
	
			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}
	
			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}
	
			return output
		}
	
		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))
	


/***/ },
/* 33 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}
	


/***/ },
/* 34 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	var toString = {}.toString;
	
	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};
	


/***/ },
/* 35 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	/**
	 * Bit twiddling hacks for JavaScript.
	 *
	 * Author: Mikola Lysenko
	 *
	 * Ported from Stanford bit twiddling hack library:
	 *    http://graphics.stanford.edu/~seander/bithacks.html
	 */
	
	"use strict"; "use restrict";
	
	//Number of bits in an integer
	var INT_BITS = 32;
	
	//Constants
	exports.INT_BITS  = INT_BITS;
	exports.INT_MAX   =  0x7fffffff;
	exports.INT_MIN   = -1<<(INT_BITS-1);
	
	//Returns -1, 0, +1 depending on sign of x
	exports.sign = function(v) {
	  return (v > 0) - (v < 0);
	}
	
	//Computes absolute value of integer
	exports.abs = function(v) {
	  var mask = v >> (INT_BITS-1);
	  return (v ^ mask) - mask;
	}
	
	//Computes minimum of integers x and y
	exports.min = function(x, y) {
	  return y ^ ((x ^ y) & -(x < y));
	}
	
	//Computes maximum of integers x and y
	exports.max = function(x, y) {
	  return x ^ ((x ^ y) & -(x < y));
	}
	
	//Checks if a number is a power of two
	exports.isPow2 = function(v) {
	  return !(v & (v-1)) && (!!v);
	}
	
	//Computes log base 2 of v
	exports.log2 = function(v) {
	  var r, shift;
	  r =     (v > 0xFFFF) << 4; v >>>= r;
	  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
	  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
	  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
	  return r | (v >> 1);
	}
	
	//Computes log base 10 of v
	exports.log10 = function(v) {
	  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
	          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
	          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
	}
	
	//Counts number of bits
	exports.popCount = function(v) {
	  v = v - ((v >>> 1) & 0x55555555);
	  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
	  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
	}
	
	//Counts number of trailing zeros
	function countTrailingZeros(v) {
	  var c = 32;
	  v &= -v;
	  if (v) c--;
	  if (v & 0x0000FFFF) c -= 16;
	  if (v & 0x00FF00FF) c -= 8;
	  if (v & 0x0F0F0F0F) c -= 4;
	  if (v & 0x33333333) c -= 2;
	  if (v & 0x55555555) c -= 1;
	  return c;
	}
	exports.countTrailingZeros = countTrailingZeros;
	
	//Rounds to next power of 2
	exports.nextPow2 = function(v) {
	  v += v === 0;
	  --v;
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v + 1;
	}
	
	//Rounds down to previous power of 2
	exports.prevPow2 = function(v) {
	  v |= v >>> 1;
	  v |= v >>> 2;
	  v |= v >>> 4;
	  v |= v >>> 8;
	  v |= v >>> 16;
	  return v - (v>>>1);
	}
	
	//Computes parity of word
	exports.parity = function(v) {
	  v ^= v >>> 16;
	  v ^= v >>> 8;
	  v ^= v >>> 4;
	  v &= 0xf;
	  return (0x6996 >>> v) & 1;
	}
	
	var REVERSE_TABLE = new Array(256);
	
	(function(tab) {
	  for(var i=0; i<256; ++i) {
	    var v = i, r = i, s = 7;
	    for (v >>>= 1; v; v >>>= 1) {
	      r <<= 1;
	      r |= v & 1;
	      --s;
	    }
	    tab[i] = (r << s) & 0xff;
	  }
	})(REVERSE_TABLE);
	
	//Reverse bits in a 32 bit word
	exports.reverse = function(v) {
	  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
	          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
	          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
	           REVERSE_TABLE[(v >>> 24) & 0xff];
	}
	
	//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
	exports.interleave2 = function(x, y) {
	  x &= 0xFFFF;
	  x = (x | (x << 8)) & 0x00FF00FF;
	  x = (x | (x << 4)) & 0x0F0F0F0F;
	  x = (x | (x << 2)) & 0x33333333;
	  x = (x | (x << 1)) & 0x55555555;
	
	  y &= 0xFFFF;
	  y = (y | (y << 8)) & 0x00FF00FF;
	  y = (y | (y << 4)) & 0x0F0F0F0F;
	  y = (y | (y << 2)) & 0x33333333;
	  y = (y | (y << 1)) & 0x55555555;
	
	  return x | (y << 1);
	}
	
	//Extracts the nth interleaved component
	exports.deinterleave2 = function(v, n) {
	  v = (v >>> n) & 0x55555555;
	  v = (v | (v >>> 1))  & 0x33333333;
	  v = (v | (v >>> 2))  & 0x0F0F0F0F;
	  v = (v | (v >>> 4))  & 0x00FF00FF;
	  v = (v | (v >>> 16)) & 0x000FFFF;
	  return (v << 16) >> 16;
	}
	
	
	//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
	exports.interleave3 = function(x, y, z) {
	  x &= 0x3FF;
	  x  = (x | (x<<16)) & 4278190335;
	  x  = (x | (x<<8))  & 251719695;
	  x  = (x | (x<<4))  & 3272356035;
	  x  = (x | (x<<2))  & 1227133513;
	
	  y &= 0x3FF;
	  y  = (y | (y<<16)) & 4278190335;
	  y  = (y | (y<<8))  & 251719695;
	  y  = (y | (y<<4))  & 3272356035;
	  y  = (y | (y<<2))  & 1227133513;
	  x |= (y << 1);
	  
	  z &= 0x3FF;
	  z  = (z | (z<<16)) & 4278190335;
	  z  = (z | (z<<8))  & 251719695;
	  z  = (z | (z<<4))  & 3272356035;
	  z  = (z | (z<<2))  & 1227133513;
	  
	  return x | (z << 2);
	}
	
	//Extracts nth interleaved component of a 3-tuple
	exports.deinterleave3 = function(v, n) {
	  v = (v >>> n)       & 1227133513;
	  v = (v | (v>>>2))   & 3272356035;
	  v = (v | (v>>>4))   & 251719695;
	  v = (v | (v>>>8))   & 4278190335;
	  v = (v | (v>>>16))  & 0x3FF;
	  return (v<<22)>>22;
	}
	
	//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
	exports.nextCombination = function(v) {
	  var t = v | (v - 1);
	  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
	}
	
	


/***/ },
/* 36 */
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	var define = false;
	
	"use strict"
	
	function dupe_array(count, value, i) {
	  var c = count[i]|0
	  if(c <= 0) {
	    return []
	  }
	  var result = new Array(c), j
	  if(i === count.length-1) {
	    for(j=0; j<c; ++j) {
	      result[j] = value
	    }
	  } else {
	    for(j=0; j<c; ++j) {
	      result[j] = dupe_array(count, value, i+1)
	    }
	  }
	  return result
	}
	
	function dupe_number(count, value) {
	  var result, i
	  result = new Array(count)
	  for(i=0; i<count; ++i) {
	    result[i] = value
	  }
	  return result
	}
	
	function dupe(count, value) {
	  if(typeof value === "undefined") {
	    value = 0
	  }
	  switch(typeof count) {
	    case "number":
	      if(count > 0) {
	        return dupe_number(count|0, value)
	      }
	    break
	    case "object":
	      if(typeof (count.length) === "number") {
	        return dupe_array(count, value, 0)
	      }
	    break
	  }
	  return []
	}
	
	module.exports = dupe


/***/ }
/******/ ]);
//# sourceMappingURL=example.build.js.map