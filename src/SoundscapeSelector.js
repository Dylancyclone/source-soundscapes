import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './App.css'

export default class SoundscapeSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedOption:''};
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
            options={Object.keys(this.props.options)}
            onChange={this.handleSoundscapeChange.bind(this)}
            value={this.state.selectedOption}
            autoScrollToSelectedOption={true}
            placeholder="Select an option..."
            />
        </div>
      );
    }
  }

  handleSoundscapeChange(ev) {
    this.setState({selectedOption: ev.value})
    this.props.onSoundscapeSelected(ev.value);
  }
}