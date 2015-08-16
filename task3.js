window.onload = function(){
    var btnPlay = document.getElementById('btn-play');
    var btnStop = document.getElementById('btn-stop');

    var context = new AudioContext();
    var fileReader = new FileReader();
    var analyser = context.createAnalyser();
    var canvas = document.getElementById('visualizator');
    var canvasContext = canvas.getContext('2d');

    analyser.fftSize = 1024;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    function draw() {
        drawVisual = requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        canvasContext.fillStyle = 'rgb(255, 255, 255)';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        var barWidth = Math.round((canvas.width / bufferLength) * 2.5);
        var barHeight;
        var x = 0;

        for(var i = 0; i < bufferLength; i++) {
            barHeight = Math.round(dataArray[i]/2);

            canvasContext.fillStyle = 'rgb(' + barHeight + ',' + barHeight + ',' + barHeight + ')';
            canvasContext.fillRect(x,canvas.height-barHeight/2,barWidth,barHeight);

            x += barWidth + 1;
        }
    };

    var buffer = null;
    var source = null;
    function loadFile(file){
        fileReader.readAsArrayBuffer(file);
        document.getElementById('track-title').textContent = file.name;
    }
    fileReader.onload = function(){
        context.decodeAudioData(fileReader.result, function(tempBuffer) {
            buffer = tempBuffer;
            btnPlay.disabled = false;
        });
    }

    btnPlay.onclick = function(){
        if (!buffer || source){
            return;
        }
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.connect(analyser);
        source.start();
        draw();
        btnStop.disabled = false;
    };

    btnStop.onclick = function(){
        if (!source){
            return;
        }
        source.stop();
        source = null;
    };

    document.getElementById('btn-choose-file').onchange = function(){
        loadFile(this.files[0]);
    };

    document.getElementById('drop-zone').addEventListener('drop', function(e){
        e.stopPropagation();
        e.preventDefault();
        var files = e.target.files || e.dataTransfer.files;
        loadFile(files[0]);
    }, false);

    document.getElementById('drop-zone').addEventListener('dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, false);
}