const {SimpleFilter, SoundTouch} = require('./soundtouch');

const BUFFER_SIZE = 2048;

class AudioPlayer {
    constructor({emitter, pitch, tempo, volume, loop}) {
        this.loop = loop;

        this.emitter = emitter;

        this.context = new AudioContext();

        this.gainNode = this.context.createGain();
        this.gainNode.gain.value = volume;
        this.gainNode.connect(this.context.destination);

        this.scriptProcessor = this.context.createScriptProcessor(BUFFER_SIZE, 2, 2);
        this.scriptProcessor.onaudioprocess = e => {
            const l = e.outputBuffer.getChannelData(0);
            const r = e.outputBuffer.getChannelData(1);
            const framesExtracted = this.simpleFilter.extract(this.samples, BUFFER_SIZE);
            if (framesExtracted === 0) {
                this.emitter.emit('end');
            }
            for (let i = 0; i < framesExtracted; i++) {
                l[i] = this.samples[i * 2];
                r[i] = this.samples[i * 2 + 1];
            }
        };

        this.soundTouch = new SoundTouch();
        this.soundTouch.pitch = pitch;
        this.soundTouch.tempo = tempo;

        this.duration = undefined;
    }

    get pitch() {
        return this.soundTouch.pitch;
    }
    set pitch(pitch) {
        this.soundTouch.pitch = pitch;
    }

    get tempo() {
        return this.soundTouch.tempo;
    }
    set tempo(tempo) {
        this.soundTouch.tempo = tempo;
    }

    get volume() {
        return this.soundTouch.tempo;
    }
    set volume(volume) {
        this.gainNode.gain.value = volume;
    }

    decodeAudioData(data) {
        return this.context.decodeAudioData(data);
    }

    setBuffer(buffer) {

        this.samples = new Float32Array(BUFFER_SIZE * 2);
        this.source = {
            extract: (target, numFrames, position) => {
                const l = buffer.getChannelData(0);
                const r = buffer.getChannelData(buffer.numberOfChannels-1); //If the file is mono, duplicate sound to both channels
                for (let i = 0; i < numFrames; i++) {
                    target[i * 2] = l[(i + position) % (buffer.duration * this.context.sampleRate)];
                    target[i * 2 + 1] = r[(i + position) % (buffer.duration * this.context.sampleRate)];
                }
                if (this.loop) return numFrames;
                return Math.min(numFrames, l.length - position);
            },
        };
        this.simpleFilter = new SimpleFilter(this.source, this.soundTouch);

        this.duration = buffer.duration;
    }

    play() {
        this.scriptProcessor.connect(this.gainNode);
    }

    pause() {
        this.scriptProcessor.disconnect();
        
        this.scriptProcessor = null;
        this.scriptProcessor = this.context.createScriptProcessor(BUFFER_SIZE, 2, 2);
        this.scriptProcessor.onaudioprocess = e => {
            const l = e.outputBuffer.getChannelData(0);
            const r = e.outputBuffer.getChannelData(1);
            const framesExtracted = this.simpleFilter.extract(this.samples, BUFFER_SIZE);
            if (framesExtracted === 0) {
                this.emitter.emit('end');
            }
            for (let i = 0; i < framesExtracted; i++) {
                l[i] = this.samples[i * 2];
                r[i] = this.samples[i * 2 + 1];
            }
        };
    }

    seekPercent(percent) {
        if (this.simpleFilter !== undefined) {
            this.simpleFilter.sourcePosition = Math.round(
                percent / 100 * this.duration * this.context.sampleRate
            );
        }
    }
}

module.exports = AudioPlayer;