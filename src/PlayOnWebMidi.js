// npm install --save webmidi
// https://github.com/djipco/webmidi
import WebMidi from "webmidi";

const PlayOnWebMidi = (options) => {
  // options:
  //   channel: Midi channel number 0-15, 'all' or number[]
  //   name: MIDI instrument name (General Midi)
  //   program: MIDI program number 0-127

  let _instrument;
  let _context;
  let _ch = 1; // MIDI channel to play on
  let _program; // Select MIDI program (instrument)

  return {
    init: async (context) => {
      //? _context = context;
      _context = {...context};
      if (options.channel || options.channel === 0) {
        _ch = options.channel;
      }
      return new Promise((resolve, reject) => {
        WebMidi.enable(function (err) {
          if (err) {
            console.error("Error %o when enabling WebMidi.", err);
            _instrument = false;
            reject(err);
            return;
          }
          console.log("WebMidi inputs: %o", WebMidi.inputs);
          console.log("WebMidi outputs: %o", WebMidi.outputs);
          let output = 0;
          _instrument = WebMidi.outputs[output];
          if (!_instrument) {
            reject(new Error(`WebMidi output ${output} not found`));
            return;
          }
          if (options.name && !options.program) {
            options.program = 0; // TODO: Implement
          }
          if (options.program) {
            _program = options.program;
            _instrument.sendProgramChange(_program, _ch,  {});
          }
          resolve();
        });
      });
    },
    stop: () => {
      if (_instrument) {
        _instrument.stopNote('all', _ch, {});
        _instrument = false;
        WebMidi.disable();
      }
    },
    setVolume: async (value) => {
      const gain = 10 ** (value/20); // dB to ratio [0,1]
      console.log('PlayOnWebMidi setVolume(%o) gain=%o', value, gain);
      if (!_instrument) {
          return;
      }
      try {
        // _float(x);
        // ( (x) => { (x !== parseFloat(x)) { throw TypeError('Not a number: ' + x); } })(gain);
        const value14b = ((x) => { return x <= 0 ? 0 : x >= 1 ? 0x3fff : Math.floor(x * 0x4000); })(gain);
        _instrument.sendControlChange( 'volumecoarse',  (value14b >>   7), _ch, {});  // MSB
        _instrument.sendControlChange( 'volumefine',    (value14b & 0x7f), _ch, {});  // LSB
      } catch (error) {
        console.error("Error %o in sendControlChange(), gain=%o", error, gain);
      }
    },
    triggerAttackRelease: async (note, duration, time, velocity) => {
      if (!_instrument) {
        return;
      }

      // Note: other output libraries may need clock translation. Use Tone.context.currentTime() to
      const opts = {};
      //   duration: set the playing duration in ms
      //   time: If the value is a string starting with the + sign and followed by a number, the request will be delayed by the specified number (in milliseconds)
      //   rawVelocity: Boolean Controls whether the attack and release velocities are set using integers between 0 and 127 (true) or a decimal number between 0 and 1 (false, default).
      //   release: Number The velocity at which to release the note
      //   velocity: Number The velocity at which to play the note

      
      // const offset = WebMidi.time - _context.currentTime * 1000;
      // opts.time = "+" + time * 1000 + offset;
      const delay = (time - _context.currentTime) * 1000;
      opts.time = "+" + delay;
      if (duration) {
        opts.duration = duration * 1000 - 10;
      }
      try {
        _instrument.playNote(note, _ch, opts);
      } catch (error) {
        console.error("Error %o in WebMidi, note=%o", error, note);
      }
    },

  };
};

export default PlayOnWebMidi;