const groupFiles = (req) => {
  Object.assign(req, { 
    fields: req.body, 
    audios: [], 
    images: [], 
    videos: [], 
    zips: []
  });
  Object.values(req.fileUpload.files).forEach(file => {
    const files = file.length ? file : [file];
    files.forEach((f) => {
      const [type] = f.mimetype.split('/');
      if(type === 'audio') {
        req.audios.push(f);
      } else if(type === 'image') {
        req.images.push(f);
      } else if(type === 'video') {
        req.videos.push(f);
      } else if(f.mimetype === 'application/zip') {
        req.zips.push(f);
      }
    });
  });
};

export default function filevalidator(acceptableTypes) {
  return async function(req, res, next) {
    const middleware = await this.app.waitForModule('middleware');
    middleware.fileUploadParser(acceptableTypes)(req, res, async error => {
      if(error) {
        return next(error);
      }
      try {
        if(typeof req.fileUpload.fields.tags === 'string') {
          req.fileUpload.fields.tags = JSON.parse(req.fileUpload.fields.tags);
        }
        await this.requestHook.invoke(req);
        groupFiles(req);
        next();
      } catch(e) {
        next(e);
      }
    });
  };
};