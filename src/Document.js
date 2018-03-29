(() => {

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

  Swish.Document = Document

})()