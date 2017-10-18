'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureStore = exports.connectStore = exports.defaultMapStateToProps = exports.createReducer = exports.makeActionCreator = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-disable */


var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _stream = require('mithril/stream');

var _stream2 = _interopRequireDefault(_stream);

var _redux = require('redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Generates a new action creator for dispatching requests.
 *
 * @param type
 * @param argNames
 * @returns {Function}
 */
var makeActionCreator = exports.makeActionCreator = function makeActionCreator(type) {
  for (var _len = arguments.length, argNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    argNames[_key - 1] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var action = { type: type };
    argNames.forEach(function (arg, index) {
      action[argNames[index]] = args[index];
    });
    return action;
  };
};

/**
 *  Generates a new reducer for handling action requests
 *
 * @param initialState
 * @param handlers
 * @returns {Function}
 */
var createReducer = exports.createReducer = function createReducer(initialState, handlers) {
  return function () {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments[1];

    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
};

/**
 * Default prop to store mapping
 *
 * @param state
 * @param props
 */
var defaultMapStateToProps = exports.defaultMapStateToProps = function defaultMapStateToProps(state, props) {
  return state;
};

/**
 * Connect container component to redux store
 *
 * @param store
 */
var connectStore = exports.connectStore = function connectStore(store) {
  return function (mapStateToProps) {
    var mapActionCreators = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return function (component) {
      return {
        oninit: function oninit(vnode) {
          var _this = this;

          this.store = store;
          this.componentState = (0, _stream2.default)({});
          this.unsubscribe = null;
          this.actions = (0, _redux.bindActionCreators)(mapActionCreators, this.store.dispatch);

          this.isSubscribed = function () {
            return typeof _this.unsubscribe === 'function';
          };

          this.trySubscribe = function () {
            if (!_this.isSubscribed()) {
              _this.unsubscribe = _this.store.subscribe(_this.handleUpdate.bind(_this, vnode));
              _this.handleUpdate(vnode);
            }
          };

          this.tryUnsubscribe = function () {
            if (_this.isSubscribed()) {
              _this.unsubscribe();
              _this.unsubscribe = null;
            }
          };

          this.handleUpdate = function (vnode) {
            if (!_this.isSubscribed()) return true;
            var ownProps = vnode.attrs || {};
            var storeState = mapStateToProps(_this.store.getState(), ownProps);

            _this.componentState(storeState);

            _mithril2.default.redraw();
          };

          this.trySubscribe();
        },
        onremove: function onremove(vnode) {
          this.actions = null;
          this.store = null;
          this.componentState = null;
          this.tryUnsubscribe();
        },
        view: function view(vnode) {
          var actions = this.actions;
          var storeProps = this.componentState();

          return (0, _mithril2.default)(component, _extends({ actions: actions }, storeProps, vnode.attrs), vnode.children);
        }
      };
    };
  };
};

/**
 * Configure store to use reducers/middleware
 *
 * @param reducers
 * @param initialState
 * @param middleware
 * @returns {Store<S>}
 */
var configureStore = exports.configureStore = function configureStore(reducers) {
  var initialState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var middleware = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  /**
   * Create data store from the defined data shape
   */
  return (0, _redux.createStore)((0, _redux.combineReducers)(reducers), initialState, _redux.applyMiddleware.apply(undefined, _toConsumableArray(middleware)));
};