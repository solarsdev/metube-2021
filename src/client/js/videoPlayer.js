const video = document.querySelector('video');
const muteBtn = document.getElementById('mute');
const playBtn = document.getElementById('play');
const time = document.getElementById('time');
const volumeRange = document.getElementById('volume');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const timeline = document.getElementById('timeline');
const fullscreenBtn = document.getElementById('fullscreen');
const videoContainer = document.getElementById('videoContainer');

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = () => {
  video.paused ? video.play() : video.pause();
  playBtn.innerText = video.paused ? 'Play' : 'Pause';
};

const handleMuteClick = () => {
  video.muted = !video.muted;
  muteBtn.innerHTML = video.muted ? 'Unmute' : 'Mute';
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;

  if (video.muted) {
    video.muted = false;
    muteBtn.innerHTML = 'Mute';
  }

  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);
const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = video.duration + 0.1;
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = video.currentTime;
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullscreenClick = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullscreenBtn.innerText = 'Enter Full Screen';
  } else {
    videoContainer.requestFullscreen();
    fullscreenBtn.innerText = 'Exit Full Screen';
  }
};

playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMuteClick);
volumeRange.addEventListener('input', handleVolumeChange);
video.addEventListener('loadedmetadata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
timeline.addEventListener('input', handleTimelineChange);
fullscreenBtn.addEventListener('click', handleFullscreenClick);

if (video.readyState == 4) {
  handleLoadedMetadata();
}
