import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

const CUSTOM_SECRET_KEY = process.env.SECRET_KEY;

export default async function (req, res, next) {

  try {

    const authHeader = req.headers['authorization'];
    console.log(authHeader);

    if(!authHeader) {
      throw new Error('토큰이 존재하지 않습니다.');
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = jwt.verify(token, CUSTOM_SECRET_KEY);
    if(!decodedToken) {
      throw new Error('유효하지 않은 토큰입니다.');
    }

    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

// 액세스, 리프레쉬 토큰 방식 만들다 실패한거
// const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_KEY;

// export default async function(req, res, next) {

//     try{
//     const { refreshToken } = req.cookies;
//     if (!refreshToken) throw new Error('요청한 사용자의 토큰이 존재하지 않습니다.');

//     const decodedToken = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY);
//     const userId = decodedToken.userid;

//     const user = await prisma.users.findFirst({
//         where: {userId}
//     });

//     if(!user){
//         throw new Error('토큰 사용자가 존재하지 않습니다.');
//     }

//     req.user = user;
//     next();

//     if(tokenType !== 'Bearer') throw new Error('토큰 타입이 Bearer 형식이 아닙니다.');
//     } catch (error){
//         return res.status(400).json({message: error.message});
//     }
// }


    // const {cookie} = req.headers;
    // 할당한 쿠키를 = 기준으로 갈라서 authorization과 Bearer~~~~ 로 나누기
    // const [auth, content] = cookie.split("=");

    // 헤더에서 authorization을 받아온게 맞는가?
    // if (auth !== 'Authorization')
    //   throw new Error("요청한 사용자의 토큰이 존재하지 않습니다.");

    // 쿠키만 사용한 기존 방식
    // authorization = "Bearer dsadsadawac"
    // const [tokenType, token] = authorization.split(" "); // 토큰타입에 Bearer를 token에 나머지를 넣는다.

    // 토큰 타입은 Bearer, 암호화된 유저 정보는 token
    // const [tokenType, token] = content.split("%20");

    
    // if (tokenType !== "Bearer")
    //   throw new Error("토큰 타입이 Bearer 형식이 아닙니다.");

    //   헤더 사용방법 확인용
//   console.log(req.headers);
//   console.log(req.cookies);
//   const { cookie } = req.headers;

//   console.log(cookie);
//   //   const authheader = req.headers['authorization'];
//   const [auth, content] = cookie.split("=");

//   console.log(auth);
//   console.log(content);

//   const [extokenType, extoken] = content.split("%20");

//   console.log(extokenType);
//   console.log(extoken);