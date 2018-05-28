import React, { Component } from 'react';
import FeatureDisplay from './components/FeatureDisplay';

export default class First extends Component {
  static displayName = 'First';

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="first-page">
        <FeatureDisplay />
      </div>
    );
  }
}
