const Swish = {};

(() => {

  let editorList = []

  function createEditor(containerId) {
    let editor = new Swish.Editor(containerId)
    editorList.push(editor)
    return editor
  }

  Swish.edit = createEditor

})()