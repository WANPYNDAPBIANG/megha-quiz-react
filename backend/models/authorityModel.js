import mongoose from "mongoose";

const authoritySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  type: { type: String, required: true }
}, { 
  // This forces mongoose to link to your exact existing collection name
  collection: 'authorities' 
});

const authorityModel = mongoose.models.authority || mongoose.model("authority", authoritySchema);

export default authorityModel;
