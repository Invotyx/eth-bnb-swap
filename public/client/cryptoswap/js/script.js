let toggle = () => {
  let element = document.getElementById('connectButtonDiv');

  let hidden = element.getAttribute('hidden');
  if (hidden) {
    element.removeAttribute('hidden');
  } else {
    element.setAttribute('hidden', 'hidden');
  }

  let element2 = document.getElementById('main-Body');

  let hidden2 = element2.getAttribute('hidden');

  if (hidden2) {
    element2.removeAttribute('hidden');
  }
};
