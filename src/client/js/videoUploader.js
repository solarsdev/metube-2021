const video = document.getElementById('video');

video.addEventListener('change', (event) => {
  const fileName = event.target.files[0].name;
  console.log(fileName);
});
