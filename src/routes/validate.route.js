const express = require('express');
const router = express.Router();
const validateController = require('../controllers/validate.controller');

router.post('/', validateController.validateEfactur);

module.exports = router;
