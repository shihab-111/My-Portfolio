import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Admin", trim: true },
    role: { type: String, enum: ["admin"], default: "admin" },
  },
  { timestamps: true }
);

UserSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};

/** Never leak the hash to the client. */
UserSchema.methods.toSafeJSON = function () {
  return { id: this._id, email: this.email, name: this.name, role: this.role };
};

export default mongoose.model("User", UserSchema);
