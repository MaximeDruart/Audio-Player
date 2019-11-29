(this["webpackJsonpaudio-player"]=this["webpackJsonpaudio-player"]||[]).push([[0],{10:function(t,e,a){t.exports=a.p+"static/media/play.7cb817fa.svg"},220:function(t,e,a){},233:function(t,e,a){"use strict";a.r(e);var i=a(0),s=a.n(i),n=a(41),o=a.n(n),c=(a(96),a(75)),r=a(76),u=a(89),l=a(77),m=a(90),v=a(22),d=a.n(v),h=(a(97),a(78)),g=a(79),p=(a(220),a(10)),f=a.n(p),S=a(42),k=a.n(S),T=a(80),E=a.n(T),y=a(43),N=a.n(y),b=a(81),w=a.n(b),C=a(82),D=a.n(C),x=a(83),I=a.n(x),j=a(84),P=a.n(j),z=a(85),L=a.n(z),R=a(86),A=a.n(R),M=a(87),O=a.n(M),B=a(88),G=a.n(B),J=a(44),V=function(t){function e(t){var a;return Object(c.a)(this,e),(a=Object(u.a)(this,Object(l.a)(e).call(this,t))).storeState=function(){localStorage.setItem("volume",a.state.volume),localStorage.setItem("activeTrack",a.state.activeTrack)},a.setLocalStorageState=function(){localStorage.getItem("volume")&&localStorage.getItem("activeTrack")&&a.setState({volume:JSON.parse(localStorage.getItem("volume")),activeTrack:JSON.parse(localStorage.getItem("activeTrack"))}),a.state.audios&&a.state.audios.forEach((function(t){return t.setVolume(a.state.volume)}))},a.formatTime=function(t){t=parseInt(t);var e=parseInt(t/60),a=t-60*(e=e<10?"0"+e.toString():e.toString());return e+":"+(a=a<10?"0"+a.toString():a.toString())},a.getSongsDuration=function(){var t=a.state.musicData;a.state.musicData.forEach((function(e,a){var i=new Audio(t[a].file);t[a].duration=i.duration})),a.setState({musicData:t})},a.getData=function(){a.setState({musicData:g})},a.sketch=function(t){var e,i,s;t.preload=function(){a.state.musicData.forEach((function(e,i){a.audios.push(t.loadSound(a.audioSources[i])),a.covers.push(t.loadImage(a.coverSources[i]))}))},t.setup=function(){a.getCoverColor(),a.setState({fileIsLoaded:!0,audios:a.audios});var i=a.$visualizer.current.getBoundingClientRect(),s=i.width,n=i.height;a.setState({canvasSize:{width:s,height:n},visRadius:2*s/3/2}),t.createCanvas(s,n).parent("canvasContainer"),e=new d.a.FFT(.9,256),t.frameRate(60)},t.draw=function(){t.angleMode(t.DEGREES),t.clear(),t.noStroke(),i=e.analyze(),s=e.waveform(),t.translate(a.state.canvasSize.width/2,a.state.canvasSize.height/2),t.rotate(60),t.beginShape(),0===i[i.length-1]&&t.vertex(a.state.visRadius,0),i.forEach((function(e,s){var n=t.map(s,0,i.length,0,360),o=t.map(e,0,255,a.state.visRadius,.6*a.state.canvasSize.width),c=o*t.cos(n),r=o*t.sin(n);t.fill(a.state.coverColor),t.vertex(c,r)})),t.endShape(),t.beginShape(),i.forEach((function(e,n){var o=t.map(n,0,i.length,0,360),c=t.map(s[n],-1,1,1,1.05),r=a.state.visRadius*c*1.05,u=t.cos(o)*r,l=t.sin(o)*r;t.vertex(u,l),t.fill("#16191D"),t.ellipse(0,0,r,r)})),t.endShape()},t.windowResized=function(){var e=a.$visualizer.current.getBoundingClientRect(),i=e.width,s=e.height;a.setState({canvasSize:{width:i,height:s},visRadius:2*i/3/2}),t.resizeCanvas(i,s)}},a.toggleAudio=function(){var t,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"noparam";"noparam"===e?t=a.state.activeTrack:(t=e,a.setState({activeTrack:e})),a.state.audios.forEach((function(e,a){a!==t&&(e.jump(0),e.stop())})),a.state.fileIsLoaded&&a.state.audios[t]&&(a.state.audios[t].isPlaying()?(a.state.audios[t].pause(),a.setState((function(t){return{audios:t.audios}}))):(a.state.audios[t].play(),a.setState((function(t){return{audios:t.audios}}))))},a.changeVolume=function(t){var e=t.target,i=t.clientY,s=e.getBoundingClientRect(),n=s.height,o=i-s.y;o=1-(o/=n),a.setState({volume:o}),a.state.audios.forEach((function(t){t.setVolume(o)}))},a.getCoverColor=function(){h.from(a.coverSources[a.state.activeTrack]).getPalette().then((function(t){return a.setState({coverColor:t.LightVibrant.getRgb()})}))},a.changeSongMoment=function(t){var e=t.target,i=t.clientX,s=e.getBoundingClientRect(),n=s.width,o=i-s.x;o/=n,a.state.audios[a.state.activeTrack]&&(a.state.audios[a.state.activeTrack].stop(),setTimeout((function(){var t=parseInt(o*a.state.audios[a.state.activeTrack].duration());a.setState({currentMusicTime:t}),a.state.audios[a.state.activeTrack].jump(t),a.state.audios[a.state.activeTrack].fade(a.state.volume,2)}),10))},a.playlistSwitch=function(){"nowPlaying"===a.state.activeScreen?a.setState({activeScreen:"playlist"}):a.setState({activeScreen:"nowPlaying"})},a.keyboardEventsHandler=function(){window.addEventListener("keydown",(function(t){if(a.state.audios[a.state.activeTrack])switch(t.code){case"Space":a.toggleAudio();break;case"ArrowRight":a.changeSong("next");break;case"ArrowLeft":a.changeSong("previous");break;case"ArrowUp":a.state.volume>=.95?a.setState({volume:1}):a.setState((function(t){return{volume:t.volume+.05}}));break;case"ArrowDown":a.state.volume<=.05?a.setState({volume:0}):a.setState((function(t){return{volume:t.volume-.05}}))}}))},a.state={visualizer:"",visRadius:"",musicData:"",canvasSize:{width:"",height:""},fileIsLoaded:!1,activeTrack:0,activeScreen:"nowPlaying",currentMusicTime:0,volume:.4,audios:[],coverColor:"white"},a.$visualizer=s.a.createRef(),a.audios=[],a.covers=[],a.coverSources=[w.a,D.a,I.a,P.a],a.audioSources=[L.a,A.a,O.a,G.a],a}return Object(m.a)(e,t),Object(r.a)(e,[{key:"changeSong",value:function(t){var e=this;if(this.state.currentMusicTime>3&&"previous"===t)return this.state.audios[this.state.activeTrack].stop(),void setTimeout((function(){e.setState({currentMusicTime:0}),e.state.audios[e.state.activeTrack].jump(0)}),10);var a="previous"===t&&this.state.activeTrack>=1,i="next"===t&&this.state.activeTrack<this.state.musicData.length-1;this.setState((function(t){return a?{activeTrack:t.activeTrack-1}:e.state.musicData&&i?{activeTrack:t.activeTrack+1}:void 0})),setTimeout((function(){(i||a)&&(e.getCoverColor(),e.state.audios.forEach((function(t,s){i?s!==e.state.activeTrack?(t.jump(0),t.stop()):(t.jump(0),t.fade(e.state.volume,5)):a&&(s!==e.state.activeTrack?(t.jump(0),t.stop()):(t.jump(0),t.fade(e.state.volume,5)))})))}),10)}},{key:"componentDidMount",value:function(){var t=this;this.setLocalStorageState(),this.getData(),this.setState({visualizer:new d.a(this.sketch)}),this.keyboardEventsHandler(),this.interval=setInterval((function(){t.state.audios[t.state.activeTrack]&&t.state.audios[t.state.activeTrack].isPlaying()&&t.setState({currentMusicTime:parseInt(t.state.audios[t.state.activeTrack].currentTime())})}),10)}},{key:"componentWillUnmount",value:function(){}},{key:"componentDidUpdate",value:function(t,e){this.storeState()}},{key:"render",value:function(){var t,e,a,i,n=this,o=50;return this.state.musicData&&(t={backgroundImage:"url(".concat(this.coverSources[this.state.activeTrack],")"),backgroundSize:"cover",backgroundPosition:"center center"},this.state.audios[this.state.activeTrack]&&(e={width:parseInt(this.state.currentMusicTime/this.state.audios[this.state.activeTrack].duration()*100)+"%"},o=100*-(1-this.state.volume),a={transform:"rotate(180deg) translateY(".concat(o,"%)"),transition:"transform 0.3s ease-in-out"})),this.state.musicData&&(i=this.state.musicData.map((function(t,a){return s.a.createElement("div",{key:a,className:"playlistElement"},s.a.createElement("img",{onClick:function(){n.toggleAudio(a)},alt:"cover",src:n.state.audios[a]&&n.state.audios[a].isPlaying()?k.a:f.a,className:"playButton"}),s.a.createElement("div",{className:"playlistWrap"},s.a.createElement("div",{className:"left"},s.a.createElement("div",{className:"artist"},t.artistName+" - "),s.a.createElement("div",{className:"title"},t.title)),s.a.createElement("div",{className:"duration"},n.state.audios[a]?n.formatTime(n.state.audios[a].duration()):t.duration),a===n.state.activeTrack?s.a.createElement("div",{style:e,className:"timeProgression"}):""))}))),s.a.createElement("div",{className:"container"},s.a.createElement("div",{className:"background"},s.a.createElement(J.CSSTransitionGroup,{transitionName:"bgTransition",transitionEnterTimeout:300,transitionLeaveTimeout:300},s.a.createElement("div",{key:this.state.activeTrack,style:t,className:"bgImage"})),s.a.createElement("div",{className:"bgFilter"})),s.a.createElement("div",{className:"musicPlayer"},s.a.createElement("div",{className:"visualizer"},s.a.createElement("div",{ref:this.$visualizer,id:"canvasContainer"}),this.state.fileIsLoaded&&this.state.audios[this.state.activeTrack]?s.a.createElement(J.CSSTransitionGroup,{transitionName:"cover",transitionAppear:!0,transitionAppearTimeout:500,transitionEnterTimeout:300,transitionLeaveTimeout:300},s.a.createElement("div",{key:this.state.activeTrack,style:t,className:"cover"})):s.a.createElement("div",{style:{textAlign:"center",color:"white"},className:"loading"},"LOADING")),s.a.createElement("div",{className:"card"},"nowPlaying"===this.state.activeScreen?s.a.createElement("div",{className:"flex-wrap"},s.a.createElement("div",{className:"info"},s.a.createElement("div",{className:"artist"},this.state.musicData?this.state.musicData[this.state.activeTrack].artistName:"artist"),s.a.createElement("div",{className:"album"},this.state.musicData?this.state.musicData[this.state.activeTrack].album:"album"),s.a.createElement("div",{className:"title"},this.state.musicData?this.state.musicData[this.state.activeTrack].title:"title")),s.a.createElement("div",{className:"controls"},s.a.createElement("img",{alt:"before-button",src:N.a,onClick:function(){n.changeSong("previous")},className:"before"}),s.a.createElement("img",{src:this.state.fileIsLoaded&&this.state.audios[this.state.activeTrack].isPlaying()?k.a:f.a,onClick:function(){n.toggleAudio()},className:"playPause",alt:"play music"}),s.a.createElement("img",{alt:"next-button",src:N.a,onClick:function(){n.changeSong("next")},className:"next"})),s.a.createElement("div",{onClick:this.changeSongMoment,className:"progressBar"},s.a.createElement("div",{className:"actualTime"},this.formatTime(this.state.currentMusicTime)),s.a.createElement("div",{className:"totalTime"},this.state.musicData&&this.state.audios[this.state.activeTrack]?this.formatTime(this.state.audios[this.state.activeTrack].duration()):"00:00"),s.a.createElement("div",{style:e,className:"timeProgression"}))):i?s.a.createElement("div",{key:this.state.activeTrack,className:"playlist"},i):"loading",s.a.createElement("div",{onClick:this.playlistSwitch,className:"playlistSwitch"},"nowPlaying"===this.state.activeScreen?"PLAYLIST":"PLAYING NOW"),s.a.createElement("div",{onClick:this.changeVolume,className:"volume"},s.a.createElement("img",{src:E.a,alt:"music symobl",className:"volumeIcon"}),s.a.createElement("div",{style:a,className:"volumeProgression"},s.a.createElement("div",{className:"volumePercentage"},parseInt(100*this.state.volume),"%"))))))}}]),e}(i.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(s.a.createElement(V,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()}))},42:function(t,e,a){t.exports=a.p+"static/media/pause.a83244f8.svg"},43:function(t,e,a){t.exports=a.p+"static/media/next.b4705597.svg"},79:function(t){t.exports=JSON.parse('[{"cover":"covers/cover01.jpg","file":"audios/audio01.mp3","artistName":"evigt morker","title":"h\xf6gre","album":"1"},{"cover":"covers/cover02.jpg","file":"audios/audio02.mp3","artistName":"park hye jin","title":"be a star","album":"Untitled"},{"cover":"covers/cover03.jpg","file":"audios/audio03.mp3","artistName":"kokoroko","title":"abusey junction","album":"we out here"},{"cover":"covers/cover04.jpg","file":"audios/audio04.mp3","artistName":"hiroshi yoshimura","title":"blink","album":"music for nine postcards"}]')},80:function(t,e,a){t.exports=a.p+"static/media/music.40b86523.svg"},81:function(t,e,a){t.exports=a.p+"static/media/cover01.1845849d.jpg"},82:function(t,e,a){t.exports=a.p+"static/media/cover02.19f85108.jpg"},83:function(t,e,a){t.exports=a.p+"static/media/cover03.83d85b4c.jpg"},84:function(t,e,a){t.exports=a.p+"static/media/cover04.b93229bb.jpg"},85:function(t,e,a){t.exports=a.p+"static/media/audio01.29e6d449.mp3"},86:function(t,e,a){t.exports=a.p+"static/media/audio02.5e067a43.mp3"},87:function(t,e,a){t.exports=a.p+"static/media/audio03.3314f366.mp3"},88:function(t,e,a){t.exports=a.p+"static/media/audio04.4c6da638.mp3"},91:function(t,e,a){t.exports=a(233)},96:function(t,e,a){}},[[91,1,2]]]);
//# sourceMappingURL=main.14045c82.chunk.js.map