document.addEventListener('DOMContentLoaded', () => {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, { edge: 'right' });
});

let ptop = 30;
let pleft = 30;
let pwidth = 800;
let pheight = 600;

const playerDOM = document.querySelector('#modal-player');

document.addEventListener('click', event => {
  if (event.target != playerDOM) {
    playerDOM.style.display = 'none';
  }
});

// popup 노출
document.addEventListener('DOMContentLoaded', () => {
  const player = playerDOM;
  // const instances = M.Modal.init(player, options);
  // instances.open();

  $('.video-js').width(pwidth).height(pheight);
  $(player)
    .offset({ top: ptop, left: pleft })
    .width(pwidth)
    .height(pheight)
    .draggable(true);
});

let totalRT = [];

let player = videojs(document.querySelector('.video-js'), {
  inactivityTimeout: 0,
  autoplay: true,
});

function getTargetInfo() {
  let refTimestamp =
    new Date(new Date().toDateString()).getTime() + 6 * 60 * 60 * 1000; // 06시 시작 기준
  let curTimestamp = new Date().getTime();
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