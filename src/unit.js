import {Element, createElement} from './element'

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

// 字符串和数字的创建单元
class TextUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid;
    return `<span data-reactid="${reactid}">${this._currentElement}</span>`
  }
}

class NativeUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid;
    let {type, props} = this._currentElement;
    let tagStart = `<${type} `;
    let childString = ''
    let tagEnd = `</${type}>`;
    for (const propName in props) {
      if (/^on[A-Z]/.test(propName)) {
        // 绑定事件
      }else if (propName === 'style') {

      }else if (propName === 'children') {

      } else if (propName === 'className') {

      } else {
        tagStart += (` ${propName}=${props[propName]} `)
      }
    }
    return tagStart + '>' + childString + tagEnd
  }
}

function createUnit(element) {
  // 字符串或者数字
  if (typeof element === 'string' || typeof element === 'number') {
    return new TextUnit(element)
  }
  // 虚拟DOM
  if (element instanceof Element && typeof element.type === 'string') {
    return new NativeUnit(element)
  }
}

export {
  createUnit
}

// react会创建单元
// 负责把元素转成成可以在页面中显示的字符串

// 每个单元都要返回HTML字符串的方法
