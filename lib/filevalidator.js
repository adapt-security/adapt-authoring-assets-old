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
      const [type] = f.type.split('/');
      if(type === 'audio') {
        req.audios.push(file);
      } else if(type === 'image') {
        req.images.push(file);
      } else if(type === 'video') {
        req.videos.push(file);
      } else if(f.type === 'application/zip') {
        req.zips.push(file);
      }
    });
  });
};

const filevalidator = function(acceptableTypes) {
  return async function(req, res, next) {
    const middleware = await this.app.waitForModule('middleware');
    middleware.fileUploadParser(acceptableTypes)(req, res, error => {
      if(error) {
        return next(error);
      }
      groupFiles(req);
      this.requestHook.invoke(req).then(() => next(), next);
    });
  };
};

module.exports = filevalidator;