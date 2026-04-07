const express = require('express');
const path = require('path');


const port = 3000

const app = express();


app.use(express.static(path.join(__dirname, '..', 'public')));

app.set('view engine', 'pug');
console.log(path.join(__dirname));

app.set('views', path.join(__dirname, "views"));


app.get('/', (req, res) => {
    res.render('pages/home');
});

app.get('/about', (req, res) => {
    res.render('pages/about');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});