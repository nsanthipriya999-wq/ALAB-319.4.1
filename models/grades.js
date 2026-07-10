import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
    scores: [
        {
            type: { type: String },
            score: { type: Number }
        }
    ],
    class_id: {
        type: Number,                   //changed from string to number
        required: true,
        min:0,
        max:300,
        validate:{

        validator:Number.isInteger,
        message:"class_id must be an integer"
        }
    },

    learner_id: {
        type: Number,
        required: true,
        min:0,
        validate:{
            validator:Number.isInteger,
            message:"learner_id must be an integer"
        }
    }
});

//single field index

gradeSchema.index({class_id:1});
gradeSchema.index({learner_id:1});


//compound index

gradeSchema.index({

    learner_id:1,
    class_id:1
});

export default mongoose.model("Grade", gradeSchema);

/*
[
  { v: 2, key: { _id: 1 }, name: '_id_' },
  { v: 2, key: { student_id: 1 }, name: 'student_id_1' },
  { v: 2, key: { class_id: 1 }, name: 'class_id_1' },
  { v: 2, key: { learner_id: 1 }, name: 'learner_id_1' },
  {
    v: 2,
    key: { learner_id: 1, class_id: 1 },
    name: 'learner_id_1_class_id_1'
  }
]
  */



/*db.runCommand({
  collMod: "grades",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "class_id",
        "learner_id"
      ],
      properties: {
        class_id: {
          bsonType: "int",
          minimum: 0,
          maximum: 300
        },
        learner_id: {
          bsonType: "int",
          minimum: 0
        }
      }
    }
  },
  validationAction: "warn"
});


[
  {
    name: 'grades',
    type: 'collection',
    options: {
      validator: {
        '$jsonSchema': {
          bsonType: 'object',
          required: [ 'class_id', 'learner_id' ],
          properties: {
            class_id: { bsonType: 'int', minimum: 0, maximum: 300 },
            learner_id: { bsonType: 'int', minimum: 0 }
          }
        }
      },
      validationLevel: 'strict',
      validationAction: 'warn'
    },
    info: { readOnly: false, uuid: UUID('e30c3530-f479-49fb-87f1-58127819fac8') },
    idIndex: { v: 2, key: { _id: 1 }, name: '_id_' }
  }
]*/

