var express = require('express');
var router = express.Router();
var { login, signup, forgotPassword, verifyToken, saveSummary, getAllSummaries } = require('../controllers/auth'); // Adjust the path based on your project structure

 

// POST login
router.post('/login', login);

// POST signup
router.post('/signup', signup);

// POST forgot password
router.post('/forgot', forgotPassword);

// POST forgot password
router.post('/verify', verifyToken);

// POST forgot password
router.post('/save-summary', saveSummary);

// Define routes
router.get('/summaries', getAllSummaries);


module.exports = router;
