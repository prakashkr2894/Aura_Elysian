import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Authentication token missing" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "test");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
