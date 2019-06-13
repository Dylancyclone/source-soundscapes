# *IMPORTANT*

If (re)installing node_modules, copy `node_modules.babel-plugin-wildcard.lib.index.js` to `node_modules/babel-plugin-wildcard/lib/index.js` and replace the file that is there!
This depends on a PR made by `louislva` [here](https://github.com/vihanb/babel-plugin-wildcard/pull/33) which has not yet been merged to master. If the fork is added to the project however, npm (for some reason) fails to compile the plugin into the file found in the lib directory. As such, the new code must be put in manually.

# Source-Soundscapes

A work-in-progress website to play source engine soundscapes in a webbrowser. This project is no where near a completed state, but updates are slowly being made.

## TODO

#### Rules

- [X] playlooping
- [X] playrandom
- [X] playsoundscape
- [X] dsp
  - Will not implement. DSP is simply way over my head, and I don't think the Web Audio API even supports effects to that degree.
- [X] dsp_spatial
  - See above.
- [X] dsp_volume
  - See above.
- [X] fadetime
  - Will not implement. fadetime determines the time it takes for the soundscape to crossfade in, this site will simply switch between soundscapes
- [X] soundmixer
  - Will not implement. soundmixer determines custom volume control over various sound categories for things like ducking. Since this is a controlled environment (no dialogue, player/NPCs, or other game sounds), this is unnecessary.

#### Keyvalues

- [X] wave
- [X] volume
- [X] pitch
- [X] position
- [X] origin
- [X] attenuation
  - Will not implement. Space is simulated under the position/origin keyvalue, making attenuation redundant.
- [X] soundlevel 
  - See above.

#### Features

- [X] Select Game
- [X] Select Soundscape
- [X] Global Volume Slider
- [ ] Save/Name Favorites
- [ ] Mute Channel
- [ ] Smart Random Sounds?