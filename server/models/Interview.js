const { ObjectId } = require('mongodb');

class Interview {
  constructor(data) {
    this.role = data.role;
    this.difficulty = data.difficulty;
    this.questions = data.questions.map(q => ({
      text: q.text,
      type: q.type,
      difficulty: q.difficulty
    }));
    this.userId = new ObjectId(data.userId);
    this.answers = data.answers || [];
    this.status = data.status || 'in_progress';
    this.overallScore = data.overallScore || 0;
    this.createdAt = data.createdAt || new Date();
    this._id = data._id;
  }

  static async create(db, data) {
    try {
      const interview = new Interview(data);
      const result = await db.collection('interviews').insertOne(interview);
      console.log('Interview created:', result.insertedId);
      return { ...interview, _id: result.insertedId };
    } catch (err) {
      console.error('Error creating interview:', err);
      throw err;
    }
  }

  static async findById(db, id) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      const interview = await db.collection('interviews').findOne({ _id: objectId });
      return interview ? new Interview(interview) : null;
    } catch (err) {
      console.error('Error finding interview:', err);
      throw err;
    }
  }

  static async findByUserId(db, userId) {
    try {
      const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
      const interviews = await db.collection('interviews')
        .find({ userId: objectId })
        .sort({ createdAt: -1 })
        .toArray();
      return interviews.map(interview => new Interview(interview));
    } catch (err) {
      console.error('Error finding user interviews:', err);
      throw err;
    }
  }

  static async updateById(db, id, update) {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      
      // Validate answers structure if it's being updated
      if (update.answers) {
        update.answers = update.answers.map(answer => ({
          questionIndex: answer.questionIndex,
          answer: answer.answer,
          feedback: {
            text: answer.feedback.text,
            score: Math.min(Math.max(answer.feedback.score, 1), 10) // Ensure score is between 1-10
          }
        }));
      }

      const result = await db.collection('interviews').updateOne(
        { _id: objectId },
        { $set: update }
      );

      if (result.modifiedCount === 0) {
        throw new Error('Interview not found or no changes made');
      }

      return true;
    } catch (err) {
      console.error('Error updating interview:', err);
      throw err;
    }
  }
}

module.exports = Interview; 