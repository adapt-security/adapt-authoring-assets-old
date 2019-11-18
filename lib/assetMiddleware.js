const { App, Responder, DataStoreQuery } = require('adapt-authoring-core');
const formidable = require('formidable');
const IncomingForm = formidable.IncomingForm;
const bytes = require('bytes');
const crypto = require('crypto');
const fs = require('fs-extra');
const STREAM_BUFFER_SIZE = 64 * 1024;
const THUMBNAIL_WIDTH = '?';
const THUMBNAIL_HEIGHT = '200';
const DEFAULT_THUMBNAIL_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAGcAAAB5CAMAAAATQ88gAAABL1BMVEU+SWA/SmFBS2JBTGNCTWNETmVET2VFUGZGUWdIU2lJU2pMV21NWG5OWW9RXHJTXnNUX3VWYHZXYndYYnhaZHlbZnpcZ3tdaHxgan5ibIBibYFjboJlcINncoVpcodqdIhrdYlsdopueIxveYxweY1xe45yfZB0fZF2gJN6hJZ6hZZ8hph9h5iBiZuDjJ6FjqCGj6CGkKGHkKKIkqSKk6WLlKWQmaqTnK2Una2Vna6Xn6+YobGZorKcpbSep7efqLihqrqkrLylrr2qssGwuca1vMq6ws+8xdLAyNXBydbFzdrHz9zI0N3K0t/L0t/M1ODN1ODQ2OPS2uXS2+bV3OjW3ejY3+ra4u3c5O/e5fDf5vHg6PPh6fTj6/bk6/bl7Pfm7ffm7vjn7vno7/np8PoQVD/gAAACnklEQVR4Ae3WbVMSURjG8bNUbmaY1EZqkgpYJhlFUWRkQhKgaQ+JmQ/hw/39P0MzNbfT5l4ehGv3Re3/9XXm9+rM3Ebky6sHXqr/vNnF5S2xZaR21QzexMqBxXljOI3Wuuc6Vwyryc55DrGRVjSOcZvYiQgybMji3MhdPAxhpyT20NvswmUAcZ2SbHoAIjvyLQ0grgMgugMgugMgugMgugMgugMgugMgugMgvgMgvgMgvgMgvgMgvgMgugOgFtsB0EiH7QBoskt1MFSjOhgaPaA6GFoJx1HI08FEqI5sXtLFVqiOLOhimeLcKYGyulikOPZmB3ISPTveQM7tnp3UQE4hIqftRONIOSLnR9lhO6BWIZ0YzFmvZMZcdyxTWZf+y9mc9pQ5baodlnNYNL6Kh6E4u9Pmr6Z3Q3COsuZM2SOqg39Fme5sOEGOs8F25kxgc2Rn24C2uU4dOXWuU0BOgevMIGeG66SRk+Y648gZ5zp55OS5ThE5Ra7TQE6D6+wNBTNDexLQx2fHfTn4uCgHMtfNIwBZnZ3hIGZ4J5gxALI7shrkrCIGQXZHKmeZCmYQZHek6vgVp4oZDNkdaST/ZJINwFgguyP7S8lTZWkfMwiyO9rJWvXp/PyT12snghkMYQcGGAAxHMAoxHMAoxDPAYxCPAcwCvEcwCjEciCjEMdBDIB6dJpNzGDowk7TdZt2BkJ2RxljfNAnxADI7iijEGYwhJ0ARiHAgJ7bHT+jEGJAOcEOYBRShusoo5AyRMfHKFRXhuAARqM6gOE7gOE7gOE7t0w0Tip2Yid2Yuffc/jFTuz8H07mbRh5fie8InZuRuTkI3JeROMkPoh5GIHzUsR8vx8687grYkTe3XVDRK7dey/yyxE5/vo5rDryu5+fSKzliGdNYwAAAABJRU5ErkJggg==';

/**
* Midleware for the assets module
**/
class AssetMiddleware {

  static postAsset(req, res, next) {
    console.log('post assets');
    return res.status(200).json({ success: true });
  }

  static putAsset(req, res, next) {
    console.log('put assets');
    return res.status(200).json({ success: true });
  }

  static deleteAsset(req, res, next) {
    console.log('delete assets');
    return res.status(200).json({ success: true });
  }

}

module.exports = AssetMiddleware;
