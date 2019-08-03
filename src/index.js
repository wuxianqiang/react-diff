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

let element = createElement(
  'button', 
  {
    id: 'sayHello',
    style: {color: 'red', backgroundColor: 'green'},
  },
  'say',
  createElement('b', {}, 'hello'))

// 虚拟DOM
// {type: 'button', props: {id: 'sayHello'}}

React.render(element, document.getElementById('root'));
