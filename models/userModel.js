import {Schema,model} from 'mongoose'
const userSchema=new Schema({
    name:{
        type:String,
        required:[true,"name is compulsory"],
        minlength:[3,"min length is 4"],
        maxlength:[20,"max length is 20"],
       

    },email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already existed"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [3, "Min length of password is 3"],
    },
    role: {
      type: String,
      enum: {
        values: ["JOBSEEKER", "EMPLOYEE","ADMIN"],
        message: "Invalid role",
      },
    skills:{
        type:[String],
        required:[true,"skills are must"]
    },
    experience:
    {
        type:Number,
        required:[true,"experience must enter"],
        minvalue:[0,"experience cannot be negative"]
    },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  }
);

export const userModel=model("users",userSchema);


