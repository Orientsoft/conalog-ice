import { observable, extendObservable, action } from 'mobx';
import config from '../config';
/**
 * 应用级Store
 * 保存全局数据、状态及方法
 */
class AppStore {
  constructor() {
    extendObservable(this, {
      group: [],
      conalogUrl: 'http://' + config.conalogHost + ':' + config.conalogPort.toString(),
    });
  }
  @action.bound getgroup(group) {
    this.group = group;
  }
}

const store = new AppStore();

export default store;
