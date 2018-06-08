/* eslint no-underscore-dangle: 0 */
import React, { Component } from 'react';
import { Table, Pagination, Tab, Search, Button, Dialog, Icon, Select, TimePicker } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';
import axios from 'axios';
import moment from 'moment';
import Modal from '../Modal';
import config from '../../../../config';
import './EnhanceTable.scss';


const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

@DataBinder({
  tableData: {
    url: conalogUrl + '/collectors',
    method: 'get',
    params: {
      category: 0,
      embed: true,
    },
    responseFormatter: (responseHandler, res, originResponse) => {
      let list = res.collectors;
      console.log(list)
      list.forEach((item) => {
        const { createdAt, updatedAt } = item;
        item.createdAt = moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
        item.updatedAt = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
      });
      const newRes = {
        status: originResponse.status === 200 ? 'SUCCESS' : 'ERROR',
        data: {
          total: res.meta.totalCount,
          pageSize: res.meta.pageSize,
          currentPage: res.meta.page + 1,
          list,
        },
      };
      responseHandler(newRes, originResponse);
    },
    defaultBindingData: {
      list: [],
      total: 100,
      pageSize: 10,
      currentPage: 1,
    },
  },
})
export default class EnhanceTable extends Component {
  static displayName = 'EnhanceTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.queryCache = {
      group: '',
      page: 0,
    };
    this.collectorInstances = [];
    this.state = {
      // activeKey: 'solved',
      addVisible: false,
      editVisible: false,
      choosedCollector: {},
      allInstances: [],
      allgroups: [],
    };
  }

  componentDidMount() {
    const url = conalogUrl + '/groups'
    axios.get(url)
      .then((response) => {
        this.state.allgroups = response.data.groups;
        this.state.allgroups.unshift({ name: '查看所有', _id: '' });
        this.setState({
          allgroups: this.state.allgroups,
        });
      })
      .catch((error) => {
        this.alert(error);
      });
    this.fetchData(this.queryCache);
    // 获取collector实例
    this.loop = setInterval(() => this.collectorInstances.forEach(id => this.getcollectorInstance(id)), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.loop);
  }

  alert = (error) => {
    Dialog.alert({
      title: 'alert',
      content: error.response.data.message ? error.response.data.message : error.response.data,
      onOk: () => { },
    });
  };

  getcollectorInstance = (id) => {
    const that = this;
    const url = conalogUrl + '/collectors/' + id + '/instances';
    axios.get(url)
      .then((response) => {
        this.dealInstance(response.data);
      })
      .catch((error) => {
        this.alert(error);
      });
  };

  dealInstance = (data) => {
    let allInstances = this.state.allInstances;
    if (allInstances.length === 0 || !allInstances.find(item => item.parser === data.parser)) {
      allInstances.push(data);
    } else {
      allInstances.forEach((item) => {
        if (item.parser === data.parser) {
          item = Object.assign(item, data);
        }
      });
    }
    this.setState({
      allInstances: this.state.allInstances,
    });
  };

  fetchData = (params) => {
    this.props.updateBindingData('tableData', {
      params,
    });
  };

  editItem = (record) => {
    this.state.choosedCollector = record;
    let interval = this.state.choosedCollector.worker.interval;
    if (interval) {
      this.state.choosedCollector.worker.interval = new Date(interval);
    }
    this.setState({
      editVisible: true,
    });
  };

  deleteItem = (record) => {
    let id = record._id;
    let name = record.name;
    Dialog.confirm({
      title: '删除',
      content: '确定删除用户  ' + name + '?',
      onOk: () => {
        const that = this;
        const url = conalogUrl + '/collectors/' + id
        axios.delete(url)
          .then((response) => {
            that.fetchData(that.queryCache);
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  };

  renderOperations = (value, index, record) => {
    return (
      <div style={{ lineHeight: '28px' }}>
        <a onClick={() => { this.editItem(record); }} style={styles.operation} >
          编辑
        </a>
        <a onClick={() => { this.deleteItem(record); }} style={styles.operation} >
          删除
        </a>
        <a onClick={() => { this.startInstance(record); }} style={styles.operation} >
          启动
        </a>
        <a onClick={() => { this.checkLog(record); }} style={styles.operation} >
          日志
        </a>
      </div>
    );
  };

  renderStop = (value, index, record) => {
    return (
      <div style={{ lineHeight: '28px' }}>
        <a onClick={() => { this.stopInstance(record); }} style={styles.operation} >
          停止
        </a>
      </div>
    );
  };

  renderchannel = (record) => {
    let d = '';
    if (record === 0) {
      d = 'REDIS_CHANNEL';
    } else if (record === 1) {
      d = 'NSQ_QUEUE';
    }
    return d;
  };

  renderrunning = (record) => {
    if (!record) {
      return <Icon type="set" />;
    } else {
      return <Icon type="set" style={styles.contentIcon} className="content-icon" />;
    }
  };

  rendercert = (record) => {
    let cert = record.username + '@' + record.host + ':' + record.port;
    return cert
  }

  renderInterval = (record) => {
    let interval = '';
    if (record) {
      interval = new Date(record);
    } else {
      interval = '';
    }
    return <TimePicker defaultValue={interval} disabled hasClear={false} size="small" />;
  }

  renderWorkerType = (record) => {
    let type = '';
    if (record === 0) {
      type = 'INTERVAL';
    } else if (record === 1) {
      type = 'CRON';
    }
    return type;
  };
  changePage = (currentPage) => {
    this.queryCache.page = currentPage - 1;
    this.fetchData(this.queryCache);
  };

  onShowModal = () => {
    this.setState({
      addVisible: true,
    });
  };

  onAddOk = (data) => {
    const that = this;
    const url = conalogUrl + '/collectors'
    axios.post(url, data)
      .then((response) => {
        that.setState({
          addVisible: false,
        });
        that.fetchData(that.queryCache);
      })
      .catch((error) => {
        this.alert(error);
      });
  };

  onAddCancel = () => {
    this.setState({
      addVisible: false,
    });
  };

  onEditOk = (data) => {
    let id = this.state.choosedCollector._id;
    const that = this;
    const url = conalogUrl + '/collectors/' + id
    axios.put(url, data)
      .then((response) => {
        that.setState({
          editVisible: false,
        });
        that.fetchData(that.queryCache);
      })
      .catch((error) => {
        this.alert(error);
      });
  };

  onEditCancel = () => {
    this.setState({
      editVisible: false,
    });
  };

  startInstance = (record) => {
    const that = this;
    const id = record._id;
    const url = conalogUrl + '/collectors/instances/' + id;
    const name = record.name;
    Dialog.confirm({
      title: '启动',
      content: '确认启动 ' + name + ' ?',
      onOk: () => {
        axios.post(url)
          .then((response) => {
            that.fetchData(that.queryCache);
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  };

  stopInstance = (record) => {
    const that = this;
    const id = record._id;
    let name = record.name
    const url = conalogUrl + '/collectors/instances/' + id
    Dialog.confirm({
      title: '启动',
      content: '确认停止 ' + name + ' ?',
      onOk: () => {
        axios.delete(url)
          .then((response) => {
            that.fetchData(that.queryCache);
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  };

  checkLog = (record) => {

  };

  chooseGroup = (value, option) => {
    this.queryCache.group = value;
    this.queryCache.page = 0;
    this.fetchData(this.queryCache);
  };

  expandedRowRender = (record) => {
    let allInstances = this.state.allInstances;
    let data = allInstances.filter(item => item.parser === record._id) ? allInstances.filter(item => item.parser === record._id) : [];
    return (<Table
      dataSource={data}
      className="basic-table"
      style={styles.basicTable}
      hasBorder={false}
    >
      <Table.Column
        title="时间"
        dataIndex="ts"
        width={85}
        cell={(item) => {
          let uptime = '--';
          if (item) {
            uptime = moment(item).format('YYYY-MM-DD HH:mm:ss');
          }
          return uptime;
        }}
      />
      <Table.Column
        title="日志条数"
        dataIndex="count"
        width={150}
        cell={(item) => {
          let count = '--';
          if (item) {
            count = item;
          }
          return count;
        }}
      />
      <Table.Column
        title="信息"
        dataIndex="lastActivity.result"
        width={150}
        cell={(item) => {
          let result = '--';
          if (item) {
            result = item;
          }
          return result;
        }}
      />
      <Table.Column
        title="error"
        dataIndex="error"
        width={150}
        cell={(item) => {
          let result = '--';
          if (item) {
            result = item;
          }
          return result;
        }}
      />
      <Table.Column
        title="操作"
        // lock="right"
        width={200}
        cell={this.renderStop}
      />
    </Table>
    )
  };

  onExpandedChange = (expandedRowKeys, currentRowKey, expanded, currentRecord) => {
    let id = currentRecord._id;
    if (expanded) {
      this.collectorInstances.push(id);
      this.getcollectorInstance(id);
    } else {
      this.collectorInstances = this.collectorInstances.filter(item => item !== id);
    }
  };

  render() {
    const allgroups = this.state.allgroups;
    const tableData = this.props.bindingData.tableData;
    tableData.list.forEach((item, key) => item.id = key);
    return (
      <div className="enhance-table" style={styles.enhanceTable}>
        <IceContainer style={styles.card}>
          <div>
            <Button type="primary" onClick={this.onShowModal}>
              添加采集
            </Button>
          </div>
          <div>
            <Select size="large" onChange={this.chooseGroup} placeholder="请选择分组" style={{ width: 200 }}>
              {allgroups && allgroups.map((item, key) => (<Option key={item.name} value={item._id}>{item.name}</Option>))}
            </Select>
          </div>
        </IceContainer>
        <IceContainer>
          <Table
            dataSource={tableData.list}
            isLoading={tableData.__loading}
            className="basic-table"
            style={styles.basicTable}
            hasBorder={false}
            expandedRowRender={this.expandedRowRender}
            onExpandedChange={this.onExpandedChange}
          >
            <Table.Column
              title="ID"
              // lock
              width={230}
              dataIndex="_id"
            />
            <Table.Column
              title="名字"
              dataIndex="name"
              width={150}
            />
            <Table.Column
              title="cert"
              dataIndex="cert"
              width={200}
              cell={this.rendercert}
            />
            <Table.Column
              title="路径"
              dataIndex="worker.path"
              width={150}
            />
            <Table.Column
              title="参数"
              dataIndex="worker.parameter"
              width={150}
            />
            <Table.Column
              title="类型"
              dataIndex="worker.type"
              width={150}
              cell={this.renderWorkerType}
            />
            <Table.Column
              title="interval"
              dataIndex="worker.interval"
              width={180}
              cell={this.renderInterval}
            />
            <Table.Column
              title="cron"
              dataIndex="worker.cron"
              width={150}
            />
            <Table.Column
              title="编码"
              dataIndex="encoding"
              width={150}
            />
            <Table.Column
              title="数据输出通道名"
              dataIndex="output.name"
              width={150}
            />
            <Table.Column
              title="数据输出通道类型"
              dataIndex="output.type"
              width={150}
            />
            <Table.Column
              title="分组"
              dataIndex="group.name"
              width={150}
              cell={this.rendergroup}
            />
            <Table.Column
              title="创建"
              dataIndex="createdAt"
              width={150}
            />
            <Table.Column
              title="更新"
              dataIndex="updatedAt"
              width={150}
            />
            <Table.Column
              title="运行"
              // lock="right"
              dataIndex="running"
              width={80}
              cell={this.renderrunning}
            />
            <Table.Column
              title="操作"
              // lock="right"
              width={200}
              cell={this.renderOperations}
            />
          </Table>
          <div style={styles.pagination}>
            <Pagination
              current={tableData.currentPage}
              pageSize={tableData.pageSize}
              total={tableData.total}
              onChange={this.changePage}
              type={this.state.isMobile ? 'simple' : 'normal'}
            />
          </div>
        </IceContainer>
        {this.state.editVisible && <Modal data={this.state.choosedCollector} onOk={this.onEditOk} onCancel={this.onEditCancel} />}
        {this.state.addVisible && <Modal onOk={this.onAddOk} onCancel={this.onAddCancel} />}
      </div>
    );
  }
}

const styles = {
  titleWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  title: {
    marginLeft: '10px',
    lineHeight: '20px',
  },
  enhanceTableOperation: {
    lineHeight: '28px',
  },
  operation: {
    marginRight: '12px',
    textDecoration: 'none',
  },
  card: {
    minHeight: 0,
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  tabCount: {
    color: '#3080FE',
  },
  extraFilter: {
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    marginLeft: 10,
  },
  pagination: {
    textAlign: 'right',
    paddingTop: '26px',
  },
};
