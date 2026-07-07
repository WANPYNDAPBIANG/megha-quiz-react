import authorityModel from "../models/authorityModel.js";

export const getAuthorities = async (req, res) => {
  try {
    const authorities = await authorityModel.find({});
    res.status(200).json(authorities);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
