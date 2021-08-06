import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import findOrCrate from 'mongoose-findorcreate';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String },
  avatar: {
    avatarKey: { type: String },
    avatarUrl: { type: String },
  },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  googleId: { type: String, unique: true },
  lineId: { type: String, unique: true },
  githubId: { type: String, unique: true },
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

userSchema.plugin(findOrCrate);

const User = mongoose.model('User', userSchema);

export default User;
