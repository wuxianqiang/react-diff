class Component {
  constructor(props) {
    this.props = props
  }
  setState(partialState) {
    // 每个单元都有update方法
    this._currentUnit.update(null, partialState);
  }
}

export {
  Component
}
