const { redisClient } = require("../controllers/signin");
const { promisify } = require("util");

const redisGetAsync = promisify(redisClient.get).bind(redisClient);

const requireAuth =async (req, res, next ) =>{
    const { authorization } = req.headers;
    
    if(!authorization) return res.status(401).json("unauthorized");
    try{
        const profId = await redisGetAsync(authorization)
        return !!profId? next() : res.status(401).json("unauthorized");

    } catch (err){
        return res.status(401).json("unauthorized");
    }

}


module.exports ={
    requireAuth
}