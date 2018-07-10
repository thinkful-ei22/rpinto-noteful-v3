'use strict'

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/notes');


mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    const searchTerm = 'Lady Gaga';
    let filter = {};

    if (searchTerm) {
      filter.title = { $regex: searchTerm };
    }
    // //Find/Search for notes using Note.find
    //return Note.find(filter).sort({ updatedAt: 'desc' });
    // //Find note by id using Note.findById
    //return Note.findById("000000000000000000000006");
    // //Create a new note using Note.create
    // return Note.create({
    //   title: "A new note",
    //   content: "contents for my new note, created with mongoose"
    // }); 
    // //Update a note by id using Note.findByIdAndUpdate
    //return Note.findByIdAndUpdate("000000000000000000000006", {title: "updated title", content: "updated content"}, {new: true});
    // //Delete a note by id using Note.findByIdAndRemove
    //return Note.findByIdAndRemove("000000000000000000000007")

  })    
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });




