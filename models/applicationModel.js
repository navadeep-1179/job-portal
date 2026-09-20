import {schema,model,Types} from "mongoose"

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type:[Types.ObjectId],
      ref: "jobs",
      required: true
    },

    jobSeeker: {
      type:[Types.ObjectId],
      ref: "users",
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
      default: "Pending"
    },

    appliedDate: {
      type: Date,
      default: Date.now
    }
  },
  { versionkey:false,
    timestamps: true,
    strict:"throw"
  }
);

export const applicationMOdel = model("applications", applicationSchema);