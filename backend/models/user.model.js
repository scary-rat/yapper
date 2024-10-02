import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minLength: 6,
        required: true,
    },
    rawPassword: {
        type: String,
    },
    profilePic: {
        type: String,
        default: ""
    },
    // yo followers chai euta array ho ani yo array vitra jun elements haru hunxa ni tyo sab ko type chai string ho
    followers: {
        type: [String],
        default: [],
    },
    following: {
        type: [String],
        default: [],
    },
    bio: {
        type: String,
        default: "",
    },
},
    {
        timestamps: true
    }
)

// Create a text index on 'username', 'email', and 'name'
// yesle k gardo rahixa vani text based search garna easy pardo rahixa
// for example aba hamile text based search garnu paryo hai
// suppose : 
// a type garda starting ma a jun jun document ko username email ra name ma xa ni tyo sab document return gardinxa mongo db le
// so basically search functionality ko lagi use garna mildo rahixa
userSchema.index({
    username: "text",
    email: "text",
    name: "text"
});

const User = mongoose.model("user", userSchema)

export default User;