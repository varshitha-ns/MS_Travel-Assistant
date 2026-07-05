import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const registerUser = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { name, email, password } = validation.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Welcome to AI Travels, ${name}! ✈️`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Your journey begins here!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for creating an account. Our AI autonomous travel agents are ready to help you plan perfect itineraries and seamlessly manage your cab bookings.</p>
          <br />
          <p>Safe travels,</p>
          <p><strong>AI Travels Team</strong></p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error("Email error: ", err);
      else console.log("Email sent successfully: ", info.response);
    });

    return res.status(201).json({
      message: "Account created successfully!",
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};