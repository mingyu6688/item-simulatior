import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import Joi from "joi";

const router = express.Router();

// 아이템 전체 조회
router.get('/items', async(req, res, next)=>{
    const itemList = await prisma.items.findMany({
        select: {
            item_Code: true,
            item_Name: true,
            item_Price: true,
        }
    });

    return res.status(200).json({data: itemList});
})

// 아이템 추가 유효성 검증
// const VaildItemCreateSchema = Joi.object({
//     item_Code: Joi.number().required().messages({
//         "number.base": "아이템 코드는 문자열이어야 합니다.",
//         "any.required": "아이템 코드를 입력해주세요.",
//     }),
//     item_Name: Joi.string().required().messages({
//       "string.base": "아이템명은 문자열이어야 합니다.",
//       "any.required": "아이템명을 입력해주세요.",
//     }),
//     item_Type: Joi.string()
//     .messages({
//         "string.base": "아이템 유형은 문자열이어야 합니다.",
//     }),
//     item_Hp: Joi.number()
//     .messages({
//         "number.base": "Hp 변경값은 숫자여야합니다.",
//     }),
//     item_Atk: Joi.number()
//     .messages({
//         "number.base": "Atk 변경값은 숫자여야합니다.",
//     }),
//     item_Price: Joi.number()
//     .required()
//     .messages({
//         "number.base": "아이템 가격은 숫자여야합니다.",
//         "any.required": "아이템 가격을 입력해주세요.",
//     }),
//     item_Info: Joi.string()
//     .messages({
//         "string.base": "아이템 정보는 문자열이어야 합니다.",
//     }),
//   });

// 아이템 추가
router.post('/items/create',  async(req, res,next)=>{

    try{
    const {item_Code, item_Name, item_Type, item_Hp, item_Atk, item_Price, item_Info} = req.body;

    // if(!item_code || !item_Name === undefined)
    //     return res.status(400).json({message: "아이템 코드와 아이템명을 입력해주세요."});

    //중복된 아이템 코드가 존재하는가
    const isExistItemCode = await prisma.items.findFirst({
        where: {item_Code},
    });
    //중복된 아이템명이 존재하는가?
    const isExistItemName = await prisma.items.findFirst({
        where: {item_Name},
    });

    // 중복 처리
    if(isExistItemCode) {
        return res.status(409).json({message: "이미 존재하는 아이템 코드입니다."});
    }
    if(isExistItemName) {
        return res.status(409).json({message: "이미 존재하는 아이템명입니다."});
    }

    // 생성
    const itemCreate = await prisma.items.create({
        data: {
            item_Code,
            item_Name,
            item_Type,
            item_Hp,
            item_Atk,
            item_Price,
            item_Info,
        }
    });

    return res.status(201).json({data: itemCreate});

    }catch(error){
        next(error);
    }
})

// 아이템 상세 조회
router.get('/items/:item_Code', async (req,res,next)=>{
    const {item_Code} = req.params;

    const isExistItem = await prisma.items.findFirst({
        where: {item_Code: +item_Code}
    })

    if(!isExistItem) {
        return res.status(400).json({message: "아이템 코드에 해당하는 아이템이 없습니다."});
    }

    const itemList = await prisma.items.findFirst({
        where: {item_Code: +item_Code},
        select: {
            itemId: true,
            item_Code: true,
            item_Name: true,
            item_Type: true,
            item_Hp: true,
            item_Atk: true,
            item_Info: true,
            item_Price: true,
        }
    })

    return res.status(201).json({data: itemList});
})

// 아이템 수정
router.put('/items/:item_Code', async(req,res,next)=>{
    const {item_Code} = req.params;
    const {item_Name, item_Type, item_Hp, item_Atk, item_Info, item_Price} = req.body;

    // 입력받은 아이템 코드가 존재하는가?
    const isExistItem_Code = await prisma.items.findFirst({
        where: {item_Code: +item_Code},
    });

    if(!isExistItem_Code){
        return res.status(404).json({message: "해당 아이템 코드를 가진 아이템이 없습니다."});
    }

    // 수정하려는 아이템명과 겹치는 데이터가 존재하는가?
    const isExistItem_Name = await prisma.items.findFirst({
        where: {item_Name: item_Name},
    })

    if(isExistItem_Name){
        return res.status(401).json({message: "해당 아이템명이 이미 있어 변경할 수 없습니다."});
    }

    // 입력받은 내용을 사용해서 데이터 수정
    await prisma.items.update({
        data: {
            item_Name: item_Name,
            item_Type: item_Type || "",
            item_Hp: item_Hp || 0,
            item_Atk: item_Atk || 0,
            item_Info: item_Info || "",
            item_Price: item_Price || 500,
        },
        where: {
            item_Code: +item_Code,
        }
    });

    return res.status(200).json({message: "아이템이 수정되었습니다."});
    // 
});

// 아이템 삭제
router.delete('/items/:item_Code', async (req, res, next)=>{
    const {item_Code} = req.params;

    // 아이템 코드가 일치하는 데이터가 존재하는지?
    const isExistItem_Code = await prisma.items.findFirst({
        where:{item_Code: +item_Code},
    });

    if(!isExistItem_Code) {
        return res.status(404).json({message: "아이템 코드에 해당하는 데이터가 없습니다."});
    }

    await prisma.items.delete({
        where: {item_Code: +item_Code},
    });

    return res.status(200).json({message: "아이템이 삭제되었습니다."});
});

export default router;