// 抽象类:只用于继承，不能实例化
class Unit {
  constructor (element) {
    // 下划线开头表示实例上的私有属性
    this._currentElement = element
  }
  getMarkUp () {
    throw Error('不能实例化')
  }
}

class TextUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid;
    return `<span data-reactid="${reactid}">${this._currentElement}</span>`
  }
}

function createUnit(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return new TextUnit(element)
  }
}

export {
  createUnit
}

// react会创建单元
// 负责把元素转成成可以在页面中显示的字符串
