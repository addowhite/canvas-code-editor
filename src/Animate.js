(() => {

  const Easing = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => --t * t * t + 1,
    easeInOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInQuart: t => t * t * t * t,
    easeOutQuart: t => 1 - --t * t * t * t,
    easeInOutQuart: t => t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
    easeInQuint: t => t * t * t * t * t,
    easeOutQuint: t => 1 + --t * t * t * t * t,
    easeInOutQuint: t => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
  }

  function interpolate(startValue, endValue, startTime, duration, easingFunction) {
    return startValue + (endValue - startValue) * Easing[easingFunction]((performance.now() - startTime) / duration)
  }

  function animate(startVal, endVal, duration, easingFunction, callback) {

    let cancel = false
    let startTime = performance.now()
    let endTime = startTime + duration

    let update = timestamp => {
      if (cancel) { return }
      callback(interpolate(startVal, endVal, startTime, duration, easingFunction))
      if (timestamp < endTime)
        window.requestAnimationFrame(update)
    }

    window.requestAnimationFrame(update)

    return {
      cancel: () => {
        cancel = true
        callback(endVal)
      }
    }

  }

  Swish.animate = animate

})()