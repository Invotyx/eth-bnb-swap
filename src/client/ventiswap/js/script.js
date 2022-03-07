let click = document.querySelectorAll('.click');
var clicked = false;
click.forEach((e) => {
  e.addEventListener('click', function () {
    if (clicked) return false;
    console.log(clicked);

    clicked = true;
    document.querySelector('.coming').classList.add('coming-translate');
    setTimeout(function () {
      clicked = false;
      document.querySelector('.coming').classList.remove('coming-translate');
    }, 2000);
  });
});
