import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './App.css'

export default class SoundscapeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOption:'',
      options:{},
    };
  }

  componentDidUpdate(prevProps) {
    var options = [];
    if (prevProps.options !== undefined)
    {
      if(Object.keys(prevProps.options).length!==Object.keys(this.props.options).length)
      {
        options = Object.keys(this.props.options).map((e) => {
          return {
            value: e,
            label: e,
            className:this.props.favorites.includes(e) ? 'favorited' : ''
          };
        })
        this.setState({options:options, selectedOption:''});
      }
    }
    else if (this.props.options !== undefined)
    {
      options = Object.keys(this.props.options).map((e) => {
        return {
          value: e,
          label: e,
          className:this.props.favorites.includes(e) ? 'favorited' : ''
        };
      })
      this.setState({options:options});
    }
  }

  render() {
    if (this.props.options === undefined)
    {
      return (
        <div className="header-item">
          <p>Select a Soundscape:</p>
        </div>
      );
    }
    else
    {
      return (
        <div className="header-item">
          <p>Select a Soundscape:</p>
          <Dropdown
            className='dropdown'
            controlClassName='dropdown-control'
            menuClassName='dropdown-menu'
            options={this.state.options}
            onChange={this.handleSoundscapeChange.bind(this)}
            value={this.state.selectedOption}
            autoScrollToSelectedOption={true}
            placeholder="Select an option..."
            />
        </div>
      );
    }
  }

  async handleSoundscapeChange(ev) {
    this.setState({selectedOption: ev.value})
    await this.props.onSoundscapeSelected(ev.value)
    
    //Wait for props to update...

    var options = Object.keys(this.props.options).map((e) => {
      return {
        value: e,
        label: e,
        className:this.props.favorites.includes(e) ? 'favorited' : ''
      };
    })
    this.setState({options:options});
  }
}