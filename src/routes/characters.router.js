import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/tokentest', async(req,res,next)=>{
    console.log(req.cookies);

    return res.status(200).json({});
})

// 캐릭터 생성
router.post('/characters', authMiddleware, async (req, res, next) => {
    const { userId } = req.user;
    const {characterName} = req.body;

    // 중복된 캐릭터명이 있는가?


    //생성
    const character = await prisma.characters.create({
        data: {
            userId, 
            characterName,
        },
    });

    return res.status(201).json({data: character});
});

// 캐릭터 목록 조회
router.get('/characters', async (req, res, next)=>{
    const characterList = await prisma.characters.findMany({
        select: {
            characterId: true,
            characterName: true,
            hp: true,
            atk: true,
        }
    });

    return res.status(200).json({data:characterList});
});


export default router;