import React, { Component } from 'react';
import { Dialog, Grid, Input, Radio, Button, Field, Select, Form } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
import { enquireScreen } from 'enquire-js';
import config from '../../../../config';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const { Item: FormItem } = Form;
const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()


const defaultValue = {
  type: 0,
  host: '',
  port: null,
  username: '',
  password: '',
  key: '',
  group: '',
};

export default class SimpleFormDialog extends Component {
  static displayName = 'SimpleFormDialog';

  constructor(props) {
    super(props);
    this.field = new Field(this);
    this.state = {
      value: this.props.data || defaultValue,
      title: this.props.data ? '修改' : '添加',
      allGroups: [],
      keyorpass: {
        require: true,
        disable: false,
      },
    };
  }

  componentWillMount() {
    const url = conalogUrl + '/groups'
    axios.get(url, { params: { pageSize: config.MAX_SIZE } })
      .then((response) => {
        this.state.allGroups = response.data.groups.filter(item => item.type === 0);
        // this.state.allGroups = response.data.groups;
        this.setState({
          allGroups: this.state.allGroups,
        });
      })
      .catch((error) => {
        console.log(error);
        // Message.error(error)
      });
    const value = this.state.value;
    // 编辑时初始化form
    this.field.setValues({
      type: value.type,
      host: value.host,
      port: value.port,
      username: value.username,
      password: value.password,
      // password: CryptoJS.AES.decrypt(value.password, 'VAULT_BOY').toString(CryptoJS.enc.Utf8),
      key: value.key,
      group: value.group._id,
    });
    if (value.type === 0) {
      this.state.keyorpass.require = true;
      this.state.keyorpass.disable = false;
      this.setState({
        keyorpass: this.state.keyorpass,
      });
    } else if (value.type === 1) {
      this.state.keyorpass.require = false;
      this.state.keyorpass.disable = true;
      this.setState({
        keyorpass: this.state.keyorpass,
      });
    }
  }

  chooseType(rule, value, callback) {
    if (value === 0) {
      this.state.keyorpass.require = true;
      this.state.keyorpass.disable = false;
      this.setState({
        keyorpass: this.state.keyorpass,
      });
      this.field.setValues({
        key: '',
      });
    } else if (value === 1) {
      this.state.keyorpass.require = false;
      this.state.keyorpass.disable = true;
      this.setState({
        keyorpass: this.state.keyorpass,
      });
      this.field.setValues({
        password: '',
      });
    }
    callback();
  }

  onOk = () => {
    this.field.validate((errors, values) => {
      if (errors) {
        console.log('Errors in form!!!');
        return;
      }
      values.port = parseInt(values.port);
      if (values.type === 0) {
        values.key = '';
        // const CERT_KEY = 'VAULT_BOY';
        // const encrypted = CryptoJS.AES.encrypt(values.password, CERT_KEY).toString();
        // values.password = encrypted;
      } else if (values.password === 1) {
        values.password = '';
      }
      this.props.onOk(values);
    });
  };

  render() {
    const allgroups = this.state.allGroups;
    const { require, disable } = this.state.keyorpass;
    const requirekey = !require;

    const simpleFormDialog = {
      ...styles.simpleFormDialog,
    };
    const { init } = this.field;
    const formItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
    };
    return (

      <Dialog
        className="simple-form-dialog"
        style={simpleFormDialog}
        autoFocus={false}
        footerAlign="center"
        title={this.state.title}
        {...this.props}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        onClose={this.props.onCancel}
        isFullScreen
        visible
      >
        <Form field={this.field}>

          <FormItem label="IP：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('host', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写IP' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="端口：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('port', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写端口' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="用户名：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('username', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写名字' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="类型：" {...formItemLayout} hasFeedback>
            <Select
              style={{ width: '100%' }}
              htmlType="type"
              {...init('type', {
                rules: [
                  { required: true, message: '请选择认证类型' },
                  { validator: this.chooseType.bind(this) },
                ],
              })}
            >
              <li value={0} key="PASSWORD">PASSWORD</li>
              <li value={1} key="KEY">KEY</li>
            </Select>
          </FormItem>

          <FormItem label="密码：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              htmlType="password"
              disabled={disable}
              {...init('password', {
                rules: [
                  { required: require, trigger: 'onBlur', message: '请填写密码' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="key：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              htmlType="password"
              disabled={!disable}
              {...init('key', {
                rules: [
                  { required: requirekey, trigger: 'onBlur', message: '请填写KEY' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="分组：" {...formItemLayout} hasFeedback>
            <Select
              style={{ width: '100%' }}
              htmlType="type"
              {...init('group', {
                rules: [
                  { required: true, message: '请选择分组' },
                ],
              })}
            >
              {allgroups && allgroups.map((item, key) => (<li key={item.name} value={item._id}>{item.name}</li>))}
            </Select>
          </FormItem>
        </Form>
      </Dialog>
    );
  }
}

const styles = {
  simpleFormDialog: { width: '640px' },
  dialogContent: {},
  formRow: { marginTop: 20 },
  input: { width: '100%' },
  formLabel: { lineHeight: '26px' },
};
