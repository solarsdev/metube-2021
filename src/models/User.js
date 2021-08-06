import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import findOrCrate from 'mongoose-findorcreate';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String },
  avatar: {
    isExternal: Boolean,
    avatarUrl: String,
    avatarKey: String,
  },
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
  socialOnly: { type: Boolean, required: true },
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

userSchema.plugin(findOrCrate);

const User = mongoose.model('User', userSchema);

export default User;
