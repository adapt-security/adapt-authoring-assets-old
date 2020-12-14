// set data needed for testing
const data = {
  pathNameTuple: [
    {filename: '123123123123123.jpg', filepath: '12/31/123123123123123.jpg'},
    {filename: 'qwertasdfkjlkjlk.jpg', filepath: 'qw/er/qwertasdfkjlkjlk.jpg'},
    {
      filename: '85d16bc26719aca3c29a3caab94a4a4267ad9580.png',
      filepath: '85/d1/85d16bc26719aca3c29a3caab94a4a4267ad9580.png'
    }
  ],
  imageThumbTuple:[
    {image: '123456789abcdefg.jpg', thumb:'123456789abcdefg_thumb.jpg', thumbSuffix:'_thumb'},
    {image: '123456789abcdefg.jpeg', thumb:'123456789abcdefg_thumb.jpeg', thumbSuffix:'_thumb'},
    {image: '123456789abcdefg.JPEG', thumb:'123456789abcdefg_thumb.JPEG', thumbSuffix:'_thumb'},
    {image: '123456789abcdefg.gif', thumb:'123456789abcdefg_thumb.gif', thumbSuffix:'_thumb'},
    {image: '123456789abcdefg.GIF', thumb:'123456789abcdefg_thumb.GIF', thumbSuffix:'_thumb'},
    {image: '123456789abcdefg.png', thumb:'123456789abcdefg_thumb.png', thumbSuffix:'_thumb'},
    {image: '123456789abcdefg.PNG', thumb:'123456789abcdefg_thumb.PNG', thumbSuffix:'_thumb'},

    {image: '123456789abcdefg.jpg', thumb:'123456789abcdefg_thumb.jpg'},
    {image: '123456789abcdefg.jpeg', thumb:'123456789abcdefg_thumb.jpeg'},
    {image: '123456789abcdefg.JPEG', thumb:'123456789abcdefg_thumb.JPEG'},
    {image: '123456789abcdefg.gif', thumb:'123456789abcdefg_thumb.gif'},
    {image: '123456789abcdefg.GIF', thumb:'123456789abcdefg_thumb.GIF'},
    {image: '123456789abcdefg.png', thumb:'123456789abcdefg_thumb.png'},
    {image: '123456789abcdefg.PNG', thumb:'123456789abcdefg_thumb.PNG'},

    {image: '123456789abcdefg.jpg', thumb:'123456789abcdefg_thumbnail.jpg', thumbSuffix:'_thumbnail'},
    {image: '123456789abcdefg.jpeg', thumb:'123456789abcdefg_thumbnail.jpeg', thumbSuffix:'_thumbnail'},
    {image: '123456789abcdefg.JPEG', thumb:'123456789abcdefg_thumbnail.JPEG', thumbSuffix:'_thumbnail'},
    {image: '123456789abcdefg.gif', thumb:'123456789abcdefg_thumbnail.gif', thumbSuffix:'_thumbnail'},
    {image: '123456789abcdefg.GIF', thumb:'123456789abcdefg_thumbnail.GIF', thumbSuffix:'_thumbnail'},
    {image: '123456789abcdefg.png', thumb:'123456789abcdefg_thumbnail.png', thumbSuffix:'_thumbnail'},
    {image: '123456789abcdefg.PNG', thumb:'123456789abcdefg_thumbnail.PNG', thumbSuffix:'_thumbnail'},

    {image: '123456789abcdefg.jpg', thumb:'123456789abcdefg-mini.jpg', thumbSuffix:'-mini'},
    {image: '123456789abcdefg.jpeg', thumb:'123456789abcdefg-mini.jpeg', thumbSuffix:'-mini'},
    {image: '123456789abcdefg.JPEG', thumb:'123456789abcdefg-mini.JPEG', thumbSuffix:'-mini'},
    {image: '123456789abcdefg.gif', thumb:'123456789abcdefg-mini.gif', thumbSuffix:'-mini'},
    {image: '123456789abcdefg.GIF', thumb:'123456789abcdefg-mini.GIF', thumbSuffix:'-mini'},
    {image: '123456789abcdefg.png', thumb:'123456789abcdefg-mini.png', thumbSuffix:'-mini'},
    {image: '123456789abcdefg.PNG', thumb:'123456789abcdefg-mini.PNG', thumbSuffix:'-mini'},
  ],
  videoThumbTuple:[
    {video: '123456789abcdefg.mp4', poster:'123456789abcdefg_poster.png'},
    {video: '123456789abcdefg.MP4', poster:'123456789abcdefg_poster.png'},

    {video: '123456789abcdefg.mp4', poster:'123456789abcdefg_poster.png', posterSuffix: '_poster'},
    {video: '123456789abcdefg.MP4', poster:'123456789abcdefg_poster.png', posterSuffix: '_poster'},

    {video: '123456789abcdefg.mp4', poster:'123456789abcdefg-poster.png', posterSuffix: '-poster'},
    {video: '123456789abcdefg.MP4', poster:'123456789abcdefg-poster.png', posterSuffix: '-poster'},

    {video: '123456789abcdefg.mp4', poster:'123456789abcdefg-mini.png', posterSuffix: '-mini'},
    {video: '123456789abcdefg.MP4', poster:'123456789abcdefg-mini.png', posterSuffix: '-mini'},
  ],
  mimetypeTuple : [
    {mimeType: "image/jpeg", extension: "jpg"},
    {mimeType: "image/png", extension: "png"},
    {mimeType: "image/gif", extension: "gif"},
    {mimeType: "audio/mpeg", extension: "mp3"},
    {mimeType: "video/mp4", extension: "mp4"},
    {mimeType: "application/zip", extension: "zip"},
    {mimeType: "application/pdf", extension: "unknown"},
  ],
    extensionTuple : [
    {mimeType: "image/jpeg", extension: "jpg"},
    {mimeType: "image/png", extension: "png"},
    {mimeType: "image/gif", extension: "gif"},
    {mimeType: "audio/mpeg", extension: "mp3"},
    {mimeType: "video/mp4", extension: "mp4"},
    {mimeType: "application/zip", extension: "zip"},
  ],
  SampleSizeTuple : [
    {width :800, height:400, maxThumbWidth: 200, maxThumbHeight:300 , sizeResult:{width:200, height:200}},
    {width :300, height:300, maxThumbWidth: 200, maxThumbHeight:300 , sizeResult:{width:200, height:200}},
    {width :650, height:240, maxThumbWidth: 100, maxThumbHeight:300 , sizeResult:{width:100, height:200}},
    {width :500, height:600, maxThumbWidth: 200, maxThumbHeight:200 , sizeResult:{width:166, height:200}},
    {width :799, height:320, maxThumbWidth: 300, maxThumbHeight:200 , sizeResult:{width:300, height:200}},
    {width :752, height:1300, maxThumbWidth: 550, maxThumbHeight:180 , sizeResult:{width:104, height:200}},
    {width :800, height:360, maxThumbWidth: 180, maxThumbHeight:550 , sizeResult:{width:180, height:200}},
    {width :160, height:480, maxThumbWidth: 620, maxThumbHeight:120 , sizeResult:{width:40, height:200}},
    {width :800, height:551, maxThumbWidth: 132, maxThumbHeight:199 , sizeResult:{width:132, height:200}},
    {width :713, height:550, maxThumbWidth: 185, maxThumbHeight:120, sizeResult:{width:155 , height:200}},
    {width :150, height:400, maxThumbWidth: 199, maxThumbHeight:290 , sizeResult:{width:108, height:200}}
  ],
  sampleFilesTuple : [
    {filename: "sample_audio", extension: "mp3", path : "./tests/data/files/sample_audio.mp3", thumb:"", hash : "58af236244a9504acbd4ab07c3d9fd9781d25402", size: 2113939},
    {filename: "sample_photo", extension: "jpg", path : "./tests/data/files/sample_photo.jpg", thumb: "./tests/data/assets/f3/86/f386b8a7b3869a12a381a21d84c6dd39ef4a8862_tn.jpg", hash : "f386b8a7b3869a12a381a21d84c6dd39ef4a8862", size: 5529555},
    {filename: "sample_video", extension: "mp4", path : "./tests/data/files/sample_video.mp4", thumb: "./tests/data/assets/13/85/1385f0808b7ef1600b6c39244917ef1df2ce6652_tn.png", hash : "1385f0808b7ef1600b6c39244917ef1df2ce6652", size: 3114374},
    {filename: "sample_zip", extension: "zip", path : "./tests/data/files/sample_zip.zip", thumb: "", hash : "0cfd52dfb7f92938eeb93b4204b348ce2a7cc8b6", size: 10773799},
  ],
  tempDir : "./tests/data/tempDir"
};
module.exports = data;
