// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const Util = require('../utilities');


// Route to build inventory by classification view
router.get("/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));

router.get('/detail/:id', Util.handleErrors(invController.getInventoryItemDetail));

module.exports = router;