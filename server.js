const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'passworld';

app.get('/', async (req, res) => {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const docs = await collection.find({}).toArray();
    const formatted = docs.map(doc => ({
      id: doc._id.toString(),
      site: doc.site,
      username: doc.username,
      password: doc.password,
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch' });
  } finally {
    if (client) await client.close();
  }
});

app.post('/', async (req, res) => {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const { site, username, password } = req.body;
    const result = await collection.insertOne({ site, username, password });
    res.json({ id: result.insertedId.toString(), site, username, password });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  } finally {
    if (client) await client.close();
  }
});

app.put('/', async (req, res) => {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const { id, site, username, password } = req.body;
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { site, username, password } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ id, site, username, password });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' });
  } finally {
    if (client) await client.close();
  }
});

app.delete('/', async (req, res) => {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const { id } = req.body;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  } finally {
    if (client) await client.close();
  }
});

module.exports = app;