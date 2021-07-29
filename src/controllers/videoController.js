import Video from '../models/Video';

export const home = async (req, res) => {
  const videos = await Video.find({});
  return res.render('home', { pageTitle: 'Home', videos });
};

export const watch = (req, res) => {
  const { id } = req.params;
  return res.render('watch', { pageTitle: `Watching` });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render('editVideo', { pageTitle: `Editing` });
};

export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => res.render('upload', { pageTitle: 'Upload Video' });

export const postUpload = async (req, res) => {
  try {
    const { title, description, hashtags } = req.body;
    await Video.create({
      title,
      description,
      hashtags: hashtags.split(',').map((hashtag) => `#${hashtag}`),
    });
    return res.redirect('/');
  } catch (error) {
    return res.render('upload', { pageTitle: 'Upload Video', error });
  }
};
