'use strict';

var express = require('express');
var controller = require('./bar.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', controller.index);
router.get('/getbar/:loc', controller.getBar);
router.put('/attending/:id', auth.isAuthenticated(), controller.attending);

module.exports = router;
