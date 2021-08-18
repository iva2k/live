// npm install --save soundfont-player
// https://github.com/danigb/soundfont-player
import Soundfont from 'soundfont-player';

const PlayOnSoundfontPlayer = (options) => {
  let instrument;
  let vca;

  return {
    init: async (context) => {
      let ac = context || new AudioContext(); // ? new webkitAudioContext()
      vca = ac.createGain();
      vca.gain.value = 1;
      vca.connect(ac.destination);

      const opts = {
        destination: vca,
      };
      if (options.soundfont) {
          opts.soundfont = options.soundfont;
      }
      return Soundfont.instrument(
        ac,
        options.name,
        opts
      ).then(function (result) {
        instrument = result;
      });
    },
    setVolume: async (value) => {
      if (vca) {
        vca.gain.value = 10 ** (value/20); // dB to ratio [0,1]
        console.log('PlayOnSoundfontPlayer setVolume(%o) gain=%o', value, vca.gain.value);
      }
    },
    triggerAttackRelease: async (note, duration, time, velocity) => {
      if (!instrument) {
        return;
      }
      const when = time;
      // Note: other output libraries may need clock translation. Use Tone.context.currentTime() to
      const opts = {};
      //   gain: float between 0 to 1
      //   attack: the attack time of the amplitude envelope
      //   decay: the decay time of the amplitude envelope
      //   sustain: the sustain gain value of the amplitude envelope
      //   release: the release time of the amplitude envelope
      //   adsr: an array of [attack, decay, sustain, release]. Overrides other parameters.
      //   duration: set the playing duration in seconds of the buffer(s)
      //   loop: set to true to loop the audio buffer
      if (duration) {
        opts.duration = duration;
      }
      instrument.play(note, when, opts);
    },

  };
};

export default PlayOnSoundfontPlayer;
