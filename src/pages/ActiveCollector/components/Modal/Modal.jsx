import React, { Component } from 'react';
import { Dialog, Input, Field, Select, Form, TimePicker } from '@icedesign/base';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
import axios from 'axios';
import config from '../../../../config';

const { Item: FormItem } = Form;
const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()
const { Combobox } = Select;

const defaultValue = {
  name: '',
  encoding: '',
  cert: '',
  output: {
    type: null,
    name: '',
  },
  category: 0,
  running: false,
  worker: {
    path: '',
    parameter: '',
    type: 0,
    interval: new Date('2017-01-01 00:00:10'),
    corn: '',
  },
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
      allCerts: [],
      intervalorcron: {
        require: true,
        disable: false,
      },
    };
  }

  componentWillMount() {
    const url = conalogUrl + '/certs'
    //获取certs
    axios.get(url, { params: { pageSize: config.MAX_SIZE } })
      .then((response) => {
        this.state.allCerts = response.data.certs;
        this.setState({
          allCerts: this.state.allCerts,
        });
      })
      .catch((error) => {
        Dialog.alert({
          title: 'alert',
          content: error.response.data.message ? error.response.data.message : error.response.data,
          onOk: () => { },
        });
      });
    const groupurl = conalogUrl + '/groups'
    //获取分组
    axios.get(groupurl, { params: { pageSize: config.MAX_SIZE } })
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
    const value = this.state.value;
    // 编辑时初始化form
    this.field.setValues({
      name: value.name,
      encoding: value.encoding,
      cert: value.cert.username ? value.cert._id : '',
      parameter: value.worker.parameter,
      path: value.worker.path,
      type: value.worker.type,
      interval: value.worker.interval,
      cron: value.worker.cron,
      category: value.category,
      outputname: value.output.name,
      outputtype: value.output.type,
      group: value.group._id,
    });
    if (value.worker.type === 0) {
      this.state.intervalorcron.require = true;
      this.state.intervalorcron.disable = false;
      this.setState({
        intervalorcron: this.state.intervalorcron,
      });
    } else if (value.worker.type === 1) {
      this.state.intervalorcron.require = false;
      this.state.intervalorcron.disable = true;
      this.setState({
        intervalorcron: this.state.intervalorcron,
      });
    }
  }

  chooseType(rule, value, callback) {
    if (value === 0) {
      this.state.intervalorcron.require = true;
      this.state.intervalorcron.disable = false;
      this.setState({
        intervalorcron: this.state.intervalorcron,
      });
      this.field.setValues({
        cron: '',
      });
    } else if (value === 1) {
      this.state.intervalorcron.require = false;
      this.state.intervalorcron.disable = true;
      this.setState({
        intervalorcron: this.state.intervalorcron,
      });
      this.field.setValues({
        interval: null,
      });
    }
    callback();
  }
  defaultoutputname(rule, value, callback) {
    const outputname = 'ac_' + value
    this.field.setValue('outputname', outputname);
  }

  onOk = () => {
    this.field.validate((errors, values) => {
      if (errors) {
        console.log('Errors in form!!!');
        return;
      }
      const data = {
        name: values.name,
        encoding: values.encoding,
        cert: values.cert,
        output: {
          type: values.outputtype,
          name: values.outputname,
        },
        category: 0,
        running: false,
        group: values.group,
        worker: {
          type: values.type,
          path: values.path,
          interval: values.interval !== null ? values.interval.getTime() : null,
          cron: values.cron,
          parameter: values.parameter,
        },
      };
      console.log(data);
      this.props.onOk(data);
    });
  };

  render() {
    const { allCerts, allGroups } = this.state;
    const { require, disable } = this.state.intervalorcron;
    const requireCron = !require;
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

          <FormItem label="名字：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('name', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写名字' },
                  // { validator: this.defaultoutputname.bind(this) },
                ],
              })}
            />
          </FormItem>

          <FormItem label="编码：" {...formItemLayout} hasFeedback >
            <Select
              style={{ width: '100%' }}
              {...init('encoding', {
                rules: [
                  { required: true, message: '请选择编码' },
                ],
              })}
            >
              <li key="UTF-8" value="UTF-8">UTF-8</li>
              <li key="ASCII" value="ASCII">ASCII</li>
              <li key="GB2312" value="GB2312">GB2312</li>
              <li key="GBK" value="GBK">GBK</li>
              <li key="GB18030" value="GB18030">GB18030</li>
              <li key="Big5" value="Big5">Big5</li>
              <li key="Big5-HKSCS" value="Big5-HKSCS">Big5-HKSCS</li>
              <li key="Shift_JIS" value="Shift_JIS">Shift_JIS</li>
              <li key="EUC-JP" value="EUC-JP">EUC-JP</li>
              <li key="UTF-16LE" value="UTF-16LE">UTF-16LE</li>
              <li key="UTF-16BE" value="UTF-16BE">UTF-16BE</li>
              <li key="binary" value="binary">binary</li>
              <li key="base64" value="base64">base64</li>
              <li key="hex" value="hex">hex</li>
            </Select>
          </FormItem>

          <FormItem label="认证：" {...formItemLayout} hasFeedback >
            <Select
              style={{ width: '100%' }}
              hasLimitHint
              {...init('cert', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请选择认证' },
                ],
              })}
            >
              {allCerts && allCerts.map((item, key) => (<li key={item.name} value={item._id}>{item.username + '@' + item.host + ':' + item.port}</li>))}
            </Select>
          </FormItem>

          <FormItem label="路径：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('path', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写名字' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="采集参数：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('parameter', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写参数' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="采集类型：" {...formItemLayout} hasFeedback >
            <Select
              style={{ width: '100%' }}
              hasLimitHint
              {...init('type', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请选择采集类型' },
                  { validator: this.chooseType.bind(this) },
                ],
              })}
            >
              <li value={0} key="INTERVAL">INTERVAL</li>
              <li value={1} key="NSQ_QUEUE">CRON</li>
            </Select>
          </FormItem>

          <FormItem label="interval：" {...formItemLayout} hasFeedback >
            <TimePicker
              hasLimitHint
              style={{ width: '100%' }}
              disabled={disable}
              format="HH:mm:ss"
              {...init('interval', {
                rules: [
                  { required: require, trigger: 'onBlur', message: '请选择时间' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="cron：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              disabled={!disable}
              {...init('cron', {
                rules: [
                  { required: requireCron, trigger: 'onBlur', message: '请填写名字' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="输出数据通道：" {...formItemLayout} hasFeedback>
            <Select
              style={{ width: '100%' }}
              {...init('outputtype', {
                rules: [
                  { required: true, message: '请选择输出数据通道' },
                ],
              })}
            >
              <li value={0} key="REDIS_CHANNEL">REDIS_CHANNEL</li>
              <li value={1} key="NSQ_QUEUE">NSQ_QUEUE</li>
            </Select>
          </FormItem>

          <FormItem label="输出数据通道名：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              placeholder="默认为 ac_名字"
              {...init('outputname', {
                rules: [
                  // { required: true, trigger: 'onBlur', message: '请填写输出数据通道名' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="分组：" {...formItemLayout} hasFeedback>
            <Select
              style={{ width: '100%' }}
              {...init('group', {
                rules: [
                  { required: true, message: '请选择分组' },
                ],
              })}
            >
              {allGroups && allGroups.map((item, key) => (<li key={item.name} value={item._id}>{item.name}</li>))}
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
