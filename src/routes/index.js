const { Router } = require('express');
const routes = Router();

const quackRoutes = require('./quack.routes');

routes.use("/quack", quackRoutes);


module.exports = routes;