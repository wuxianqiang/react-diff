import $ from 'jquery'
import {createUnit} from './unit';
import {Component} from './component'
// import {Element, createElement} from './element'

let React = {
  render,
  rootIndex: 0,
  Component
}

// 通过自定义属性定位元素
function render(element, container) {
  // container.innerHTML = `<span data-reactid="${React.rootIndex}">${element}</span>`
  let unit = createUnit(element)
  let markUp = unit.getMarkUp(React.rootIndex); // 用来返回HTML标记
  $(container).html(markUp)
}

export default React
