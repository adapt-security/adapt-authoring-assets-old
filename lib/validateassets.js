const formidable = require('formidable');
const { App } = require("adapt-authoring-core");

const validateassets =
    function(acceptableTypes) {
      return (req, res, next) => {
        const form = formidable({ multiples: true });
        form.parse(req, (err, fields, files) => {
          if(err) {
            const e = new Error(App.instance.lang.t('error.failedparsing'));
            e.statusCode = 500;
            return next(e);
          }
          req.fields = fields;
          req.images = [];
          req.audios = [];
          req.videos = [];
          req.zips = [];
          for(const file of Object.values(files)) {
            //if multi are uploaded
            if(file && file.length) {
              file.forEach(f => {
                validateFile(f.type, f);
              });
              //if single file is uploaded
            } else if(file && !file.length) {
              validateFile(file.type, file);
            } else {
              res.messages = res.messages || [];
              res.messages.push(`filetype ${file.type} not supported`);
            }
          }
          return next();
        });

        function validateFile(fileType, file) {
          if(acceptableTypes.has(fileType)) {
            switch(fileType) {
              case "image/jpeg":
              case "image/png":
              case "image/gif":
                req.images.push(file);
                break;
              case "audio/mpeg":
                req.audios.push(file);
                break;
              case "video/mp4":
                req.videos.push(file);
                break;
              case "application/zip":
                req.zips.push(file);
            }
          }
        }
      };
    };

module.exports = validateassets;