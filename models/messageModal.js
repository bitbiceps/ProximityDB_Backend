import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        read : {type : Boolean , default : false},
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic",
            default: null,
        },
        articleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Article",
            default: null,
        },
         status : {
            type : String ,
            enum: ["received", "sent"], 
            default: "received",
         },
        content: {
            type: String, 
            default: null,
        },
        topicContent: {
            type: {
                message: { type: String, default: null }, 
                topic: { type: String, default: null }, 
                status : {type : String  , default : "pending"}
            },
            default: null,
        },
        messageType: {
            type: String,
            enum: ["topic_update", "article_update", "general"],
            required: true,
        },
    },
    { timestamps: true }
);

messageSchema.pre("save", function (next) {
    if (!this.overview) {
        if (this.messageType === "topic_update" && this.topicContent.status === 'pending') {
            this.content = `Topic update request`;
        }
    }
    next();
});

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
