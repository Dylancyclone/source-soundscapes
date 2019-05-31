# *IMPORTANT*

If (re)installing node_modules, copy `node_modules.babel-plugin-wildcard.lib.index.js` to `node_modules/babel-plugin-wildcard/lib/index.js` and replace the file that is there!
This depends on a PR made by `louislva` [here](https://github.com/vihanb/babel-plugin-wildcard/pull/33) which has not yet been merged to master. If the fork is added to the project however, npm (for some reason) fails to compile the plugin into the file found in the lib directory. As such, the new code must be put in manually.

# Source-Soundscapes

A work-in-progress website to play source engine soundscapes in a webbrowser. This project is no where near a completed state, but updates are slowly being made.

## TODO

#### Rules

- [X] playlooping
- [ ] playrandom
- [ ] playsoundscape
- [ ] dsp
- [ ] dsp_spatial
- [ ] dsp_volume
- [ ] fadetime
- [ ] soundmixer

#### Keyvalues

- [X] wave
- [ ] volume
- [X] pitch
- [ ] position
- [ ] origin
- [ ] attenuation
- [ ] soundlevel 

#### Features

- [ ] Select Game
- [X] Select Soundscape
- [ ] Mute Channel
- [ ] Import Soundscape
- [ ] Support Custom Environments
- [ ] Smart Random Sounds?