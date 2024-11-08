const { Schema, model } = require("mongoose");

const contactSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (value) => {
        const re =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(re);
      },
      error: "Please enter a valid email address",
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value) => {
        const re = /^(\+234|0)[789]\d{9}$/;
        return re.test(value);
      },
      error:
        "Please enter a valid  phone number (e.g., +2347012345678 or 07012345678)",
    },
  },
  message: {
    type: String,
    required: true
  }
});

const ContactModel = model('contacts', contactSchema);
module.exports = ContactModel;