export default function(error, req, res, next) {
    console.log(error);
    if (error.name === "ValidationError") {
      console.log(error);
      return res.status(400).json({ errormessage: error.message });
    }

    return res
      .status(500)
      .json({ errormessage: "서버에서 에러가 발생하였습니다." });
}
