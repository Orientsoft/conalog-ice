import React, { Component } from 'react';
import SimpleTable from './components/SimpleTable';

export default class User extends Component {
  static displayName = 'User';

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="user-page">
        <SimpleTable />
      </div>
    );
  }
}
