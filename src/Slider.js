import React, {Component} from 'react'
import { mapRange } from 'gsap/all';

class Slider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue : this.props.currentValue,
      currentValuePercentage: mapRange(this.props.startValue, this.props.endValue, 0, 100, this.props.currentValue),
      mouseIsDown : false,
      // orientation : 
    }
    this.mouseDragStart = {}
    this.mouseDragDeltasPercentage = {}
    this.valueSavePercentage = 0
  }

  changeValue = event => {
    // current target will be the target that the event listener has been attached to. even if the actual event is one of its children
    let { currentTarget, clientX } = event
    let { width, x } = currentTarget.getBoundingClientRect()
    let relativePos = clientX - x
    relativePos /= width
    let mapPos = mapRange(0, 1, this.props.startValue, this.props.endValue, relativePos)
    this.setState({
      currentValue : mapPos,
      currentValuePercentage : relativePos * 100
    }) 

    // samples need to be a power of 2 so some tweaking is needed
    return this.props.stateProperty === 'samples' ? this.getClosestPow2(mapPos) : mapPos
  }

  getClosestPow2 = value => {
    let powersOf2 = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048],
      minIndex, minDiff = Infinity
    powersOf2.forEach((pow, index) => {
      if (minDiff > Math.abs(pow - value)) {
        minDiff = Math.abs(pow - value)
        minIndex = index
      }
    })
    return powersOf2[minIndex]
  }

  dragAndDrop = event => {
    const {currentTarget, clientY, clientX} = event
    const {height, width, x} = currentTarget.getBoundingClientRect()
    // ideally the slider would accept an orientation prop which would allow for vertical and horizontal sliders
    // let relativePosY = 1 - ((clientY - y) / height)

    // getting mouse position as percentage of target ranging from 0 to 1
    let relativePosX = (clientX - x) / width
    // mapping it with the range provided by parent
    let mapPosX = mapRange(0, 1, this.props.startValue, this.props.endValue, relativePosX)

    // when the user starts a click, the slider moves to the click position then starts listening to mousemove events, ending when the user releases the click or leaves the slider dom

    // even if there are no changes in the value, we still have to return it as it will be passed to the parent and will modify the state property of the parent (passed as a prop)
    if (event.type === 'mousedown') {
      this.setState({ mouseIsDown: true })
      this.mouseDragStart = {
        x : clientX,
        y : clientY
      } 
      this.setState({
        currentValue : mapPosX ,
        currentValuePercentage: relativePosX *100
      },
      () => this.valueSavePercentage = relativePosX)
      return this.props.stateProperty === 'samples' ? this.getClosestPow2(mapPosX) : mapPosX

    } else if (event.type === 'mousemove') {
      if (this.state.mouseIsDown) {
        // difference between start and actual (in percent)
        this.mouseDragDeltasPercentage = {
          x : (this.mouseDragStart.x - clientX) / width, 
          y: (this.mouseDragStart.y - clientY) / height, 
        }
        // substract it from the saved value
        let deltaAdjustedValuePercentage = this.valueSavePercentage - this.mouseDragDeltasPercentage.x
        // lerp to get value
        let deltaAdjustedValue = this.props.startValue  + ((this.props.endValue - this.props.startValue)* deltaAdjustedValuePercentage)   
        this.setState({
          currentValue: deltaAdjustedValue,
          currentValuePercentage: deltaAdjustedValuePercentage * 100
        })
        return this.props.stateProperty ==='samples' ? this.getClosestPow2(deltaAdjustedValue) : deltaAdjustedValue
      } else {
        return this.props.stateProperty === 'samples' ? this.getClosestPow2(this.state.currentValue) : this.state.currentValue
      }
    } else if (event.type === 'mouseup' || event.type === 'mouseleave') {   
      this.setState({ mouseIsDown: false }) 
      return this.props.stateProperty === 'samples' ? this.getClosestPow2(this.state.currentValue) : this.state.currentValue
    }
  }


  render() {
    return (
      <div
        onClick={ // cannot quite fit the audio slider with the others so i'm running another fn
          this.props.audio && this.props.changeHandlerAudio
        }
        onMouseDown = {e => { if (!this.props.audio) this.props.changeHandler(this.props.stateProperty, this.dragAndDrop(e))}}
        onMouseMove = {e => { if (!this.props.audio) this.props.changeHandler(this.props.stateProperty, this.dragAndDrop(e))}}
        onMouseUp = {e => { if (!this.props.audio) this.props.changeHandler(this.props.stateProperty, this.dragAndDrop(e))}}
        onMouseLeave = {e => { if (!this.props.audio) this.props.changeHandler(this.props.stateProperty, this.dragAndDrop(e))}}
        className="progressBar"
       >
        <div className = "currentTime"> {
          typeof this.props.currentValue === 'string' ? this.props.currentValue : this.props.currentValue.toFixed(2)
        }</div>
        <div className="totalTime">{this.props.endValue}</div>
        <div
          style={{
            width : `${this.state.currentValuePercentage || this.props.audioCurrentValuePercentage}%`,
          }}
          className={ this.props.audio ? "timeProgression tp-audio" : "timeProgression"}
          // className = {"timeProgression" + this.props.audio && "tp-audio"}
        ></div>
      </div>
    )
  }
}

export default Slider