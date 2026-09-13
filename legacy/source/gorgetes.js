window.addEventListener('scroll', function () {
    var element = document.querySelector('.media')
    var position = element.getBoundingClientRect()
  
    // checking whether fully visible
    if (position.top < window.innerHeight && position.bottom >= 0) {
      element.classList.add('visible')
    } else {
      element.classList.remove('visible')
    }
  })

  window.addEventListener('scroll', function () {
    var element = document.querySelector('.kerdesek')
    var position = element.getBoundingClientRect()
  
    // checking whether fully visible
    if (position.top < window.innerHeight && position.bottom >= 0) {
      element.classList.add('visible')
    } else {
      element.classList.remove('visible')
    }
  })

  window.addEventListener('scroll', function () {
    var element = document.querySelector('.szolgaltatas')
    var position = element.getBoundingClientRect()
  
    // checking whether fully visible
    if (position.top < window.innerHeight && position.bottom >= 0) {
      element.classList.add('visible')
    } else {
      element.classList.remove('visible')
    }
  })

  window.addEventListener('scroll', function () {
    var element = document.querySelector('.foglal')
    var position = element.getBoundingClientRect()
  
    // checking whether fully visible
    if (position.top < window.innerHeight && position.bottom >= 0) {
      element.classList.add('visible')
    } else {
      element.classList.remove('visible')
    }
  })