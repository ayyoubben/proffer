const mongoose = require('mongoose')

const inscValSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    numRegistre: {
        value: {
            type: String,
            required: true,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    qualification: {
        value: {
            type: String,
            required: true,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    codes: {
        codes: [
            {
                type: String,
                required: false
            }
        ],
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    nif: {
        value: {
            type: String,
            required: true,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    nis: {
        value: {
            type: String,
            required: true,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    casnos: {
        value: {
            type: String,
            required: true,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    cacopath: {
        value: {
            type: String,
            required: true,
        },
        valid: {
            type: Boolean,
            required: false,
        },
        notification: {
            type: String,
            required: false,
        }
    },
    documents: [{
        type: String,
        required: true
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Soumissionnaire'  
    },
},
{
    timestamps: true
})

const InscVal = mongoose.model('InscVal', inscValSchema)

module.exports = InscVal