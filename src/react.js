let React = {
  render,
  rootIndex: 0
}

// 通过自定义属性定位元素
function render(element, container) {
  container.innerHTML = `<span data-reactid="${React.rootIndex}">${element}</span>`
}

export default React
