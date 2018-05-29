import React, { Component } from 'react';
import { Dialog, Grid, Input, Button, Field, Form, Select } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
// import { enquireScreen } from 'enquire-js';

const { Item: FormItem } = Form;

const defaultValue = {
  name: '',
  type: null,
};

export default class SimpleFormDialog extends Component {
  constructor(props) {
    super(props);
    this.field = new Field(this);
    this.state = {
      value: this.props.data || defaultValue,
      title: this.props.data ? '修改' : '添加',
    };
  }

  componentWillMount() {
    this.field.setValues({
      name: this.state.value.name,
      type: this.state.value.type,
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
        type: values.type,
      };
      this.props.onOk(data);
    });
  };

  render() {
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
                  { required: true, trigger: 'onBlur', message: '请填写组名' },
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
                  { required: true, message: '请选择分组' },
                ],
              })}
            >
              <li value={0} key='CERT'>CERT</li>
              <li value={1} key='COLLECTOR'>COLLECTOR</li>
              <li value={2} key='PARSER'>PARSER</li>
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
