import React, { Component } from 'react';
import { Dialog, Grid, Input, Radio, Button, Select } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
import { enquireScreen } from 'enquire-js';

const { Row, Col } = Grid;
const { Group: RadioGroup } = Radio;
const Option = Select.Option;

// const defaultValue = {
//   keywords: '',
//   type: 'post',
//   content: '',
// };
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
    this.state = {
      value: defaultValue,
      isMobile: false,
    };
  }

  componentDidMount() {
    this.enquireScreenRegister();
  }

  enquireScreenRegister = () => {
    const mediaCondition = 'only screen and (max-width: 720px)';

    enquireScreen((mobile) => {
      this.setState({
        isMobile: mobile,
      });
    }, mediaCondition);
  };

  onFormChange = (value) => {
    this.setState({
      value,
    });
  };
  onOk = () => {
    this.refForm.validateAll((error) => {
      if (error) {
        // show validate error
        return;
      }
      // deal with value
      this.props.onOk();
      this.hideDialog();
    });
  };

  onCancel = () => {
    this.hideDialog();
  }
  hideDialog = () => {
    this.setState({
      value: defaultValue,
    });
  };
  
  render() {
    const { isMobile } = this.state;
    const simpleFormDialog = {
      ...styles.simpleFormDialog,
    };
    // 响应式处理
    if (isMobile) {
      simpleFormDialog.width = '300px';
    }

    return (
      <Dialog
        className="simple-form-dialog"
        style={simpleFormDialog}
        autoFocus={false}
        footerAlign="center"
        title="添加"
        {...this.props}
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        onClose={this.props.onCancel}
        isFullScreen
        visible
      >
        <IceFormBinderWrapper
          ref={(ref) => {
            this.refForm = ref;
          }}
          value={this.state.value}
          onChange={this.onFormChange}
        >
          <div style={styles.dialogContent}>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>名字:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '18'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="name"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>路径:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '18'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="path"
                    style={styles.input}
                  />
                </IceFormBinder>
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>参数:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '18'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="parameter"
                    style={styles.input}
                  />
                </IceFormBinder>
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>数据输入通道类型:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '6'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Select name="input.type" style={styles.input}>
                    <Option key="REDIS_CHANNEL" value={0}>REDIS_CHANNEL</Option>
                    <Option key="NSQ_QUEUE" value={1}>NSQ_QUEUE</Option>
                  </Select>
                </IceFormBinder>
              </Col>

              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>数据输出通道类型:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '6'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Select name="output.type" style={styles.input}>
                    <Option key="REDIS_CHANNEL" value={0}>REDIS_CHANNEL</Option>
                    <Option key="NSQ_QUEUE" value={1}>NSQ_QUEUE</Option>
                  </Select>
                </IceFormBinder>
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>数据输入通道名:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '18'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="input.name"
                    style={styles.input}
                  />
                </IceFormBinder>
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>数据输出通道名:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '18'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="output.name"
                    style={styles.input}
                  />
                </IceFormBinder>
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>运行:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '18'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="running"
                    style={styles.input}
                  />
                </IceFormBinder>
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '6'}`}>
                <label style={styles.formLabel}>分组:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '18'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="group"
                    style={styles.input}
                  />
                </IceFormBinder>
              </Col>
            </Row>
          </div>
        </IceFormBinderWrapper>
      </Dialog>
    );
  }
}

const styles = {
  simpleFormDialog: { width: '600px' },
  dialogContent: {},
  formRow: { marginTop: 20 },
  input: { width: '100%' },
  formLabel: {
    lineHeight: '26px',
    textAlign: 'right',
  },
};
