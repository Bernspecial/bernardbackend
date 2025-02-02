// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const Util = require('../utilities');
const validate = require("../middware/addClassification");
const validat = require("../middware/addInventory")

// Route to build inventory by classification view
router.get("/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));

router.get('/detail/:id', Util.handleErrors(invController.getInventoryItemDetail));


router.get("/add-classification", Util.handleErrors(invController.buildAddClassification))
router.post("/add-classification", validate.registrationRules(), validate.checkAddData, Util.handleErrors(invController.addClassification))

router.get("/add-inventory", Util.handleErrors(invController.buildAddInv))
router.post("/add-inventory", validat.addInvRules(), validat.checkInvData, Util.handleErrors(invController.addInventory))

router.get("/", Util.handleErrors(invController.management))

module.exports = router;