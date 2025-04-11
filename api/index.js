const express = require('express');
const cors = require('cors'); // Импортируйте пакет cors
const desRouter = require('../api/routes/des-router');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(cors()); // Разрешите CORS для всех маршрутов
app.use(express.json());
app.use('/apis', desRouter);

app.listen(PORT, () => console.log(`server started on port ${PORT}`))