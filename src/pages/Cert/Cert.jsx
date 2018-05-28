import React, { Component } from 'react';
import EnhanceTable from './components/EnhanceTable';

export default class Cert extends Component {
  static displayName = 'Cert';

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="cert-page">
        <EnhanceTable />
      </div>
    );
  }
}
