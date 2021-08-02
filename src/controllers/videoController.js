import Video from '../models/Video';

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: 'desc' });
  return res.render('home', { pageTitle: 'Home', videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render('404', { pageTitle: 'Page not found' });
  }
  return res.render('videos/watch', { pageTitle: `Watching ${video.title}`, video });
};

export const search = async (req, res) => {
  const { search_query } = req.query;
  let videos = [];
  if (search_query) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(search_query, 'i'),
      },
    }).sort({ createdAt: 'desc' });
  }
  return res.render('search', { pageTitle: 'Search videos', videos });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render('404', { pageTitle: 'Page not found' });
  }
  return res.render('videos/edit', {
    pageTitle: `Editing ${video.title}`,
    video,
    csrfToken: req.csrfToken(),
  });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.transformHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  await Video.findByIdAndDelete(id);
  return res.redirect('/');
};

export const getUpload = (req, res) =>
  res.render('videos/upload', { pageTitle: 'Upload Video', csrfToken: req.csrfToken() });

export const postUpload = async (req, res) => {
  try {
    const { title, description, hashtags } = req.body;
    await Video.create({
      title,
      description,
      hashtags: Video.transformHashtags(hashtags),
    });
    return res.redirect('/');
  } catch (error) {
    return res.render('videos/upload', {
      pageTitle: 'Upload Video',
      error,
      csrfToken: req.csrfToken(),
    });
  }
};
