import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

const CUSTOM_SECRET_KEY = process.env.SECRET_KEY;

export default async function(req, res, next) {

    try{
    const { authorization } = req.cookies;
    if (!authorization) throw new Error('요청한 사용자의 토큰이 존재하지 않습니다.');

    // authorization = "Bearer dsadsadawac"
    const [tokenType, token] = authorization.split(' '); // 토큰타입에 Bearer를 token에 나머지를 넣는다.

    const decodedToken = jwt.verify(token, CUSTOM_SECRET_KEY);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
        where: {userId: +userId}
    });
    if(!user){
        throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    req.user = user;
    next();

    if(tokenType !== 'Bearer') throw new Error('토큰 타입이 Bearer 형식이 아닙니다.');
    } catch (error){
        return res.status(400).json({message: error.message});
    }
}

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