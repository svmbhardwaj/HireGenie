const AppError = require("../utils/AppError")


/**
 * @name validate
 * @description Build a middleware that validates the request against the given zod schemas.
 * Pass any subset of { body, params, query }; each is parsed and replaced with the parsed
 * (coerced) value. On failure a 400 AppError is forwarded with the flattened field errors.
 */
function validate(schemas) {
    return function (req, res, next) {

        for (const source of [ "body", "params", "query" ]) {
            if (!schemas[source]) continue

            const result = schemas[source].safeParse(req[source])

            if (!result.success) {
                const details = result.error.issues.map(issue => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))

                return next(new AppError(400, "Validation failed", details))
            }

            // req.query is a getter-only in some setups; assign parsed values field by field
            if (source === "query") {
                Object.assign(req.query, result.data)
            } else {
                req[source] = result.data
            }
        }

        next()
    }
}


module.exports = validate
