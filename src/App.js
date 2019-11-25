import React, {Component} from 'react'
import p5 from 'p5'
import 'p5/lib/addons/p5.sound';
import * as Vibrant from 'node-vibrant'

import musicDataJSON from './musicData.json'

import './App.css';
import { wrap } from 'module';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      visualizer : "",
      visRadius : 100,
      musicData : "",
      canvasSize : {
        width : 500,
        height : 500
      },
      fileIsLoaded : false,
      activeTrack :  0,
      activeScreen : "nowPlaying",
      currentMusicTime : 0,
     }
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

  audios = []
  sketch = p => {
    let fft
    let spectrum
    let waveform

    p.preload = () => {
      this.state.musicData.tracks.forEach(track => {
        this.audios.push(p.loadSound(track.file))
      })
    }

    p.setup = () => {
      this.setState({ fileIsLoaded: true })
      p.createCanvas(p.windowWidth / 5, p.windowWidth / 5).parent('visualizer')
      // this.audios[this.state.activeTrack].loop()
      fft = new p5.FFT(0.9, 256)
      p.frameRate(60)
    }

    p.draw = () => {
      p.angleMode(p.DEGREES)
      p.background(255)
      // noStroke()
      spectrum = fft.analyze()
      waveform = fft.waveform()
      p.translate(this.state.canvasSize.width / 2, this.state.canvasSize.height / 2);
      p.beginShape()
      if (spectrum[spectrum.length - 1] === 0) p.vertex(this.state.visRadius, 0)
      spectrum.forEach((value, index) => {
        let angle = p.map(index, 0, spectrum.length, 0, 361)
        let waveformMultiplier = p.map(waveform[index], -1, 1, 1, 1.05)
        let minimum = this.state.visRadius * waveformMultiplier
        let valueCopy = p.map(value, 0, 255, minimum, 270)
        let cosVal = valueCopy * p.cos(angle)
        let sinVal = valueCopy * p.sin(angle)
        p.vertex(cosVal, sinVal)
        // line(0, 0, cosVal, sinVal)
      })
      p.endShape()
    }
  }

  toggleAudio = () => {
    this.state.fileIsLoaded & this.audios[this.state.activeTrack].isPlaying() ? this.audios[this.state.activeTrack].pause() : this.audios[this.state.activeTrack].loop()
  }

  changeSong(direction){
    let canChangePrevious = direction === "previous" && this.state.activeTrack >= 1
    let canChangeNext = direction === "next" && this.state.activeTrack < this.state.musicData.tracks.length - 1
    this.setState(prevState => {
      if (canChangePrevious) {
        return { activeTrack: prevState.activeTrack-1 };
      } else if (this.state.musicData) {
        if (canChangeNext) {
          console.log(" ??? ");    
          return { activeTrack: prevState.activeTrack+1 };
        }
      }
    })

    // c'est ghetto mais jsp pas pourquoi il y a un délai sur la modif de state au dessus
    if (canChangeNext || canChangePrevious) {
      console.log("?")
      this.audios.forEach((audio, index) => {
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
      if (this.audios[this.state.activeTrack] && this.audios[this.state.activeTrack].isPlaying()) { 
        this.setState({ currentMusicTime: parseInt(this.audios[this.state.activeTrack].currentTime()) });
      }
    }, 1000);    

    // this.getSongsDuration() // need to get all audio files first for this fn to work
  }

  componentWillUnmount(){
    clearInterval(this.interval)
  }


  playlistSwitch = () => {
    if (this.state.activeScreen === "nowPlaying") {
      this.setState({ activeScreen: "playlist" });
    } else {
      this.setState({ activeScreen: "nowPlaying" });
    }
  }


  render() { 
    let backgroundImageStyle
    let barWidth
    if (this.state.musicData.tracks) {
      backgroundImageStyle = {
        'backgroundImage' : this.state.musicData.tracks[this.state.activeTrack].cover,
      }
      if (this.audios[this.state.activeTrack]) {
        barWidth = {
          'width' : parseInt((this.state.currentMusicTime / this.audios[this.state.activeTrack].duration())*100) + "%"
        }
      }
    }
    let renderedPlaylist
    if (this.state.musicData.tracks) {
      renderedPlaylist = this.state.musicData.tracks.map( (track, index) =>
        <div key={index} className="playlistElement">
          <div className="left">
            <div className="artist">{track.artistName + " - "}</div>
            <div className="title">{track.title}</div>
          </div>
          <div className="duration">{this.audios[index] ? this.formatTime(this.audios[index].duration()) : track.duration}</div>
          {(index === this.state.activeTrack) ? <div style={barWidth} className="timeProgression"></div> : ""}
        </div>
      )
    }
    
    return ( 
      <div className="container">
        <div className="background">
          <div style = {backgroundImageStyle} className="bgImage"></div>
          <div className="bgFilter"></div>
        </div>
        <div className="musicPlayer">
          <div id="visualizer"></div>
          <div className="card">
              {this.state.activeScreen === "nowPlaying" ?
              <div className="flex-wrap">
                <div className="info">
                  <div className="artist">{this.state.musicData ? this.state.musicData.tracks[this.state.activeTrack].artistName : "artist"}</div>
                  <div className="album">{this.state.musicData ? this.state.musicData.tracks[this.state.activeTrack].album : "album"}</div>
                  <div className="title">{this.state.musicData ? this.state.musicData.tracks[this.state.activeTrack].title : "title"}</div>
                </div>
                <div className="controls">
                  <div onClick={()=> {this.changeSong("previous")}} className="before">before</div>
                  <div onClick={this.toggleAudio} className="playPause"> {this.state.fileIsLoaded ? "play" : "loading"}</div>      
                  <div onClick={()=> {this.changeSong("next")}} className="next">next</div>
                </div>
                <div className="progressBar">
                  <div className="actualTime">{this.formatTime(this.state.currentMusicTime)}</div>
                  <div className="totalTime">{
                  this.state.musicData.tracks && this.audios[this.state.activeTrack] ?  this.formatTime(this.audios[this.state.activeTrack].duration()) : "00:00"
                  }</div>
                  <div
                    style={barWidth}
                    className="timeProgression"
                  ></div>
                </div>
              </div>
              : renderedPlaylist ?
                <div className="playlist">{renderedPlaylist}</div>
               : "loading"
              }
            <div onClick = {this.playlistSwitch} className="playlistSwitch">{this.state.activeScreen === 'nowPlaying' ? "PLAYLIST" : 'PLAYING NOW'}</div>
            <div className="volume">
              <div className="volumeIcon">VOL</div>
              <div className="volumeProgression">
                <div className="volumePercentage">72%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
     );
  }
}
 
export default App ;
