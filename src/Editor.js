const Swish = {};

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

  function debounce(func, waitPeriod) {
    let timeout;
    return function() {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(func, waitPeriod)
    }
  }

  let editorList = []

  class Document {
    constructor() {
      this.lines = []
    }
    getText() {
      return this.lines.join('\n')
    }
    setText(str) {
      this.lines = str.split(/\r|\n|\r\n/g)
    }
    getLine(index) {
      return this.lines[index]
    }
    getLines() {
      return this.lines
    }
    length() {
      return this.lines.length
    }
    forEach(func) {
      this.lines.forEach(func)
    }
  }

  class Editor {
    constructor(containerId) {
      this.settings = {
        line_height: 16,
        background_color: '#333',
        text_color: '#ccc',
        font: 'Courier New',
        zoom: 1
      }
      this.settings.scale = this.settings.zoom * (window.devicePixelRatio || 1)

      this.state = {}
      this.state.scroll = { x: 0, y: 0 }

      this.container = document.getElementById(containerId)
      let content = this.container.innerHTML
      this.container.innerHTML = ''
      this.document = new Document()

      this.canvas = this.createCanvas(this.container)
      this.context = this.canvas.getContext('2d')


      let bounds = this.canvas.getBoundingClientRect()
      this.resize(bounds.width, bounds.height, false)
      if (content.trim() !== '')
        this.setText(content)
      this.canvas.focus()

      this.context.save()
      this.context.scale(this.settings.scale, this.settings.scale)
    }
    createCanvas(container) {
      let canvas = document.createElement('canvas')
      // canvas.className = 'swish-canvas'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.outline = 'none'
      canvas.tabIndex = '1'
      container.appendChild(canvas)
      canvas.addEventListener('keydown', this.onKeyDown.bind(this))
      canvas.addEventListener('mousewheel', this.onScroll.bind(this), { passive: true }) // USE A PASSIVE EVENT LISTENER
      window.addEventListener('resize', debounce(this.onResize.bind(this), 100), { passive: true })
      return canvas;
    }
    resize(width, height, redraw = true) {
      let dpiScale = (window.devicePixelRatio || 1)
      this.canvas.width = width * dpiScale
      this.canvas.height = height * dpiScale
      if (redraw) this.renderFrame()
    }
    setText(str) {
      this.document.setText(str)
      this.renderFrame();
    }
    renderFrame() {
      this.context.font = `${this.settings['line_height']}px ${this.settings['font']}`
      this.context.textAlign = 'start'
      this.context.textBaseline = 'top'
      this.context.fillStyle = this.settings['background_color']
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.renderDocument()
    }
    renderDocument() {
      //this.document.forEach(this.renderLine.bind(this))
      this.renderVisibleLines()
    }
    renderVisibleLines() {
      // this.context.save()
      // this.context.scale(this.settings.scale, this.settings.scale)
      this.context.fillStyle = this.settings['text_color']
      let lines = this.document.getLines()
      let startIndex = Math.floor((this.state.scroll.y / this.settings.scale) / this.settings['line_height'])
      let endIndex = Math.ceil((this.canvas.height / this.settings.scale) / this.settings['line_height'])
      startIndex = Math.max(0, startIndex)
      endIndex = Math.min(lines.length - 1, endIndex)
      for (let i = startIndex; i <= endIndex; ++i)
        this.renderLine(this.document.getLine(i), i, lines)
      // this.context.restore()
    }
    renderNewlyVisibleLines(scrollPixels) {
      // this.context.save()
      // this.context.scale(this.settings.scale, this.settings.scale)
      let canvasWidth = this.canvas.width / this.settings.scale
      let canvasHeight = this.canvas.height / this.settings.scale
      let scrollY, s = this.state.scroll.y / this.settings.scale
      if (scrollPixels > 0)
        s += canvasHeight + this.settings['line_height']
      if (s > 0) {
        scrollY = s - s % this.settings['line_height']
      } else {
        scrollY = -Math.ceil(Math.abs(s) / this.settings['line_height']) * this.settings['line_height']
      }
      scrollY /= this.settings['line_height']
      let linesScrolled = Math.ceil(Math.abs(scrollPixels) / this.settings['line_height']) + 1

      if (scrollPixels > 0) {
        let clearTop = (scrollY - linesScrolled) * this.settings['line_height'] - this.state.scroll.y / this.settings.scale
        this.context.fillStyle = this.settings['background_color']
        this.context.fillRect(0, clearTop, canvasWidth, canvasHeight - clearTop)
        this.context.fillStyle = this.settings['text_color']
        for (let i = Math.max(0, scrollY - linesScrolled), l = Math.min(this.document.length(), scrollY); i < l; ++i)
          this.renderLine(this.document.getLine(i), i, this.document.getLines())
      } else {
        this.context.fillStyle = this.settings['background_color']
        this.context.fillRect(0, 0, canvasWidth, (scrollY + linesScrolled) * this.settings['line_height'] - this.state.scroll.y / this.settings.scale)
        this.context.fillStyle = this.settings['text_color']
        for (let i = Math.max(0, scrollY), l = Math.min(this.document.length(), scrollY + linesScrolled); i < l; ++i)
          this.renderLine(this.document.getLine(i), i, this.document.getLines())
      }
      // this.context.restore()
    }
    renderLine(lineContent, lineIndex, allLines) {
      if (lineContent === '') { return }
      this.context.fillText(lineContent, 0, lineIndex * this.settings['line_height'] - this.state.scroll.y / this.settings.scale)
    }
    scroll(pixels) {
      if (Math.abs(pixels) < 1) { return }
      pixels = Math.max(-this.state.scroll.y, pixels)
      pixels = Math.min((this.document.length() - 1) * this.settings.scale * this.settings['line_height'] - this.state.scroll.y, pixels)
      this.state.scroll.y += pixels
      this.context.putImageData(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height), 0, -pixels)
      this.renderNewlyVisibleLines(pixels)
      // this.renderFrame()
    }
    onKeyDown(ev) {
      switch (ev.keyCode) {
        case 38:
          // this.scroll(-this.settings['line_height'])
          // this.scroll(this.settings['line_height'] * 2.5)
          this.scroll(1)
          break;
        case 40:
          // this.scroll(this.settings['line_height'])
          // this.scroll(-this.settings['line_height'] * 2.5)
          this.scroll(-1)
          break;
      }
    }
    onScroll(ev) {
      // this.scroll(ev.deltaY)
      if (this.scrollAnimation)
        this.scrollAnimation.cancel()

      this.scrollAnimation = animate(this.state.scroll.y, this.state.scroll.y + ev.deltaY, 200, 'easeOutQuint', targetScroll => {
        this.scroll(Math.round(targetScroll - this.state.scroll.y))
      })
    }
    onResize(ev) {
      let bounds = this.canvas.getBoundingClientRect()
      this.resize(bounds.width, bounds.height)
    }
  }

  function createEditor(containerId) {
    let editor = new Editor(containerId)
    editorList.push(editor)
    return editor
  }

  Swish.edit = createEditor

})()
