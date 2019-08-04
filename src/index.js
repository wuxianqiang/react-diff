import React from './react';
import {createElement} from './element'
// import ReactDOM from 'react-dom';

// JSX是浏览器器不能识别的，要靠babel转换成createElement语法
// let element = (
//   <button id="sayHello" style={{color: 'red', backgroundColor: 'green'}}>
//     say
//     <b>
//       Hello
//     </b>
//   </button>
// )

// let element = createElement(
//   'button', 
//   {
//     id: 'sayHello',
//     onClick: () => {console.log('hello')},
//     style: {color: 'red', backgroundColor: 'green'},
//   },
//   'say',
//   createElement('b', {}, 'hello'))

// 虚拟DOM
// {type: 'button', props: {id: 'sayHello'}}

class Counter extends React.Component {
  constructor (props) {
    super(props);
    this.state = {number: 0}
  }
  //WARNING! To be deprecated in React v17. Use componentDidMount instead.
  componentWillMount() {
    console.log('将要渲染')
  }
  componentDidMount() {
    // console.log('DidMount')
    // setInterval(() => {
    //   this.setState({
    //     number: this.state.number + 1
    //   })
    // }, 1000)
  }
  shouldComponentUpdate(nextProps, nextState) {
    return true
  }
  increment = () => {
    this.setState({
      number: this.state.number + 1
    })
  }
  render() {
    console.log('ren', this.state.number)
    let p = createElement('p', {style: {color: 'red'}}, this.state.number)
    let button = createElement('button', {onClick: this.increment}, '+')
    return createElement('div',{id: 'counter'}, p, button)
    // return this.state.number
  }
}

let element = createElement(Counter, {name: '计数器'})
React.render(element, document.getElementById('root'))
