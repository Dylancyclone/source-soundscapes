import React from 'react';

export default class GameSelector extends React.Component {
  render() {
    return (
      <label>
        Select a Game:{' '}
        <select  onChange={this.handleGameChange.bind(this)}>
          <option />
          {this.renderGameOptions()}
        </select>
      </label>
    );
  }

  renderGameOptions() {
    var build = [];
    for (var i in this.props.options) {
      build.push (
        <option key={i} value={i}>
          {this.props.options[i]}
        </option>
      );
    }
    return build;
  }

  handleGameChange(ev) {
    this.props.onGameSelected(this.props.options[ev.target.value]);
  }
}