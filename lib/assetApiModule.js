const { App, Responder } = require('adapt-authoring-core');
const AbstractApiModule = require('adapt-authoring-api');
const AssetSchema = require('../schema/asset.schema.js');
const formidable = require('formidable');
const IncomingForm = formidable.IncomingForm;
const bytes = require('bytes');

/**
* Abstract module which handles course assets
* @extends {AbstractApiModule}
*/
class AssetApiModule extends AbstractApiModule {
  /** @override */
  static get def() {
    return {
      name: 'assets',
      model: 'asset',
      schemas: [ AssetSchema ],
      routes: [
        {
          route: '/:_id?',
          handlers: {
            get: AbstractApiModule.requestHandler(),
            post: postAsset
          }
      ]
    };
  }
}

/**
* End point for uploading an asset
* - parse form to get form values and file info
* - create read stream for uploaded filename
* - on upload create file name hash
* - process file through file storage module
* - populate file records fields
* - write file record to DB
**/
function postAsset(req, res, next) {
  // need to access conifig values for paths, maxFileUploadSize etc

}

/**
* End point for updating an asset
* - parse form to get form values and file info
* - create read stream for uploaded filename
* - on upload create file name hash
* - process file through file storage module
* - populate file records fields
* - write file record to DB
**/
function putAsset(req, res, next) {

}

/**
* End point for deleting an asset
* - checks for asset usage from DB by _id
* - if not used delete DB record and file
* - if used return course list that it is used in
**/
function deleteAsset(req, res, next) {

}

/**
* End point for downloading an asset
* - retrieves asset from DB by _id
* - creates read stream for file and pipes file
*/
function serveAsset(req, res, next) {

}

/**
* End point for downloading a thumbnail
* - retrieves asset from DB by _id
* - creates read stream for thumbnail file and pipes file
*/
function serveThumb(req, res, next) {

}

module.exports = AssetApiModule;
