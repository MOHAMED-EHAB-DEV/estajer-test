import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
        },
        description: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["new", "read", "replied", "closed"],
            default: "new",
        },
        images: [
            {
                preview: { type: String, required: true },
                gradientColors: [String],
                gradientStyle: String,
            },
        ],
        budget: {
            type: Number,
            default: 0,
        },
        pdfLink: {
            type: String,
            default: "",
            trim: true,
        },
        replay: {
            type: String,
            default: "",
            trim: true,
        }
    },
    { timestamps: true }
);

export default mongoose.models.Proposal || mongoose.model("Proposal", ProposalSchema);