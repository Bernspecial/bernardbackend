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

/* ****************************************
*  Deliver registration view
* *************************************** */
invCont.buildAddClassification = async (req, res, next) => {
    try {
        let nav = await utilities.getNav();
        let flashMessage = req.flash('notice'); // Assuming you're using connect-flash
        res.render("./inventory/add-classification", {
            title: "Classification",
            nav,
            messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
            errors: null
        });
    } catch (error) {
        next(error);
    }
}

/* ****************************************
* Adding process
* *************************************** */
invCont.addClassification = async (req, res) => {
    let nav = await utilities.getNav()
    const { classification_name } = req.body


    try {
        const addResult = await invModel.addClassification(classification_name);
        console.log("Add Result:", addResult); // Log the result for debugging

        // Check if addResult is defined and has the expected structure
        if (addResult) {
            req.flash("notice", `Congratulations, you've added the classification: ${addResult.classification_name}.`);
            return res.redirect("/inv/"); // Redirect to the management page
        } else {
            req.flash("notice", "Sorry, the request failed.");
            return res.redirect("/inv/add-classification");
        }
    } catch (error) {
        console.error("Error adding classification:", error.message);
        req.flash("notice", "An error occurred while adding the classification.");
        return res.redirect("/inv/add-classification");
    }
}


/* ****************************************
*  Build Add Inventory view
* *************************************** */
invCont.buildAddInv = async (req, res, next) => {
    try {
        let nav = await utilities.getNav();
        let flashMessage = req.flash('notice'); // Assuming you're using connect-flash

        // Fetch classifications to populate the dropdown
        const classifications = await utilities.buildClassificationList(); // Fetch classifications
        // Get classification_id from the request (if applicable)
        const classification_id = req.body.classification_id || ''; // Adjust this based on your logic
        res.render("./inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
            errors: null,
            classifications,
            classification_id,
        });
    } catch (error) {
        next(error);
    }
}

invCont.addInventory = async (req, res) => {
    let nav = await utilities.getNav()
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    const regResult = await invModel.addVehicle(
        inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'ve added ${inv_make} to the inventory.`
        )

        return res.redirect("/inv/"); // Use redirect here
    } else {
        req.flash("notice", "Sorry, the request failed.")
        res.status(501).render("/inv/add-inventory", {
            title: "Failed Request",
            nav,
        })
        return
        // return res.redirect("inventory/add-inventory"); // Use redirect here
    }
}

/* ****************************************
*  Build Managament view
* *************************************** */
invCont.management = async (req, res, next) => {
    try {
        let nav = await utilities.getNav();
        let flashMessage = req.flash('notice'); // Assuming you're using connect-flash

        res.render("./inventory/management", {
            title: "Management",
            nav,
            messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
            errors: null,
        });
    } catch (error) {
        next(error);
    }
}

invCont.triggerError = (req, res) => {
    // Intentionally throw an error to trigger the error handling middleware
    throw new Error('This is an intentional error for testing purposes.');
};

module.exports = invCont