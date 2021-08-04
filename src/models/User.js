import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import findOrCrate from 'mongoose-findorcreate';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  avatarPath: String,
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  googleId: String,
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

userSchema.plugin(findOrCrate);

const User = mongoose.model('User', userSchema);

export default User;
