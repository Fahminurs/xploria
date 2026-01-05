const filepath = {
    media: '/media/',
    msg_ja: "/msg/js/ja.js",
    msg_en: "/msg/js/en.js",
    msg_ja_kids: "/msg/js/ja_kids.js"
};

(function() {
    const htmlElements = [
        '<meta charset="utf-8">',
        '<link rel="stylesheet" type="text/css" href="/css/style.css">',
        '<title>IROSchool</title>',
        '<script type="text/javascript" src="/js/blockly_compressed.js"></script>',
        '<script type="text/javascript" src="/js/blocks_compressed.js"></script>',
        '<script type="text/javascript" src="/js/arduino_compressed.js"></script>',
        '<script type="text/javascript" src="/js/custom_blocks.js"></script>',
        '<script type="text/javascript" src="/js/esp32_blocks.js"></script>',
        '<script type="text/javascript" src="/js/esp32_arduino.js"></script>',
        '<script type="text/javascript" src="/msg/js/en.js"></script>',
        '<script type="text/javascript" src="/js/Blob.js"></script>',
        '<script type="text/javascript" src="/js/spin.js"></script>',
        '<script type="text/javascript" src="/js/FileSaver.min.js"></script>',
        '<script type="text/javascript" src="/js/blockly_helper.js"></script>',
        '<script type="text/javascript" src="/js/jquery-2.1.3.min.js"></script>',
        '<script type="text/javascript" src="/js/materialize.min.js"></script>',
        '<script type="text/javascript" src="/js/jquery.xdomainajax.js"></script>',
        '<script type="text/javascript" src="/js/jquery.cookie.js"></script>',
        '<script type="text/javascript" src="/js/toolbox.js"></script>',
        '<script type="text/javascript" src="/js/setCategoryCharacter.js"></script>',
        '<script type="text/javascript" src="/js/init.js"></script>',
        '<script type="text/javascript" src="/js/my_materialize.js"></script>',
        '<script type="text/javascript" src="/js/clipboard.min.js"></script>'
    ];

    // Construct the complete HTML string
    const html = htmlElements.join('');

    // Inject the constructed HTML into the document
    document.write(html);
})();