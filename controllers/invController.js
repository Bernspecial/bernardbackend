const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

invCont.getInventoryItemDetail = async (req, res, next) => {
    const inventoryId = req.params.id;
    
    try {
        const vehicleData = await invModel.getVehicleById(inventoryId);
        const vehicleGrid = await utilities.buildVehicleDetailHTML(vehicleData);
        let nav = await utilities.getNav()
        if (!vehicleData) {
            return res.status(404).send('Vehicle not found');
        }

        // console.log( vehicleGrid)
        // Render the EJS template with the vehicle data
        res.render('./inventory/vehicleDetail', { title: 'Vehicle Detail', nav, vehicle: vehicleGrid });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

invCont.triggerError = (req, res) => {
    // Intentionally throw an error to trigger the error handling middleware
    throw new Error('This is an intentional error for testing purposes.');
};


module.exports = invCont