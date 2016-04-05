var pitchShiftNode = require('../pitchShiftNode');

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