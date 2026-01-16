function errorHandler(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        // JWT authentication error
        return res.status(401).json({ message: "The user is not authorized", success: false });
        
    }
    if (err.name === "ValidationError") {
        // Validation error
        return res.status(400).json({ message: err.message, success: false });
    }
    if (err) {
        // Other errors
        return res.status(500).json({ message: err.message, success: false });
    }    
}

module.exports = errorHandler;