(() => {

  class Language {
    constructor() {
      this.keywords = {
        "this": '#aaf',
        "class": '#aaf',
        "break": '#aaf',
        "continue": '#aaf',
        "return": '#aaf'
      };
    }
    getWordColor(word, prevWord, nextWord) {
      if (nextWord && nextWord[0] === '(')
        return (prevWord && prevWord === '.') ? '#f0f' : '#ff0'
      return this.keywords[word]
    }
  }

  Swish.Language = Language

})()