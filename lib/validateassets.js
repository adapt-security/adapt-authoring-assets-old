const formidable = require('formidable');

const validateassets =
    function(acceptableTypes) {
        return (req, res, next) => {
            const form = formidable({ multiples: true });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    res.status(500).sendError('Error while parsing.');
                    return;
                }
                req.fields = fields;
                req.images = [];
                req.audios = [];
                req.videos = [];
                req.zips = [];
                for (let file of Object.values(files)) {
                    // if multi are uploaded
                    if (file && file.length) {
                        file.forEach(f => {
                            validateFile(f.type, f);
                        });
                        //if single file is uploaded
                    } else if (file && !file.length) {
                        validateFile(file.type, file);
                    } else {
                        res.messages = res.messages || [];
                        res.messages.push(`filetype %{filetype} not supported`);
                    }
                }
                next();
            });

            validateFile = (fileType, file) => {
                if (acceptableTypes.has(fileType)) {
                    switch (fileType) {
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
        }
    }

module.exports = validateassets;