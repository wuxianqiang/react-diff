import {Element} from './element'
import $ from 'jquery'

let diffQueue; // 差异对应
let undateDepth = 0; // 更新级别

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
  update (nextElement) {
    if (this._currentElement !== nextElement) {
      this._currentElement = nextElement;
      $(`[data-reactid="${this._reactid}"]`).html(this._currentElement);
    }
  }
}
// reactid是一层一层的格式0.1.2

// 分析虚拟DOM的的单元
class NativeUnit extends Unit {
  update(nextElement) {
    let oldProps = this._currentElement.props;
    let newProps = nextElement.props;
    this.updateDOMProperties(oldProps, newProps)
    this.updateDOMChildren(nextElement.props.children)
  }
  // 新的React元素和老的React进行对比
  updateDOMChildren (newChildrenElement) {
    this.diff(diffQueue, newChildrenElement)
  }
  // 开始对比
  diff(diffQueue, newChildrenElement) {
    let oldChildrenMap = this.getOldChildrenMap(this._renderedChildrenUnit);
    let newChildren = this.getNewChildren(oldChildrenMap, newChildrenElement);
  }
  getNewChildren (oldChildrenMap, newChildrenElement) {
    let newChildren = [];
    // 一定要给key值
    newChildrenElement.forEach((newElement, index) => {
      let newKey = (
        newElement&&
        newElement.props&&
        newElement.props.key
      ) || index.toString();
      let oldUnit = oldChildrenMap[newKey];
      let oldElement = oldUnit && oldUnit._currentElement;
      if (shouldDeepCompare(oldElement, newElement)) {
        oldUnit.update(newElement);
        newChildren.push(oldUnit)
      } else {
        let nextUnit = createUnit(newElement);
        newChildren.push(nextUnit)
      }
    })
    return newChildren
  }

  getOldChildrenMap (childrenUnit=[]) {
    let map = {}
    for (let i = 0; i < childrenUnit.length; i++) {
      // 在进行遍历的时候有个key属性值
      let key = (
        childrenUnit[i]&&
        childrenUnit[i].props&&
        childrenUnit[i].props.key
      ) || i.toString();
      map[key] =  childrenUnit[i];
      console.log(childrenUnit[i])
    }
    return map;
  }

  updateDOMProperties (oldProps, newProps) {
    let propName;
    for (propName in oldProps) {
      if (!newProps.hasOwnProperty(propName)) {
        $(`[data-reactid="${this._reactid}"]`).removeAttr(propName)
      }
      // 事件要取消绑定
      if(/^on[A-Z]/.test(propName)) {
        $(document).undelegate(`.${this._reactid}`)
      }
    }
    for (propName in newProps) {
      if (propName === 'children') {
        continue;
      }else if (/^on[A-Z]/.test(propName)) {
        let eventName = propName.slice(2).toLowerCase();
        $(document).delegate(`[data-reactid="${this._reactid}"]`, `${eventName}.${this._reactid}`, newProps[propName])
      } else if(propName === 'style'){
        let styleObj = newProps[propName];
        // eslint-disable-next-line no-loop-func
        // eslint-disable-next-line array-callback-return
        Object.entries(styleObj).map(([attr, value]) => {
          $(`[data-reactid="${this._reactid}"]`).css(attr, value)
        })
      } else {
        $(`[data-reactid="${this._reactid}"]`).prop(propName, newProps[propName])
      }
    }
  }
  getMarkUp(reactid) {
    this._reactid = reactid;
    let {type, props} = this._currentElement;
    let tagStart = `<${type} data-reactid="${this._reactid}"`;
    let childString = ''
    let tagEnd = `</${type}>`;
    this._renderedChildrenUnit = []
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
          // 将单元添加到数组中保存方便做DOM-DIff处理
          this._renderedChildrenUnit.push(child);
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

class CompositeUnit extends Unit {
  // 负责组件的更新操作
  update (nextElement, partialState) {
    // 获取到新元素
    this._currentElement = nextElement || this._currentElement
    // 获取到新的状态
    // 合并状态
    // 不管是不是要修改组件，一定要修改状态
    let nextState = this._currentElement.state = Object.assign(this._componentInstance.state, partialState)
    let nextProps = this._currentElement.props;
    // 判断是否要更新
    if (this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps, nextState)) {
      return
    }
    // 确定要更新
    // 上次渲染的单元
    let preRenderedUnitInstance = this._renderedUnitInstance;
    // 删除渲染的元素
    let preRenderedElement = preRenderedUnitInstance._currentElement;
    // 这次渲染的元素
    let nextRenderElement = this._componentInstance.render();
    // 比较类型啥的
    if (shouldDeepCompare(preRenderedElement, nextRenderElement)) {
      // react的DOM-diff策略
      // 把更新的操作交给上次更新的unit
      preRenderedUnitInstance.update(nextRenderElement)
      this._componentInstance.componentDidUpdate&&this._componentInstance.componentDidUpdate()
    } else {
      this._renderedUnitInstance = createUnit(nextRenderElement);
      let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._reactid);
      $(`[data-reactid="${this._reactid}"]`).replaceWith(nextMarkUp)
    }
  }
  getMarkUp (reactid) {
    this._reactid = reactid;
    // {type: Counter, props: {name: '计数器'}}
    let {type: Component, props} = this._currentElement;
    // _componentInstance当前组件的实例
    let componentInstance = this._componentInstance = new Component(props);
    this._componentInstance._currentUnit = this; // 保存处理的单元
    // 如果组件有渲染函数就让它执行
    componentInstance.componentWillMount && componentInstance.componentWillMount()
    // 获取到了react元素
    let renderElement = componentInstance.render();
    // _renderedUnitInstance保存react也要进行编译和返回
    let renderUnit = this._renderedUnitInstance = createUnit(renderElement);
    let renderedMarkUp = renderUnit.getMarkUp(this._reactid)
    // 在这个时候绑定一个事件
    $(document).on('mounted', () => {
      componentInstance.componentDidMount &&componentInstance.componentDidMount()
    })
    return renderedMarkUp
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
  // 是个类组件
  if (element instanceof Element && typeof element.type === 'function') {
    return new CompositeUnit(element)
  }
}

// 两个react元素的比较
function shouldDeepCompare (oldElement, newElement) {
  if (oldElement != null && newElement != null) {
    let oldType = typeof oldElement;
    let newType = typeof newElement;
    // 普通字符串
    if ((oldType === 'string' || oldElement === 'number') && (newType === 'string' || newType === 'number')) {
      return true;
    }
    // react元素
    if (oldElement instanceof Element && newElement instanceof Element) {
      return oldElement.type === newElement.type
    }
  }
  return false;
}

export {
  createUnit
}

// react会创建单元
// 负责把元素转成成可以在页面中显示的字符串

// 每个单元都要返回HTML字符串的方法
// 使用到了jQuery里面的事件委托
// 事件都定义到document中
// 绑定事件的元素也是通过自定义属性方式获取的。

// 开始渲染自定义组件
