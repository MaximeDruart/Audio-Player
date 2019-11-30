import React, {Component} from 'react'
import { mapRange } from 'gsap/all';

class Slider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue : this.props.currentValue,
      currentValuePercentage: mapRange(this.props.startValue, this.props.endValue, 0, 100, this.props.currentValue)
    }
  }

  changeValue = event => {
    let { target, clientX } = event
    let { width, x } = target.getBoundingClientRect()
    let relativePos = clientX - x
    relativePos /= width
    // audio seekbar is handled separately
    if (!this.props.audio) {
      let mapPos = mapRange(0, 1, this.props.startValue, this.props.endValue, relativePos)
      this.setState({
        currentValue : mapPos,
        currentValuePercentage : relativePos * 100
      }) 

      // samples need to be a power of 2 so some tweaking is needed
      if (this.props.stateProperty === 'samples') {
        let powersOf2 = [2,4,8,16,32,64,128,256,512,1024,2048], minIndex, minDiff = Infinity
        powersOf2.forEach((pow, index) => {
          if (minDiff > Math.abs(pow-mapPos)) {
            minDiff = Math.abs(pow-mapPos)
            minIndex = index
          }
        })
        return powersOf2[minIndex] 
      }
      return mapPos
    }

  }

  render() {
    return (
      <div
        onClick={ this.props.audio ? // cannot quite fit the audio slider with the others so i'm running another fn
        this.props.changeHandlerAudio
        : e => this.props.changeHandler(this.props.stateProperty, this.changeValue(e))
        }
        className="progressBar"
       >
        <div className = "currentTime"> {
          typeof this.props.currentValue === 'string' ? this.props.currentValue : this.props.currentValue.toFixed(2)
        }</div>
        <div className="totalTime">{this.props.endValue}</div>
        <div
          style={{'width' : `${this.state.currentValuePercentage || this.props.audioCurrentValuePercentage}%`}}
          className="timeProgression"
        ></div>
      </div>
    )
  }
}

export default Slider