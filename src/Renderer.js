(() => {

  class Renderer {

    constructor(canvasElement, scale) {
      this.canvas = canvasElement
      this.context = canvasElement.getContext('2d')
      this.context.save()
      this.context.scale(scale, scale)
    }

    scrollDocument(editor, pixels) {
      if (Math.abs(pixels) < 1) { return }
      this.context.putImageData(this.context.getImageData(0, 0, this.canvas.width, this.canvas.height), 0, -pixels)
      this.renderNewlyVisibleLines(editor, pixels)
      // this.renderFrame(editor)
    }

    renderFrame(editor) {
      this.context.font = `${editor.settings['line_height']}px ${editor.settings['font']}`
      this.context.textAlign = 'start'
      this.context.textBaseline = 'top'
      this.context.fillStyle = editor.settings['background_color']
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
      this.renderDocument(editor)
    }

    renderDocument(editor) {
      // editor.document.forEach(this.renderLine.bind(this, editor))
      this.renderVisibleLines(editor)
    }

    renderVisibleLines(editor) {
      // this.context.save()
      // this.context.scale(editor.settings['scale'], editor.settings['scale'])
      this.context.fillStyle = editor.settings['text_color']
      let lines = editor.document.getLines()
      let startIndex = Math.floor((editor.state.scroll.y / editor.settings['scale']) / editor.settings['line_height'])
      let endIndex = Math.ceil((this.canvas.height / editor.settings['scale']) / editor.settings['line_height'])
      startIndex = Math.max(0, startIndex)
      endIndex = Math.min(lines.length - 1, endIndex)
      for (let i = startIndex; i <= endIndex; ++i)
        this.renderLine(editor, editor.document.getLine(i), i, lines)
      // this.context.restore()
    }

    renderNewlyVisibleLines(editor, scrollPixels) {
      // this.context.save()
      // this.context.scale(editor.settings['scale'], editor.settings['scale'])
      let canvasWidth = this.canvas.width / editor.settings['scale']
      let canvasHeight = this.canvas.height / editor.settings['scale']
      let scrollY, s = editor.state.scroll.y / editor.settings['scale']
      if (scrollPixels > 0)
        s += canvasHeight + editor.settings['line_height']
      if (s > 0) {
        scrollY = s - s % editor.settings['line_height']
      } else {
        scrollY = -Math.ceil(Math.abs(s) / editor.settings['line_height']) * editor.settings['line_height']
      }
      scrollY /= editor.settings['line_height']
      let linesScrolled = Math.ceil(Math.abs(scrollPixels) / editor.settings['line_height']) + 1

      if (scrollPixels > 0) {
        let clearTop = (scrollY - linesScrolled) * editor.settings['line_height'] - editor.state.scroll.y / editor.settings['scale']
        this.context.fillStyle = editor.settings['background_color']
        this.context.fillRect(0, clearTop, canvasWidth, canvasHeight - clearTop)
        this.context.fillStyle = editor.settings['text_color']
        for (let i = Math.max(0, scrollY - linesScrolled), l = Math.min(editor.document.length(), scrollY); i < l; ++i)
          this.renderLine(editor, editor.document.getLine(i), i, editor.document.getLines())
      } else {
        this.context.fillStyle = editor.settings['background_color']
        this.context.fillRect(0, 0, canvasWidth, (scrollY + linesScrolled) * editor.settings['line_height'] - editor.state.scroll.y / editor.settings['scale'])
        this.context.fillStyle = editor.settings['text_color']
        for (let i = Math.max(0, scrollY), l = Math.min(editor.document.length(), scrollY + linesScrolled); i < l; ++i)
          this.renderLine(editor, editor.document.getLine(i), i, editor.document.getLines())
      }
      // this.context.restore()
    }

    renderLine(editor, lineContent, lineIndex, allLines) {
      if (lineContent === '') { return }
      //this.context.fillText(lineContent, 0, lineIndex * this.settings['line_height'] - this.state.scroll.y / editor.settings['scale'])
      let words = lineContent.split(/\b/g)
      let x = 0
      let y = lineIndex * editor.settings['line_height'] - editor.state.scroll.y / editor.settings['scale']
      let wordSize
      let w
      for (let i = 0, l = words.length; i < l; ++i) {
        w = words[i]
        wordSize = this.context.measureText(w)
        let color = editor.settings.language.getWordColor(w, words[i - 1], words[i + 1])
        if (!color) color = editor.settings['text_color']
        this.context.fillStyle = color
        this.context.fillText(w, x, y)
        x += wordSize.width
      }
    }

  }

  Swish.Renderer = Renderer

})()
