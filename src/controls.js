import React from 'react';
import './App.css'

export default class Controls extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      favorited:this.props.favorites.includes(this.props.selectedSoundscape),
      paused:this.props.paused,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.favorites.length !== 0)
    {
      if(prevProps.selectedSoundscape!==this.props.selectedSoundscape){
        this.setState({favorited:this.props.favorites.includes(this.props.selectedSoundscape)});
      }
    }
    if(prevProps.selectedSoundscape!==this.props.selectedSoundscape){
      this.setState({paused:this.props.paused});
    }
  }

  render() {
    return (
      <div className="controls">
        {!this.state.favorited && <p className="star-inactive" onClick={() => this.handleFavorite()}>☆</p>}
        {this.state.favorited && <p className="star-active" onClick={() => this.handleUnfavorite()}>★</p>}

        {!this.state.paused && <p className="pause" onClick={() => this.handlePause()}>❚❚</p>}
        {this.state.paused && <p className="play" onClick={() => this.handlePlay()}>▶</p>}
      </div>
    );
  }

  handleFavorite() {
    if(this.props.selectedSoundscape !== '')
    {
      this.setState({favorited: true})
      this.props.handleFavorite();
    }
  }

  handleUnfavorite() {
    if(this.props.selectedSoundscape !== '')
    {
      this.setState({favorited: false})
      this.props.handleUnfavorite();
    }
  }

  handlePause() {
    if(this.props.selectedSoundscape !== '')
    {
      this.setState({paused: true})
      this.props.handlePause();
    }
  }

  handlePlay() {
    if(this.props.selectedSoundscape !== '')
    {
      this.setState({paused: false})
      this.props.handlePlay();
    }
  }
}