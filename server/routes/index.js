const express = require('express');
const db = require('../db');

const router = express.Router();

//get all user /api
router.get('/', async (req, res, next) => {
    try {
        let results = await db.all();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(5000);
    }
});

//get a single user /api/:id
router.get('/:id', async (req, res, next) => {
    try {
        let results = await db.one(req.params.id);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(5000);
    }
});
module.exports = router;