let videos = [
  {
    title: 'First Video',
    rating: 5,
    comments: 2,
    createdAt: '2 minutes ago',
    views: 59,
    id: 1,
  },
  {
    title: 'Second Video',
    rating: 5,
    comments: 2,
    createdAt: '2 minutes ago',
    views: 59,
    id: 1,
  },
  {
    title: 'Third Video',
    rating: 5,
    comments: 2,
    createdAt: '2 minutes ago',
    views: 59,
    id: 1,
  },
];

export const home = (req, res) => res.render('home', { pageTitle: 'Home', videos });
export const search = (req, res) => res.send('search');
export const watch = (req, res) => res.send('watch');
export const edit = (req, res) => res.send('edit');
export const deleteVideo = (req, res) => res.send('delete video');
export const upload = (req, res) => res.send('upload video');
