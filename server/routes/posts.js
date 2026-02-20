import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { connectDB } from '../db/connection.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = await connectDB();
    const { search, category, sort } = req.query;
    const filter = {};

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [
        { skillOffered: regex },
        { skillWanted: regex },
        { description: regex },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'inquiries') {
      sortOption = { inquiryCount: -1 };
    }

    const posts = await db
      .collection('posts')
      .find(filter)
      .sort(sortOption)
      .toArray();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const db = await connectDB();
    const post = await db
      .collection('posts')
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const { skillOffered, skillWanted, description, category, tags } = req.body;

    if (!skillOffered || !skillWanted || !description || !category) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const post = {
      userId: new ObjectId(req.user.id),
      name: req.user.name,
      skillOffered,
      skillWanted,
      description,
      category,
      tags: tags || [],
      inquiryCount: 0,
      createdAt: new Date(),
    };

    const result = await db.collection('posts').insertOne(post);
    res.status(201).json({ ...post, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const post = await db
      .collection('posts')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { skillOffered, skillWanted, description, category, tags } = req.body;
    await db.collection('posts').updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          skillOffered,
          skillWanted,
          description,
          category,
          tags: tags || [],
        },
      },
    );
    res.json({ message: 'Post updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await connectDB();
    const post = await db
      .collection('posts')
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db
      .collection('posts')
      .deleteOne({ _id: new ObjectId(req.params.id) });
    await db
      .collection('inquiries')
      .deleteMany({ postId: new ObjectId(req.params.id) });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
