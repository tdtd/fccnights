'use strict';

import angular from 'angular';
import SignupController from './signup.controller';

export default angular.module('nightlifeApp.signup', [])
  .controller('SignupController', SignupController)
  .name;
