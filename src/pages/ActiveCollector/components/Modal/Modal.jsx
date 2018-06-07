import React, { Component } from 'react';
import { Dialog, Input, Field, Select, Form, TimePicker } from '@icedesign/base';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
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
    type: null,
    interval: null,
    corn: '',
  },
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
      scripts: [],
    };
  }

  componentWillMount() {
    const value = this.state.value;
    // 编辑时初始化form
    this.field.setValues({
      name: value.name,
      encoding: value.encoding,
      cert: value.cert.user ? value.cert.user + '@' + value.cert.host + value.cert.port : '',
      parameter: value.worker.parameter,
      path: value.worker.path,
      type: value.worker.type,
      interval: value.worker.interval,
      cron: value.worker.cron,
      category: value.category,
      outputname: value.output.name,
      outputtype: value.output.type,
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
        path: values.path,
        input: {
          type: values.inputtype,
          name: values.inputname,
        },
        output: {
          type: values.outputtype,
          name: values.outputname,
        },
        parameter: values.parameter || '',
        group: values.group,
      };
      this.props.onOk(data);
    });
  };

  render() {
    const allgroups = this.state.allGroups;
    const scripts = this.state.scripts;
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
              {...init('inputtype', {
                rules: [
                  { required: true, message: '输入数据通道' },
                ],
              })}
            >
              <li value={0} key="REDIS_CHANNEL">REDIS_CHANNEL</li>
              <li value={1} key="NSQ_QUEUE">NSQ_QUEUE</li>
            </Select>
          </FormItem>

          <FormItem label="cert：" {...formItemLayout} hasFeedback >
            <Select
              style={{ width: '100%' }}
              hasLimitHint
              {...init('cert', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写参数' },
                ],
              })}
            >
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

          <FormItem label="参数：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('parameter', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写名字' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="type：" {...formItemLayout} hasFeedback >
            <Select
              style={{ width: '100%' }}
              hasLimitHint
              {...init('type', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请选择采集类型' },
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
              {...init('interval', {
                rules: [
                  // { required: true, trigger: 'onBlur', message: '请选择时间' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="cron：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('cron', {
                rules: [
                  // { required: true, trigger: 'onBlur', message: '请填写名字' },
                ],
              })}
            />
          </FormItem>

          <FormItem label="输出数据通道：" {...formItemLayout} hasFeedback>
            <Select
              style={{ width: '100%' }}
              {...init('outputtype', {
                rules: [
                  { required: true, message: '输出数据通道' },
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
              {...init('outputname', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写输出数据通道名' },
                ],
              })}
            />
          </FormItem>

          {/* <FormItem label="分组：" {...formItemLayout} hasFeedback>
            <Select
              style={{ width: '100%' }}
              // htmlType="type"
              {...init('group', {
                rules: [
                  { required: true, message: '请选择分组' },
                ],
              })}
            >
              {allgroups && allgroups.map((item, key) => (<li key={item.name} value={item._id}>{item.name}</li>))}
            </Select>
          </FormItem> */}
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
