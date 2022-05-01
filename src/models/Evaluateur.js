const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const evaluateurSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    code: {
        type: Number,
        required: false,
    },
    tokens: [{
        token: {
            type: String,
            required: false,
        }
    }],
},
{
    timestamps: true
})

evaluateurSchema.methods.toJSON = function () {
    const evaluateur = this
    const evaluateurObject = evaluateur.toObject()

    delete evaluateurObject.code
    delete evaluateurObject.password
    delete evaluateurObject.tokens

    return evaluateurObject
}

evaluateurSchema.methods.generateAuthToken = async function () {
    const evaluateur = this
    const token = jwt.sign({_id: evaluateur._id.toString()}, process.env.JWT_SECRET)

    evaluateur.tokens = evaluateur.tokens.concat({ token })

    await evaluateur.save()
    return token
}

evaluateurSchema.statics.findByCredentials = async (email, password) => {
    const evaluateur = await Evaluateur.findOne({email})

    if (!evaluateur) {
        throw new Error ('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, evaluateur.password)

    if (!isMatch) {
        throw new Error ('Unable to login')
    }

    return evaluateur
}

evaluateurSchema.pre('save', async function(next) {
    const evaluateur = this

    if (evaluateur.isModified('password')) {
        evaluateur.password = await bcrypt.hash(evaluateur.password, 8)
    }

    next()
})

const Evaluateur = mongoose.model('Evaluateur', evaluateurSchema)

module.exports = Evaluateur