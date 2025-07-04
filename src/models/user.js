import mongoose from "mongoose";


const ContestHistorySchema = new mongoose.Schema({
  contestIdList: [Number],
  rankList: [Number],
  ratingList: [Number],
  unsolvedList: [Number],
  dateList: [String]
}, { _id: false });

const ProblemSolvedSchema = new mongoose.Schema({
  totalProblemsSolved: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  maxRatedProblem: { type: Number, default: 0 },
  problemsPerRatingBuckets: {
    "1200": Number,
    "1400": Number,
    "1600": Number,
    "1800": Number,
    "1900": Number,
    "2100": Number,
    "2300": Number,
    "2400": Number,
    "2600": Number,
    "2800": Number,
    "3000": Number,
    "4500": { type: Number, default: null }
  },
  dailySubmissions: {
    type: Map,
    of: Number,
    default: {}
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailId: { type: String, required: true },
  phoneNumber: { type: String },
  handle: { type: String, required: true },
  currentRating: { type: Number, required: true },
  maxRating: { type: Number, required: true },
  contestHistory: {
    "30": { type: ContestHistorySchema, default: () => ({}) },
    "90": { type: ContestHistorySchema, default: () => ({}) },
    "365": { type: ContestHistorySchema, default: () => ({}) }
  },
  problemSolvedData: {
    "7": { type: ProblemSolvedSchema, default: () => ({}) },
    "30": { type: ProblemSolvedSchema, default: () => ({}) },
    "90": { type: ProblemSolvedSchema, default: () => ({}) }
  }
});

const UserData = mongoose.model('User', UserSchema);
export default UserData;
