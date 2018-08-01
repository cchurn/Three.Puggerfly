/**
 * Created by cchurn16 on 4/10/18.
 */
/*global */
import {EventEmitter} from 'events';
import $ from 'jquery';

const bitlyService = 'https://api-ssl.bitly.com/v3/shorten';
const bitlyAccessToken ='3d7694b3d6607a113e46854c74dc8985434b1922';

class Sharing extends EventEmitter {
    sendData( base64string ) {
        return new Promise(resolve => {
            const contentType = 'image/jpeg';
            const b64Data = base64string.substr(base64string.indexOf(',') + 1);
            const blob = this.b64toBlob(b64Data, contentType);

            let data = new FormData();
            data.append('file', blob);

            $.ajax({
                //          url :  "https://sharetest2.herokuapp.com/myserver3.php",
                url :  "https://www.aestudio.co.uk/bq/myserver3.php",
                type: 'POST',
                data: data,
                timeout: 60000000,
                contentType: false,
                processData: false,
                success: function(data) {
                    resolve(data);
                },
                error: function() {
                    console.log('URK');
                }
            });
        });
    }

    /**
     * private
     * @param b64Data
     * @param contentType
     * @param sliceSize
     * @returns {Blob}
     */
    b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        let byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);
            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }

    getShortURL(url) {
        var longurl = bitlyService + '?access_token=' + bitlyAccessToken + '&longUrl=' + encodeURIComponent(url);
        console.log(longurl);
        return new Promise(function( resolve, reject ) {
            $.getJSON(

                longurl,
                {},
                function(res)
                {
                    resolve(res);
                }
            );}.bind( this ));
    }
}
export default Sharing;