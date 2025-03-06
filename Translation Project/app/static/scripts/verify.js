var verifyCode;

/*
This function will create a 6 digit code and send a POST with that code to the backend.
*/
window.onload(sendCode())
function sendCode(){
    verifyCode = Math.floor(Math.random() * 1000000)
    $.ajax({
      url: '/sendCode',
      type: 'POST',
      async: true,
      contentType: 'application/json',
      data: JSON.stringify({'code':verifyCode, 'email':sessionStorage.getItem("email"), 'fname':sessionStorage.getItem("fname")}),
      success: function(response) {
      }
    })
  }

/*
This function will verify the 6 digit code and send a POST to the backend.
*/
  function checkCode(){
    if(document.getElementById("code").value != ""){
      if(verifyCode == document.getElementById("code").value){
        $.ajax({
          url: '/verifyCode',
          type: 'POST',
          async: true,
          contentType: 'application/json',
          data: JSON.stringify({'email':sessionStorage.getItem("email")}),
          success: function(response) {
          }
        })
        window.location = '/login';
      }
      else{
        alert("Incorrect verification code")
      }
    }
    else{
      alert("Incorrect verification code")
    }
  }
