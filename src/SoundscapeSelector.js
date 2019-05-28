import React from 'react';

export default class SoundscapeSelector extends React.Component {
  render() {
    return (
      <label>
        Select a Soundscape:{' '}
        <select  onChange={this.handleSoundscapeChange.bind(this)}>
          <option />
          {this.renderSoundscapeOptions()}
        </select>
      </label>
    );
  }

  renderSoundscapeOptions() {
    var build = [];
    for (var i in this.props.options) {
      build.push (
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return build;
  }

  handleSoundscapeChange(ev) {
    this.props.onSoundscapeSelected(ev.target.value);
  }
}