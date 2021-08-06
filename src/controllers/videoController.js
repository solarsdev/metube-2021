import { deleteStorageFile } from '../middlewares';
import User from '../models/User';
import Video from '../models/Video';
import { ElasticTranscoderClient, CreateJobCommand } from '@aws-sdk/client-elastic-transcoder';

const isProductionEnv = process.env.NODE_ENV === 'production';

export const home = async (req, res) => {
  try {
    const videos = isProductionEnv
      ? await Video.find({ fileInfo: { job: { status: 'Complete' } } })
          .populate('owner')
          .sort({ createdAt: 'desc' })
      : await Video.find({}).populate('owner').sort({ createdAt: 'desc' });
    return res.render('home', { pageTitle: 'Home', videos });
  } catch (error) {
    console.log(error);
    res.end();
  }
};

export const watch = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).render('404', { pageTitle: 'Page not found' });
    }
    return res.render('videos/watch', { pageTitle: video.title, video });
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const search = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    return res.redirect('/search');
  }
};

export const getEdit = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
};

export const postEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, hashtags } = req.body;

    await Video.findByIdAndUpdate(id, {
      title,
      description,
      hashtags: Video.transformHashtags(hashtags),
    });

    return res.redirect(`/videos/${id}`);
  } catch (error) {
    console.log(error);
    return res.redirect('/');
  }
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
    return res.redirect('/');
  }
};

export const getUpload = (req, res) =>
  res.render('videos/upload', { pageTitle: 'Upload Video', csrfToken: req.csrfToken() });

export const postUpload = async (req, res) => {
  try {
    const {
      body: { title, description, hashtags },
      file,
    } = req;

    const videoKey = file ? file.key : null;

    if (!videoKey) {
      return res.status(400).render('videos/upload', {
        pageTitle: 'Upload Video',
        errorMessage: 'Missing video',
        csrfToken: req.csrfToken(),
      });
    }

    // transcode
    const etClient = isProductionEnv
      ? new ElasticTranscoderClient()
      : new ElasticTranscoderClient({
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
    const command = new CreateJobCommand({
      PipelineId: process.env.PIPELINE_ID,
      Input: {
        Key: videoKey,
      },
      Output: {
        PresetId: '1351620000001-000040', // 360p prset
        Key: `${videoKey}-360p`,
        ThumbnailPattern: `${videoKey}-{count}`,
      },
    });
    const {
      Job: { Id: jobId, Status: jobStatus },
    } = await etClient.send(command);

    const video = await Video.create({
      title,
      description,
      hashtags: Video.transformHashtags(hashtags),
      fileInfo: {
        job: {
          id: jobId,
          status: jobStatus,
        },
        videoKey,
      },
      owner: res.locals.user._id,
    });

    const user = await User.findById(res.locals.user._id);
    user.videos.push(video._id);
    await user.save();

    return res.redirect(`/videos/${video._id}`);
  } catch (error) {
    return res.status(400).render('videos/upload', {
      pageTitle: 'Upload Video',
      errorMessage: error.stack,
      csrfToken: req.csrfToken(),
    });
  }
};

export const postTranscodeUpdate = async (req, res) => {
  const { jobId } = req.params;
  await Video.findOneAndUpdate(
    {
      fileInfo: {
        job: {
          id: jobId,
        },
      },
    },
    {
      fileInfo: {
        job: {
          status: 'Complete',
        },
      },
    },
  );
  return res.sendStatus(200);
};
