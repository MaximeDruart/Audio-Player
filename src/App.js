import React, {Component} from 'react'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound';
import * as Vibrant from 'node-vibrant'
import musicDataJSON from './musicData.json'
import './App.css';
import playButton from './play.svg'
import pauseButton from './pause.svg'
import musicSymbol from './music.svg'
import nextSymbol from './next.svg'
import {CSSTransitionGroup} from 'react-transition-group'


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      visualizer : "",
      visRadius : 100,
      musicData : "",
      canvasSize : {
        width : "",
        height : ""
      },
      fileIsLoaded : false,
      activeTrack :  0,
      activeScreen : "nowPlaying",
      currentMusicTime : 0,
      volume : 0.5,
      audios:[],
     }
     this.$visualizer = React.createRef()
     this.audios = []
     this.covers = []
  }


  formatTime = string => {
    string = parseInt(string)
    let min = (parseInt(string / 60))
    min = min < 10 ? "0" + min.toString() : min.toString()
    let second = string - min*60
    second = second < 10 ? "0" + second.toString() : second.toString()
    return min + ":"+ second
  }

  getSongsDuration = () => {
    let tempData = this.state.musicData
    this.state.musicData.tracks.forEach((track, index) => {
      let audio = new Audio(tempData.tracks[index].file)
      tempData.tracks[index].duration = audio.duration
    })
    this.setState({ musicData: tempData });
  }

  getData =() => {
    // wanted to do an api call but couldn't find an api that'd give me audio files...
    this.setState({ musicData : musicDataJSON });
  }


  sketch = p => {
    let fft
    let spectrum
    let waveform

    p.preload = () => {
      this.state.musicData.tracks.forEach(track => {
        this.audios.push(p.loadSound(track.file))
        this.covers.push(p.loadImage(track.cover))
      })
    }

    p.setup = () => {      
      this.setState({ fileIsLoaded: true, audios:this.audios })
      let {width, height} = this.$visualizer.current.getBoundingClientRect()
      this.setState({ canvasSize: {width : width, height : height} });
      p.createCanvas(width, height).parent('visualizer')
      fft = new p5.FFT(0.9, 256)
      p.frameRate(60)
    }

    p.draw = () => {
      p.angleMode(p.DEGREES)
      p.background(255)
      spectrum = fft.analyze()
      waveform = fft.waveform()
      p.translate(this.state.canvasSize.width / 2, this.state.canvasSize.height / 2);
      p.beginShape()
      if (spectrum[spectrum.length - 1] === 0) p.vertex(this.state.visRadius, 0)
      spectrum.forEach((value, index) => {
        let angle = p.map(index, 0, spectrum.length, 0, 360)
        let waveformMultiplier = p.map(waveform[index], -1, 1, 1, 1.05)
        let minimum = this.state.visRadius * waveformMultiplier
        let valueCopy = p.map(value, 0, 255, minimum, 270)
        let cosVal = valueCopy * p.cos(angle)
        let sinVal = valueCopy * p.sin(angle)
        p.vertex(cosVal, sinVal)
        // line(0, 0, cosVal, sinVal)
        // p.fill("red")
        // p.rect(0, 0, 10, valueCopy)
        // p.rotate(angle)
      })
      p.endShape()
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

  changeVolume = event => {
    let {target, clientY} = event
    let {height, y} = target.getBoundingClientRect()
    let relativePos =  clientY - y
    relativePos /= height
    relativePos = 1 - relativePos
    this.setState({ volume: relativePos });
    this.state.audios[this.state.activeTrack].setVolume(relativePos)
  }

  changeSong(direction){
    let canChangePrevious = direction === "previous" && this.state.activeTrack >= 1
    let canChangeNext = direction === "next" && this.state.activeTrack < this.state.musicData.tracks.length - 1
    this.setState(prevState => {
      if (canChangePrevious) {
        return { activeTrack: prevState.activeTrack-1 };
      } else if (this.state.musicData) {
        if (canChangeNext) {
          return { activeTrack: prevState.activeTrack+1 };
        }
      }
    })

    // c'est ghetto mais jsp pas pourquoi il y a un délai sur la modif de state au dessus
    if (canChangeNext || canChangePrevious) {
      this.state.audios.forEach((audio, index) => {
        if (canChangeNext) {
          if (index !== this.state.activeTrack+1) {
            audio.jump(0)
            audio.stop()
          } else {
            audio.jump(0)
            audio.play()
          }
        }
        if (canChangePrevious) {
          if (index !== this.state.activeTrack-1) {
            audio.jump(0)
            audio.stop()
          } else {
            audio.jump(0)
            audio.play()
          }
        }
      })
    }
  }
  

  interval
  componentDidMount() {
    this.setState({ visualizer: new p5(this.sketch) });
    this.getData()

    this.interval = setInterval(() => {
      if (this.state.audios[this.state.activeTrack] && this.state.audios[this.state.activeTrack].isPlaying()) { 
        this.setState({ currentMusicTime: parseInt(this.state.audios[this.state.activeTrack].currentTime()) });
      }
    }, 1000);    

    // this.getSongsDuration() // need to get all audio files first for this fn to work
  }

  componentWillUnmount(){
    // clearInterval(this.interval)
  }


  playlistSwitch = () => {
    if (this.state.activeScreen === "nowPlaying") {
      this.setState({ activeScreen: "playlist" });
    } else {
      this.setState({ activeScreen: "nowPlaying" });
    }
  }

  keyboardEventsHandler = () => {
    document.addEventListener('keyboard', event => {
      switch (event.code) {
        case "arrowRight":
          
          break;
      
        case "arrowLeft":

          break;

        case "arrowUp":
          break;
        case "arrowDown":
          break;
        default:
          break;
      }
    })
  }


  render() { 
    let backgroundImageStyle
    let barWidthStyle
    let soundStyle
    let soundTransformValue = 50
    if (this.state.musicData.tracks) {      
      backgroundImageStyle = {
        'backgroundImage' : `url(${this.state.musicData.tracks[this.state.activeTrack].cover})`,
        backgroundSize : 'cover',
        backgroundPosition : 'center center'
      }
      if (this.state.audios[this.state.activeTrack]) {
        barWidthStyle = {
          'width' : parseInt((this.state.currentMusicTime / this.state.audios[this.state.activeTrack].duration())*100) + "%"
        }
        soundTransformValue = -(1 - this.state.volume)*100
        soundStyle = {
          'transform' : `rotate(180deg) translateY(${soundTransformValue}%)`,
          'transition' : 'transform 0.3s ease-in-out'
        }
      }
    }
    let renderedPlaylist
    if (this.state.musicData.tracks) {
      renderedPlaylist = this.state.musicData.tracks.map( (track, index) =>
      <div key={index} className="playlistElement">
        <img
          onClick={()=> {this.toggleAudio(index)}}
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
          {(index === this.state.activeTrack) ? <div style={barWidthStyle} className="timeProgression"></div> : ""}
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
            <div key={this.state.activeTrack} style ={backgroundImageStyle} className="bgImage"></div>
          </CSSTransitionGroup>
          <div className="bgFilter"></div>
        </div>
        <div className="musicPlayer">
          <div ref={this.$visualizer} id="visualizer"></div>
          <div className="card">
              {this.state.activeScreen === "nowPlaying" ?
              <div className="flex-wrap">
                <div className="info">
                  <div className="artist">{this.state.musicData ? this.state.musicData.tracks[this.state.activeTrack].artistName : "artist"}</div>
                  <div className="album">{this.state.musicData ? this.state.musicData.tracks[this.state.activeTrack].album : "album"}</div>
                  <div className="title">{this.state.musicData ? this.state.musicData.tracks[this.state.activeTrack].title : "title"}</div>
                </div>
                <div className="controls">
                  <img alt="before-button" src={nextSymbol} onClick={()=> {this.changeSong("previous")}} className="before"></img>
                  <img
                    src={this.state.fileIsLoaded ? (this.state.audios[this.state.activeTrack].isPlaying() ? pauseButton : playButton) : playButton}
                    onClick={()=>{this.toggleAudio()}}
                    className="playPause"
                    alt="play music"
                  ></img>      
                  <img alt="next-button" src={nextSymbol} onClick={()=> {this.changeSong("next")}} className="next"></img>
                </div>
                <div className="progressBar">
                  <div className="actualTime">{this.formatTime(this.state.currentMusicTime)}</div>
                  <div className="totalTime">{
                  this.state.musicData.tracks && this.state.audios[this.state.activeTrack] ?  this.formatTime(this.state.audios[this.state.activeTrack].duration()) : "00:00"
                  }</div>
                  <div
                    style={barWidthStyle}
                    className="timeProgression"
                  ></div>
                </div>
              </div>
              : renderedPlaylist ?
               <div className="playlist">{renderedPlaylist}</div>
               : "loading"
              }
            <div onClick = {this.playlistSwitch} className="playlistSwitch">{this.state.activeScreen === 'nowPlaying' ? "PLAYLIST" : 'PLAYING NOW'}</div>
            <div onClick={this.changeVolume} className="volume">
              <img src={musicSymbol} alt="music symobl" className="volumeIcon"></img>
              <div style={soundStyle} className="volumeProgression">
                <div className="volumePercentage">{parseInt(this.state.volume*100)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
     );
  }
}
 
export default App ;
