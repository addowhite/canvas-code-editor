(() => {

  class Editor {
    constructor(containerId) {
      this.settings = {
        line_height: 16,
        background_color: '#333',
        text_color: '#ccc',
        font: 'Courier New',
        zoom: 1,
        language: new Swish.Language(),
        dpiScale: 1,
        highDPI: false,
        animateScroll: true
      }
      if (this.settings.highDPI) this.settings.dpiScale = (window.devicePixelRatio || 1)
      this.settings.scale = this.settings.zoom * this.settings.dpiScale

      this.state = {}
      this.state.scroll = { x: 0, y: 0 }

      this.container = document.getElementById(containerId)
      let content = this.container.innerHTML
      this.container.innerHTML = ''
      this.document = new Swish.Document()

      this.canvas = this.createCanvas(this.container)
      this.renderer = new Swish.Renderer(this.canvas)

      let bounds = this.canvas.getBoundingClientRect()
      this.resize(bounds.width, bounds.height, false)
      if (content.trim() !== '')
        this.setText(content)
      this.canvas.focus()
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
      window.addEventListener('resize', Swish.util.debounce(this.onResize.bind(this), 100), { passive: true })
      return canvas;
    }

    resize(width, height, redraw = true) {
      this.canvas.width = width * this.settings.dpiScale
      this.canvas.height = height * this.settings.dpiScale
      if (redraw) this.renderer.renderFrame(this)
    }

    setText(str) {
      this.document.setText(str)
      this.renderer.renderFrame(this);
    }

    scroll(pixels) {
      if (Math.abs(pixels) < 1) { return }
      pixels = Math.max(-this.state.scroll.y, pixels)
      pixels = Math.min((this.document.length() - 1) * this.settings['scale'] * this.settings['line_height'] - this.state.scroll.y, pixels)
      this.state.scroll.y += pixels
      this.renderer.scrollDocument(this, pixels)
    }

    onKeyDown(ev) {
      switch (ev.keyCode) {
        case 38:
          // this.scroll(this.settings['line_height'])
          // this.scroll(this.settings['line_height'] * 2.5)
          this.onScroll({ deltaY: -this.settings['line_height'] * 5 })
          break;
        case 40:
          // this.scroll(-this.settings['line_height'])
          // this.scroll(-this.settings['line_height'] * 2.5)
          this.onScroll({ deltaY: this.settings['line_height'] * 5 })
          break;
      }
    }

    onScroll(ev) {
      if (this.settings.animateScroll) {
        if (this.scrollAnimation)
          this.scrollAnimation.cancel()

        this.scrollAnimation = Swish.animate(this.state.scroll.y, this.state.scroll.y + ev.deltaY, 100, 'easeOutQuint', targetScroll => {
          this.scroll(Math.round(targetScroll - this.state.scroll.y))
        })

      } else {
        this.scroll(ev.deltaY)
      }
    }

    onResize(ev) {
      let bounds = this.canvas.getBoundingClientRect()
      this.resize(bounds.width, bounds.height)
    }
  }

  Swish.Editor = Editor

})()