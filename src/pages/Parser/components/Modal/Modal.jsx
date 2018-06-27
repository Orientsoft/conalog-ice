import React, { Component } from 'react';
import { Dialog, Grid, Input, Button, Field, Select, Form } from '@icedesign/base';
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
const { Combobox } = Select;

const defaultValue = {
  name: '', // 命名要求唯一
  path: '', // 相对路径
  input: {
    type: null, // IO_TYPE
    name: '', // undefiend, null, ''表示用户未定义，按照默认法则拼串
  },
  output: {
    type: null, // IO_TYPE
    name: '', // undefiend, null, ''表示用户未定义，按照默认法则拼串
  },
  parameter: '',
  running: false,
  group: '', // 分组
};

export default class SimpleFormDialog extends Component {
  static displayName = 'SimpleFormDialog';

  constructor(props) {
    super(props);
    this.field = new Field(this);
    this.state = {
      value: this.props.data || defaultValue,
      title: this.props.data ? '修改' : '添加',
      // isMobile: false,
      allGroups: [],
      scripts: [],
    };
  }

  componentWillMount() {
    const url = conalogUrl + '/groups'
    //获取分组
    axios.get(url, { params: { pageSize: config.MAX_SIZE } })
      .then((response) => {
        this.state.allGroups = response.data.groups.filter(item => item.type === 2);
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
    // 获取脚本
    const urlscript = conalogUrl + '/parsers/scripts';
    axios.get(urlscript)
      .then((response) => {
        this.state.scripts = response.data;
        this.setState({
          scripts: this.state.scripts,
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
      path: value.path,
      inputtype: value.input.type,
      inputname: value.input.name,
      outputtype: value.output.type,
      outputname: value.output.name,
      parameter: value.parameter,
      group: value.group._id,
      // group: value.group,
    });
  }

  // onFormChange = (value) => {
  //   this.setState({
  //     value,
  //   });
  // };
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

          <FormItem label="路径：" {...formItemLayout} hasFeedback >
            {/* <Row> */}
            <Combobox
              onInputUpdate={this.onInputUpdate}
              style={{ width: '100%' }}
              {...init('path', {
                rules: [
                  { required: true, message: '请选择脚本' },
                ],
              })}
            >
              {scripts && scripts.map((item, key) => (<option key={item} value={item}>{item}</option>))}
            </Combobox>
          </FormItem>

          <FormItem label="参数：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('parameter', {
                // rules: [
                //   { required: true, trigger: 'onBlur', message: '请填写参数' },
                // ],
              })}
            />
          </FormItem>

          <FormItem label="输入数据通道：" {...formItemLayout} hasFeedback>
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

          <FormItem label="输入数据通道名：" {...formItemLayout} hasFeedback >
            <Input
              hasLimitHint
              {...init('inputname', {
                rules: [
                  { required: true, trigger: 'onBlur', message: '请填写输入数据通道名' },
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
              placeholder="默认为 p_名字"
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

