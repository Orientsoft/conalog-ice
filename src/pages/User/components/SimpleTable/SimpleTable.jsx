import React, { Component } from 'react';
import { Table, Pagination, Button, Dialog } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import IceImg from '@icedesign/img';
import DataBinder from '@icedesign/data-binder';
import IceLabel from '@icedesign/label';
import Modal from '../Modal';
import { enquireScreen } from 'enquire-js';
import config from '../../../../config';
import axios from 'axios';
import moment from 'moment';

const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

@DataBinder({
  tableData: {
    url: conalogUrl + '/users',
    method: 'get',
    responseFormatter: (responseHandler, res, originResponse) => {
      let list = res.users
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
      total: 0,
      pageSize: 10,
      currentPage: 1,
    },
  },
})
export default class SimpleTable extends Component {
  static displayName = 'SimpleTable';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      isMobile: false,
      addVisible: false,
      editVisible: false,
      choosedUser: {},
    };
  }

  componentDidMount() {
    // this.enquireScreenRegister();
    this.fetchData({
      page: 0,
    });
  }

  alert = (error) => {
    Dialog.alert({
      title: 'alert',
      content: error.response.data.message ? error.response.data.message : error.response.data,
      onOk: () => { },
    });
  }

  fetchData = ({ page }) => {
    this.props.updateBindingData('tableData', {
      params: {
        page,
      },
    });
  };

  renderTitle = (value, index, record) => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div>
          <IceImg src={record.cover} width={48} height={48} />
        </div>
        <span
          style={{
            marginLeft: '10px',
            lineHeight: '20px',
          }}
        >
          {record.title}
        </span>
      </div>
    );
  };

  editItem = (record) => {
    this.state.choosedUser = record;
    this.setState({
      editVisible: true,
    });
  };

  deleteItem = (record) => {
    let id = record._id
    let username = record.username
    Dialog.confirm({
      title: '删除',
      content: '确定删除用户  ' + username + '?',
      onOk: () => {
        const that = this;
        const url = conalogUrl + '/users/' + id
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
      </div>
    );
  };

  changePage = (currentPage) => {
    this.fetchData({
      page: currentPage - 1,
    });
  };
  showAddModal = () => {
    this.setState({
      addVisible: true,
    });
  }
  onAddOk = (data) => {
    const that = this;
    const url = conalogUrl + '/users'
    axios.post(url, data)
      .then((response) => {
        that.fetchData({
          page: 0,
        });
        this.setState({
          addVisible: false,
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
    let id = this.state.choosedUser._id
    const that = this;
    const url = conalogUrl + '/users/' + id
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
  }

  render() {
    const tableData = this.props.bindingData.tableData;

    return (
      <div className="simple-table">
        <IceContainer>
          <Button type="primary" onClick={this.showAddModal}>
            添加用户
          </Button>
        </IceContainer>
        <IceContainer>
          <Table
            dataSource={tableData.list}
            isLoading={tableData.__loading} // eslint-disable-line
            className="basic-table"
            hasBorder={false}
          >
            <Table.Column
              title="ID"
              width={320}
              dataIndex="_id"
            />
            {/* <Table.Column title="问题分类" dataIndex="type" width={85} /> */}
            <Table.Column
              title="用户名"
              width={150}
              dataIndex="username"
            />
            <Table.Column
              title="创建"
              dataIndex="createdAt"
              width={200}
            />
            <Table.Column
              title="更新"
              dataIndex="updatedAt"
              width={200}
            />
            <Table.Column
              title="操作"
              // dataIndex="operation"
              width={150}
              cell={this.renderOperations}
            />
          </Table>
          <div style={styles.paginationWrapper}>
            <Pagination
              current={tableData.currentPage}
              pageSize={tableData.pageSize}
              total={tableData.total}
              onChange={this.changePage}
              type={this.state.isMobile ? 'simple' : 'normal'}
            />
          </div>
        </IceContainer>
        {this.state.addVisible && <Modal onOk={this.onAddOk} onCancel={this.onAddCancel} />}
        {this.state.editVisible && <Modal data={this.state.choosedUser} onOk={this.onEditOk} onCancel={this.onEditCancel} />}
      </div>
    );
  }
}

const styles = {
  operation: {
    marginRight: '12px',
    textDecoration: 'none',
  },
  paginationWrapper: {
    textAlign: 'right',
    paddingTop: '26px',
  },
};
