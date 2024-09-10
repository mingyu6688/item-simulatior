import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";

const router = express.Router();

// 회원가입 유효성 검증
const VaildsignupSchema = Joi.object({
  id: Joi.string()
    .alphanum()
    .regex(/^[a-z0-9]+$/)
    .required()
    .messages({
      "string.base": "아이디는 문자열이어야 합니다.",
      "string.alphanum": "알파벳과 숫자로 입력해야 합니다.",
      "string.pattern.base": "소문자와 숫자로 입력해야합니다.",
      "any.required": "아이디를 입력해주세요.",
    }),
  password: Joi.string().min(6).required().messages({
    "string.base": "비밀번호는 문자열이어야 합니다.",
    "String.min": "비밀번호는 6글자가 넘어야 합니다.",
    "any.required": "비밀번호를 입력해주세요.",
  }),
  passwordcheck: Joi.string().min(6).required().messages({
    "string.base": "비밀번호 재확인은 문자열이어야 합니다.",
    "string.min": "비밀번호 재확인은 6글자가 넘어야 합니다.",
    "any.required": "비밀번호 재확인을 입력해주세요.",
  }),
});

// 로그인 유효성 검증
const VaildsigninSchema = Joi.object({
  id: Joi.string()
    .alphanum()
    .regex(/^[a-z0-9]+$/)
    .required()
    .messages({
      "string.base": "아이디는 문자열이어야 합니다.",
      "string.alphanum": "알파벳과 숫자로 입력해야 합니다.",
      "string.pattern.base": "소문자와 숫자로 입력해야합니다.",
      "any.required": "아이디를 입력해주세요.",
    }),
  password: Joi.string().min(6).required().messages({
    "string.base": "비밀번호는 문자열이어야 합니다.",
    "String.min": "비밀번호는 6글자가 넘어야 합니다.",
    "any.required": "비밀번호를 입력해주세요.",
  })
});

// 회원가입
router.post("/sign-up", async (req, res, next) => {
  // 유효성 검증
  try {
    const { id, password, passwordcheck } = await VaildsignupSchema.validateAsync(
      req.body,
    );

    // 이메일 중복 체크
    const isExistUser = await prisma.users.findFirst({
      where: {
        id,
      },
    });
    if (isExistUser) {
      return res.status(409).json({ message: "사용중인 아이디입니다." });
    }

    // 비밀번호 확인
    if (password !== passwordcheck) {
      return res.status(409).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // 입력받은 비밀번호 bcrypt 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // Users 테이블에 추가
    const user = await prisma.users.create({
      data: {
        id,
        password: hashedPassword, // 암호화된 비밀번호를 기록
      },
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    //에러 처리 미들웨어로 넘김
    next(error);
  }
});

// 가입한 Users 조회
router.get("/users", async (req, res, next) => {
  const usersList = await prisma.users.findMany({
    select: {
      userId: true,
      id: true,
      password: true,
    },
  });

  return res.status(200).json({ data: usersList });
});

const CUSTOM_SECRET_KEY = process.env.SECRET_KEY;

// 로그인
router.post('/sign-in', async (req, res, next)=>{
  try{
  const { id, password } = await VaildsigninSchema.validateAsync(req.body);

  const isExistUser = await prisma.users.findFirst({
      where: {id}
  });

  if (!isExistUser)
      return res.status(401).json({message: "존재하지 않는 아이디입니다."});

  if(!(await bcrypt.compare(password, isExistUser.password)))
      return res.status(401).json({message: "비밀번호가 일치하지 않습니다."});

  const token = jwt.sign(
      {userId: isExistUser.userId},CUSTOM_SECRET_KEY);

  res.cookie('authorization', `Bearer ${token}`);
  return res.status(200).json({message: "로그인에 성공하였습니다."});
  } catch(error){
    next(error);
  }
});



// const tokenStorages = {};

// const ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_KEY;//`HangHae99`; // Access Token의 비밀 키를 정의합니다.
// const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_KEY;//`Sparta`; // Refresh Token의 비밀 키를 정의합니다.


// // 로그인
// router.post("/sign-in", async (req, res, next) => {

//   // 로그인 유효성 검증
//   try {
//     const { id, password } = await VaildsigninSchema.validateAsync(req.body);

//     // 입력받은 아이디가 존재하는가?
//     const isExistId = await prisma.Users.findFirst({
//       where : {
//         id
//       }
//     });
    
//     if (!isExistId) {
//       return res.status(401).json({message: "존재하지 않는 아이디입니다."});
//     }

//     // 비밀번호를 bcrypt 해서 일치하는지 검증하고 
//     if (!(await bcrypt.compare(password, isExistId.password))){
//       return res.status(401).json({message: "비밀번호가 일치하지 않습니다."});
//     }

//     // 액세스 토큰과 리프레쉬 토큰 생성
//     const accessToken = createAccessToken(id);
//     const refreshToken = jwt.sign({ userid: isExistId.userId, id: id }, REFRESH_TOKEN_SECRET_KEY, {expiresIn: '7d'});
    
//     console.log(isExistId);


//     tokenStorages[refreshToken] = {
//       id: id,
//       ip: req.ip,
//       userAgent: req.headers['user-agent'],
//     }

//     // 클라이언트에게 쿠키(토큰)을 할당
//     res.cookie('accessToken', accessToken);
//     res.cookie('refreshToken', refreshToken);

//     return res.status(200).json({message: "Token이 정상적으로 발급되었습니다."});

//   } catch (error) {
//   //에러 처리 미들웨어로 넘김 
//   next(error);
//   }
// });

// router.post('/createnewcharacter', async(req,res,next)=>{

//   // 제공된 토큰이 유효한지 검증하는 기능
//   const { accessToken } = req.cookies;

//   if(!accessToken)
//   return res.status(400).json({message: "Access Token이 존재하지 않습니다."});

//   const payload = validateToken(accessToken, ACCESS_TOKEN_SECRET_KEY);
//   if(!payload){
//     return res.status(401).json({errormessage: "Access Token이 정상적이지 않습니다."}); 
//   }

//   const {id} = payload; // payload는 유저의 id, ip, userAgent 정보를 가지고 있다.
//   return res.status(200).json({message: `${id}의 Payload를 가진 Token이 정상적으로 인증되었습니다.`});
// })

// // 토큰 검증, payload 조회용 함수
// function validateToken(token, secretKey) {
//   try {
//     return jwt.verify(token, secretKey);
//   } catch(err) {
//     return null;
//   }
// }

// // 액세스 토큰 재발급 함수
// function createAccessToken(id){
//   return jwt.sign({id:id}, ACCESS_TOKEN_SECRET_KEY, {expiresIn: '10s'});
// }


// router.post('/tokens/refresh', async (req,res,next)=>{
//   const {refreshToken} = req.cookies;

//   if(!refreshToken){
//     return res.status(400).json({errormessage: 'Refresh Token이 존재하지 않습니다.'});
//   }

//   const payload = validateToken(refreshToken, REFRESH_TOKEN_SECRET_KEY);

//   if(!payload){
//     return res.status(401).json({errormessage: 'Refresh Token이 정상적이지 않습니다.'});
//   }

//   const userInfo = tokenStorages[refreshToken];

//   if(!userInfo){
//     return res.status(419).json({errormessage: 'Refresh Token의 정보가 서버에 존재하지 않습니다.'});
//   }

//   const newAccessToken = createAccessToken(userInfo.id);

//   res.cookie('accessToken', newAccessToken);
//   return res.status(200).json({message: 'Access Token을 정상적으로 새롭게 발급했습니다.'});
// });


export default router;
