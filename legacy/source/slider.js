
var slideIndex = 0;
carousel();

function carousel() {
  var i;
  var x = document.getElementsByClassName("mySlides");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > x.length) {slideIndex = 1}
  x[slideIndex-1].style.display = "block";
  setTimeout(carousel, 2000); // Change image every 2 seconds
}

var slideIndex = 0;
carousel2();

function carousel2() {
  var i;
  var x = document.getElementsByClassName("mySlides2");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > x.length) {slideIndex = 1}
  x[slideIndex-1].style.display = "block";
  setTimeout(carousel2, 2000); // Change image every 2 seconds
}

var slideIndex = 0;
carousel3();

function carousel3() {
  var i;
  var x = document.getElementsByClassName("mySlides3");
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > x.length) {slideIndex = 1}
  x[slideIndex-1].style.display = "block";
  setTimeout(carousel3, 2000); // Change image every 2 seconds
}


window.addEventListener('scroll', function () {
  var element = document.querySelector('.citroen')
  var position = element.getBoundingClientRect()

  // checking whether fully visible
  if (position.top < window.innerHeight && position.bottom >= 0) {
    element.classList.add('visible')
  } else {
    element.classList.remove('visible')
  }
})

window.addEventListener('scroll', function () {
  var element = document.querySelector('.ford')
  var position = element.getBoundingClientRect()

  // checking whether fully visible
  if (position.top < window.innerHeight && position.bottom >= 0) {
    element.classList.add('visible')
  } else {
    element.classList.remove('visible')
  }
})