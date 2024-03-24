const { Router } = require('express');
const uploadConfig = require('../configs/upload');
const multer = require("multer");
const upload = multer(uploadConfig.MULTER);
const QuackController = require('../controllers/QuackController');

const quackRoutes = Router();

const quackController = new QuackController();

quackRoutes.post('/', quackController.index);
quackRoutes.post('/audio', upload.single("file"), quackController.audio);

module.exports = quackRoutes;