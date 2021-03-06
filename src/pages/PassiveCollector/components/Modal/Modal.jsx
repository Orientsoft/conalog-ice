import React, { Component } from 'react';
import { Dialog, Input, Field, Select, Form, TimePicker } from '@icedesign/base';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
import axios from 'axios';
import { observer, inject } from 'mobx-react';
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
  },
  group: '',
};
@inject('store')
@observer
export default class SimpleFormDialog extends Component {
  static displayName = 'SimpleFormDialog';

  constructor(props) {
    super(props);
    this.field = new Field(this);
    this.state = {
      value: this.props.data || defaultValue,
      title: this.props.data ? '修改' : '添加',
    };
  }

  componentWillMount() {
    // 获取certs
    this.props.store.fetchCerts({ params: { pageSize: config.MAX_SIZE } });
    // 获取分组
    this.props.store.fetchGroup({ params: { pageSize: config.MAX_SIZE } }, { grouptype: 1 });
    const value = this.state.value;
    // 编辑时初始化form
    this.field.setValues({
      name: value.name,
      encoding: value.encoding,
      cert: value.cert.username ? value.cert._id : '',
      parameter: value.worker.parameter,
      path: value.worker.path,
      outputname: value.output.name,
      outputtype: value.output.type,
      group: value.group._id,
    });
  }

  onInputUpdate = (record) => {
    this.field.setValues({
      path: record,
    });
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
        category: 1,
        running: false,
        group: values.group,
        worker: {
          path: values.path,
          parameter: values.parameter,
        },
      };
      this.props.onOk(data);
    });
  };

  render() {
    const allGroups = this.props.store.allGroups.slice();
    allGroups.shift();
    const allCerts = this.props.store.allCerts.slice();
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
                ],
              })}
            />
          </FormItem>

          <FormItem label="编码：" {...formItemLayout} hasFeedback >
            <Select
              style={{ width: '100%' }}
              {...init('encoding', {
                rules: [
                  { required: true, message: '庆选择编码' },
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
                  { required: true, trigger: 'onBlur', message: '请填写路径' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="参数：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('parameter', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写参数' },
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
              placeholder="默认为 pc_名字"
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
              // htmlType="type"
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
