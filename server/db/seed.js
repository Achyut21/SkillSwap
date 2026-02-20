import 'dotenv/config';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const CATEGORIES = [
  'Programming',
  'Music',
  'Language',
  'Sports',
  'Art',
  'Academics',
  'Other',
];

const SKILLS = {
  Programming: [
    'Python',
    'JavaScript',
    'React',
    'Machine Learning',
    'Java',
    'C++',
    'SQL',
    'TypeScript',
    'Node.js',
    'UI Design',
  ],
  Music: ['Guitar', 'Piano', 'Drums', 'Singing', 'Music Production', 'Violin'],
  Language: ['Spanish', 'French', 'Japanese', 'Mandarin', 'Korean', 'German'],
  Sports: [
    'Basketball',
    'Soccer',
    'Tennis',
    'Swimming',
    'Yoga',
    'Chess',
    'Rock Climbing',
  ],
  Art: [
    'Drawing',
    'Painting',
    'Photography',
    'Video Editing',
    'Graphic Design',
    'Animation',
  ],
  Academics: [
    'Calculus',
    'Statistics',
    'Physics',
    'Chemistry',
    'Writing',
    'Public Speaking',
  ],
  Other: ['Cooking', 'Marketing', 'Excel', 'Personal Finance', 'First Aid'],
};

const FIRST_NAMES = [
  'Alex',
  'Maria',
  'Jake',
  'Sophie',
  'Liam',
  'Emma',
  'Noah',
  'Ava',
  'Oliver',
  'Isabella',
  'Ethan',
  'Mia',
  'Lucas',
  'Charlotte',
  'Mason',
  'Amelia',
  'Logan',
  'Harper',
  'James',
  'Evelyn',
  'Aiden',
  'Abigail',
  'Ella',
  'Jackson',
  'Scarlett',
  'Sebastian',
  'Grace',
  'Mateo',
  'Chloe',
  'Henry',
  'Victoria',
  'Owen',
  'Riley',
  'Daniel',
  'Zoey',
  'Leo',
  'Nora',
  'Jack',
  'Lily',
  'Ryan',
  'Hannah',
  'David',
  'Layla',
  'Joseph',
  'Ellie',
  'Carter',
  'Stella',
  'Luke',
  'Maya',
  'Jayden',
  'Paisley',
  'Dylan',
  'Audrey',
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickCategory() {
  return pick(CATEGORIES);
}

function pickSkill(category) {
  return pick(SKILLS[category]);
}

function generateDescription(offered, wanted) {
  const templates = [
    `I can teach you ${offered} from the basics. Looking to learn ${wanted} in exchange.`,
    `Been doing ${offered} for a few years now. Would love to pick up ${wanted} from someone experienced.`,
    `Happy to share my knowledge of ${offered}. Really want to get into ${wanted}.`,
    `I am pretty good at ${offered} and looking for someone to teach me ${wanted}. Flexible schedule.`,
    `Offering ${offered} lessons in exchange for ${wanted} sessions. Let us connect.`,
    `I have solid experience with ${offered}. In return I want to learn ${wanted}. Weekly meetups work best.`,
    `Can help you with ${offered} from beginner to intermediate level. Hoping to learn ${wanted}.`,
    `Looking for a skill swap. I bring ${offered} and want ${wanted}. Open to online or in person.`,
  ];
  return pick(templates);
}

function generateInquiryMessage(offered, wanted) {
  const templates = [
    `Hey I am interested in learning ${offered} from you. I can help you with ${wanted} in return.`,
    `This is exactly what I was looking for. I know ${wanted} and would love to trade skills.`,
    `Would love to connect. I have been wanting to learn ${offered} for a while. I can teach you ${wanted}.`,
    `Your post caught my eye. I am solid at ${wanted} and really want to learn ${offered}. When are you free?`,
    `Great match. I can offer ${wanted} and I need help with ${offered}. Let me know if you are interested.`,
    `Hi. I have experience with ${wanted} and your ${offered} skills would be perfect. Want to set up a time?`,
  ];
  return pick(templates);
}

async function seed() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('skillswap');

  await db.collection('users').deleteMany({});
  await db.collection('posts').deleteMany({});
  await db.collection('inquiries').deleteMany({});
  console.log('Cleared existing data');

  // Generate 50 users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];
  for (let i = 0; i < 50; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    users.push({
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}${last.toLowerCase()}${i}@example.com`,
      password: hashedPassword,
      createdAt: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      ),
    });
  }
  const userResult = await db.collection('users').insertMany(users);
  const userIds = Object.values(userResult.insertedIds);
  console.log(`Inserted ${userIds.length} users`);

  // Generate 1000+ posts
  const posts = [];
  for (let i = 0; i < 1050; i++) {
    const category = pickCategory();
    const offeredCat = pickCategory();
    const offered = pickSkill(offeredCat);
    const wanted = pickSkill(category);
    const userId = pick(userIds);
    const user = users[userIds.indexOf(userId)];

    posts.push({
      userId,
      name: user.name,
      skillOffered: offered,
      skillWanted: wanted,
      description: generateDescription(offered, wanted),
      category,
      tags: [offered.toLowerCase(), wanted.toLowerCase()],
      inquiryCount: 0,
      createdAt: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
      ),
    });
  }
  const postResult = await db.collection('posts').insertMany(posts);
  const postIds = Object.values(postResult.insertedIds);
  console.log(`Inserted ${postIds.length} posts`);

  // Generate 350+ inquiries
  const inquiries = [];
  for (let i = 0; i < 375; i++) {
    const postIndex = Math.floor(Math.random() * postIds.length);
    const post = posts[postIndex];
    let senderId = pick(userIds);
    while (senderId.toString() === post.userId.toString()) {
      senderId = pick(userIds);
    }
    const sender = users[userIds.indexOf(senderId)];
    inquiries.push({
      postId: postIds[postIndex],
      userId: senderId,
      senderName: sender.name,
      senderContact: sender.email,
      message: generateInquiryMessage(post.skillOffered, post.skillWanted),
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
    });
  }
  await db.collection('inquiries').insertMany(inquiries);
  console.log(`Inserted ${inquiries.length} inquiries`);

  // Update inquiry counts on posts
  const counts = {};
  for (const inq of inquiries) {
    const key = inq.postId.toString();
    counts[key] = (counts[key] || 0) + 1;
  }
  for (const [postId, count] of Object.entries(counts)) {
    await db
      .collection('posts')
      .updateOne(
        { _id: postIds[postIds.findIndex((id) => id.toString() === postId)] },
        { $set: { inquiryCount: count } },
      );
  }
  console.log('Updated inquiry counts');
  console.log('Seeding complete');
  await client.close();
}

seed();
