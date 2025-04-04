import User from '../models/user.model.js';
import Profile from '../models/profile.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import PDFDocument from 'pdfkit'
import fs from 'fs';
import ConnectionRequest from '../models/connections.model.js';

const convertUserDataToPDF = async (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(32).toString("hex")+".pdf";
    const stream = fs.createWriteStream("profile_pictures/" + outputPath);

    doc.pipe(stream);
    const imagePath = `profile_pictures/${userData.userId.profilePicture}`;
    let imageHeight = 0; // Track image height

    if (fs.existsSync(imagePath)) {
        // Set image and get its dimensions
        doc.image(imagePath, {
            fit: [120, 120], // Set the image size
            align: "center",
            valign: "top",
        });
        imageHeight = 120; // Adjust the height (image's size)
    } else {
        // Fallback if no image
        doc.fontSize(14).text("Profile picture not available.", { align: "center" });
        imageHeight = 40; // Text height, approximate padding
    }
    doc.y += imageHeight + 10;
    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);
    doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);
    doc.fontSize(14).text(`Post Work:`)
    if (userData.postWork && Array.isArray(userData.postWork)) {
        userData.postWork.forEach((work, index) => {
            doc.fontSize(14).text(`Company name: ${work.company}`);
            doc.fontSize(14).text(`Position: ${work.position}`);
            doc.fontSize(14).text(`Years: ${work.year}`);
        });
    } else {
        doc.fontSize(14).text("No past work experience listed.");
    }
    doc.end();
    return outputPath;
}

export const register = async (req, res) => {
    try {
        // Destructure request body
        const { name, email, password, username } = req.body;

        // Validate input
        if (!name || !email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists (email or username)
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists with this email or username" });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ name, email, password: hashPassword, username });
        await newUser.save();

        // Create profile for the user
        const profile = new Profile({ userId: newUser._id });
        await profile.save(); // Save profile

        // Send success response
        return res.status(201).json({ message: "User created" });

    } catch (error) {
        // Handle server errors
        return res.status(500).json({ message: "there is an error " });
    }
};

export const login = async (req, res) => {
    try {
        // Destructure request body
        const { email, password } = req.body;
        
        // Validate input
        if (!email ||!password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Compare hashed password with provided password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        
        const token = crypto.randomBytes(32).toString("hex");
        await User.updateOne({_id:user._id}, {token});
        return res.json({token});
    } catch (error) {
        // Handle server errors
        return res.status(500).json({ message: "there is an error " });
    }
}

export const uploadprofilepicture = async (req, res) => {
    const {token} = req.body;
    try {
        const user = await User.findOne({token});
        if (!user) {
            return res.status(401).json({ message: "user not found" });
        }
        user.profilePicture = req.file.filename;
        await user.save();
        return res.status(200).json({ message:"profile picture updated successfully"})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateUserProfile = async (req, res) => {
    const {token, ...newUserData} = req.body;
    console.log(token);
    try {
        const user = await User.findOne({token});
        if (!user) {
            return res.status(401).json({ message: "user not found" });
        }
        const {username, email} = req.body;
        const existingUser = await User.findOne({username, email});
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(409).json({ message: "User already exists with this username or email" });
        }
        Object.assign(user, newUserData);
        await user.save();
        return res.status(200).json({ message:"profile updated successfully"})
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getUserProfile = async (req, res) => {
    const {token} = req.query;
    try {
        const user = await User.findOne({token});
        if (!user) {
            return res.status(401).json({ message: "user not found" });
        }
        const userProfile = await Profile.findOne({userId: user._id}).populate('userId', 'name email username profilePicture');
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found" });
        }
        return res.json(userProfile);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateProfileData = async (req, res) => {
    const {token, ...newProfileData} = req.body;

    try {
        const userProfile = await User.findOne({token: token});
        if(!userProfile){
            return res.status(401).json({ message: "user not found" });
        }
        const profile_to_update = await Profile.findOne({userId: userProfile._id});
        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();
        return res.status(200).json({ message: "profile updated successfully" });
        } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAllUserProfile = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('userId', 'name email username profilePicture');
        return res.json(profiles);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const downloadProfile = async (req, res) => {
    const user_id = req.query.id;
    console.log("USER ID IS",user_id);

    const userProfile = await Profile.findOne({userId: user_id}).populate('userId', 'name username email password profilePicture');
    console.log("User Profile:", userProfile); // Log the profile data

    // Check if profile exists
    if (!userProfile) {
        return res.status(404).json({ message: "User profile not found" });
    }

    let outputPath = await convertUserDataToPDF(userProfile);

    return res.json({"message": outputPath});
}

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
    const {username} = req.query;
    try {
        const user = await User.findOne({username});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userProfile = await Profile.findOne({userId: user._id}).populate('userId', 'name email username profilePicture');
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found" });
        }
        return res.json({"profile":userProfile});
    }catch(err){
        return res.status(500).json({ message: err.message });
    }
}

export const sendConnectionRequest = async (req, res) => {
    const {token, connectionId} = req.body;
    try {
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).json({ message: "User not found"});
        }

        const connectionUser = await User.findOne({_id: connectionId});
        if(!connectionUser){
            return res.status(404).json({ message: "Connection not found"});
        }
        const existingRequest = await ConnectionRequest.findOne(
            {
                userId: user._id,
                connectionId: connectionUser._id
            }
        )
        if(existingRequest){
            return res.status(200).json({ message: "Request already sent"});
        }
        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id
        })
        await request.save();
        return res.status(200).json({ message: "Request sent successfully"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const getMyConnectionRequest = async (req, res) => {
    const {token} = req.query;
    try {
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const connections = await ConnectionRequest.findOne({userId:user._id}).populate('connectionId', 'name username email profilePicture');

        return res.json({connections});

    } catch (error) {
        return res.status(500).json({message: error.message});
    }
}

export const whatAreMyConnections = async (req, res) => {
    const {token} = req.query;
    try {
        const user = await User.findOne({token: token});

        if(!user) {
            return res.status(500).send({message:"user not found"});
        }

        const connections = await ConnectionRequest.find({connectionId: user._id}).populate('userId', 'name username email profilePicture');
        return res.json(connections);
    } catch (error) {
        return res.status(500).send({message: error.message});
    }
}

export const acceptConnectionRequest = async (req, res) =>{
    const {token, requestId, action_type} = req.body;
    try{
        const user = await User.findOne({token});
        if(!user){
            return res.status(404).send({message:"User not found"});
        }
        const connection = await ConnectionRequest.findOne({_id:requestId});
        if(!connection){
            return res.status(404).send({message:"Connection not found"});
        }
        if(action_type === "accept"){
            connection.status_accepted = true;
        }else{
            connection.status_accepted = false;
        } 
        await connection.save();
        return res.status(200).send({message:"Connection updated successfully"});   
    }catch(err){
        return res.status(500).send({message: err.message});
    }
} 

