import React from 'react';
import ReactDOM from 'react-dom';
// 载入默认全局样式 normalize 、.clearfix 和一些 mixin 方法等
import '@icedesign/base/reset.scss';
// import routes from './routes';
import { Provider } from 'mobx-react';
import App from './routes';
import store from './stores/AppStore';

// 以下代码 ICE 自动生成, 请勿修改
const container = document.createElement('div');
container.dataset.reactRoot = true;
document.body.appendChild(container);
// ReactDOM.render(routes, container);

//加入mobx
const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    container
  );
};
render();
