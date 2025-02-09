const util = require("../utilities/index")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.addInvRules = () => {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            // .isLength({ min: 1 })
            .withMessage("The Make field is required"), // on error this message is sent.
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            // .isLength({ min: 1 })
            .withMessage(" The Model field is required."),

        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({ min: 4, max: 4 })
            .withMessage("Year must be a 4-digit number."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Description is required."),

        body("inv_image")
            .trim()
            .escape()
            .optional(),
        // .isURL()
        // .withMessage("Image must be a valid URL."),

        body("inv_thumbnail")
            .trim()
            .escape()
            .optional(),
        // .isURL()
        // .withMessage("Thumbnail must be a valid URL."),

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Price is required and must be a number."),

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Miles is required and must be a number."),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Color is required."),

        body("inv_id")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Inventory ID is required and must be a number."),

    ];
}

/* ******************************
 * Check inventory data and return errors or continue to registration
 * ***************************** */
validate.checkInvData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    const classifications = await util.buildClassificationList(); // Fetch classifications again
    // Get classification_id from the request (if applicable)
    //  const classification_id = req.body.classification_id || ''; // Adjust this based on your logic
    if (!errors.isEmpty()) {
        let nav = await util.getNav()
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,
            classifications,
            classification_id,
        })
        return;
    }
    next()
}


/* ******************************
 * errors will be directed back to the view
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    const classifications = await util.buildClassificationList(); // Fetch classifications again
    // Get classification_id from the request (if applicable)
    const inv_id = req.body.inv_id || ''; // Adjust this based on your logic
    if (!errors.isEmpty()) {
        let nav = await util.getNav()
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit Inventory",
            nav,
            inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id,
            classifications,
            classification_id,
        })
        return;
    }
    next()
}


module.exports = validate;