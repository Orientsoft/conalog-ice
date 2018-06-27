/* eslint no-underscore-dangle: 0 */
import React, { Component } from 'react';
import { Table, Pagination, Search, Button, Dialog, Select } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';
// import IceLabel from '@icedesign/label';
import axios from 'axios';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import Modal from '../Modal';
import config from '../../../../config';

const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

@DataBinder({
  tableData: {
    url: conalogUrl + '/certs',
    method: 'get',
    params: {
      embed: 1,
    },
    responseFormatter: (responseHandler, res, originResponse) => {
      let list = res.certs;
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

@inject('store')
@observer
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
    this.state = {
      // activeKey: 'solved',
      addVisible: false,
      editVisible: false,
      choosedcert: {},
      allGroups: [],
    };
  }

  componentDidMount() {
    const url = conalogUrl + '/groups'
    axios.get(url, { params: { pageSize: config.MAX_SIZE } })
      .then((response) => {
        this.state.allGroups = response.data.groups.filter(item => item.type === 0);
        // this.state.allGroups = response.data.groups;
        this.state.allGroups.unshift({ name: '查看所有', _id: '' });
        this.setState({
          allGroups: this.state.allGroups,
        });
      })
      .catch((error) => {
        this.alert(error);
      });

    this.fetchData(this.queryCache);
  }

  alert = (error) => {
    Dialog.alert({
      title: 'alert',
      content: error.response.data.message ? error.response.data.message : error.response.data,
      onOk: () => { },
    });
  }

  fetchData = (params) => {
    this.props.updateBindingData('tableData', {
      params,
    });
  };

  editItem = (record) => {
    this.state.choosedcert = record;
    this.setState({
      editVisible: true,
    });
  };

  deleteItem = (record) => {
    let id = record._id;
    let username = record.username;
    Dialog.confirm({
      title: '删除',
      content: '确定删除用户  ' + username + '?',
      onOk: () => {
        const that = this;
        const url = conalogUrl + '/certs/' + id
        axios.delete(url)
          .then((response) => {
            that.fetchData(this.queryCache);
          })
          .catch((error) => {
            this.alert(error);
          });
      },
    });
  };

  testConnect = (record) => {
    let id = record._id;
    const url = conalogUrl + '/certs/' + id + '/test'
    axios.get(url)
      .then((response) => {
        Dialog.confirm({
          title: '测试',
          content: response.statusText,
          onOk: () => { },
        });
      })
      .catch((error) => {
        this.alert(error);
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
        <a onClick={() => { this.testConnect(record); }} style={styles.operation} >
          测试
        </a>
      </div>
    );
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
    const url = conalogUrl + '/certs'
    axios.post(url, data)
      .then((response) => {
        this.setState({
          addVisible: false,
        });
        that.fetchData(this.queryCache);
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
    let id = this.state.choosedcert._id
    const that = this;
    const url = conalogUrl + '/certs/' + id
    axios.put(url, data)
      .then((response) => {
        that.setState({
          editVisible: false,
        });
        that.fetchData(this.queryCache);
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

  chooseGroup = (value, option) => {
    this.queryCache.group = value;
    this.queryCache.page = 0;
    this.fetchData(this.queryCache);
  }

  render() {
    console.log('props', this.props.store);
    const allgroups = this.state.allGroups;
    const tableData = this.props.bindingData.tableData;
    return (
      <div className="enhance-table" style={styles.enhanceTable}>
        <IceContainer style={styles.card}>
          <div>
            <Button type="primary" onClick={this.onShowModal}>
              添加认证
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
          >
            <Table.Column
              title="ID"
              lock
              width={230}
              dataIndex="_id"
            />
            {/* <Table.Column title="分类" dataIndex="type" width={85} /> */}
            <Table.Column
              title="IP"
              dataIndex="host"
              width={150}
            />
            <Table.Column
              title="端口"
              dataIndex="port"
              width={85}
            // cell={this.renderStatus}
            />
            <Table.Column
              title="用户名"
              dataIndex="username"
              width={150}
            />
            <Table.Column
              title="分组"
              dataIndex="group.name"
              width={150}
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
              title="操作"
              lock="right"
              width={150}
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
        {this.state.editVisible && <Modal data={this.state.choosedcert} onOk={this.onEditOk} onCancel={this.onEditCancel} />}
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
