'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var barCtrlStub = {
  index: 'barCtrl.index',
  show: 'barCtrl.show',
  create: 'barCtrl.create',
  upsert: 'barCtrl.upsert',
  patch: 'barCtrl.patch',
  destroy: 'barCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var barIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './bar.controller': barCtrlStub
});

describe('Bar API Router:', function() {
  it('should return an express router instance', function() {
    expect(barIndex).to.equal(routerStub);
  });

  describe('GET /api/bars', function() {
    it('should route to bar.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'barCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/bars/:id', function() {
    it('should route to bar.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'barCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/bars', function() {
    it('should route to bar.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'barCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/bars/:id', function() {
    it('should route to bar.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'barCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/bars/:id', function() {
    it('should route to bar.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'barCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/bars/:id', function() {
    it('should route to bar.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'barCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
