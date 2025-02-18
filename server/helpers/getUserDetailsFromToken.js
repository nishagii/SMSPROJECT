const jwt = require('jsonwebtoken')
const UserModel = require('../models/UserModel')

const getUserDetailsFromToken = async(token)=>{
    
    if(!token){
        return {
            message : "session out",
            logout : true,
        }
    }

    let decode;
    try {
        decode = await jwt.verify(token, process.env.JWT_SECREAT_KEY);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return {
                message: "Token expired",
                logout: true,
            };
        }
        return {
            message: "Invalid token",
            logout: true,
        };
    }


    const user = await UserModel.findById(decode.id).select('-password');


    return user
}

module.exports = getUserDetailsFromToken
