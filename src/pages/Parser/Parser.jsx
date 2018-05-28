import React, { Component } from 'react';
import EnhanceTable from './components/EnhanceTable';

export default class Parser extends Component {
  static displayName = 'Parser';

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="parser-page">
        <EnhanceTable />
      </div>
    );
  }
}
