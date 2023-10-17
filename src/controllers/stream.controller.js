const streamService = require('../services/stream.service.js');

async function post(req, res, next) {
    try {
        res.json(await streamService.capture(req.params.id, req.body.captures, req.headers['roblox-id']));
    } catch (err) {
        console.error(`Error while capturing stream`, err.message);
        next(err);
    }
}

async function get(req, res, next) {
    try {
        res.json(await streamService.findAll());
    } catch (err) {
        console.error(`Error while getting streams`, err.message);
        next(err);
    }
}

async function save(req, res, next){ 
    try {
        res.json(await streamService.saveStream(req.params.id));
    } catch (err) {
        console.error(`Error while saving stream`, err.message);
        next(err);
    }
}

module.exports = {
    post,
    get,
    save,
}