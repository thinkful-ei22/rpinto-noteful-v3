'use strict';

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Folder = require('../models/folders');

// GET all folders, Sort by name

router.get('/', (req, res, next) => {
  Folder
    .find()
    .sort('name')
    .then(folder => {
      res.json(folder);
    });
});

// GET folders by id, Validate the id is a Mongo ObjectId, Conditionally return a 200 response or a 404 Not Found

router.get('/:id', (req, res, next) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder
    .findById(req.params.id)
    .then(folder => {
      res.json(folder);
    })
    .catch(err => {
      next(err);
    });
});

// POST folders to create a new folder

router.post('/', (req, res, next) => {
  //Validate the incoming body has a name field
  if (!req.body.name) {
    const err = new Error('You must make a name for a folder');
    err.status = 400;
    return next(err);
  }

  Folder
    .create({
      name: req.body.name
    })
    //Respond with a 201 status and location header
    .then(newFolder => res.location(`${req.originalUrl}${newFolder.id}`).status(201).json(newFolder))
    //Catch duplicate key error code 11000 and respond with a helpful error message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      next(err);
    });
});


// PUT folders by id to update a folder name
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

  Folder
    .findByIdAndUpdate(req.params.id,
      { $set: toUpdate },
      { new: true }
    )
    .then( updatedFolder => res.json(updatedFolder))
  //Catch duplicate key error code 11000 and respond with a helpful error message
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('No duplicate File names allowed');
        err.status = 400;
      }
      next(err);
    });
});
// DELETE folders by id which deletes the folder AND the related notes, Respond with a 204 status

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
    { $unset: { folderId: '' } }
  );

  folderRemovePromise.then(()=>{
    return noteRemovePromise;
  }).then(()=>{
    res.status(204).end();
  })
  .catch(err => {
    next(err);
  })
  
  // Example of parallel promises, similar to series promise above
  // Promise.all([folderRemovePromise, noteRemovePromise])
  //   .then(() => {
  //     res.status(204).end();
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

module.exports = router;