/* eslint no-underscore-dangle: 0 */
import React, { Component } from 'react';
import { Table, Pagination, Tab, Search, Button, Dialog, Icon } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';
import IceLabel from '@icedesign/label';
import { enquireScreen } from 'enquire-js';
import axios from 'axios';
import moment from 'moment';
import Modal from '../Modal';
import config from '../../../../config';


const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

@DataBinder({
  tableData: {
    url: conalogUrl + '/collectors',
    method: 'get',
    responseFormatter: (responseHandler, res, originResponse) => {
      let list = res.collectors;
      // list.forEach((item) => {
      //   const { createdAt, updatedAt } = item;
      //   item.createdAt = moment(createdAt).format('YYYY-MM-DD HH:mm:ss');
      //   item.updatedAt = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');
      // });
      // console.log('list', list)
      // const newRes = {
      //   status: originResponse.status === 200 ? 'SUCCESS' : 'ERROR',
      //   data: {
      //     total: res.meta.totalCount,
      //     pageSize: res.meta.pageSize,
      //     currentPage: res.meta.page + 1,
      //     list,
      //   },
      // };
      // responseHandler(newRes, originResponse);
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

    this.queryCache = {};
    this.parserInstances = [];
    this.state = {
      // activeKey: 'solved',
      addVisible: false,
      editVisible: false,
      choosedparser: {},
      allGroups: [],
      allInstances: [],
    };
  }

  componentDidMount() {
    const url = conalogUrl + '/groups'
    axios.get(url)
      .then((response) => {
        this.state.allGroups = response.data.groups;
        this.setState({
          allGroups: this.state.allGroups,
        });
      })
      .catch((error) => {
        this.alert(error);
      });
    this.fetchData({
      page: 0,
    });
    // 获取parser实例
    this.loop = setInterval(() => this.parserInstances.forEach(id => this.getparserInstance(id)), 3000);
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
  }

  getparserInstance = (id) => {
    const that = this;
    const url = conalogUrl + '/parsers/' + id + '/instances';
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
  }

  fetchData = (page) => {
    this.props.updateBindingData('tableData', {
      params: page,
    });
  };

  editItem = (record) => {
    this.state.choosedparser = record;
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
        const url = conalogUrl + '/parsers/' + id
        axios.delete(url)
          .then((response) => {
            that.fetchData({
              page: 0,
            });
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
        <a onClick={() => { this.startParser(record); }} style={styles.operation} >
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
  }

  rendergroup = (record) => {
    let d = '';
    this.state.allGroups.filter((item) => {
      if (item._id === record) {
        d = item.name;
      }
    });
    return d;
  }

  renderchannel = (record) => {
    let d = '';
    if (record === 0) {
      d = 'REDIS_CHANNEL';
    } else if (record === 1) {
      d = 'NSQ_QUEUE';
    }
    return d;
  }

  renderrunning = (record) => {
    if (!record) {
      return <Icon type="set" />;
    } else {
      return <Icon type="set" style={styles.contentIcon} className="content-icon" />;
    }
  }

  changePage = (currentPage) => {
    this.fetchData({
      page: currentPage - 1,
    });
  };

  onShowModal = () => {
    this.setState({
      addVisible: true,
    });
  };

  onAddOk = (data) => {
    const that = this;
    const url = conalogUrl + '/parsers'
    axios.post(url, data)
      .then((response) => {
        that.setState({
          addVisible: false,
        });
        that.fetchData({
          page: 0,
        });
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
    let id = this.state.choosedparser._id
    const that = this;
    const url = conalogUrl + '/parsers/' + id
    axios.put(url, data)
      .then((response) => {
        that.setState({
          editVisible: false,
        });
        that.fetchData({
          page: 0,
        });
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

  startParser = (record) => {
    const that = this;
    const id = record._id;
    const url = conalogUrl + '/parsers/' + id + '/instances';
    const name = record.name;
    Dialog.confirm({
      title: '启动',
      content: '确认启动 ' + name + ' ?',
      onOk: () => {
        axios.get(url)
          .then((response) => {
            that.fetchData({
              page: 0,
            });
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  };

  stopInstance = (record) => {
    const that = this;
    const id = record.parser;
    const url = conalogUrl + '/parsers/' + id + '/instances'
    Dialog.confirm({
      title: '启动',
      content: '确认停止 ' + id + ' ?',
      onOk: () => {
        axios.delete(url)
          .then((response) => {
            console.log('hhhhh');
            that.fetchData({
              page: 0,
            });
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  }

  onStartAllParser = () => {
    const that = this;
    const url = conalogUrl + '/parsers/instances';
    Dialog.confirm({
      title: '启动',
      content: '确认启动所有parser?',
      onOk: () => {
        axios.post(url)
          .then((response) => {
            that.fetchData({
              page: 0,
            });
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  }
  onStopAllParser = () => {
    const that = this;
    const url = conalogUrl + '/parsers/instances'
    Dialog.confirm({
      title: '启动',
      content: '确认停止所有parser?',
      onOk: () => {
        axios.delete(url)
          .then((response) => {
            that.fetchData({
              page: 0,
            });
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  }

  checkLog = (record) => {

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
        title="parser"
        // lock
        width={230}
        dataIndex="parser"
      />
      <Table.Column
        title="进程号"
        dataIndex="status.pid"
        width={150}
        cell={(item) => {
          let pid = '--';
          if (item) {
            pid = item;
          }
          return pid;
        }}
      />
      <Table.Column
        title="更新时间"
        dataIndex="status.uptime"
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
        title="重启"
        dataIndex="status.restart"
        width={85}
        cell={(item) => {
          let restart = '--';
          if (item) {
            restart = item;
          }
          return restart;
        }}
      />
      <Table.Column
        title="状态"
        dataIndex="status.status"
        width={150}
        cell={(item) => {
          let status = '--';
          if (item) {
            status = item;
          }
          return status;
        }}
      />
      <Table.Column
        title="日志条数"
        dataIndex="lastActivity.count"
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
        title="日期"
        dataIndex="lastActivity.date"
        width={150}
        cell={(item) => {
          let date = '--';
          if (item) {
            date = moment(item).format('YYYY-MM-DD HH:mm:ss');
          }
          return date;
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
      this.parserInstances.push(id);
      this.getparserInstance(id);
    } else {
      this.parserInstances = this.parserInstances.filter(item => item !== id);
    }
  };

  render() {
    const tableData = this.props.bindingData.tableData;
    tableData.list.forEach((item, key) => item.id = key);
    return (
      <div className="enhance-table" style={styles.enhanceTable}>
        <IceContainer style={styles.card}>
          <div>
            <Button type="primary" onClick={this.onShowModal}>
              添加解析
            </Button>
          </div>
          <div>
            <Button type="primary" onClick={this.onStartAllParser}>
              启动
            </Button>
            <Button type="primary" onClick={this.onStopAllParser}>
              停止
            </Button>
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
              title="脚本"
              dataIndex="path"
              width={150}
            />
            <Table.Column
              title="参数"
              dataIndex="parameter"
              width={85}
            />
            <Table.Column
              title="数据输入通道类型"
              dataIndex="input.type"
              width={150}
              cell={this.renderchannel}
            />
            <Table.Column
              title="数据输入通道名"
              dataIndex="input.name"
              width={150}
            />
            <Table.Column
              title="数据输出通道类型"
              dataIndex="output.type"
              width={150}
              cell={this.renderchannel}
            />
            <Table.Column
              title="数据输出通道名"
              dataIndex="output.name"
              width={150}
            />
            <Table.Column
              title="分组"
              dataIndex="group"
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
        {this.state.editVisible && <Modal data={this.state.choosedparser} onOk={this.onEditOk} onCancel={this.onEditCancel} />}
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
