import {Schema,model,Types} from 'mongoose'


const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: [true,"title is must"],
      trim: true
    },

    companyName: {
      type: String,
      required: [true,"company is must"],
      trim: true
    },

    description: {
      type: String,
      required: [true,"description is must"],
    },

    location: {
      type: String,
      required: [true,"location is must"],
    },

    employmentType: {
      type: String,
      required: true,
      enum:{
        values:["Full-time", "Part-time", "Internship", "Contract"],
        message: "Invalid type of employment"
    }},

    salaryRange: {
    
        type:String,
        required:[true,"salary range is must"]
        
     
    },

    requiredSkills: {
      type: [String],
      required: true
    },

    experienceRequirement: {
      type: Number,
      required: true
    },

    postedDate: {
      type: Date,
      default: Date.now
    },

    applicationDeadline: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open"
    },

    employer: {
      type: [Types.ObjectId],
      ref: "users",
      required: true
    }
  },
  {
      versionKey: false,
    timestamps: true,
    strict: "throw"
  }
);
export const jobModel = model("jobs",jobSchema);
 