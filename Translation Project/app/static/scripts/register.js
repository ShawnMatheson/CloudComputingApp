/*
This function will gather the account details from the registration form and check that they are all valid.
If they are valid it will send a POST to the backend wehre the data can be uploaded to the database.
*/
function storedata(){
    var email = document.getElementById('email').value.trim();
    var fname = document.getElementById('fname').value.trim();
    var pass1 = document.getElementById('password1').value.trim();
    var pass2 = document.getElementById('password2').value.trim();
    var lname = document.getElementById('lname').value.trim();
    if(emailRegex(email)){
      var check = checkemail(email);
      if(check){
        if(pass1 != pass2){
            alert("Passwords do not match!");
        }
        else if(passwordRegex(pass1)){
          if(nameRegex(fname) && nameRegex(lname)){
            $.ajax({
              url: '/storedata',
              type: 'POST',
              async: true,
              contentType: 'application/json',
              data: JSON.stringify({'email':email,'password':pass1,'fname':fname,'lname':lname}),
              success: function(response) {
                sessionStorage.setItem("email", email)
                sessionStorage.setItem("fname", fname)
                window.location = '/verify';
              }
            })
          }
          else{
            alert("The first and last name fields can only contain letters")
          }
        }
        else{
          alert("The password you entered is not a valid password");
        }
      }
      else{
        alert("That email is taken");
      }
    }
    else{
      alert("The email address you entered is not a valid email addresss");
    }
}

/*
This function sends a post to the backend that will verify that a particular email address is not already registered.
*/
function checkemail(email){
  var res = "";
  $.ajax({
    url: '/checkemail',
    type: 'POST',
    async: false,
    contentType: 'application/json',
    data: JSON.stringify({'email':email}),
    success: function(response) {
      if(response.toString() == "true"){
        res = true;
      }
      else{
        res = false;
      }
    }
  })
  return res;
}

//password regex taken from: https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a on July.15th/2023
function passwordRegex(pass) {
  let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/i;
  return regex.test(pass);
}

//email regex taken from: https://regex-generator.olafneumann.org/?sampleText=Apples1234%40email.com&flags=i&selection=0%7CRFC2822%20e-mail on July.15/2023
function emailRegex(email) {
  let regex = /^[-A-Za-z0-9!#$%&'*+\/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+\/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?$/i;
  return regex.test(email);
}

function nameRegex(name) {
  let regex = /^[A-Za-z]+$/i;
  return regex.test(name);
}
