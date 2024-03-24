require('express-async-errors');
require('dotenv/config');

const migrationsRun = require('./database/sqlite/migrations')
const cors = require('cors');
const AppError = require('./utils/AppError');
const express = require('express');

const app = express();
app.use(cors())
const routes = require('./routes');
const uploadConfig = require('./configs/upload');


app.use(express.json());

migrationsRun();

app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER));

app.use(routes);


app.use((error, request, response, next) => {
    if(error instanceof AppError){
        return response.status(error.statusCode).json({
            status: 'error',
            message: error.message
        });
    }
    console.log(error);
    return response.status(500).json({
        status: 'error',
        message: 'Internal server error'
    })
});
const PORT = process.env.PORT || 3304;
const HOST = `0.0.0.0`;

app.listen(PORT, HOST, () => console.log(`Server is running on port ${PORT} 🚀`));