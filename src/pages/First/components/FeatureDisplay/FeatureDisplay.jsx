import React, { Component } from 'react';
import { Grid } from '@icedesign/base';
import config from '../../../../config';
import axios from 'axios';

const { Row, Col } = Grid;
const conalogUrl = 'http://' + config.conalogHost + ':' + config.conalogPort.toString()

const data = [
  {
    title: '采集',
    description:
      '支持主动采集，被动采集和代理采集数据',
    imgUrl:
      'https://img.alicdn.com/tfs/TB1RBTKi4rI8KJjy0FpXXb5hVXa-456-456.png',
  },
  {
    title: '解析',
    description:
      '以交互的方式快速构建解析流以及编写解析器词法',
    imgUrl:
      'https://img.alicdn.com/tfs/TB1LN_Ai9_I8KJjy0FoXXaFnVXa-450-453.png',
  },
  {
    title: '状态',
    description:
      '以图形方式监测数据采集状态以及数据解析状态',
    imgUrl:
      'https://img.alicdn.com/tfs/TB1K3JmgOqAXuNjy1XdXXaYcVXa-450-450.png',
  },
  {
    title: '历史',
    description:
      '通过查找历史日志检查问题',
    imgUrl:
      'https://img.alicdn.com/tfs/TB124gfiY_I8KJjy1XaXXbsxpXa-450-453.png',
  },
];

export default class FeatureDisplay extends Component {
  static displayName = 'FeatureDisplay';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount () {
    const url = conalogUrl + '/users/me'
    axios.get(url)
      .then(function (response) {
        console.log(response);
        // hashHistory.push('/home');
      })
      .catch(function (error) {
        console.log(error);
        // Message.error(error)
      });
  }

  render() {
    return (
      <div className="feature-display" style={styles.container}>
        <div>
          <h3 style={{ textAlign: 'center', fontSize: 80 }}>Conalog</h3>
          <p style={{ textAlign: 'center', fontSize: 70 }}>contact your logs</p>
        </div>
        <br />
        <div style={styles.items}>
          <Row gutter="20" wrap>
            {data.map((item, index) => {
              return (
                <Col key={index} xxs="24" s="12" l="6">
                  <div style={styles.item}>
                    <img src={item.imgUrl} style={styles.image} alt="" />
                    <h3 style={styles.title}>{item.title}</h3>
                    <p style={styles.description}>{item.description}</p>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '0 80px',
  },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  item: {
    textAlign: 'center',
    padding: '0 30px',
    margin: '40px 0',
  },
  title: {
    fontWeight: 'bold',
    fontSize: '20px',
  },
  image: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
  },
  description: {
    fontSize: '13px',
    lineHeight: '22px',
    color: '#999',
  },
};
