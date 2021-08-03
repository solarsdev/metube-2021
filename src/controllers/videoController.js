import { deleteStorageFile } from '../middlewares';
import User from '../models/User';
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
  try {
    const { id } = req.params;
    const video = await Video.findById(id).select({ _id: true, owner: true, videoPath: true });
    const user = res.locals.user;

    if (!video) {
      return res.redirect('/');
    }

    if (!user) {
      return res.redirect(`/videos/${id}`);
    }

    if (String(video.owner) !== String(user._id)) {
      console.log(typeof video.owner, typeof user._id);
      console.log(video.owner, user._id);
      return res.redirect(`/videos/${id}`);
    }

    await Promise.all([
      Video.findByIdAndDelete(id),
      User.findByIdAndUpdate(res.locals.user._id, {
        $pull: { videos: id },
      }),
      deleteStorageFile(video.videoPath),
    ]);
    return res.redirect('/');
  } catch (error) {
    console.log(error);
  }
  return res.redirect('/');
};

export const getUpload = (req, res) =>
  res.render('videos/upload', { pageTitle: 'Upload Video', csrfToken: req.csrfToken() });

export const postUpload = async (req, res) => {
  try {
    const {
      body: { title, description, hashtags },
      file,
    } = req;

    const videoPath = file && 'key' in file ? file.key : null;

    if (!videoPath) {
      return res.render('videos/upload', {
        pageTitle: 'Upload Video',
        errorMessage: 'Missing video',
        csrfToken: req.csrfToken(),
      });
    }

    const video = await Video.create({
      title,
      description,
      hashtags: Video.transformHashtags(hashtags),
      videoPath,
      owner: res.locals.user._id,
    });

    const user = await User.findById(res.locals.user._id);
    user.videos.push(video._id);
    await user.save();

    return res.redirect(`/videos/${video._id}`);
  } catch (error) {
    return res.render('videos/upload', {
      pageTitle: 'Upload Video',
      errorMessage: error.stack,
      csrfToken: req.csrfToken(),
    });
  }
};
