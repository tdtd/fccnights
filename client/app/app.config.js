'use strict';

export function routeConfig($urlRouterProvider, $locationProvider, $httpProvider) {
  'ngInject';

  let authInterceptor = function() {
    return {
      responseError: function(err){
        if(err.status == 401) window.location = '/auth/twitter';
        return err;
      }
    } 
  };
  
  $httpProvider.interceptors.push(authInterceptor);
  
  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
}
