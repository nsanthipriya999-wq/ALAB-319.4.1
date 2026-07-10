import "dotenv/config";
import express from "express";
import connectDB from "./db.js";
import Grade from "./models/grades.js";

const app=express();
const port=process.env.PORT||3000;
app.use(express.json());
//----------Displays one record ----------
app.get("/",async(req,res)=>{
   try{
    //res.send("Welcome to API");
    const result=await Grade.findOne();
    res.json(result);
   }catch(err){
    res.status(500).json({error:err.message});
   }
   });

   //-----------------GET/grades/stats----------------------
   app.get("/grades/stats",async(req,res)=>{
    try{

      const result= await Grade.aggregate([
        //-----(flattens array fields)--------------------------------------
        {
            $unwind:"$scores"

        },

        //------------------(Group scores by learner_id)-----------------------
        {
           $group:{
                _id:"$learner_id",
                quiz:{

                   $push: {
                       $cond: {
                              if: { $eq: ["$scores.type", "quiz"] },
                              then: "$scores.score",
                              else: "$$REMOVE",
                              }
                           }
                     },
              exam: {
                    $push: {
                        $cond: {
                                if: { $eq: ["$scores.type", "exam"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                              },
                          },
                  },
           homework: {
                    $push: {
                          $cond: {
                                  if: { $eq: ["$scores.type", "homework"] },
                                  then: "$scores.score",
                                 else: "$$REMOVE",
                                } ,
                            }
                      }
               }
       },
//-------------weighted average calculation------------------------
    {
      $project: {
        weightedAverage: {
          $sum: [
            {
              $multiply: [{ $avg: "$exam" }, 0.5]
            },
            {
              $multiply: [{ $avg: "$quiz" }, 0.3]
            },
            {
              $multiply: [{ $avg: "$homework" }, 0.2]
            }

          ]
        }
      }
    },

    //-------------------Learner count--------------------
    {
      $group: {
        _id: null,
        learnersAbove70: {
           $sum: {
              $cond: [
              {
                $gt: ["$weightedAverage", 70]
              }, 1,
              0
            ]
          }
        },
        totalLearners: { $sum: 1 }
      }
    },
    //-----------calculate percentage----------
    {
      $project: {
        _id: 0,
        learnersAbove70: 1,
        totalLearners: 1,
        percentageAbove70: {
            $round:[
                {
                  $multiply: [
                    {
                     $divide: ["$learnersAbove70", "$totalLearners"]
                    },
                 100
               ]
        },
        2
        ]
      },
    }
    }
  ]);


  if (result.length === 0) {res.send("Grades not found").status(404);}
  else res.json(result[0]).status(200);
    }catch(err){
        res.status(500).json({error:err.message});
    }


});


//-------GET/grades/stats/:id------------id refers to class_id---------------------------------
app.get("/grades/stats/:id",async(req,res)=>{
try{
      const classId =Number(req.params.id);
      const result= await Grade.aggregate([
       {
         //--------filters by class_id------
           $match:{

             class_id:classId
           }

       },

        //-----(flattens array fields)--------------------------------------
        {
            $unwind:"$scores"

        },

        //------------------(Group scores by learner_id)-----------------------
        {
           $group:{
                _id:"$learner_id",
                quiz:{

                   $push: {
                       $cond: {
                              if: { $eq: ["$scores.type", "quiz"] },
                              then: "$scores.score",
                              else: "$$REMOVE",
                              }
                           }
                     },
              exam: {
                    $push: {
                        $cond: {
                                if: { $eq: ["$scores.type", "exam"] },
                                then: "$scores.score",
                                else: "$$REMOVE",
                              },
                          },
                  },
           homework: {
                    $push: {
                          $cond: {
                                  if: { $eq: ["$scores.type", "homework"] },
                                  then: "$scores.score",
                                 else: "$$REMOVE",
                                } ,
                            }
                      }
               }
       },
//-------------weighted average calculation------------------------
    {
      $project: {
        weightedAverage: {
          $sum: [
            {
              $multiply: [{ $avg: "$exam" }, 0.5]
            },
            {
              $multiply: [{ $avg: "$quiz" }, 0.3]
            },
            {
              $multiply: [{ $avg: "$homework" }, 0.2]
            }

          ]
        }
      }
    },

    //-------------------Learner count--------------------
    {
      $group: {
        _id: null,
        learnersAbove70: {
           $sum: {
              $cond: [
              {
                $gt: ["$weightedAverage", 70]
              }, 1,
              0
            ]
          }
        },
        totalLearners: { $sum: 1 }
      }
    },
    //-----------calculate percentage----------
    {
      $project: {
        _id: 0,
        learnersAbove70: 1,
        totalLearners: 1,
        percentageAbove70: {
            $round:[
                {
                  $multiply: [
                    {
                     $divide: ["$learnersAbove70", "$totalLearners"]
                    },
                 100
               ]
        },
        2
        ]
      },
    }
    }
  ]);


  if (result.length === 0) {res.send("No data found for given class Id").status(404);}
  else res.json(result[0]).status(200);
    }catch(err){
        res.status(500).json({error:err.message});}
});




//----------------starting the server----------------------------
app.listen(port, () => {
  console.log('Listening on port: ' + port);
  connectDB();
})

















    






















    



