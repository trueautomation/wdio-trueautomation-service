module.exports = {
  setInnerHTML: function (browser, elem, value) {
    if (elem.isDisplayed()) {
      const elemId = elem.elementId
      browser.executeScript(`(function(el, val){
        el.innerHTML = val;
        return;
      })(arguments[0], arguments[1])`, [{ 'element-6066-11e4-a52e-4f735466cecf': elemId }, value])
    } else {
      if (elem.error && elem.error.error === 'no such element') {
        throw elem.error.message
      } else {
        throw new Error('Element not displayed')
      }
    }
  }
}
