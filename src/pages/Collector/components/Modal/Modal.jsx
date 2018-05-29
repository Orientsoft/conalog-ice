import React, { Component } from 'react';
import { Dialog, Grid, Input, Radio, Button } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
import { enquireScreen } from 'enquire-js';

const { Row, Col } = Grid;
const { Group: RadioGroup } = Radio;

const defaultValue = {
  type: '',
  host: '',
  port: '',
  username: '',
  password: '',
  key: '',
  group: '',
};

export default class SimpleFormDialog extends Component {
  static displayName = 'SimpleFormDialog';

  constructor(props) {
    super(props);
    this.state = {
      //   visible: this.props.visible,
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
      console.log(this.props)
      this.props.onOk();
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
              <Col span={`${isMobile ? '6' : '3'}`}>
                <label style={styles.formLabel}>主机IP:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '16'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="host"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '3'}`}>
                <label style={styles.formLabel}>端口:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '16'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="port"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '3'}`}>
                <label style={styles.formLabel}>用户名:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '16'}`}>
                <IceFormBinder
                  required
                  
                  message="当前字段必填"
                >
                  <Input
                    name="username"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '3'}`}>
                <label style={styles.formLabel}>类型:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '16'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="type"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '3'}`}>
                <label style={styles.formLabel}>密码:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '16'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="password"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '3'}`}>
                <label style={styles.formLabel}>key:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '16'}`}>
                <IceFormBinder
                  required
                  // message="当前字段必填"
                >
                  <Input
                    name="key"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
            <Row style={styles.formRow}>
              <Col span={`${isMobile ? '6' : '3'}`}>
                <label style={styles.formLabel}>分组:</label>
              </Col>
              <Col span={`${isMobile ? '18' : '16'}`}>
                <IceFormBinder
                  required
                  message="当前字段必填"
                >
                  <Input
                    name="group"
                    style={styles.input}
                  />
                </IceFormBinder>
                <IceFormError name="keywords" />
              </Col>
            </Row>
          </div>
        </IceFormBinderWrapper>
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
