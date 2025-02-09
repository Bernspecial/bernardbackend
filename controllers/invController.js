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
        const classificationSelect = await utilities.buildClassificationList()
        let flashMessage = req.flash('notice'); // Assuming you're using connect-flash
        console.log('Classifications:', classificationSelect);
        res.render("./inventory/management", {
            title: "Management",
            nav,
            messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
            errors: null,
            classificationSelect,
        });
    } catch (error) {
        next(error);
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    console.log('Item Data:', itemData);


    // I Checked if itemData is an array and access the first element
    const vehicle = Array.isArray(itemData) ? itemData[0] : itemData;

    // I used the if statemnet to confirm if the vehicle is valid.
    if (!vehicle) {
        return res.status(404).send('Item not found');
    }
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

    // After using the variable vehicle to confirm if the iemData is an array
    // then i used the vechicle result to display the inventory name.
    const itemName = `${vehicle.inv_make || 'Unknown Make'} ${vehicle.inv_model || 'Unknown Model'}`;
    let flashMessage = req.flash('notice'); // Assuming you're using connect-flash

    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
        classificationSelect: classificationSelect,
        errors: null,
        inv_id: vehicle.inv_id, // Change this line to use vehicle.inv_id
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,
        inv_year: vehicle.inv_year,
        inv_description: vehicle.inv_description,
        inv_image: vehicle.inv_image,
        inv_thumbnail: vehicle.inv_thumbnail,
        inv_price: vehicle.inv_price,
        inv_miles: vehicle.inv_miles,
        inv_color: vehicle.inv_color,
        classification_id: vehicle.classification_id,
    })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async (req, res) => {
    let nav = await utilities.getNav()
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

    // Check if inv_id is a valid integer
    if (!inv_id || isNaN(inv_id)) {
        req.flash("notice", "Invalid Inventory ID.");
        return res.redirect("/inv/");
    }

    const updateResult = await invModel.updateVehicle(
        inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    )

    if (updateResult) {
        const itemName = `${inv_make} ${inv_model}`
        req.flash(
            "notice",
            `Congratulations, you\'ve updated ${itemName}.`
        )

        return res.redirect("/inv/"); // Use redirect here
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the request failed.")
        res.status(501).render("/inv/edit-inventory", {
            title: "Edit  " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        })
        return
        // return res.redirect("inventory/add-inventory"); // Use redirect here
    }
}



/* ***************************
 *  Build delete inventory view
 * ************************** */

invCont.deleteInv = async (req, res) => {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getVehicleById(inv_id)
    // console.log('Item Data:', itemData);


    // I Checked if itemData is an array and access the first element
    const vehicle = Array.isArray(itemData) ? itemData[0] : itemData;

    // I used the if statemnet to confirm if the vehicle is valid.
    if (!vehicle) {
        return res.status(404).send('Item not found');
    }
    // const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

    // After using the variable vehicle to confirm if the iemData is an array
    // then i used the vechicle result to display the inventory name.
    const itemName = `${vehicle.inv_make || 'Unknown Make'} ${vehicle.inv_model || 'Unknown Model'}`;
    let flashMessage = req.flash('notice'); // Assuming you're using connect-flash

    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        messages: { notice: flashMessage.length > 0 ? flashMessage[0] : null }, // Pass the message to the view
        // classificationSelect: classificationSelect,
        errors: null,
        inv_id: vehicle.inv_id, // Change this line to use vehicle.inv_id
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,
        inv_year: vehicle.inv_year,
        // inv_description: vehicle.inv_description,
        // inv_image: vehicle.inv_image,
        // inv_thumbnail: vehicle.inv_thumbnail,
        inv_price: vehicle.inv_price,
        // inv_miles: vehicle.inv_miles,
        // inv_color: vehicle.inv_color,
        // classification_id: vehicle.classification_id,
    })
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async (req, res) => {
    let nav = await utilities.getNav()
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;

    // // Check if inv_id is a valid integer
    // if (!inv_id || isNaN(inv_id)) {
    //     req.flash("notice", "Invalid Inventory ID.");
    //     return res.redirect("/inv/");
    // }

    const deleteResult = await invModel.deleteVehicle(
        inv_id, inv_make, inv_model, inv_year, inv_price,
    )

    if (deleteResult) {
        const itemName = `${inv_make} ${inv_model}`
        req.flash(
            "notice",
            `Congratulations, you\'ve deleted ${itemName} from inventory.`
        )

        return res.redirect("/inv/"); // Use redirect here
    } else {
        // const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the request failed.")
        res.status(501).render("/inv/edit-inventory", {
            title: "Edit  " + itemName,
            nav,
            // classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            // inv_description,
            // inv_image,
            // inv_thumbnail,
            inv_price,
            // inv_miles,
            // inv_color,
            // classification_id,
        })
        return
        // return res.redirect("inventory/add-inventory"); // Use redirect here
    }
}

invCont.triggerError = (req, res) => {
    // Intentionally throw an error to trigger the error handling middleware
    throw new Error('This is an intentional error for testing purposes.');
};



module.exports = invCont