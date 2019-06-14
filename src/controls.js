import React from 'react';
import './App.css'

export default class Controls extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {favorited:this.props.favorites.includes(this.props.selectedSoundscape)};
  }

  componentDidUpdate(prevProps) {
    if (this.props.favorites.length !== 0)
    {
      if(prevProps.selectedSoundscape!==this.props.selectedSoundscape){
        this.setState({favorited:this.props.favorites.includes(this.props.selectedSoundscape)});
      }
    }
  }

  render() {
    return (
      <div className="controls">
        {!this.state.favorited && <p className="star-inactive" onClick={() => this.handleFavorite()}>☆</p>}
        {this.state.favorited && <p className="star-active" onClick={() => this.handleUnfavorite()}>★</p>}
        <p className="stop" onClick={() => this.props.handleStop()}>⯃</p>
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
}