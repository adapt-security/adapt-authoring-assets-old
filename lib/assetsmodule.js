const fs = require("fs-extra");
const path = require("path");
const AbstractApiModule = require('adapt-authoring-api');
const { App } = require('adapt-authoring-core');
const AssetsRepository = require('./assetsrepository');
const AssetsUtils = require('./assetsUtils');
const importAudios = require('./importaudios');
const importImages = require('./importimages');
const importVideos = require('./importvideos');
const importZips = require('./importzips');
const filevalidator = require("./filevalidator");
const replaceSingleAssetFile = require('./replaceassetfile');

/**
 * Asset management module
 */
class Assetsmodule extends AbstractApiModule {
/** @override */
  async setValues() {
    this.thumbnailSuffix = this.getConfig("thumbnailSuffix");
    this.repository = new AssetsRepository(this.getConfig("uploadDir"), this.thumbnailSuffix);
    this.thumbnailMaxWidth = this.getConfig("thumbnailMaxWidth");
    this.thumbnailMaxHeight = this.getConfig("thumbnailMaxHeight");

    this.root = "assets";
    this.collectionName = "assets";
    this.schemaName = "asset";

    const [authored, tags] = await this.app.waitForModule("authored", "tags");
    await authored.registerModule(this);
    await tags.registerModule(this);

    const acceptableTypes = this.getConfig("acceptableTypes");
    const readPerms = [`read:${this.root}`];
    const writePerms = [`write:${this.root}`];

    this.routes = [{
      //The parameter for unzip a zip file is `unzip=="true"`, if not specified, it will upload zip file as sinlge asset
      route: "/",
      modifying: true,
      handlers: {
        post: [
          filevalidator(acceptableTypes).bind(this),
          importZips.bind(this),
          importImages.bind(this),
          importAudios.bind(this),
          importVideos.bind(this),
          this.importResponse
        ],
      },
      permissions: { post: writePerms },
    },
    {
      route: "/:_id",
      handlers: {
        get: this.requestHandler(),
        put: [this.updateAsset.bind(this)],
        patch: [replaceSingleAssetFile.bind(this)],
        delete: [this.deleteAsset.bind(this)],
      },
      permissions: { get: readPerms, patch: writePerms, put: writePerms, delete: writePerms },
    },
    {
      route: "/serve/:_id",
      handlers: {
        get: [this.getAsset.bind(this)],
      },
      permissions: { get: readPerms, put: writePerms },
    },
    {
      route: "/query",
      handlers: {
        post: [this.indexResponse.bind(this)],
      },
      permissions: { get: readPerms, post: writePerms },
    },
    ];
  }
  indexResponse(req, res, next) {
    if (req.body) {
      this.find(req.body, {})
        .then((results) => {
          /*
          * If there is options for sorting assets
          * Parameters for sorting: ` req.query.size = "descending"` and ` req.query.size = "ascending"
          */
          if (req.query.size) {
            results = this.sortAssets(results, req.query.size);
          }
          res.status(200).json(results);
        })
        .catch((e) => {
          res.status(500).send(e);
        });
    } else {
      this.retrieveAllAssets.bind(this);
    }
  }
  /**
 * Get the list of all the assets
 */
  retrieveAllAssets(req, res, next) {
    this.find({}, {})
      .then((results) => {
        if (req.query.size) {
          results = this.sortAssets(results, req.query.size);
        }
        res.status(200).json(results);
      })
      .catch((e) => {
        res.status(500).send(e);
      });
  }
  /**
 * Import response
 */
  async importResponse(req, res, next) {
    if (req.query.unzip === "true" && req.zips.length) {
      //if unzip is selected, after imort we should remove temp directory
      const isTempDirDeleted = await AssetsUtils.removeDir(this.getConfig('uploadTempDir'));
      if (!isTempDirDeleted) next(new Error('Failed to delete dir'));
    }
    let results = req.results;
    if(results && results.length > 0) {
      results = results.filter(e => e);//Clear null element
    }
    res.send(results);
  }
  /**
 * Get single asset file name
 * @param {Array} assets Filtered assets
 */
  getAssetFilename(assets) {
    if (assets[0]) {
      return assets[0].path;
    } else {
      throw new Error(App.instance.lang.t("error.noasset"));
    }
  }
  /**
 * Get Thumbnail from assts
 * @param {Array} assets Filtered assets
 */
  getThumbnailFilename(assets) {
    if (assets[0]) {
      return AssetsUtils.getThumbPath(assets[0].path, this.thumbnailSuffix);
    } else {
      throw new Error(App.instance.lang.t("error.noasset"));
    }
  }
  /**
 * Get full path of an asset according to its name
 * @param {String} filename
 */
  async getAssetFullPath(filename) {
    const exists = await this.repository.hasAsset(filename);
    if (exists) {
      return this.repository.fullPath(filename);
    } else {
      throw new Error(App.instance.lang.t("error.nofile"));
    }
  }
  /**
 * Serve single asset
 */
  serveAsset(req, res, next) {
    return (fullPath) => {
      const type =
AssetsUtils.mimetypeByExtension(path.extname(fullPath).slice(1)) || "text/plain";
      const stream = fs.createReadStream(fullPath);
      stream.on("open", function() {
        res.set("Content-Type", type);
        stream.pipe(res);
      });
      stream.on("error", function() {
        res.set("Content-Type", "text/plain");
        res.status(500).send(App.instance.lang.t("error.noasset"));
      });
    };
  }
  /**
 * Get asset with or without Thumbnail
 */
  getAsset(req, res, next) {
    if (req.query.thumb === "true") {
      this.retrieveThumbnail(req, res, next);
    } else {
      this.retrieveAsset(req, res, next);
    }
  }
  /**
 * Retrieve asset by filtering options
 */
  retrieveAsset(req, res, next) {
    this.find({ _id: req.params["_id"] }, {})
      .then(this.getAssetFilename.bind(this))
      .then(this.getAssetFullPath.bind(this))
      .then(this.serveAsset(req, res, next))
      .catch((e) => {
        res.status(500).send(`${App.instance.lang.t("error.retrievingAsset")} ${e}`);
      });
  }
  /*
* todo: in case of audio we may respond with an audio icon.
* todo: in case of zip we may respond with a zip icon.
*/
  retrieveThumbnail(req, res, next) {
    this.find({ _id: req.params["_id"] }, {})
      .then(this.getThumbnailFilename.bind(this))
      .then(this.getAssetFullPath.bind(this))
      .then(this.serveAsset(req, res, next))
      .catch((e) => {
        res
          .status(500)
          .send(`${App.instance.lang.t("error.retrievingThumb")} ${e}`);
      });
  }
  /**
 * Update sinle asset
 */
  updateAsset(req, res, next) {
    this.update({ _id: req.params["_id"] }, req.apiData.data)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((e) => {
        res.status(500).send(e);
      });
  }
  /**
 * Sort the filtered Assets according to the size
 * @param {Array} assets Filtered asset
 * @param {String} option Sort option
 * "descending" Sort option for descending
 * "descending" Sort option for ascending
 */
  sortAssets(assets, option) {
    if (option === "descending") {
      assets.sort((a, b) => {
        return b.size - a.size;
      });
    } else if (option === "ascending") {
      assets.sort((a, b) => {
        return a.size - b.size;
      });
    }
    return assets;
  }
  /**
 * Remove assets record from database and delete asset file from repo
 */
  // eslint-disable-next-line max-statements
  async deleteAsset(req, res, next) {
    const result = await this.find({ _id: req.params["_id"] });
    //if no record is found
    if (!result[0]) {
      res.status(500).send(`${App.instance.lang.t("error.norecord")}`);
      return;
    }
    const fullPath = await this.getAssetFullPath(result[0].path);
    if (!fullPath) {
      res.status(500).send(`${App.instance.lang.t("info.nofile")} ${e}`);
      return;
    }
    if (fullPath) {
      let pathRecords = await this.find({ path: result[0].path });
      const posterRecords = await this.find({ poster: result[0].path });
      if (posterRecords.length > 0) { //here to check if the file is used as custom poster image
        pathRecords = [].concat(pathRecords, posterRecords);
      }
      const hasMultiPointer = pathRecords.length > 1;
      if (!hasMultiPointer && result[0].path !== result[0].poster) { //If only sigle assets points to a file, will delete this file from the repository
        const isFileDeleted = await this.repository.delete(fullPath, result[0].type);
        if (isFileDeleted) {
          //if asset is an image, remove its thumbnail from the repository
          if (result[0].type === "image") await this.repository.deleteThumbnail(fullPath);
          if (result[0].type === "video") {
            //if asset is an video, remove its thumbnail and poster image from the repository
            await this.repository.deleteThumbnail(fullPath);
            await this.repository.deleteVideoPoster(fullPath);
          }
        } else {
          res.status(500).send(`${App.instance.lang.t("info.faileddeletefile")} ${e}`);
        }
      }
      //if there are multiple pointer to a single file, will not delete file from repository
      const isAssetRecordDeleted = await this.delete({ _id: req.params["_id"] });
      if (isAssetRecordDeleted) {
        res.status(200).send(`${App.instance.lang.t("info.deletesuccessful")}`);
      } else {
        res.status(500).send(`${App.instance.lang.t("info.faileddeleterecord")} ${e}`);
      }
    }
  }
}

module.exports = Assetsmodule;
