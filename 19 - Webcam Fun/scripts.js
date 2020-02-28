const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

const toggleStreamButton = document.querySelector('#toggleStream');


function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      console.log(localMediaStream);          
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => {
      console.error(`OH NO!!!`, err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);    
    let pixels = ctx.getImageData(0, 0, width, height);
    mirrorFrame(pixels, width, height);
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

// TODO: 
// - edge detection greyscale
// - edge detection colored
// - feature detection
// - randomly connect features with lines
function mirrorFrame(pixels, width, height) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width / 2; x++) {

      let start = y * width * 4 + x * 4;
      let g = 0.21 * pixels.data[start] + 0.72 * pixels.data[start + 1] + 0.07 * pixels.data[start + 2];
      pixels.data[start] = g;
      pixels.data[start + 1] = g;
      pixels.data[start + 2] = g;

      for (let c = 0; c < 4; c++) {
        let ix_from = y * width * 4 + x * 4 + c;
        let ix_to = y * width * 4 + (width - x) * 4 + c;
        let swp = pixels.data[ix_to];
        pixels.data[ix_to] = pixels.data[ix_from];
        pixels.data[ix_from] = swp;
      }
    }
  }
}


function takePhoto() {
  // played the sound
  snap.currentTime = 0;
  snap.play();

  // take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  strip.insertBefore(link, strip.firstChild);
}


getVideo();

let intervalHandle = false;


toggleStreamButton.addEventListener('click', () => {
  if (!intervalHandle) {    
    intervalHandle = paintToCanvas();
  } else {
    clearInterval(intervalHandle);
    intervalHandle = false;
  }
});

