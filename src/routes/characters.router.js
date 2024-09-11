import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/tokentest", async (req, res, next) => {
  console.log(req.cookies);

  return res.status(200).json({});
});

// 캐릭터 생성
router.post("/characters/create", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { characterName } = req.body;

  // 중복된 캐릭터명이 있는가?
  const isExistName = await prisma.characters.findFirst({
    where: { characterName },
  });

  if (isExistName) {
    return res.status(409).json({ message: "사용중인 캐릭터명입니다." });
  }

  //생성
  const character = await prisma.characters.create({
    data: {
      userId,
      characterName,
    },
  });

  return res.status(201).json({ data: character });
});

// 캐릭터 목록 조회
router.get("/characters", authMiddleware, async (req, res, next) => {
  const characterList = await prisma.characters.findMany({
    select: {
      userId: true,
      characterId: true,
      characterName: true,
      hp: true,
      atk: true,
    },
  });

  return res.status(200).json({ data: characterList });
});

// 캐릭터 상세 조회
router.post("/characters", authMiddleware, async (req, res, next) => {
  //토큰이 있으면
  const { userId } = req.user;
  const { characterName } = req.body;

  const isExistName = await prisma.characters.findFirst({
    where: { characterName },
  });

  // 캐릭터명이 존재하는가?
  if (!isExistName) {
    return res.status(401).json({ message: "존재하지 않는 캐릭터명입니다." });
  }

  // 캐릭터명이 검색되었다면
  // 로그인한 사람의 캐릭터인가?
  if (isExistName.userId === userId) {
    const characterInfo = await prisma.characters.findFirst({
      where: { characterName },
      select: {
        userId: true,
        characterName: true,
        hp: true,
        atk: true,
        money: true,
      },
    });

    return res.status(200).json({ characterInfo: characterInfo });
  }
  // 다른 사람의 캐릭터인가?
  else {
    const characterInfo = await prisma.characters.findFirst({
      where: { characterName },
      select: {
        userId: true,
        characterName: true,
        hp: true,
        atk: true,
      },
    });

    return res.status(200).json({ characterInfo: characterInfo });
  }
});

// 캐릭터 삭제
// 로그인한 사람과 동일한 userId 데이터를 가진 캐릭터만 삭제 가능
router.delete("/characters", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;
  const { characterName } = req.body;

  // 캐릭터 명이 존재하는가?
  const isExistName = await prisma.characters.findFirst({
    where: { characterName },
  });
  // 없으면 return
  if (!isExistName) {
    return res.status(404).json({ message: "존재하지 않는 캐릭터명입니다." });
  }

  // 캐릭터의 userId와 로그인한 사람의 userId가 다른가? 그럼 리턴
  if (isExistName.userId !== userId){
    return res.status(401).json({message: "사용자의 캐릭터가 아닙니다."});
  }

  // 삭제 진행
  await prisma.characters.delete({where: {characterName: characterName}});

  return res.status(200).json({data: "캐릭터가 삭제되었습니다."});
});

export default router;
