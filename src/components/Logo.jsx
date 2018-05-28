import React, { PureComponent } from 'react';
import { Link } from 'react-router';

export default class Logo extends PureComponent {
  render() {
    return (
      <div className="logo" style={{}}>
        <Link to="/home" className="logo-text">
          CONALOG
        </Link>
      </div>
    );
  }
}
