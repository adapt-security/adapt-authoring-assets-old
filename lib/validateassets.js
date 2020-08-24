const formidable = require('formidable');
const { App } = require('adapt-authoring-core');

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
                for (let file of Object.values(files)) {
                    if (acceptableTypes.has(file.type)) {
                        switch (file.type) {
                            case 'image/jpeg':
                            case 'image/png':
                            case 'image/gif':
                                req.images.push(file);
                                break;
                            case 'audio/mpeg':
                                req.audios.push(file);
                                break;
                            case 'video/mp4':
                                req.videos.push(file);
                        }
                    } else {
                        res.messages = res.messages || [];
                        res.messages.push(`filetype %{filetype} not supported`);
                    }
                }
                next();
            });
        }
    }
module.exports = validateassets;