// Copyright (c) YugaByte, Inc.

import UniverseForm from '../../components/forms/UniverseForm';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { getInstanceTypeList, getInstanceTypeListSuccess, getInstanceTypeListFailure
          } from '../../actions/cloud';
import { createUniverse, createUniverseSuccess, createUniverseFailure,
  editUniverse, editUniverseSuccess, editUniverseFailure,
  fetchUniverseList, fetchUniverseListSuccess, fetchUniverseListFailure, closeDialog }
  from '../../actions/universe';
import {isValidObject} from '../../utils/ObjectUtils';

//For any field errors upon submission (i.e. not instant check)

const mapDispatchToProps = (dispatch) => {
  return {

    submitCreateUniverse: (values) => {
      values.regionList = values.regionList.map(function(item, idx){
        return item.value;
      });
      var payload = {"userIntent": values};
      return new Promise((resolve, reject) => {
        dispatch(createUniverse(payload)).then((response) => {
          if (response.payload.status !== 200) {
            dispatch(createUniverseFailure(response.payload));
          } else {
            dispatch(createUniverseSuccess(response.payload));
            dispatch(fetchUniverseList())
              .then((response) => {
                if (response.payload.status !== 200) {
                  dispatch(fetchUniverseListFailure(response.payload));
                  //Add Error message state to modal
                } else {
                  dispatch(fetchUniverseListSuccess(response.payload));
                  dispatch(closeDialog());
                }
              });
          }
        });
      })
    },
    submitEditUniverse: (values) => {
      values.regionList = values.regionList.map(function(item, idx){
        return item.value;
      });
      var payload = {"userIntent": values};
      var universeUUID = values.universeId;
      dispatch(editUniverse(universeUUID, payload)).then((response) => {
        if (response.payload.status !== 200) {
          dispatch(editUniverseFailure(response.payload));
        } else {
          dispatch(editUniverseSuccess(response.payload));
          dispatch(fetchUniverseList())
            .then((response) => {
              if (response.payload.status !== 200) {
                dispatch(fetchUniverseListFailure(response.payload));
                //Add Error message state to modal
              } else {
                dispatch(fetchUniverseListSuccess(response.payload));
                dispatch(closeDialog());
              }
            });
        }
      })
    },
    
    getInstanceTypeListItems: (provider) => {
      dispatch(getInstanceTypeList(provider))
        .then((response) => {
          if(response.payload.status !== 200) {
            dispatch(getInstanceTypeListFailure(response.payload));
          } else {
            dispatch(getInstanceTypeListSuccess(response.payload));
          }
        });
    }
  }
}

function mapStateToProps(state, ownProps) {
  const {universe: {currentUniverse}} = state;
  var data = {
    "serverPackage": "yb-server-0.0.1-SNAPSHOT.c31ccae363d3a94ab5ebc7088212a92729df17ea.tar.gz",
    "numNodes": 3, "isMultiAZ": true, "instanceType": "m3.medium"
  };
  
  if (isValidObject(currentUniverse)) {
    data.universeName = currentUniverse.name;
    data.provider = currentUniverse.provider.uuid;
    data.regionList = currentUniverse.regions.map(function (item, idx) {
      return {'value': item.uuid, 'name': item.name, "label": item.name};
    });
    data.numNodes = currentUniverse.universeDetails.numNodes;
    data.isMultiAZ = currentUniverse.universeDetails.userIntent.isMultiAZ;
    data.instanceType = currentUniverse.universeDetails.userIntent.instanceType;
    data.serverPackage = currentUniverse.universeDetails.ybServerPkg;
    data.universeId = currentUniverse.universeUUID;
  }

  return {
    universe: state.universe,
    cloud: state.cloud,
    initialValues: data
  };
}


var universeForm = reduxForm({
  form: 'UniverseForm',
  fields: ['formType', 'universeName', 'provider', 'regionList',
    'numNodes', 'isMultiAZ', 'instanceType', 'serverPackage', 'universeId']
})




module.exports = connect(mapStateToProps, mapDispatchToProps)(universeForm(UniverseForm));
