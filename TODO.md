# Action Plan

Note: Using "to-do" with hypen in the free text to differentiate from non-hypen version that is reserved solely for search tools (like VSCode TO-DO Tree) that compile actionable lists.

## TO-DOs

In addition to the to-do's sprinkled throughout the code, this file contains kind of a roadmap.

It is also a thinking-out-loud place, to capture ideas for future features.

### Baseline

(see duplicaes in the code)

* TODO Fix scribbletune::channel.extension polluting track with Tone instrument (chockes Apollo devtools JSON with circular references)
* TODO BPM control
* TODO Channel mute
* TODO Master volume + mute
* TODO Metronom
* TODO Clip names
* TODO Clip colors
* TODO Clip 'ditto', drag'n'drop
* TODO Track record, rewind, replay, export to file (Tone.Transport keeps recording of events, maybe on notes level, need something like clip-level?)
* TODO Clip record (from MIDI in?) -> parse into primitives (notes, pattern)

### Roadmap to the Editor

1. TODO Parse raw code of loadable track file, and annotate track data, e.g. `pattern` contains result, `patternGen` would contain code snipet that created that pattern. Same for notes, chords, etc.
2. TODO Ability to 'apply' or 're-generate', i.e. run all generators to re-calculate pattern, notes, etc.
3. TODO Reverse generator? E.g. take notes or chords sequence and map back to the scale of the key signature. Given scale 'C major', chords 'C G Am F' -> produce code `notes = notes(chords(keySignature, 'I V IV vi'))` or such.
4. TODO Continue impoving Editor.js toward a functional level. Implementation should use `xxxGen` when present.

### Roadmap to the TTM - Lead Sheet

1. TODO Add lead sheet 'open file'/'save file'/'edit file'
2. TODO Add lead sheet parser (text -> data)
3. TODO Add lead sheet exporter (data -> text)
4. TODO Add lead sheet data structure to the track loader
5. TODO Examples of track using lead sheet

### Roadmap to the TTM - Other

Main idea is to add textual patterns (rhythms) library, textual melodies library, something like 'drum:kick:style-reggae' (with multi-dimensional tags as style, country, era, artists, etc.) to allow picking/generating patterns from mappings to a free-form text search, which will be able to find tagged info, like '80's reggae from Brasil'. ML/AI most likely will be needed.

## Data Structures

### Lead Sheet

Parsed text into data structure for algorithm consumption. Main use is in the track / clips, to create melodies programmaticaly.

* Key signature
* Time signature
* Tempo
* Tune(s): Main melody / secondary melodies
* Lyrics

Extensions to Lead Sheet or rather a separate mid-layer place, like "Arrangement":

* Ability to change any of Key/Time/Tempo mid-track? (e.g. a clip could set new tempo for the whole track)
* 'Song' structure, e.g. verse, chorus, break (names should be arbitrary so any structures could be described) - some modularity, so composition can be described in 'modules'. That could translate into e.g. clip type
* Instrumental Arrangements
