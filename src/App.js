import React, { PureComponent } from 'react'
import { CSSTransitionGroup } from 'react-transition-group'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound'
import * as Vibrant from 'node-vibrant'

import Slider from './Slider'
import musicDataJSON from './musicData.json'
import './App.scss'

import playButton from './svgs/play.svg'
import pauseButton from './svgs/pause.svg'
import musicSymbol from './svgs/music.svg'
import nextSymbol from './svgs/next.svg'
import settings from './svgs/settings.svg'
import cover1 from './covers/cover01.jpg'
import cover2 from './covers/cover02.jpg'
import cover3 from './covers/cover03.jpg'
import cover4 from './covers/cover04.jpg'
import audio1 from './audios/audio01.mp3'
import audio2 from './audios/audio02.mp3'
import audio3 from './audios/audio03.mp3'
import audio4 from './audios/audio04.mp3'

class App extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visualizer: "",
      visRadius: "",
      musicData: "",
      canvasSize: {
        width: "",
        height: ""
      },
      fileIsLoaded: false,
      activeTrack: 0,
      activeScreen: "nowPlaying",
      displayOptions : false,
      currentMusicTime: 0,
      volume: 0.4,
      audios: [],
      coverColor: "white",
      mouseIsDown : false,
      smoothing : 0.8,
      samples : 256,
      amplitude : 0.4,
    }
    this.smoothingSave = this.state.smoothing
    this.samplesSave = this.state.samples
    this.$visualizer = React.createRef()
    this.audios = []
    this.covers = []
    this.coverSources = [cover1, cover2, cover3, cover4]
    this.audioSources = [audio1, audio2, audio3, audio4]

    this.mouseDragStart = {}
    this.mouseDragDeltas= {}
    this.startVolume = this.state.volume
    this.increment = 0.5
  }

  storeState = () => {
    localStorage.setItem('volume', this.state.volume)
    localStorage.setItem('activeTrack', this.state.activeTrack)
  }

  setStateToLocalStorage = () => {
    if (localStorage.getItem('volume') && localStorage.getItem('activeTrack')) {
      this.setState({
        volume: JSON.parse(localStorage.getItem('volume')),
        activeTrack: JSON.parse(localStorage.getItem('activeTrack'))
      }, () => {
        if (this.state.audios) this.state.audios.forEach(audio => audio.setVolume(this.state.volume))
      })
    }
  }

  formatTime = string => {
    string = parseInt(string)
    let min = (parseInt(string / 60))
    min = min < 10 ? "0" + min.toString() : min.toString()
    let second = string - min * 60
    second = second < 10 ? "0" + second.toString() : second.toString()
    return min + ":" + second
  }

  getSongsDuration = () => {
    let tempData = this.state.musicData
    this.state.musicData.forEach((track, index) => {
      let audio = new Audio(tempData[index].file)
      tempData[index].duration = audio.duration
    })
    this.setState({ musicData: tempData });
  }

  getData = () => {
    // wanted to do an api call but couldn't find an api that'd give me audio files...
    this.setState({ musicData: musicDataJSON });
  }


  sketch = p => {
    let fft
    let spectrum
    let waveform

    p.preload = () => {
      this.state.musicData.forEach((track, index) => {
        this.audios.push(p.loadSound(this.audioSources[index]))
        this.covers.push(p.loadImage(this.coverSources[index]))
      })
    }

    p.setup = () => {
      this.setState({
        fileIsLoaded: true,
        audios: this.audios
      },
        () => {
        this.setStateToLocalStorage()
        this.getCoverColor()
      })

      let { width, height } = this.$visualizer.current.getBoundingClientRect()
      this.setState({
        canvasSize: { width: width, height: height },
        visRadius: (width * 1/2) / 2 // canvas is a half of its container and we divide by 2 again for radius and not diameter
      })
      p.createCanvas(width, height).parent('canvasContainer')
      fft = new p5.FFT(this.state.smoothing, this.state.samples)
      p.frameRate(60)
    }

    p.draw = () => {
      if (this.smoothingSave !== this.state.smoothing) {
        fft = new p5.FFT(this.state.smoothing, this.state.samples)
        this.smoothingSave = this.state.smoothing
      }
      if (this.samplesSave !== this.state.samples) {
        fft = new p5.FFT(this.state.smoothing, this.state.samples)
        this.samplesSave = this.state.samples
      }
      p.angleMode(p.DEGREES)
      p.clear()
      p.noStroke()
      spectrum = fft.analyze()
      waveform = fft.waveform()
      p.translate(this.state.canvasSize.width / 2, this.state.canvasSize.height / 2)
      p.rotate(-20)
      spectrum =  spectrum.slice(0, Math.floor(spectrum.length *(2/3)))

      // drawing spikes
      spectrum.forEach((value, index) => {
        let angle = p.map(index, 0, spectrum.length, 0, 360)
        let valueCopy = p.map(value, 0, 255, this.state.visRadius*1.10, this.state.canvasSize.width * this.state.amplitude)
        // let cosVal = valueCopy * p.cos(angle)
        // let sinVal = valueCopy * p.sin(angle)
        p.fill(this.state.coverColor)
        p.push()
        p.rotate(angle)
        p.rect(0, 0, 9, valueCopy)
        p.pop()
      })

      
      // drawing the inner circle
      p.beginShape()
      spectrum.forEach((value, index) => {
        let angle = p.map(index, 0, spectrum.length, 0, 360)
        let waveformMultiplier = p.map(waveform[index], -1, 1, 1, 1.05)
        let minimum = this.state.visRadius * waveformMultiplier * 1.05
        let x = p.cos(angle) * minimum
        let y = p.sin(angle) * minimum
        p.vertex(x, y)
        p.fill("#16191D")
        p.ellipse(0, 0, minimum, minimum)
      })
      p.endShape()
    }

    p.windowResized = () => {
      let { width, height } = this.$visualizer.current.getBoundingClientRect()
      this.setState({
        canvasSize: { width: width, height: height },
        visRadius: (width * 1 / 2) / 2
      })
      p.resizeCanvas(width, height)
    }

  }

  toggleAudio = (trackNbParam = "noparam") => {
    let trackNumber
    if (trackNbParam === "noparam") {
      trackNumber = this.state.activeTrack
    } else {
      trackNumber = trackNbParam
      let previousTrack = this.state.activeTrack
      this.setState({ activeTrack: trackNbParam }, () => {
        this.getCoverColor()
        if (previousTrack !== this.state.activeTrack) this.state.audios[previousTrack].stop()
      })
    }
    if (this.state.fileIsLoaded && this.state.audios[trackNumber]) {
      if (this.state.audios[trackNumber].isPlaying()) {
        this.state.audios[trackNumber].pause()
        // we have to force update as pausing the track doesnt' re render the dom so we're still on the play icon
        this.forceUpdate() 
      } else {
        this.state.audios[trackNumber].play()
        this.forceUpdate() 
      }
    }
  }

  dragAndDrop = event => {
    const {currentTarget, clientY} = event
    const {height, y} = currentTarget.getBoundingClientRect()
    let relativePos = 1 - ((clientY - y) / height)

    if (event.type === 'mousedown') {
      this.setState({ mouseIsDown: true })
      this.mouseDragStart = clientY
      this.setState({ volume : relativePos },
      () => {
        this.state.audios.forEach((audio) => audio.setVolume(this.state.volume))
        this.startVolume = this.state.volume
      })
    } else if (event.type === 'mousemove' && this.state.mouseIsDown) {
      this.mouseDragDeltas = (this.mouseDragStart - (clientY)) / height

      this.setState({ volume: this.startVolume + this.mouseDragDeltas },
      () => this.state.audios.forEach((audio) => audio.setVolume(this.state.volume)))
      
    } else if (event.type === 'mouseup' || event.type === 'mouseleave') {
      this.setState({ mouseIsDown: false })
    }
  }

  getCoverColor = () => {
    Vibrant.from(this.coverSources[this.state.activeTrack]).getPalette()
      .then((palette) => this.setState({ coverColor: palette.LightVibrant.getRgb() }))
  }

  changeSongMoment = event => {
    let { currentTarget, clientX } = event
    let { width, x } = currentTarget.getBoundingClientRect()
    let relativePos = clientX - x
    relativePos /= width
    if (this.state.audios[this.state.activeTrack]) {
      this.state.audios[this.state.activeTrack].stop()
      setTimeout(() => {
        let songCMT = parseInt(relativePos * this.state.audios[this.state.activeTrack].duration())
        this.setState({ currentMusicTime: songCMT })
        this.state.audios[this.state.activeTrack].jump(songCMT)
        this.state.audios[this.state.activeTrack].fade(this.state.volume, 2)
      }, 10);
    }
  }

  changeSong = direction => {
    if (this.state.currentMusicTime > 3 && direction === "previous") {
      this.state.audios[this.state.activeTrack].stop()
      setTimeout(() => {
        this.setState({ currentMusicTime: 0 });
        this.state.audios[this.state.activeTrack].jump(0)
      }, 10)
      return
    }
    let canChangePrevious = direction === "previous" && this.state.activeTrack >= 1
    let canChangeNext = direction === "next" && this.state.activeTrack < this.state.musicData.length - 1
    this.setState(prevState => {
      if (canChangePrevious) {
        return { activeTrack: prevState.activeTrack - 1 }
      } else if (canChangeNext) {
        return { activeTrack: prevState.activeTrack + 1 } 
      }
    }, () => {
        if (canChangeNext || canChangePrevious) {
          this.getCoverColor()
          if (canChangeNext) {
            this.state.audios[this.state.activeTrack-1].stop()
            this.state.audios[this.state.activeTrack].play()
          } else if (canChangePrevious) {
            this.state.audios[this.state.activeTrack + 1].stop()
            this.state.audios[this.state.activeTrack].play()
          }
        }
    })
  }

  playlistSwitch = () => {
    if (this.state.activeScreen === "nowPlaying") {
      this.setState({ activeScreen: "playlist" })
    } else {
      this.setState({ activeScreen: "nowPlaying" })
    }
  }

  optionSwitch = event => {
    this.setState(prevState => {
      return { displayOptions: !prevState.displayOptions }
    })
  }

  keyboardEventsHandler = () => {
    window.addEventListener('keydown', event => {
      if (this.state.audios[this.state.activeTrack]) {
        switch (event.code) {
          case "Space":
            this.toggleAudio()
            break;

          case "ArrowRight":
            this.changeSong("next")
            break;

          case "ArrowLeft":
            this.changeSong("previous")
            break;

          case "ArrowUp":
            if (this.state.volume >= 0.95) {
              this.setState({ volume: 1 },
              () => this.state.audios[this.state.activeTrack].setVolume(this.state.volume))
            } else {
              this.setState(prevState => {
                return { volume: prevState.volume + 0.05 }
              }, () => this.state.audios[this.state.activeTrack].setVolume(this.state.volume))
            }
            break;
          case "ArrowDown":
            if (this.state.volume <= 0.05) {
              this.setState({ volume: 0 });
            } else {
              this.setState(prevState => {
                return { volume: prevState.volume - 0.05 };
              })
            }
            break;
          default:
            break;
        }
      }
    })
  }

  updateStateFromSlider = (stateProperty, newValue) => {
    this.setState({ [stateProperty]: newValue })
  }

  componentDidMount() {
    this.getData()
    this.setState({
      visualizer: new p5(this.sketch)
    },
    this.keyboardEventsHandler)

    this.interval = setInterval(() => {
      if (this.state.audios[this.state.activeTrack]) {
        if (this.state.audios[this.state.activeTrack].isPlaying()) {
          this.setState({ currentMusicTime: parseInt(this.state.audios[this.state.activeTrack].currentTime()) });
        }
      }
    }, 10)
    this.loadingInterval = setInterval(() => {
      this.increment = this.increment > 3.9 ? 0.8 : this.increment + 0.1
      this.setState({ loadingInc: this.increment });
    }, 100)
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    clearInterval(this.loadingInterval)
  }

  componentDidUpdate() {
    this.storeState()
    if (this.state.fileIsLoaded) clearInterval(this.loadingInterval)
  }

  render() {
    let backgroundImageStyle, backgroundImageStyleCover
    let cmtWidthStyle
    let soundStyle
    let soundTransformValue = 50
    if (this.state.musicData) {
      backgroundImageStyle = {
        'backgroundImage': `url(${this.coverSources[this.state.activeTrack]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      }
      backgroundImageStyleCover = {
        'backgroundImage': `url(${this.coverSources[this.state.activeTrack]})`,
        backgroundSize: 'auto 105%',
        backgroundPosition: 'center center'
      }
      if (this.state.audios[this.state.activeTrack]) {
        cmtWidthStyle = {
          'width': parseInt((this.state.currentMusicTime / this.state.audios[this.state.activeTrack].duration()) * 100) + "%"
        }
        soundTransformValue = -(1 - this.state.volume) * 100
        soundStyle = {
          'transform': `rotate(180deg) translateY(${soundTransformValue}%)`,
          'transition': this.state.mouseIsDown ? 'none' : 'all 0.2s ease-in-out'
        }
      }
    }
    let renderedPlaylist
    if (this.state.musicData) {
      renderedPlaylist = this.state.musicData.map((track, index) =>
        <div key={index} className="playlistElement">
          <img
            onClick={() => { this.toggleAudio(index) }}
            alt="cover"
            src={!this.state.audios[index]
              ? playButton
              : this.state.audios[index].isPlaying() ? pauseButton : playButton
            }
            className="playButton"
          ></img>
          <div className="playlistWrap">
            <div className="left">
              <div className="artist">{track.artistName + " - "}</div>
              <div className="dash">-</div>
              <div className="title">{track.title}</div>
            </div>
            <div className="duration">
              {this.state.audios[index] ? this.formatTime(this.state.audios[index].duration()) : track.duration}
            </div>
            {index === this.state.activeTrack && <div style={cmtWidthStyle} className="timeProgression"></div>}
          </div>
        </div>
      )
    }
    return (
      <div className="container">
        <div className="background">
          <CSSTransitionGroup
            transitionName="bgTransition"
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}
          >
            <div key={this.state.activeTrack} style={backgroundImageStyle} className="bgImage"></div>
          </CSSTransitionGroup>
          <div className="bgFilter"></div>
        </div>
        <div className="musicPlayer">
          <div className="visualizer">
            {/* dummy div for to replace p5 base loading screen */}
            <div style={{'display' : 'none'}} id="p5_loading" className="loading">LOADING</div>
            <div className = {!this.state.fileIsLoaded ? "loadingAnim load-on" : "loadingAnim load-off"}></div>
            <div ref={this.$visualizer} id="canvasContainer"></div>
            {this.state.fileIsLoaded && this.state.audios[this.state.activeTrack] &&
              ( !this.state.displayOptions ?
                <CSSTransitionGroup
                  transitionName="cover"
                  transitionAppear={true}
                  transitionAppearTimeout={300}
                  transitionEnterTimeout={300}
                  transitionLeaveTimeout={300}
                >
                  <div key={this.state.activeTrack} style={backgroundImageStyleCover} className="cover cover-img"></div>
                </CSSTransitionGroup>
                : <div className="cover cover-options">
                  <CSSTransitionGroup
                    transitionName="options"
                    transitionAppear={true}
                    transitionAppearTimeout={300}
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}
                  >   
                    <div key={this.state.activeTrack} className="options-wrapper">
                      <div className="option">
                        <div className="option-txt">smoothing</div>
                        <Slider
                          startValue={0}
                          endValue={1}
                          stateProperty={'smoothing'}
                          currentValue={this.state.smoothing}
                          changeHandler={this.updateStateFromSlider}
                          ></Slider>
                      </div>
                      <div className="option">
                        <div className="option-txt">Samples</div>
                        <Slider
                          startValue={64}
                          endValue={1024}
                          stateProperty={'samples'}
                          currentValue={this.state.samples}
                          changeHandler={this.updateStateFromSlider}
                          ></Slider>
                      </div>
                      <div className="option">
                        <div className="option-txt">Amplitude</div>
                        <Slider
                          startValue={0.3}
                          endValue={0.6}
                          stateProperty={'amplitude'}
                          currentValue={this.state.amplitude}
                          changeHandler={this.updateStateFromSlider}
                        ></Slider>
                      </div>
                    </div>
                  </CSSTransitionGroup>  
                </div>
              )
            }{this.state.fileIsLoaded && this.state.audios[this.state.activeTrack] &&
              <CSSTransitionGroup
                transitionName="switch"
                transitionAppear = {true}
                transitionAppearTimeout={300}
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}
              >
                <div key={this.state.activeTrack} onClick={this.optionSwitch} className="optionSwitchButton">
                  <img src={settings} alt="settings"/>
                </div>      
              </CSSTransitionGroup>
            }
          </div>
          <div className="card">
            {this.state.activeScreen === "nowPlaying" ?
              <div className="flex-wrap">
                <div className="info">
                  <div className="artist"> {this.state.fileIsLoaded ?
                  this.state.musicData[this.state.activeTrack].artistName
                  : `loading${".".repeat(parseInt(this.state.loadingInc))}`
                  }</div>
                  <div className="album">{this.state.fileIsLoaded ?
                    this.state.musicData[this.state.activeTrack].album
                    : "uwu"
                  }</div>
                  <div className="title">{this.state.fileIsLoaded ?
                    this.state.musicData[this.state.activeTrack].title
                    : "please wait"
                  }</div>
                </div>
                <div className="controls">
                  <img
                    src={nextSymbol}
                    onClick={() => { this.changeSong("previous") }}
                    className="before"
                    alt="before-button"
                  ></img>
                  <img
                    src={this.state.fileIsLoaded ? (this.state.audios[this.state.activeTrack].isPlaying() ? pauseButton : playButton) : playButton}
                    onClick={()=> {this.toggleAudio() }}
                    className="playPause"
                    alt="play music"
                  ></img>
                  <img
                    src={nextSymbol}
                    onClick={() => { this.changeSong("next") }}
                    className="next"
                    alt="next-button"
                  ></img>
                </div>
                <Slider
                  audio={this.state.audios[this.state.activeTrack]}
                  startValue={this.formatTime(this.state.currentMusicTime)}
                  endValue={this.state.musicData && this.state.audios[this.state.activeTrack] ? this.formatTime(this.state.audios[this.state.activeTrack].duration()) : "00:00"}
                  currentValue = {this.formatTime(this.state.currentMusicTime)}
                  audioCurrentValuePercentage={this.state.musicData && this.state.audios[this.state.activeTrack] ?
                    parseInt((this.state.currentMusicTime / this.state.audios[this.state.activeTrack].duration()) * 100)
                    : 0
                  }
                  changeHandlerAudio={this.changeSongMoment}
                ></Slider>
              </div>
              : renderedPlaylist ?
                // <CSSTransitionGroup
                //     transitionName = "pop"
                //     transitionAppear={true}
                //     transitionAppearTimeout={300}
                //     transitionEnterTimeout={300}
                //     transitionLeaveTimeout={300}>
                // </CSSTransitionGroup>
                <div key={this.state.activeTrack} className="playlist">{renderedPlaylist}</div>
                : "loading"
            }
            <div onClick={this.playlistSwitch} className="playlistSwitch">{this.state.activeScreen === 'nowPlaying' ? "PLAYLIST" : 'PLAYING NOW'}</div>
            <div
              onClick={this.dragAndDrop}
              onMouseDown = {this.dragAndDrop}
              onMouseUp = {this.dragAndDrop}
              onMouseMove = {this.dragAndDrop}
              onMouseLeave = {this.dragAndDrop}
              className="volume"
            >
              <img src={musicSymbol} alt="music symobl" className="volumeIcon"></img>
              <div style={soundStyle} className="volumeProgression">
                <div className="volumePercentage">{
                (this.state.volume *100) < 10 ?
                "0"+parseInt(this.state.volume*100)
                :parseInt(this.state.volume * 100)
                }%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
