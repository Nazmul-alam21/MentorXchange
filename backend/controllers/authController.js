import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// Register

export const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // if user exist
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exist" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};



// Login

export const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // check user exist
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User does not exist" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).json({ message: "Invalid Credentials" });
        }

        // generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d", });

        return res.status(201).json({
            message: "Login successful", token,
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}