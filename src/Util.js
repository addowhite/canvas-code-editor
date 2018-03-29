(() => {

  function debounce(func, waitPeriod) {
    let timeout;
    return function() {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(func, waitPeriod)
    }
  }

  Swish.util = {}
  Swish.util.debounce = debounce

})()
