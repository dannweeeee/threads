import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }, 
    parentId: {
        type: String,
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread', // reference to itself, so that one thread can have multiple threads as children aka recursion
        }
    ]
});

const Thread = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;