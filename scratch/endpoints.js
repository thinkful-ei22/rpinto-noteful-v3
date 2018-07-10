// router.get('/', (req, res, next) => {
//   console.log('Get All Notes');
//   .find(filter).sort({ updatedAt: 'desc' });
//   .then(notes => {
//     res.json([
//       { id: 1, title: 'Temp 1' },
//       { id: 2, title: 'Temp 2' },
//       { id: 3, title: 'Temp 3' }
//     ]);
//   })
//   .catch(
//     err => {
//       console.error(err);
//       res.status(500).json({message: 'Internal server error'});
//   });
// });