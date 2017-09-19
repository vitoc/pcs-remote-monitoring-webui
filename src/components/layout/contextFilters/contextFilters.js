// Copyright (c) Microsoft. All rights reserved.

import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actionTypes from '../../../actions/actionTypes';
import { getRegionByDisplayName, loadRegionSpecificDevices } from '../../../actions/filterActions';
import Select from 'react-select';

import FilterSvg from '../../../assets/icons/Filter.svg';

import './contextFilters.css';

class ContextFilters extends Component {

  constructor(props) {
    super(props);
    // On intial load we show 'All devices' as the group filter and set id as 0.
    this.state = { selectedGroupId: this.props.selectedDeviceGroupId };
    this.updateValue = this.updateValue.bind(this);
  }

  componentDidMount() {
    this.props.loadRegions();
  }

  updateValue(selectedGroupId) {
    this.setState(
      { selectedGroupId }, 
      _ => this.props.deviceGroupChanged(selectedGroupId, this.props.deviceGroups)
    );
  }

  render() {
    const { deviceGroups, disableDeviceFilter }  = this.props;
    let options = deviceGroups.map(group => {
      return { value: group.Id, label: group.DisplayName };
    });
    options = [{ label: 'All Devices', value: 0 }, ...options];
    return (
      <div className="context-filter-container">
        <div className="device-group-filter">
          <img src={FilterSvg} alt="Filter" className="filter-icon" />
          <div className="select-container">
            <Select
              className="top-nav-filters"
              autofocus
              options={options}
              disabled={disableDeviceFilter}
              value={this.state.selectedGroupId}
              onChange={this.updateValue}
              simpleValue
              searchable={true}
            />
          </div>
        </div>
        <div className="dynamic-filters-container">
          {this.props.children}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  loadRegions: () => dispatch(getRegionByDisplayName()),

  deviceGroupChanged: (selectedGroupId, deviceGroups) => {
    let selectedGroupConditions;
    deviceGroups.some(group => {
      if (group.Id === selectedGroupId) {
        selectedGroupConditions = group.Conditions;
        return true;
      }
      return false;
    });
    dispatch(loadRegionSpecificDevices(selectedGroupConditions ? selectedGroupConditions : [], selectedGroupId));
  },

  showManageFiltersFlyout: deviceGroups => {
    dispatch({
      type: actionTypes.FLYOUT_SHOW,
      content: {
        type: 'Manage Filters',
        deviceGroups
      }
    });
  }
});

const mapStateToProps = state => ({
  deviceGroups: state.filterReducer.deviceGroups || [],
  selectedDeviceGroupId: state.filterReducer.selectedDeviceGroupId || 0
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextFilters);