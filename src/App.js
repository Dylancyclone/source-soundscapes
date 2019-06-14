import React from 'react';
import AudioPlayer from './screw/audioplayer';
import EventEmitter from 'eventemitter3';
import SoundscapeSelector from './SoundscapeSelector';
import GameSelector from './GameSelector';
import Favorite from './favorite';

import sourceLogo from './images/source-logo.png';
import githubLogo from './images/github.png';

import './App.css';

import * as Items from './soundscapes';

let previousVolume = 1;
//let sounds = [];

export default class Example extends React.Component {
  constructor(props) {
    super(props);
    //this.readTextFile(process.env.PUBLIC_URL + '/soundscapes/hl2/soundscapes_town.txt');
    console.log(Items)

    this.state = {
      games: [],
      soundscapes: [],
      currentSoundscape: '',
      currentGame: '',
    };

    this.channels = [];
    this.timeouts = [];

    this.favorites = [];

		this.handleFavorite = this.handleFavorite.bind(this);
		this.handleUnfavorite = this.handleUnfavorite.bind(this);
  }

  async componentDidMount() {
    var games = [];
    var soundscapes = {};
    Object.keys(Items).forEach((game) => {
      games.push(game)
      Object.keys(Items[game]).forEach((e) => {
        var parsed = this.parseSoundscape(Items[game][e]);
        soundscapes = {...soundscapes, ...parsed}
        soundscapes[game] = {...soundscapes[game], ...parsed}
      })
    })
    games.push("FAVORITES");

    this.favorites = JSON.parse(await localStorage.getItem('SourceSoundscapes.favorites'))||[];
    console.log(this.favorites)
    if (this.favorites !== null && this.favorites.length !== 0) {soundscapes["FAVORITES"] = Object.assign.apply(null, this.favorites.map(x =>({[x]:0})))};
    //console.log(sounds)
    this.setState({
      games:games,
      soundscapes:soundscapes,
    })
  }

  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  parseSoundscape(text) {
    var titleRegex = /"[a-zA-z._0-9]+"/;
    var channelRegex = /"(playrandom)":|"(playlooping)":|"(playsoundscape)":/;
    var objectRegex = /("[a-zA-z._0-9]+")([{[])/g;
    var keyValueRegex = /("[a-zA-z._0-9]+")("[a-zA-z.,_0-9/-]+")/g;
    var rndWaveRegex = /"rndwave":{([a-zA-Z.0-9,:/"_-]+)}/g;
    var waveRegex = /"wave":("[a-zA-z.,_0-9/-]+")/g;
    var objectCommaRegex = /[}\]]"/g;
    var cleanUpRegex = /,([}\]])/g;

    //For future reference, this line may cause problems in some edge case.
    //These characters represent "Sound Characters" Read about them here:
    //https://developer.valvesoftware.com/wiki/Soundscripts#Sound_Characters
    //Since most of them have no impact on this site, we just remove them
    //so that we get clean paths

    text = text.replace(/[*#)(><^@$!?~]/g,""); //Remove all Sound Characters
    text = text.replace(/\\/g,"/"); //Replace backslashs with forwardslashs
    text = text.replace(/([0-9. -]+,){2}([0-9. -]+);*/g,"location"); //Remove origin keyvalue data
    
    text = text.replace(/\/\/(.*)/g,""); //Remove all commented lines
    text = text.replace(/[\s\n]/g,""); //Remove all whitespaces and newlines

    var sections = {}
    while (text.match(titleRegex) !== null)
    {
      var header = text.match(titleRegex);
      if (text[header.index+header[0].length] === "{")
      {
        var startIndex = header.index+header[0].length;
        var endIndex = this.findClosingBracketMatchIndex(text,startIndex);
        var section = text.slice(startIndex,endIndex+1);

        text = text.replace(text.slice(header.index,endIndex+1),""); //snip this section

        section = section.replace(objectRegex,"$1:$2");
        section = section.replace(keyValueRegex,"$1:$2,");
        section = section.replace(objectCommaRegex,"},\""); 

        var channels = [];
        while (section.match(channelRegex) !== null)
        {
          var channelText = section.match(channelRegex);
          if (section[channelText.index+channelText[0].length] === "{")
          {
            var channelStartIndex = channelText.index+channelText[0].length;
            var channelEndIndex = this.findClosingBracketMatchIndex(section,channelStartIndex);
            //console.log(section.slice(channelStartIndex,channelEndIndex+1))
            var channel = section.slice(channelStartIndex,channelEndIndex+1);

            if (rndWaveRegex.test(channel)) {channel = channel.replace(waveRegex,"$1")}; 
            channel = channel.replace(rndWaveRegex,"\"rndwave\":[$1]"); 
            channel = channel.replace(cleanUpRegex,"$1"); //remove commas at the end of a list

            channel = JSON.parse(channel);
            //if (channel.wave !== undefined) {sounds.push(channel.wave);}
            //if (channel.rndwave !== undefined) {sounds= [...sounds, ...channel.rndwave];}
            if (channelText[1] !== undefined) {channel.type=channelText[1]};
            if (channelText[2] !== undefined) {channel.type=channelText[2]};
            if (channelText[3] !== undefined) {channel.type=channelText[3]};
            channels.push(channel);

            if (section[channelEndIndex+1] === ",")
            {
              section = section.replace(section.slice(channelText.index,channelEndIndex+2),""); //snip this channel
            }
            else
            {
              section = section.replace(section.slice(channelText.index,channelEndIndex+1),""); //snip this channel
            }
          }
        }
        section = section.replace(cleanUpRegex,"$1"); //remove commas at the end of a list

        //console.log(section);
        section = JSON.parse(section)
        section.channels = channels;
        sections[header[0].replace(/"/g,"")] = section;
        //section = JSON.parse(header[0]+":"+JSON.stringify(section)+",");
        //console.log(JSON.parse(section)[Object.keys(section)[0]].channels[0].rndwave);
        //console.log(section)
        //console.log(text)

        //sections.push(section);
      }
    }
    return sections;
  }
  
  readTextFile = file => {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                var allText = rawFile.responseText;
                console.log("allText: ", allText);
                this.setState({
                    fundData: allText
                });
            }
        }
    };
    rawFile.send(null);
  };

  findClosingBracketMatchIndex(str, pos) {
    if (str[pos] !== '{') {
      throw new Error("No '{' at index " + pos);
    }
    let depth = 1;
    for (let i = pos + 1; i < str.length; i++) {
      switch (str[i]) {
      case '{':
        depth++;
        break;
      case '}':
        if (--depth === 0) {
          return i;
        }
        break;
      }
    }
    return -1;    // No matching closing parenthesis
  }

  handleSoundscapeSelected = (soundscape) => {
    var soundscapes = this.state.soundscapes;
    if (this.favorites !== null && this.favorites.length !== 0)
    {
      soundscapes["FAVORITES"] = Object.assign.apply(null, this.favorites.map(x =>({[x]:0})))
    }
    else if (this.favorites !== null && this.favorites.length === 0)
    {
      soundscapes["FAVORITES"] = [];
    }

    this.setState({ soundscapes:soundscapes, currentSoundscape: soundscape});
    console.log("Selected Soundscape:", soundscape)
    this.channels.forEach((channel) => {channel.pause();})
    this.timeouts.forEach((timeout) => {clearTimeout(timeout);})
    this.channels = [];
    this.timeouts = [];
  }

  handleGameSelected = (game) => {
    var soundscapes = this.state.soundscapes;
    if (this.favorites !== null && this.favorites.length !== 0)
    {
      soundscapes["FAVORITES"] = Object.assign.apply(null, this.favorites.map(x =>({[x]:0})))
    }
    else if (this.favorites !== null && this.favorites.length === 0)
    {
      soundscapes["FAVORITES"] = [];
    }
    
    this.setState({ soundscapes:soundscapes, currentGame: game, currentSoundscape:''});
    console.log("Selected game:", game)
    this.channels.forEach((channel) => {channel.pause();})
    this.timeouts.forEach((timeout) => {clearTimeout(timeout);})
    this.channels = [];
    this.timeouts = [];
  }

  handleVolumeUpdate = (e) => {
    this.channels.forEach((channel) => {channel.volume = channel.volume / previousVolume * parseFloat(e.target.value);})
    previousVolume = e.target.value;
  }

  handleStop() {
    console.log("Stopped playback")
    this.channels.forEach((channel) => {channel.pause();})
    this.timeouts.forEach((timeout) => {clearTimeout(timeout);})
    this.channels = [];
    this.timeouts = [];
  }

  handleFavorite() {
    if (!this.favorites.includes(this.state.currentSoundscape)) {this.favorites.push(this.state.currentSoundscape)}
    localStorage.setItem('SourceSoundscapes.favorites', JSON.stringify(this.favorites));
    console.log("Added "+this.state.currentSoundscape+" to favorites")
    //console.log(this.favorites)
  }

  handleUnfavorite() {
    this.favorites = this.favorites.filter((item) => { 
      return item !== this.state.currentSoundscape
    })
    localStorage.setItem('SourceSoundscapes.favorites', JSON.stringify(this.favorites));
    console.log("Removed "+this.state.currentSoundscape+" from favorites")
    //console.log(this.favorites)
  }

  renderCurrentSoundscape() {
    return (
      <p>
        Current Soundscape: {this.state.currentSoundscape}
      </p>
    );
  }

  renderChannels(soundscape) {
    var text = [];
    if (this.state.soundscapes[soundscape] === undefined)
    {
      console.error("ERROR: Cannot find soundscript: " + soundscape)
      return;
    }
		this.state.soundscapes[soundscape].channels.forEach(async (channel, i) => {
      //if (this.channels[index]) this.channels[index].stop(); //In case something is already there and hasn't been stopped
      var filename;
      var volume;
      var pitch;
      var index;
      var pan;
      
      if (channel.type==='playlooping')
      {
        if (/,/.test(channel.volume)) {
          volume = this.randomBetween(parseFloat(channel.volume.split(',')[0]),parseFloat(channel.volume.split(',')[1]));
        }
        else
        {
          volume = channel.volume;
        }

        if (/,/.test(channel.pitch)) {
          pitch = this.randomBetween(parseFloat(channel.pitch.split(',')[0]),parseFloat(channel.pitch.split(',')[1]))/100;
        }
        else
        {
          pitch = channel.pitch/100;
        }

        if (channel.position === "random") {
          pan = this.randomBetween(-0.5,0.5);
        }
        else if (!isNaN(parseInt(channel.position)))
        {
          pan = this.randomBetween(-0.5,0.5);
        }
        else
        {
          pan = 0;
        }
        
        if (channel.hasOwnProperty("origin"))
        {
          pan = this.randomBetween(-0.5,0.5);
        }

        this.emitter = new EventEmitter();

        index = this.channels.push(new AudioPlayer({
          emitter: this.emitter,
          pitch: pitch,
          tempo: 1,
          volume: volume * previousVolume,
          pan:pan,
          loop:true
        }))-1;

        this.emitter.on('end', () => this.channels[index].seekPercent(0));

        const reader = new FileReader();
        filename = "/sound/"+channel.wave;
        fetch(filename)
          .then(resp => resp.blob())
          .then(blob => {
            reader.readAsArrayBuffer(blob);
            reader.onload = async event => {
              let buffer;
              try {
                  buffer = await this.channels[index].decodeAudioData(event.target.result);
              } catch (err) {
                console.warn("Error: " + err + ", with file: " + filename + ". Does file exist?")
                  return;
              }

              this.channels[index].setBuffer(buffer);
              this.channels[index].play();
            };
          });
          text.push(
            <div key={JSON.stringify(channel)}>
              <p>{JSON.stringify(channel)}</p>
            </div>
          );
      }
      if (channel.type==='playrandom')
      {


        if (/,/.test(channel.volume)) {
          volume = this.randomBetween(parseFloat(channel.volume.split(',')[0]),parseFloat(channel.volume.split(',')[1]));
        }
        else
        {
          volume = channel.volume;
        }

        if (/,/.test(channel.pitch)) {
          pitch = this.randomBetween(parseFloat(channel.pitch.split(',')[0]),parseFloat(channel.pitch.split(',')[1]))/100;
        }
        else
        {
          pitch = channel.pitch/100;
        }

        if (channel.position === "random") {
          pan = this.randomBetween(-0.75,0.75);
          volume *= 0.75;
        }
        else if (!isNaN(parseInt(channel.position)))
        {
          pan = this.randomBetween(-0.75,0.75);
          volume *= 0.75;
        }
        else
        {
          pan = 0;
        }

        if (channel.hasOwnProperty("origin"))
        {
          pan = this.randomBetween(-0.75,0.75);
        }

        this.emitter = new EventEmitter();

        index = this.channels.push(new AudioPlayer({
          emitter: this.emitter,
          pitch: pitch,
          tempo: 1,
          volume: volume * .75 * previousVolume,
          pan:pan,
          loop:false
        }))-1;

        //this.emitter.on('stop', () => this.channels[index].seekPercent(0));
        this.emitter.on('err', (c) => {
          filename = "/sound/"+channel.rndwave[Math.floor(Math.random() * channel.rndwave.length)];
          fetch(filename)
            .then(resp => resp.blob())
            .then(blob => {
              reader.readAsArrayBuffer(blob);
              reader.onload = async event => {
                let buffer;
                try {
                    buffer = await this.channels[index].decodeAudioData(event.target.result);
                } catch (err) {
                  console.warn("Error: " + err + ", with file: " + filename + ". Does file exist? Retry number: "+ c)
                  if (c>9)
                  {
                    console.error("Error: Channel keeps failing, stopping attempts.")
                  }
                  else
                  {
                    this.emitter.emit('err', c+1)
                  }
                  return;
                }

                await this.channels[index].setBuffer(buffer);
                this.channels[index].seekPercent(0);
                this.timeouts.push(setTimeout(function () {
                    this.channels[index].play();
                  }.bind(this), this.randomBetween(parseFloat(channel.time.split(',')[0]),parseFloat(channel.time.split(',')[1]))*1000, this)
                )
              };
            });
        })
        
        this.emitter.on('end', () => {
          this.channels[index].seekPercent(0);
          this.channels[index].pause();
          
          filename = "/sound/"+channel.rndwave[Math.floor(Math.random() * channel.rndwave.length)];
          fetch(filename)
            .then(resp => resp.blob())
            .then(blob => {
              reader.readAsArrayBuffer(blob);
              reader.onload = async event => {
                let buffer;
                try {
                    buffer = await this.channels[index].decodeAudioData(event.target.result);
                } catch (err) {
                  console.warn("Error: " + err + ", with file: " + filename + ". Does file exist?")
                  this.emitter.emit('err', 1)
                  return;
                }

                await this.channels[index].setBuffer(buffer);
                this.channels[index].seekPercent(0);

                if (/,/.test(channel.volume)) {
                  this.channels[index].volume = this.randomBetween(parseFloat(channel.volume.split(',')[0]),parseFloat(channel.volume.split(',')[1]))*.75 * previousVolume;
                }
        
                if (/,/.test(channel.pitch)) {
                  this.channels[index].pitch = this.randomBetween(parseFloat(channel.pitch.split(',')[0]),parseFloat(channel.pitch.split(',')[1]))/100;
                }
                if (channel.position === "random") { //Only change position if random. If it has a set position, keep it constant.
                  this.channels[index].pan = this.randomBetween(-0.75,0.75);
                  volume *= 0.75;
                }
                else if (!isNaN(parseInt(channel.position)))
                {
                  volume *= 0.75;
                }
                

                this.timeouts.push(setTimeout(function () {
                    this.channels[index].play();
                  }.bind(this), this.randomBetween(parseFloat(channel.time.split(',')[0]),parseFloat(channel.time.split(',')[1]))*1000, this)
                )
              };
            });
        })

        const reader = new FileReader();
        filename = "/sound/"+channel.rndwave[Math.floor(Math.random() * channel.rndwave.length)];
        fetch(filename)
          .then(resp => resp.blob())
          .then(blob => {
            reader.readAsArrayBuffer(blob);
            reader.onload = async event => {
              let buffer;
              try {
                buffer = await this.channels[index].decodeAudioData(event.target.result);
              } catch (err) {
                console.warn("Error: " + err + ", with file: " + filename + ". Does file exist?")
                this.emitter.emit('err', 1)
                return;
              }

              this.channels[index].setBuffer(buffer);
              this.timeouts.push(setTimeout(function () {
                  this.channels[index].play();
                }.bind(this), this.randomBetween(parseFloat(channel.time.split(',')[0]),parseFloat(channel.time.split(',')[1]))*1000, this)
              )
            };
          });
          text.push(
            <div key={JSON.stringify(channel)}>
              <p>{JSON.stringify(channel)}</p>
            </div>
          );
      }
      
      if (channel.type==='playsoundscape')
      {
        text.push(this.renderChannels(channel.name))
      }
		});
		//console.log(channels)
		return(text);
  }

  render() {

    if (this.state.soundscapes === [])
    {
      return null;
    }
    else
    {
      return (
        <div className="body">
          <div className="title">
            <div className="title-item">
              <img src={sourceLogo} alt=""/>
              <p>Soundscapes</p>
            </div>
            <div className="title-item">
              <div style={{flexGrow:1}}></div>
              <a href="https://github.com/Dylancyclone/source-soundscapes"><img src={githubLogo} alt="" align="right"/></a>
            </div>
          </div>
          <div className="header">
            <GameSelector
              options={this.state.games}
              onGameSelected={this.handleGameSelected}
            />
            <SoundscapeSelector
              options={this.state.soundscapes[this.state.currentGame]}
              favorites={this.favorites}
              onSoundscapeSelected={this.handleSoundscapeSelected}
            />
            <div className="controls">
              <Favorite
                favorites={this.favorites}
                selectedSoundscape={this.state.currentSoundscape}
                handleFavorite={this.handleFavorite}
                handleUnfavorite={this.handleUnfavorite}
              />
              
              <p className="stop" onClick={() => this.handleStop()}>⯃</p>
            </div>
            <div className="slidecontainer">
              <p>Volume</p>
              <input type="range" min="0.01" max="2" defaultValue="1" onChange={(e) => {this.handleVolumeUpdate(e)}} step="0.01" className="slider"/>
            </div>
          </div>
          <div className="content">
            {this.state.currentSoundscape && this.renderCurrentSoundscape()}
            {this.state.currentSoundscape !=='' && this.renderChannels(this.state.currentSoundscape)}
          </div>
          <div className="footer">
          <p>Copyright © <a href="http://lathrum.com/dylan/portfolio/" target="_blank">Dylan Lathrum</a>, 2019.</p>
          <p>All sounds and soundscripts belong to Valve Software.</p>
          </div>
        </div>
      );
    }
  }
}