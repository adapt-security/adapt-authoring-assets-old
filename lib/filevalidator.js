import axios from 'axios';

const groupFiles = async function(req) {
  const sortFile = function(f) {
    switch(f.mimetype.split('/')[0]) { // generic media
      case 'audio': req.audios.push(f);
      case 'image': req.images.push(f);
      case 'video': req.videos.push(f);
        return;
      default: 
        switch(f.mimetype) { // specific types
          case 'application/zip': req.zips.push(f);
        }
    }
  }
  Object.assign(req, { 
    fields: req.body, 
    audios: [], 
    images: [], 
    videos: [], 
    zips: []
  });
  if(!req?.fileUpload?.files) {
    throw this.app.errors.NO_FILES_UPLOADED;
  }
  const allFiles = Object.values(req.fileUpload.files).reduce((files, f) => f.length ? [...files, ...f] : [...files, f], []);

  if(allFiles) {
    return allFiles.forEach(sortFile);
  }
  if(!req.apiData.data.url) {
    return;
  }
  const url = req.apiData.data.url;
  try {
    const { headers } = await axios.get(url);
    Object.assign(req.apiData.data, {
      ...headers, 
      mimetype: headers['content-type'],
      type: headers['content-type'].split('/')[0],
      size: Number(headers['content-length'])
    });
  } catch(e) {
    if(e.code === 'ERR_INVALID_URL') throw this.app.errors.INVALID_ASSET_URL.setData({ url });
    throw e;
  }
};

export default function filevalidator(acceptableTypes) {
  return async function(req, res, next) {
    const middleware = await this.app.waitForModule('middleware');
    middleware.fileUploadParser(acceptableTypes)(req, res, async error => {
      if(error) {
        return next(error);
      }
      try {
        const tags = req?.fileUpload?.fields?.tags;
        if(tags) req.fileUpload.fields.tags = JSON.parse(tags);

        await this.requestHook.invoke(req);

        await groupFiles.call(this, req);
        next();
      } catch(e) {
        next(e);
      }
    });
  };
};