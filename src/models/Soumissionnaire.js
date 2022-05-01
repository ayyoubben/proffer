const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const soumissionnaireSchema = new mongoose.Schema({
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

soumissionnaireSchema.virtual('inscVal', {
    ref: 'InscVal',
    localField: '_id',
    foreignField: 'owner'
})

soumissionnaireSchema.virtual('inscEnr', {
    ref: 'InscEnr',
    localField: '_id',
    foreignField: 'owner'
})

soumissionnaireSchema.methods.toJSON = function () {
    const soumissionnaire = this
    const soumissionnaireObject = soumissionnaire.toObject()

    delete soumissionnaireObject.code
    delete soumissionnaireObject.password
    delete soumissionnaireObject.tokens

    return soumissionnaireObject
}

soumissionnaireSchema.methods.generateAuthToken = async function () {
    const soumissionnaire = this
    const token = jwt.sign({_id: soumissionnaire._id.toString()}, process.env.JWT_SECRET)

    soumissionnaire.tokens = soumissionnaire.tokens.concat({ token })

    await soumissionnaire.save()
    return token
}

soumissionnaireSchema.statics.findByCredentials = async (email, password) => {
    const soumissionnaire = await Soumissionnaire.findOne({email})

    if (!soumissionnaire) {
        throw new Error ('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, soumissionnaire.password)

    if (!isMatch) {
        throw new Error ('Unable to login')
    }

    return soumissionnaire
}

soumissionnaireSchema.pre('save', async function(next) {
    const soumissionnaire = this

    if (soumissionnaire.isModified('password')) {
        soumissionnaire.password = await bcrypt.hash(soumissionnaire.password, 8)
    }

    next()
})

const Soumissionnaire = mongoose.model('Soumissionnaire', soumissionnaireSchema)

module.exports = Soumissionnaire