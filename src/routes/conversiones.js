const express = require('express');
const router = express.Router();
const conversionController = require('../controllers/conversionController');

router.get('/', conversionController.list);
router.post('/add', conversionController.save);
router.get('/clean', conversionController.clean);


module.exports = router;