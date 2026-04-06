import User from "../models/User.js";


// GET USER SETTINGS

export const getSettings = async (req, res) => {

  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      darkMode: user.darkMode || false
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: "Server error" });

  }

};



// UPDATE SETTINGS

export const updateSettings = async (req, res) => {

  try {

    const { name, password, darkMode } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;

    if (password) user.password = password;

    if (darkMode !== undefined) user.darkMode = darkMode;

    await user.save();

    res.json({ message: "Settings updated successfully" });

  } catch (error) {

    console.error(error);

    res.status(500).json({ message: "Server error" });

  }

};