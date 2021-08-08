import { deleteStorageFiles, videoUploader } from '../middlewares';
import User from '../models/User';
import Video from '../models/Video';
import { ElasticTranscoderClient, CreateJobCommand } from '@aws-sdk/client-elastic-transcoder';
import multer from 'multer';

const isProductionEnv = process.env.NODE_ENV === 'production';

export const home = async (req, res) => {
  try {
    const videos = await Video.find({ 'fileInfo.job.status': 'Complete' })
      .populate('owner')
      .sort({ createdAt: 'desc' });
    return res.render('home', { pageTitle: 'Home', videos });
  } catch (error) {
    console.log(error);
    res.status(500).send('サーバーにエラーが発生しました。管理者にお問合せください。');
  }
};

export const watch = async (req, res) => {
  try {
    const { id: videoId } = req.params;

    if (!videoId) {
      req.flash('error', '必須項目を入れてください。');
      return res.redirect('/');
    }

    const video = await Video.findById(videoId);

    if (!video) {
      req.flash('error', '動画が見つかりませんでした。');
      return res.redirect('/');
    }

    return res.render('videos/watch', { pageTitle: video.title, video });
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
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

    return res.render('search', { pageTitle: '動画検索', videos });
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/search');
  }
};

export const getEdit = async (req, res) => {
  try {
    const { id: videoId } = req.params;

    if (!videoId) {
      req.flash('error', '必須項目を入れてください。');
      return res.redirect('/');
    }

    const video = await Video.findById(videoId);

    if (!video) {
      req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
      return res.redirect('/');
    }

    if (String(video.owner) !== String(res.locals.user._id)) {
      req.flash('error', 'アクセス権限がありません。');
      return res.redirect(`/videos/${id}`);
    }

    return res.render('videos/edit', {
      pageTitle: video.title,
      video,
      csrfToken: req.csrfToken(),
    });
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/');
  }
};

export const postEdit = async (req, res) => {
  try {
    const { params: { id: videoId } = {}, body: { title, description, hashtags } = {} } = req;

    if (!videoId || !title) {
      req.flash('error', '必須項目を入れてください。');
      return res.redirect('/');
    }

    const newVideoObject = {
      $set: {
        title,
      },
      $unset: {},
    };

    if (description) {
      newVideoObject.$set.description = description;
    } else {
      newVideoObject.$unset.description = true;
    }

    if (hashtags) {
      newVideoObject.$set.hashtags = Video.transformHashtags(hashtags);
    } else {
      newVideoObject.$unset.hashtags = true;
    }

    await Video.findByIdAndUpdate(videoId, newVideoObject);

    return res.redirect(`/videos/${videoId}`);
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/');
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id: videoId } = req.params;

    if (!videoId) {
      req.flash('error', '必須項目を入れてください。');
      return res.redirect('/');
    }

    const video = await Video.findById(videoId, 'owner fileInfo.videoKey');
    const { _id: loginUserId } = res.locals.user;

    if (!video) {
      req.flash('error', '動画が見つかりませんでした。');
      return res.redirect('/');
    }

    const { owner: videoOwnerId, fileInfo: { videoKey } = {} } = video;

    if (String(videoOwnerId) !== String(loginUserId)) {
      req.flash('error', 'アクセス権限がありません。');
      return res.redirect(`/videos/${videoId}`);
    }

    await Promise.all([
      Video.findByIdAndDelete(videoId),
      User.findByIdAndUpdate(loginUserId, {
        $pull: { videos: videoId },
      }),
      deleteStorageFiles([
        {
          Key: videoKey,
        },
        {
          Key: `${videoKey}-360p`,
        },
        {
          Key: `${videoKey}-00001.png`,
        },
      ]),
    ]);

    return res.redirect('/');
  } catch (error) {
    console.log(error);
    req.flash('error', 'サーバーにエラーが発生しました。管理者にお問合せください。');
    return res.redirect('/');
  }
};

export const getUpload = (req, res) =>
  res.render('videos/upload', { pageTitle: '動画作成', csrfToken: req.csrfToken() });

export const postUpload = (req, res) => {
  videoUploader.single('video')(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      const { code } = error;
      if (code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'Limit File Size');
      } else if (code === 'LIMIT_UNEXPECTED_FILE') {
        req.flash('error', 'Limit Unexpected File');
      }
      return res.redirect('/videos/upload');
    }

    const { body: { title, description, hashtags } = {}, file: { key: videoKey } = {} } = req;

    if (!title || !videoKey) {
      req.flash('error', 'ファイルが見つかりませんでした。');
      return res.redirect('/videos/upload');
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
    const { Job: { Id: jobId, Status: jobStatus } = {} } = await etClient.send(command);

    if (!jobId || !jobStatus) {
      req.flash('error', '動画の変換ができせんでした。');
      return res.redirect('/videos/upload');
    }

    const { locals: { user: { _id: loginUserId } = {} } = {} } = res;

    const newVideoObject = {
      title,
      fileInfo: {
        job: {
          id: jobId,
          status: jobStatus,
        },
        videoKey,
      },
      owner: loginUserId,
    };

    if (description) {
      newVideoObject.description = description;
    }

    if (hashtags) {
      newVideoObject.hashtags = Video.transformHashtags(hashtags);
    }

    const { _id: videoId } = await Video.create(newVideoObject);
    await User.findByIdAndUpdate(loginUserId, {
      $push: {
        videos: videoId,
      },
    });

    return res.redirect(`/videos/${videoId}`);
  });
};

export const postTranscodeUpdate = async (req, res) => {
  const accept = req.accepts('application/vnd.solarsdev.metube+json');

  if (!accept) {
    return res.sendStatus(406);
  }

  const { body: { jobId } = {} } = req;

  if (!jobId) {
    return res.sendStatus(400);
  }

  try {
    await Video.findOneAndUpdate(
      { 'fileInfo.job.id': jobId },
      { $set: { 'fileInfo.job.status': 'Complete' } },
    );
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(200);
};
