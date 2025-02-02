const util = require("../utilities/index")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}


validate.registrationRules = () => {
    return [
        // classification name is required and must be string
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            // .isLength({ min: 1 })
            // .withMessage("Please provide a first name."), // on error this message is sent.
            .custom(async (classification_name) => {
                const cNameExists = await invModel.checkExistingClassificationName(classification_name);
                if (cNameExists) {
                    throw new Error("The name already exist");
                }
            }),
    ]
}

validate.checkAddData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    // console.log(errors)
    if (!errors.isEmpty()) {
        let nav = await util.getNav()
        return res.status(400).render("inventory/add-classification", {
            errors,
            title: "Classification",
            nav,
            classification_name,
        })

    }
    next()
}

module.exports = validate;