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

  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;