import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { connectDB } from '../db/connection.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/posts/:postId/inquiries', async (req, res) => {
  try {
    const db = await connectDB();
    const inquiries = await db
      .collection('inquiries')
      .find({ postId: new ObjectId(req.params.postId) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/posts/:postId/inquiries', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const post = await db
      .collection('posts')
      .findOne({ _id: new ObjectId(req.params.postId) });

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot inquire on your own post' });
    }

    const { message, senderContact } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const inquiry = {
      postId: new ObjectId(req.params.postId),
      userId: new ObjectId(req.user.id),
      senderName: req.user.name,
      senderContact: senderContact || req.user.email,
      message,
      createdAt: new Date(),
    };

    await db.collection('inquiries').insertOne(inquiry);
    await db
      .collection('posts')
      .updateOne(
        { _id: new ObjectId(req.params.postId) },
        { $inc: { inquiryCount: 1 } },
      );
    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/inquiries/:id', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const inquiry = await db
      .collection('inquiries')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    if (inquiry.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db
      .collection('inquiries')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    await db
      .collection('posts')
      .updateOne({ _id: inquiry.postId }, { $inc: { inquiryCount: -1 } });
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
