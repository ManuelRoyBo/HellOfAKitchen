let Scanner

function newScanner() {
    scanner = new Html5QrcodeScanner('reader', { 
        // Scanner will be initialized in DOM inside element with id of 'reader'
        qrbox: {
            width: 400,
            height: 400
        },  // Sets dimensions of scanning box (set relative to reader element width)
        fps: 20, // Frames per second to attempt a scan
    });

  scanner.render(success, error);
}

newScanner();

function success(result) {

}

function error(err) {
    //quand ca ne scan pas
}

//QR CODE
