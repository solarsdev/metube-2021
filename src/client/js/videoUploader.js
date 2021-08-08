const video = document.getElementById('video');
const videoUploadFilename = document.getElementById('video-upload__filename');
const videoUploadFilesize = document.getElementById('video-upload__filesize');

video.addEventListener('change', (event) => {
  let { name, size } = event.target.files[0];
  const [filename, ext] = name.split('.');
  if (filename.length > 20) {
    name = `${filename.substr(0, 15)}...${filename.substr(-5)}.${ext}`;
  }
  videoUploadFilename.innerText = name;
  videoUploadFilesize.innerText = (size / 1024 / 1024).toFixed(1);
  videoUploadFilesize.classList.remove('hide');
});
