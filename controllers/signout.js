const {redisClient} = require("./signin");
const { promisify } = require("util");


const redisDelAsync = promisify(redisClient.del).bind(redisClient);

const signoutUser = (req, res) =>{
    const {authorization} = req.headers;
    if(authorization){
        try {
            redisDelAsync(authorization)
        } catch (err) {
            console.log(err)
        }

    }
}

module.exports = {
    signoutUser
}