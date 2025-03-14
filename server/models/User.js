const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

class User {
  constructor(data) {
    this.name = data.name;
    this.email = data.email.toLowerCase();
    this.password = data.password;
    this.createdAt = new Date();
  }

  static async findByEmail(db, email) {
    return await db.collection('users').findOne({ email: email.toLowerCase() });
  }

  static async findById(db, id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      console.log('Attempting to find user with ID:', objectId);
      const user = await db.collection('users').findOne({ _id: objectId });
      if (!user) {
        console.log('User not found for ID:', objectId);
      } else {
        console.log('User found:', user.email);
      }
      return user;
    } catch (err) {
      console.error('Error in findById:', err.message);
      return null;
    }
  }

  async save(db) {
    try {
      // Hash password before saving
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      
      // Insert the user
      const result = await db.collection('users').insertOne(this);
      console.log('User saved to database:', { id: result.insertedId, email: this.email });
      return result;
    } catch (err) {
      console.error('Error saving user:', err.message);
      throw err;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (err) {
      console.error('Error comparing passwords:', err.message);
      return false;
    }
  }
}

module.exports = User; 