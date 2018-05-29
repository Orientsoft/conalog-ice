import React, { Component } from 'react';
// import SimpleFormDialog from './components/SimpleFormDialog';
import EnhanceTable from './components/EnhanceTable';

export default class Collector extends Component {
  static displayName = 'Collector';

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="collector-page">
        {/* <SimpleFormDialog /> */}
        <EnhanceTable />
      </div>
    );
  }
}
