import { observable, extendObservable, action } from 'mobx';
import axios from 'axios';
import config from '../config';
/**
 * 应用级Store
 * 保存全局数据、状态及方法
 */
class AppStore {
  constructor() {
    extendObservable(this, {
      allGroups: [],
      allCerts: [],
      conalogUrl: 'http://' + config.conalogHost + ':' + config.conalogPort.toString(),
    });
  }

  @action.bound
  async fetchGroup(params, type) {
    const url = 'http://' + config.conalogHost + ':' + config.conalogPort.toString() + '/groups';
    await axios.get(url, params)
      .then((response) => {
        this.setgroup(response.data.groups, type);
      });
  }
  @action.bound setgroup(group, type) {
    this.allGroups = group.filter(item => item.type === type.grouptype);
    this.allGroups.unshift({ name: '查看所有', _id: '' });
  }

  @action.bound
  async fetchCerts(params) {
    const url = 'http://' + config.conalogHost + ':' + config.conalogPort.toString() + '/certs';
    await axios.get(url, params)
      .then((response) => {
        this.setcert(response.data.certs);
      });
  }
  @action.bound setcert(certs) {
    this.allCerts = certs;
  }
}

const store = new AppStore();

export default store;
