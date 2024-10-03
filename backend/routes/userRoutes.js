// routes/userRoutes.js
import express from 'express';
import User from '../models/User.js';
import EmployerProfile from '../models/employer.model.js';
import JobSeekerProfile from '../models/jobseeker.model.js';

import generateToken from '../utils/generateToken.js'; // Utility function to generate JWT

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  console.log(req.body, 'request')
  const { firstName, lastName, email, password, role, } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = new User({
    firstName,
    lastName,
    email,
    password,
    role,
  });

  try {
    const createdUser = await user.save();
    if (user.role === 'employer') {
      await EmployerProfile.create({
        user: createdUser._id,
        companyName: 'Acme Inc',
        currentPosition: 'director',
        companyWebsite: 'www.acme.com',
        description: 'Leading widget manufacturer'
      });
    } else if (user.role === 'job_seeker') {
      await JobSeekerProfile.create({
        user: createdUser._id,
        resume: 'artist',
        skills: 'developer',
        experience: '2+',
        education: 'university of uyo'
      });
    }

    return res.status(201).json({
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      token: generateToken(createdUser._id)
    });
  } catch (e) {
    console.log(e)
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// GET ALL USERS
router.get('/', async (_req, res) => {
  const users = await User.find({})
  res.json(users)
})

export default router;
