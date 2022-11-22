document.addEventListener('DOMContentLoaded', () => {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, { edge: 'right' });
});

const did = 1;

const playerDOM = document.querySelector('#modal-player');

document.addEventListener('click', event => {
  console.log(event.target.contains(playerDOM));
  if (event.target === playerDOM ? true : event.target.contains(playerDOM)) {
    playerDOM.style.display = 'none';
  }
});

const observer = new ResizeObserver(entries => {
  for (let entry of entries) {
    const { width, height } = entry.contentRect;
    $('.video-js').width(width).height(height);
    console.log('observer', width, height);
  }
});

observer.observe(playerDOM);

// popup 노출
const initPlayerUi = position => {
  const { width, height, ...offset } = position;
  console.log(position);
  $(playerDOM)
    .offset(offset)
    .width(width)
    .height(height)
    .draggable({
      cursor: 'crosshair',
      stop: function (event, ui) {
        position = {
          width: ui.helper.width(),
          height: ui.helper.height(),
          ...ui.offset,
        };
        postPlayerUi(player.deviceId, position);
      },
    })
    .resizable({
      stop: function (event, ui) {
        position = {
          ...ui.size,
          ...ui.position,
        };
        postPlayerUi(player.deviceId, position);
      },
    });
};

let totalRT = [];

let player = videojs(document.querySelector('.video-js'), {
  inactivityTimeout: 0,
  autoplay: true,
});

player.ready(function () {
  console.log('player ready');
  this.deviceId = did;
  getApiResponses(this.deviceId);
  this.volume(0);
});

player.on('play', async function () {
  const playlist = this.playlist();
  const currentIdx = this.playlist.currentIndex();
  const targetIdx = (currentIdx + 1) % playlist.length;

  if (playlist[targetIdx].isHivestack === 'Y') {
    const hivestackInfo = await getUrlFromHS(this.screen);
    if (hivestackInfo.success) {
      playlist[targetIdx].sources[0].src = hivestackInfo.videoUrl;
      playlist[targetIdx].reportUrl = hivestackInfo.reportUrl;
      playlist[targetIdx].report.HIVESTACK_URL = hivestackInfo.videoUrl;
    } else {
      playlist.splice(targetIdx, 1);
    }
  }

  this.playlist(playlist, currentIdx);
});

const initPlayerPlaylist = (player, playlist, screen) => {
  console.log('initPlayerPlaylist');
  totalRT = playlist.map(v => {
    return parseInt(v.runningTime) * 1000;
  });
  player.screen = screen;
  player.playlist(playlist);
  player.playlist.repeat(true);
  player.playlist.autoadvance(0);

  let [idx, sec] = getTargetInfo();
  console.log(idx, sec);
  player.playlist.currentItem(idx);
  player.currentTime(sec);
  player.play();
};

const appendVideoList = videoList => {
  const parentNode = document.querySelector('#video-body');
  videoList.forEach(row => {
    const tr = document.createElement('tr');
    Object.values(row).forEach(value => {
      td = document.createElement('td');
      td.innerText = value;
      tr.appendChild(td);
    });
    parentNode.appendChild(tr);
  });
};

function getTargetInfo() {
  let _refTimestamp =
    new Date(new Date().toDateString()).getTime() + 6 * 60 * 60 * 1000; // 06시 시작 기준
  let curTimestamp = new Date().getTime();
  let refTimestamp =
    _refTimestamp > curTimestamp
      ? _refTimestamp - 24 * 60 * 60 * 1000
      : _refTimestamp;

  let totalTimestamp = totalRT.reduce((acc, cur, idx) => (acc += cur), 0);
  let targetTimestamp = (curTimestamp - refTimestamp) % totalTimestamp;

  for (let i = 0; i < totalRT.length; i++) {
    console.log([i, targetTimestamp / 1000]);
    if (targetTimestamp < totalRT[i]) {
      return [i, targetTimestamp / 1000];
    } else {
      targetTimestamp -= totalRT[i];
    }
  }
  return [0, 0];
}
