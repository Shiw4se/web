const express = require('express');
const { sendRPCRequest } = require('../rabbitmq/rpcClient');
require('dotenv').config();

const router = express.Router();
const USER_RPC_QUEUE = process.env.USER_RPC_QUEUE;

router.post('/register', async (req, res) => {
    try {
        const response = await sendRPCRequest(USER_RPC_QUEUE, {
            action: 'register',
            data: req.body,
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});

router.post('/login', async (req, res) => {
    console.log('Login request body:', req.body);  // <-- тут лог для перевірки вхідних даних

    try {
        const response = await sendRPCRequest(USER_RPC_QUEUE, {
            action: 'login',
            data: req.body,
        });
        res.status(response.status).json(response.body);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal error' });
    }
});


module.exports = router;
