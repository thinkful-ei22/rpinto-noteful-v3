'use strict';

const express = require('express');

const router = express.Router();

const Note = require('../models/notes');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  
  Note
  .find()
  .then(notes => res.json(notes))
});


/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  Note
  .findById(req.params.id)
  .then(note => {
    res.json(note)
  })
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  Note
    .create({
      title: req.body.title,
      content: req.body.content
    })
    .then(newNote => res.json(newNote))
});


/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);

    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Note
    .findByIdAndUpdate(req.params.id,
      { $set: toUpdate },
      { new: true }
    )
    .then(updatedNote => res.json(updatedNote))
});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  Note
  .findByIdAndRemove(req.params.id)
  .then(deletedNote => res.json(deletedNote).end())
});

module.exports = router;