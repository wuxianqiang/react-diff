import {Element, createElement} from './element'
import $ from 'jquery'

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
    let tagStart = `<${type} data-reactid="${this._reactid}"`;
    let childString = ''
    let tagEnd = `</${type}>`;
    for (const propName in props) {
      if (/^on[A-Z]/.test(propName)) {
        // 绑定事件
        // onClick => click
        let eventName = propName.slice(2).toLowerCase();
        // 事件绑定
        // 第一个参数：通过自定义属性获取元素
        // 第二个参数：事件名称.命名空间
        // 第三个参数：函数的回调
        $(document).delegate(`[data-reactid="${this._reactid}"]`, `${eventName}.${this._reactid}`, props[propName])
      }else if (propName === 'style') {
        let styleObj = props[propName];
        let styles = Object.entries(styleObj).map(([attr, value]) => {
          // backgroundColor => background-color
          attr = attr.replace(/[A-Z]/g, (matched, group1) => {
            return `-${matched.toLowerCase()}`
          })
          return `${attr}:${value}`
        }).join(';')
        tagStart += (` style="${styles}" `)
      }else if (propName === 'children') {
        let children = props[propName];
        // eslint-disable-next-line no-loop-func
        children.forEach((child, index) => {
          // 可能是字符串，也可能是虚拟DOM
          let childUnit = createUnit(child);
          let childMarkUp = childUnit.getMarkUp(`${this._reactid}.${index}`);
          childString += childMarkUp;
        })
      } else if (propName === 'className') {
        tagStart += (` class="${props[propName]}" `)
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
