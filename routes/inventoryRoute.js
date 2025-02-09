// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const Util = require('../utilities');
const validate = require("../middware/addClassification");
const validat = require("../middware/addInventory")
const che = require("../controllers/accountController")


// router.use(che.checkAdminAccess)
// Route to build inventory by classification view
router.get("/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));

router.get('/detail/:id', Util.handleErrors(invController.getInventoryItemDetail));


router.get("/add-classification", Util.handleErrors(invController.buildAddClassification))
router.post("/add-classification", validate.registrationRules(), validate.checkAddData, Util.handleErrors(invController.addClassification))

router.get("/add-inventory", che.checkAdminAccess, Util.handleErrors(invController.buildAddInv))
router.post("/add-inventory", che.checkAdminAccess, validat.addInvRules(), validat.checkInvData, Util.handleErrors(invController.addInventory))

router.get("/", che.checkAdminAccess, Util.handleErrors(invController.management))

router.get("/getInventory/:classification_id", che.checkAdminAccess, Util.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inv_id", che.checkAdminAccess, Util.handleErrors(invController.editInventoryView))
router.post("/update", che.checkAdminAccess, validat.addInvRules(), validat.checkUpdateData, Util.handleErrors(invController.updateInventory))

router.get("/delete/:inv_id", che.checkAdminAccess, Util.handleErrors(invController.deleteInv))
router.post("/delete", che.checkAdminAccess, Util.handleErrors(invController.deleteInventory))

module.exports = router;