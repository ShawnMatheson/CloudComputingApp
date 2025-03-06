/*
This function Pulls the translation data from index.html and sends a POST response to the backend.
*/
function translateText(){
    var textToTranslate = document.getElementById('curText').value.trim();
    var curLang = document.getElementById('curLang').value
    var translatedLang = document.getElementById('translatedLang').value
    $.ajax({
        url: '/translate',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify({'curText':textToTranslate,'curLang':curLang,'translatedLang':translatedLang}),
        success: function(response) {
            document.getElementById('translatedText').value = response;
        }
      })
}