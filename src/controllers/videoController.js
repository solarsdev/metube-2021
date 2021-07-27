export const home = (req, res) => res.render('home', { pageTitle: 'Home' });
export const search = (req, res) => res.send('search');
export const watch = (req, res) => res.send('watch');
export const edit = (req, res) => res.send('edit');
export const deleteVideo = (req, res) => res.send('delete video');
export const upload = (req, res) => res.send('upload video');
