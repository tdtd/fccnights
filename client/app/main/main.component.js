'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './main.routes';

export class MainComponent {
  /*@ngInject*/
  constructor($scope, $http, $q) {
    this.$http = $http;
    this.$scope = $scope;
    this.$q = $q;
    this.found = true;
    this.info;
    this.locAvail = false;
    this.loc;
    this.barList = [];
    this.isMobile = window.matchMedia("only screen and (max-width: 760px)");
    
    if (this.getLastSearch()){
      this.loc = this.getLastSearch();
    }
  }
  
  $onInit() {
    let self = this;
    self.search();
    if ("geolocation" in navigator) {
      this.locAvail = true;
    }
  }
  
  search() {
    let self = this;
    if(!this.loc) return;
    this.setLastSearch(this.loc);
    this.found = false;
    this.getBars(this.loc)
      .then(data => {
        self.barList = self.parseBar(data);
        self.found = true;
      })
      .catch(err => {

      })
  }
  
  getBars(loc) {
    let self = this;
    return this.$q((resolve, reject) => {
      //return resolve (info)
      self.$http.get('/api/bars/getbar/'+loc)
        .then( res => {
          return resolve(res.data)
      })
        .catch( err => {
          console.log(err)
          return reject(err);
      })
    })
  }
  
  //Handle Bar Object
  parseBar(bars){
    let barArr = [];
    let m = this.isMobile;
    barArr = bars.map((bar) => {
      bar.rating = this.rating(bar.rating);
      if(m.matches) {
        bar.activeUrl = bar.mobile_url;
      } else {
        bar.activeUrl = bar.url;
      }
      return bar;
    })
    return barArr;
  }
  
  rating(rate) {
    let arr = [];
    for (var i = 0; i < 5; i++){
      let r = rate - 1;
      if (i <= r){
        arr[i] = 'full';
      } else if (rate % 1 != 0 && (Math.round(rate) - 1)  == i) {
        arr[i] = 'half';
      } else {
        arr[i] = 'empty';
      }
    }
    return arr;
  }
  
  updateAttending(data){
    this.barList.forEach((bar) => {
      if (bar.id == data.id){
        bar.attending = data.attending[0];
      }
    })
  }
  
  //UI Interactions
  getLoc() {
    let self = this;
    navigator.geolocation.getCurrentPosition((pos) => {
      self.loc = ''+pos.coords.latitude+', '+pos.coords.longitude;
      self.$scope.$digest()
      self.search();
    })
  }
  
  attending(bar) {
    let self = this;
    this.$http.put('api/bars/attending/'+bar.id)
      .then(res => {
        self.updateAttending(res.data)
      })
    .catch(err => {
      console.log(err)
    })
  }
  
  setLastSearch(text){
    localStorage.setItem('lastSearch', text)
  }
  
  getLastSearch(text){
    return localStorage.getItem('lastSearch');
  }
}

export default angular.module('nightlifeApp.main', [uiRouter])
  .config(routes)
  .component('main', {
    template: require('./main.html'),
    controller: MainComponent,
    controllerAs: 'mCtrl'
  })
  .name;