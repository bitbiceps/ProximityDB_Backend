export const validateRegistration = (req, res, next) => {
  const { fullName, email, password, termsAccepted } = req.body;

  if (!fullName || !email || !password || !termsAccepted) {
    return res.status(400).json({ message: "All fields are required" });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  next();
};
