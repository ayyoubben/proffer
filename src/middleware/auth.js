const jwt = require('jsonwebtoken')
const Soumissionnaire = require('../models/Soumissionnaire')

const auth = (Model) => async (req, res, next) => {
    try{
        //console.log(Model)
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await Model.findOne({_id: decoded._id, 'tokens.token': token})
        //console.log(user)

        if (!user) {
            throw new Error()
        }
        
        if (Model == Soumissionnaire) {
            req.token = token
            req.soumissionnaire = user        
        }
        next()

        //console.log(token)
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate!' })
    }
}

module.exports = auth