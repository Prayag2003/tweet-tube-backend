import mongoose, { Model, Schema } from "mongoose";
import { ITweet } from "./interfaces";

const tweetSchema = new Schema<ITweet>(
  {
    content: {
      type: String,
      required: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet: Model<ITweet> = mongoose.model<ITweet>(
  "Tweet",
  tweetSchema
);
