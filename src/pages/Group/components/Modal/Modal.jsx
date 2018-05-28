import React, { Component } from 'react';
import { Dialog, Grid, Input, Button, Field, Form, Select } from '@icedesign/base';
import IceContainer from '@icedesign/container';
import {
  FormBinderWrapper as IceFormBinderWrapper,
  FormBinder as IceFormBinder,
  FormError as IceFormError,
} from '@icedesign/form-binder';
// import { enquireScreen } from 'enquire-js';
import CryptoJS from 'crypto-js';
// import { Link } from 'react-router';

// const { Row, Col } = Grid;
const { Item: FormItem } = Form;

// const defaultValue = {
//   username: '',
//   password: '',
//   rePasswd: '',
// };

// export default class SimpleFormDialog extends Component {
//   static displayName = 'SimpleFormDialog';

//   constructor(props) {
//     super(props);
//     this.field = new Field(this);
//     this.state = {
//       visible: false,
//       value: defaultValue,
//       isMobile: false,
//     };
//   }

//   componentDidMount() {
//     this.enquireScreenRegister();
//   }

//   enquireScreenRegister = () => {
//     const mediaCondition = 'only screen and (max-width: 720px)';

//     enquireScreen((mobile) => {
//       this.setState({
//         isMobile: mobile,
//       });
//     }, mediaCondition);
//   };

//   showDialog = () => {
//     this.setState({
//       visible: true,
//       value: {
//         username: '',
//         password: '',
//         rePasswd: '',
//       },
//     });
//   };

//   hideDialog = () => {
//     this.setState({
//       visible: false,
//       value: defaultValue,
//     });
//   };

//   onOk = () => {
//     const password = this.state.value.password;
//     if (password) {
//       this.state.value.password = CryptoJS.SHA256(password).toString();
//     }
//     console.log('value', this.state.value);
//     this.refForm.validateAll((error) => {
//       if (error) {
//         // show validate error
//         return;
//       }
//       // deal with value

//       this.hideDialog();
//     });
//   };

//   onFormChange = (value) => {
//     this.setState({
//       value,
//     });
//   };

//   checkPass2 = (rule, value, callback) => {
//     const { getValue } = this.field;
//     console.log('value',value, this.state.value.password)
//     if (value && value !== this.state.value.password) {
//       callback('两次输入密码不一致！');
//     } else {
//       callback();
//     }
//   }

//   render() {
//     const { init } = this.field;
//     const { isMobile } = this.state;
//     const simpleFormDialog = {
//       ...styles.simpleFormDialog,
//     };
//     // 响应式处理
//     if (isMobile) {
//       simpleFormDialog.width = '300px';
//     }

//     return (
//       <IceContainer>
//         <Dialog
//           className="simple-form-dialog"
//           style={simpleFormDialog}
//           autoFocus={false}
//           footerAlign="center"
//           title="添加"
//           {...this.props}
//           onOk={this.onOk}
//           onCancel={this.hideDialog}
//           onClose={this.hideDialog}
//           isFullScreen
//           visible={this.state.visible}
//         >
//           <IceFormBinderWrapper
//             ref={(ref) => {
//               this.refForm = ref;
//             }}
//             value={this.state.value}
//             onChange={this.onFormChange}
//           >
//             <div style={styles.dialogContent}>
//               <Row style={styles.formRow}>
//                 <Col span={`${isMobile ? '6' : '6'}`}>
//                   <label style={styles.formLabel}>用户名:</label>
//                 </Col>
//                 <Col span={`${isMobile ? '18' : '14'}`}>
//                   <IceFormBinder
//                     required
//                     message="当前字段必填"
//                   >
//                     <Input
//                       name="username"
//                       style={styles.input}
//                     />
//                   </IceFormBinder>
//                   <IceFormError name="username" />
//                 </Col>
//               </Row>
//               <Row style={styles.formRow}>
//                 <Col span={`${isMobile ? '6' : '6'}`}>
//                   <label style={styles.formLabel}>密码:</label>
//                 </Col>
//                 <Col span={`${isMobile ? '18' : '14'}`}>
//                   <IceFormBinder
//                     required
//                     message="当前字段必填"
//                   >
//                     <Input
//                       htmlType="password"
//                       name="password"
//                       style={styles.input}
//                     />
//                   </IceFormBinder>
//                   <IceFormError name="password" />
//                 </Col>
//               </Row>
//               <Row style={styles.formRow}>
//                 <Col span={`${isMobile ? '6' : '6'}`}>
//                   <label style={styles.formLabel}>确认密码:</label>
//                 </Col>
//                 <Col span={`${isMobile ? '18' : '14'}`}>
//                   <IceFormBinder
//                     required
//                     message="当前字段必填"
//                   >
//                     <Input
//                       htmlType="rePasswd"
//                       name="rePasswd"
//                       style={styles.input}
//                       placeholder="两次输入密码保持一致"
//                       {...init('rePasswd', {
//                         rules: [
//                           {
//                             required: true,
//                             whitespace: true,
//                             message: '请再次输入密码',
//                           },
//                           {
//                             validator: this.checkPass2.bind(this),
//                           },
//                         ],
//                       }
//                       )}
//                     />
//                   </IceFormBinder>
//                   <IceFormError name="password" />
//                 </Col>
//               </Row>
//             </div>
//           </IceFormBinderWrapper>
//         </Dialog>
//         <Button type="primary" onClick={this.showDialog}>
//           添加用户
//         </Button>
//         <Button type="primary">
//           <Link to="/">
//             返回登录界面
//           </Link>
//         </Button>
//       </IceContainer>
//     );
//   }
// }

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
        title="添加"
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
              <li value={0}>CERT</li>
              <li value={1}>COLLECTOR</li>
              <li value={2}>PARSER</li>
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
