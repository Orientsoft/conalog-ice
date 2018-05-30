/* eslint no-underscore-dangle: 0 */
import React, { Component } from 'react';
import { Table, Pagination, Tab, Search, Button, Dialog, Icon } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import DataBinder from '@icedesign/data-binder';
import IceLabel from '@icedesign/label';
import { enquireScreen } from 'enquire-js';
import Modal from '../Modal';
import config from '../../../../config';
import axios from 'axios';
import moment from 'moment';

const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

@DataBinder({
  tableData: {
    url: conalogUrl + '/parsers',
    method: 'get',
    responseFormatter: (responseHandler, res, originResponse) => {
      let list = res.parsers;
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

    this.queryCache = {};
    this.state = {
      // activeKey: 'solved',
      addVisible: false,
      editVisible: false,
      choosedparser: {},
      allGroups: [],
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
        Dialog.alert({
          title: 'alert',
          content: error.response.data.message ? error.response.data.message : error.response.data,
          onOk: () => { },
        });
      });
    // this.queryCache.page = 1;
    this.fetchData({
      page: 0,
    });
    // this.fetchData();
  }

  // fetchData = () => {
  //   this.props.updateBindingData('tableData', {
  //     data: this.queryCache,
  //   });
  // };
  fetchData = (page) => {
    this.props.updateBindingData('tableData', {
      params: page,
    });
  };

  renderTitle = (value, index, record) => {
    return (
      <div style={styles.titleWrapper}>
        <span style={styles.title}>{record.title}</span>
      </div>
    );
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
            Dialog.alert({
              title: 'alert',
              content: error.response.data.message ? error.response.data.message : error.response.data,
              onOk: () => { },
            });
          });
      },
    });
  };

  startParser = (record) => {
    let id = record._id;
    const url = conalogUrl + '/parsers/' + id + '/test'
    axios.get(url)
      .then((response) => {
        Dialog.confirm({
          title: '测试',
          content: response.statusText,
          onOk: () => { },
        });
      })
      .catch((error) => {
        Dialog.alert({
          title: 'alert',
          content: error.response.data.message ? error.response.data.message : error.response.data,
          onOk: () => { },
        });
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
      </div>
    );
  };

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
    if (record) {
      return <Icon type="set" />;
    } else {
      return <div style={styles.icon}><Icon  type="set" /></div> ;
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
        Dialog.alert({
          title: 'alert',
          content: error.response.data.message ? error.response.data.message : error.response.data,
          onOk: () => { },
        });
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
        Dialog.alert({
          title: 'alert',
          content: error.response.data.message ? error.response.data.message : error.response.data,
          onOk: () => { },
        });
      });
  };

  onEditCancel = () => {
    this.setState({
      editVisible: false,
    });
  };

  render() {
    const tableData = this.props.bindingData.tableData;
    return (
      <div className="enhance-table" style={styles.enhanceTable}>
        <IceContainer style={styles.card}>
          <div>
            <Button type="primary" onClick={this.onShowModal}>
              添加解析
            </Button>
          </div>
          {/* <div style={styles.extraFilter}>
            <Search
              style={styles.search}
              type="primary"
              inputWidth={150}
              placeholder="搜索"
              searchText=""
              onSearch={this.onSearch}
            />
          </div> */}
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
              width={230}
              dataIndex="_id"
            />
            {/* <Table.Column title="分类" dataIndex="type" width={85} /> */}
            <Table.Column
              title="名字"
              dataIndex="name"
              width={150}
            />
            <Table.Column
              title="脚本"
              dataIndex="path"
              width={85}
            // cell={this.renderStatus}
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
              dataIndex="running"
              width={50}
              cell={this.renderrunning}
            />
            <Table.Column
              title="操作"
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
  icon: {
    animation: 'change 3s linear infinite',
    // display: 'inline - block',
  },
};
