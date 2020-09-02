const AssetsUtils = require('./assetsUtils');

const importZips = function(req, res, next) {
  const importZip = async(zip) => {
    const filenameHash = await this.repository.save(zip.path, zip.type);
   // const jsonschema = await this.app.waitForModule('jsonschema');


    // WIP

    // Problem: Doing it with " jsonschema.applyDefaults('assets',... " does not work here for some unknown reason

    let defaults = {
      "path": filenameHash,
      "type": 'zip',
      "size": AssetsUtils.getFileSize(zip.path)
    }

    console.log(defaults)

    const result = await this.insert(Object.assign(defaults, req.fields), {});
    return result;
  };

  console.log('REQ', req.zips , req.zips.length)

  if (req.zips && req.zips.length) {
    Promise.all(req.zips.map(importZip)).then(() => {
      next();
    }).catch((e) => {
      res.status(500).send(e.message);
    });
  } else {
    next();
  }
};

module.exports = importZips;
