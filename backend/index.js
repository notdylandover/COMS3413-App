const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const os = require('os');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String },
    lastname: { type: String },
    profileImage: { type: String },
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    res.send('Server is running.');
});

app.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, username, password, profileImage } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return console.log(`User ${username} already exists.`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ firstname, lastname, username, password: hashedPassword, profileImage });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
        console.log(`User ${username} registered successfully.`);
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
        console.warn(error);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return console.warn('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return console.warn('Invalid credentials');
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });

        console.log(`User ${username} logged in successfully.`);
    } catch (error) {
        res.status(500).json({ error: 'Failed to login' });
        console.warn(error);
    }
});

app.get('/user', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('firstname lastname profileImage');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
});

app.put('/update-profile', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { firstName, lastName, profileImage } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { firstname: firstName, lastname: lastName, profileImage },
            { new: true, runValidators: true }
        );

        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            const networkInterfaces = os.networkInterfaces();
            const localIP = Object.values(networkInterfaces)
                .flat()
                .find((net) => net.family === 'IPv4' && !net.internal)?.address || 'localhost';
        
            console.log(`Server is running on http://${localIP}:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
