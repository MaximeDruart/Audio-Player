import React, { Component } from 'react'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound';
import * as Vibrant from 'node-vibrant'
import musicDataJSON from './musicData.json'
import './App.css';
import playButton from './play.svg'
import pauseButton from './pause.svg'
import musicSymbol from './music.svg'
import nextSymbol from './next.svg'
import cover1 from './covers/cover01.jpg'
import cover2 from './covers/cover02.jpg'
import cover3 from './covers/cover03.jpg'
import cover4 from './covers/cover04.jpg'
import audio1 from './audios/audio01.mp3'
import audio2 from './audios/audio02.mp3'
import audio3 from './audios/audio03.mp3'
import audio4 from './audios/audio04.mp3'
import { CSSTransitionGroup } from 'react-transition-group'

class App extends Component {
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
      currentMusicTime: 0,
      volume: 0.4,
      audios: [],
      coverColor: "white",
      mouseIsDown : false
    }
    this.$visualizer = React.createRef()
    this.audios = []
    this.covers = []
    this.coverSources = [cover1, cover2, cover3, cover4]
    this.audioSources = [audio1, audio2, audio3, audio4]

    this.mouseDragStart = {}
    this.mouseDragDeltas= {}
    this.startVolume = this.state.volume
  }

  storeState = () => {
    localStorage.setItem('volume', this.state.volume)
    localStorage.setItem('activeTrack', this.state.activeTrack)
  }

  setLocalStorageState = () => {
    if (localStorage.getItem('volume') && localStorage.getItem('activeTrack')) {
      this.setState({
        volume: JSON.parse(localStorage.getItem('volume')),
        activeTrack: JSON.parse(localStorage.getItem('activeTrack'))
      })
    }
    if (this.state.audios) this.state.audios.forEach(audio => audio.setVolume(this.state.volume))
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
      this.getCoverColor()
      this.setState({ fileIsLoaded: true, audios: this.audios })
      let { width, height } = this.$visualizer.current.getBoundingClientRect()
      this.setState({
        canvasSize: { width: width, height: height },
        visRadius: (width * 2 / 3) / 2
      })
      p.createCanvas(width, height).parent('canvasContainer')
      fft = new p5.FFT(0.9, 256)
      p.frameRate(60)
    }

    p.draw = () => {
      p.angleMode(p.DEGREES)
      p.clear()
      p.noStroke()
      spectrum = fft.analyze()
      waveform = fft.waveform()
      p.translate(this.state.canvasSize.width / 2, this.state.canvasSize.height / 2)
      p.rotate(60)
      p.beginShape()
      if (spectrum[spectrum.length - 1] === 0) p.vertex(this.state.visRadius, 0)
      spectrum.forEach((value, index) => {
        let angle = p.map(index, 0, spectrum.length, 0, 360)
        let valueCopy = p.map(value, 0, 255, this.state.visRadius, this.state.canvasSize.width * 0.6)
        let cosVal = valueCopy * p.cos(angle)
        let sinVal = valueCopy * p.sin(angle)
        p.fill(this.state.coverColor)
        p.vertex(cosVal, sinVal)
        // line(0, 0, cosVal, sinVal)
        // p.rect(0, 0, 10, valueCopy)
        // p.rotate(angle)
      })
      p.endShape()


      p.beginShape()
      spectrum.forEach((value, index) => {
        let angle = p.map(index, 0, spectrum.length, 0, 360)
        let waveformMultiplier = p.map(waveform[index], -1, 1, 1, 1.05)
        let minimum = this.state.visRadius * waveformMultiplier * 1.05
        let x = p.cos(angle) * minimum
        let y = p.sin(angle) * minimum
        p.vertex(x, y)
        // p.push()
        p.fill("#16191D")
        p.ellipse(0, 0, minimum, minimum)
        // p.pop()
      })
      p.endShape()
    }

    p.windowResized = () => {
      let { width, height } = this.$visualizer.current.getBoundingClientRect()
      this.setState({
        canvasSize: { width: width, height: height },
        visRadius: (width * 2 / 3) / 2
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
      this.setState({ activeTrack: trackNbParam });
    }
    this.state.audios.forEach((audio, index) => {
      if (index !== trackNumber) {
        audio.jump(0)
        audio.stop()
      }
    })
    if (this.state.fileIsLoaded && this.state.audios[trackNumber]) {
      if (this.state.audios[trackNumber].isPlaying()) {
        this.state.audios[trackNumber].pause()
        this.setState(prevState => {
          return { audios: prevState.audios };
        });
      } else {
        this.state.audios[trackNumber].play()
        this.setState(prevState => {
          return { audios: prevState.audios };
        });
      }
    }
  }

  dragAndDrop = event => {
    const {target, clientY, clientX} = event
    const {height, width} = target.getBoundingClientRect()

    if (event.type === 'mousedown') {
      this.upDownDelay = new Date()      
      // waiting for the volume slide animation to end
      setTimeout(() => {
        this.setState({ mouseIsDown: true })
      }, 200)

      this.mouseDragStart = {
        x : clientX,
        y : clientY
      }
      this.startVolume = this.changeVolume(event)
    } else if (event.type === 'mousemove' && this.state.mouseIsDown) {
      this.mouseDragDeltas = {
        x : (this.mouseDragStart.x - (clientX)) / width, 
        y: (this.mouseDragStart.y - (clientY)) / height, 
      }
      this.setState({ volume: this.startVolume + this.mouseDragDeltas.y })

    } else if (event.type === 'mouseup' || event.type === 'mouseleave') {
      // kinda sketchy but it's the simpliest to avoid conflicts with simple click (who fires down and up events in less than .2s)
      if (new Date()-this.upDownDelay < 300) {
        setTimeout(() => {
          this.setState({ mouseIsDown: false })
        }, 200)
      } else {
        this.setState({ mouseIsDown: false })
      }
    }
  }

  changeVolume = event => {
    let { target, clientY } = event
    let { height, y } = target.getBoundingClientRect()
    let relativePos = clientY - y
    relativePos /= height
    relativePos = 1 - relativePos
    this.setState({ volume: relativePos })
    this.state.audios.forEach((audio) => {
      audio.setVolume(relativePos)
    })
    return relativePos
  }


  getCoverColor = () => {
    Vibrant.from(this.coverSources[this.state.activeTrack]).getPalette()
      .then((palette) => this.setState({ coverColor: palette.LightVibrant.getRgb() }))
  }

  changeSongMoment = event => {
    let { target, clientX } = event
    let { width, x } = target.getBoundingClientRect()
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

  changeSong(direction) {
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
        return { activeTrack: prevState.activeTrack - 1 };
      } else if (this.state.musicData) {
        if (canChangeNext) {
          return { activeTrack: prevState.activeTrack + 1 };
        }
      }
    })

    // c'est ghetto mais jsp pas pourquoi il y a un délai sur la modif de state au dessus
    setTimeout(() => {
      if (canChangeNext || canChangePrevious) {
        this.getCoverColor()
        this.state.audios.forEach((audio, index) => {
          if (canChangeNext) {
            if (index !== this.state.activeTrack) {
              audio.jump(0)
              audio.stop()
            } else {
              audio.jump(0)
              audio.fade(this.state.volume, 5)
            }
          } else if (canChangePrevious) {
            if (index !== this.state.activeTrack) {
              audio.jump(0)
              audio.stop()
            } else {
              audio.jump(0)
              audio.fade(this.state.volume, 5)
            }
          }
        })
      }
    }, 150);
  }

  componentDidMount() {
    this.setLocalStorageState()
    this.getData()
    this.setState({ visualizer: new p5(this.sketch) });
    this.keyboardEventsHandler()

    this.interval = setInterval(() => {
      if (this.state.audios[this.state.activeTrack]) {
        if (this.state.audios[this.state.activeTrack].isPlaying()) {
          this.setState({ currentMusicTime: parseInt(this.state.audios[this.state.activeTrack].currentTime()) });
        }
      }
    }, 10)
  }

  componentWillUnmount() {
    // clearInterval(this.interval)
  }


  playlistSwitch = () => {
    if (this.state.activeScreen === "nowPlaying") {
      this.setState({ activeScreen: "playlist" })
    } else {
      this.setState({ activeScreen: "nowPlaying" })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.storeState()
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
              this.setState({ volume: 1 });
            } else {
              this.setState(prevState => {
                return { volume: prevState.volume + 0.05 };
              })
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


  render() {
    let backgroundImageStyle
    let cmtWidthStyle
    let soundStyle
    let soundTransformValue = 50
    if (this.state.musicData) {
      backgroundImageStyle = {
        'backgroundImage': `url(${this.coverSources[this.state.activeTrack]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center'
      }
      if (this.state.audios[this.state.activeTrack]) {
        cmtWidthStyle = {
          'width': parseInt((this.state.currentMusicTime / this.state.audios[this.state.activeTrack].duration()) * 100) + "%"
        }
        soundTransformValue = -(1 - this.state.volume) * 100
        soundStyle = {
          'transform': `rotate(180deg) translateY(${soundTransformValue}%)`,
          'transition': this.state.mouseIsDown ? 'none' : 'transform 0.2s ease-in-out'
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
              <div className="title">{track.title}</div>
            </div>
            <div className="duration">{this.state.audios[index] ? this.formatTime(this.state.audios[index].duration()) : track.duration}</div>
            {(index === this.state.activeTrack) ? <div style={cmtWidthStyle} className="timeProgression"></div> : ""}
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
            <div ref={this.$visualizer} id="canvasContainer"></div>
            {this.state.fileIsLoaded && this.state.audios[this.state.activeTrack] ?
              <CSSTransitionGroup
                transitionName="cover"
                transitionAppear={true}
                transitionAppearTimeout={500}
                transitionEnterTimeout={300}
                transitionLeaveTimeout={300}
              >
                <div key={this.state.activeTrack} style={backgroundImageStyle} className="cover"></div>
              </CSSTransitionGroup>
              : <div
                style={{
                  'textAlign': 'center',
                  'color': 'white'
                }
                }
                className="loading">LOADING</div>
            }
          </div>
          <div className="card">
            {this.state.activeScreen === "nowPlaying" ?
              <div className="flex-wrap">
                <div className="info">
                  <div className="artist">{this.state.musicData ? this.state.musicData[this.state.activeTrack].artistName : "artist"}</div>
                  <div className="album">{this.state.musicData ? this.state.musicData[this.state.activeTrack].album : "album"}</div>
                  <div className="title">{this.state.musicData ? this.state.musicData[this.state.activeTrack].title : "title"}</div>
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
                <div onClick={this.changeSongMoment} className="progressBar">
                  <div className="actualTime">{this.formatTime(this.state.currentMusicTime)}</div>
                  <div className="totalTime">{
                    this.state.musicData && this.state.audios[this.state.activeTrack] ? this.formatTime(this.state.audios[this.state.activeTrack].duration()) : "00:00"
                  }</div>
                  <div
                    style={cmtWidthStyle}
                    className="timeProgression"
                  ></div>
                </div>
              </div>
              : renderedPlaylist ?
                // <CSSTransitionGroup
                //     transitionName = "playlist-pop"
                //     transitionEnterTimeout={500}
                //     transitionLeaveTimeout={300}
                // >
                <div key={this.state.activeTrack} className="playlist">{renderedPlaylist}</div>
                // </CSSTransitionGroup>
                : "loading"
            }
            <div onClick={this.playlistSwitch} className="playlistSwitch">{this.state.activeScreen === 'nowPlaying' ? "PLAYLIST" : 'PLAYING NOW'}</div>
            <div
              onMouseDown = {this.dragAndDrop}
              onMouseUp = {this.dragAndDrop}
              onMouseMove = {this.dragAndDrop}
              onMouseLeave = {this.dragAndDrop}
              className="volume"
            >
              <img src={musicSymbol} alt="music symobl" className="volumeIcon"></img>
              <div style={soundStyle} className="volumeProgression">
                <div className="volumePercentage">{parseInt(this.state.volume * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
