import React from 'react';
import SoundscapeSelector from './SoundscapeSelector';

import * as Items from './soundscapes';

export default class Example extends React.Component {
  constructor(props) {
    super(props);
    //this.readTextFile(process.env.PUBLIC_URL + '/soundscapes/hl2/soundscapes_town.txt');
    console.log(Items)

    this.state = {
      soundscapes: [],
      currentSoundscape: '',
    };

    this.channels = [];
    this.timeouts = [];
  }

  componentDidMount() {
    var soundscapes = {};
    console.log(Object.keys(Items.hl2))
    Object.keys(Items.hl2).forEach((e) => {
      soundscapes = {...soundscapes, ...this.parseSoundscape(Items.hl2[e])}
    })
    console.log(JSON.stringify(soundscapes))
    this.setState({
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
    var keyValueRegex = /("[a-zA-z._0-9]+")("[a-zA-z.,_0-9/]+")/g;
    var playRandomRegex = /"playrandom"/g;
    var rndWaveRegex = /"rndwave":{([a-zA-Z.0-9,:/"_]+)}/g;
    var waveRegex = /"wave":("[a-zA-z.,_0-9/]+")/g;
    var objectCommaRegex = /[}\]]"/g;
    var cleanUpRegex = /,([}\]])/g;

    //For future reference, this line may cause problems in some edge case.
    //Currently, the only place I've seen asterisks in a soundscape files are in places like this:
    //"wave"		"*ambient/atmosphere/plaza_amb.wav"
    //Where I can't see the asterisk even doing anything and it kinda just breaks the path.
    //I cannot find any mention of asterisks on the VDC page, nor any mention online that says it functions
    //differently from a path without asterisks. I don't think asterisks can even be used as wildcards in this
    //context, so I think it is safe to remove them.
    //Just note that this might be a problem if I'm wrong.

    text = text.replace(/[*#)]/g,""); //Remove all illegal characters
    
    text = text.replace(/\/\/(.+)/g,""); //Remove all commented lines
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
        //section = section.replace(playRandomRegex,"\"playrandom-"+uuidv4()+"\""); 
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
            if (rawFile.status === 200 || rawFile.status == 0) {
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
    this.setState({ currentSoundscape: soundscape});
    console.log(soundscape)
    console.log(this.state.soundscapes[soundscape])
    this.channels.forEach((channel) => {channel.pause();})
    this.timeouts.forEach((timeout) => {clearTimeout(timeout);})
  }

  renderCurrentSoundscape() {
    return (
      <p>
        Current Soundscape {this.state.currentSoundscape}.
      </p>
    );
  }

  renderChannels() {
    var text = [];
    this.channels = [];
    this.timeouts = [];
		this.state.soundscapes[this.state.currentSoundscape].channels.forEach((channel, index) => {
      if (this.channels[index]) this.channels[index].stop(); //In case something is already there and hasn't been stopped

      if (channel.type==='playlooping')
      {
        this.channels[index] = new Audio("/sound/"+channel.wave);
        if (/,/.test(channel.volume)) {
          this.channels[index].volume = this.randomBetween(channel.volume.split(',')[0],channel.volume.split(',')[1]);
        }
        else
        {
          this.channels[index].volume = channel.volume;
        }
        this.channels[index].ontimeupdate= function(i) {
          if(this.currentTime > this.duration - 0.3){
            this.currentTime = 0;
            this.play();
          }
        };
        this.channels[index].play();
        console.log(this.channels[index])
        text.push(
          <div key={JSON.stringify(channel)}>
            <p>{JSON.stringify(channel)}</p>
          </div>
        );
      }
      if (channel.type==='playrandom')
      {
        this.channels[index] = new Audio("/sound/"+channel.rndwave[Math.floor(Math.random() * channel.rndwave.length)]);
        if (/,/.test(channel.volume)) {
          this.channels[index].volume = this.randomBetween(parseFloat(channel.volume.split(',')[0]),parseFloat(channel.volume.split(',')[1]));
        }
        else
        {
          this.channels[index].volume = channel.volume;
        }
        var that = this; //I knew this day would come
        this.channels[index].addEventListener('ended', function () {
          that.timeouts.push(setTimeout(function () {
            this.src="/sound/"+channel.rndwave[Math.floor(Math.random() * channel.rndwave.length)];
            this.currentTime = 0;
            this.play();
          }.bind(this), that.randomBetween(parseFloat(channel.time.split(',')[0]),parseFloat(channel.time.split(',')[1]))*1000, this)
          )
        })
        this.channels[index].addEventListener('loadstart', function () {
          that.timeouts.push(setTimeout(function () {
            this.play();
          }.bind(this), that.randomBetween(parseFloat(channel.time.split(',')[0]),parseFloat(channel.time.split(',')[1]))*1000, this)
          )
        })
        //this.channels[index].play();
        console.log(this.channels[index])
        text.push(
            <div key={JSON.stringify(channel)}>
            <p>{JSON.stringify(channel)}</p>
          </div>
        );
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
        <div>
          <SoundscapeSelector
            options={this.state.soundscapes}
            selectedSoundscape={this.state.currentSoundscape}
            onSoundscapeSelected={this.handleSoundscapeSelected}
          />
          {this.state.currentSoundscape && this.renderCurrentSoundscape()}
          {this.state.currentSoundscape !=='' && this.renderChannels()}
        </div>
      );
    }
  }
}