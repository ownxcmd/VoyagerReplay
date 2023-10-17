const express = require('express');
const router = express.Router();
const streamController = require('../controllers/stream.controller.js');

router.post('/capture/:id', streamController.post);

router.post('/save/:id', streamController.save);

router.get('/', streamController.get);

module.exports = router;
