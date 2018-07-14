'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Tag = require('../models/tags');

// GET all tags, Sort by name

router.get('/', (req, res, next) => {
  Tag
    .find()
    .sort('name')
    .then(tag => {
      res.json(tag);
    });
});

// GET tags by id, Validate the id is a Mongo ObjectId, Conditionally return a 200 response or a 404 Not Found

router.get('/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('Invalid field entry');
    err.status = 400;
    return next(err);
  }

  Tag
    .findById(req.params.id)
    .then(tag => {
      res.json(tag);
    })
    .catch(err => {
      next(err);
    });
});

// POST tags to create a new tag

router.post('/', (req, res, next) => {
  //Validate the incoming body has a name field
  if (!req.body.name) {
    const err = new Error('You must make a name for a tag');
    err.status = 400;
    return next(err);
  }

  Tag
    .create({
      name: req.body.name
    })
    //Respond with a 201 status and location header
    .then(newTag => res.location(`${req.originalUrl}${newTag.id}`).status(201).json(newTag))
    //Catch duplicate key error code 11000 and respond with a helpful error message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      next(err);
    });
});


// PUT tags by id to update a tag name
router.put('/:id', (req, res, next) => {
  //Validate the id is a mongo object id,
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('`id` field is not valid');
    err.status = 400;
    return next(err);
  }
  //Validate there is a name in name field
  if (!req.body.name) {
    const err = new Error('Missing `name` field');
    err.status = 400;
    return next(err);
  }

  const toUpdate = {};

  Tag
    .findByIdAndUpdate(req.params.id,
      { $set: toUpdate },
      { new: true }
    )
    .then( updatedTag => res.json(updatedTag))
  //Catch duplicate key error code 11000 and respond with a helpful error message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('No duplicate tag names allowed');
        err.status = 400;
      }
      next(err);
    });
});
// DELETE tags by id which deletes the tag AND the related notes, Respond with a 204 status

router.delete('/:id', (req, res, next) => {
  const { id } = req.params;


  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('`id` is not valid');
    err.status = 400;
    return next(err);
  }

  // ON DELETE SET NULL equivalent
  const folderRemovePromise = Folder.findByIdAndRemove(req.params.id);

  const noteRemovePromise = Note.updateMany(
    { folderId: req.params.id },
    { $unset: { folderId: '' } },
    { $unset: { tagId: ''} },
    { $pull: { tagId } }
  );

  Promise.all([folderRemovePromise, noteRemovePromise])
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;