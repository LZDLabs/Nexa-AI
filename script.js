const startButton = document.getElementById('startButton');
const heroButton = document.getElementById('heroButton');

function startNexa() {
  document.querySelector('#features').scrollIntoView({ behavior: 'smooth' });
}

startButton.addEventListener('click', startNexa);
heroButton.addEventListener('click', startNexa);
