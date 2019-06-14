import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import './App.css'

export default class GameSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedOption:''};
  }
  render() {
    return (
      <div className="header-item">
        <p>Select a Game:</p>
        <Dropdown
          className='dropdown'
          controlClassName='dropdown-control'
          menuClassName='dropdown-menu'
          options={this.props.options}
          onChange={this.handleGameChange.bind(this)}
          value={this.state.selectedOption}
          autoScrollToSelectedOption={true}
          placeholder="Select an option..."
        />
      </div>
    );
  }

  handleGameChange(ev) {
    this.setState({selectedOption: ev.value})
    this.props.onGameSelected(ev.value);
  }
}