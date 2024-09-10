import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/sign-up", async (req,res,next) => {
    return res.status(200).json({message: "작동완료"})
});

export default router;