module.exports = {
  name: 'asset',
  definition: {
    title: {
      type: 'String',
      required: true
    },
    assetType: {
      "type": "string",
      "required": "true"
    },
    description: {
      "type": "string",
      "required": "false"
    },
    path: {
      "type": "string",
      "required": "true"
    },
    filename: {
      "type" : "string",
      "required" : "true"
    },
    thumbnailPath: {
      "type": "string",
      "required": "false"
    },
    repository: {
      "type": "string",
      "required": "true"
    },
    size: {
      "type": "number"
    },
    directory: {
      "type": "string"
    },
    isDirectory: {
      "type": "boolean",
      "default": "false"
    },
    mimeType: {
      "type": "string"
    },
    author: {
      "type": "string"
    },
    metadata: {
      "type": "object"
    }
  }
};
