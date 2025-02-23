import jwt from "jsonwebtoken"

export function generateTokenAndSetCookie(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET,{expiresIn:'15d'});

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, //MilliSeconds
    httponly: true, // prevent XSS attack cross-site scripting attacks
    sameSite: "strict", //CSRF attack cross-site request forgery attacks
  });
}