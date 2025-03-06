/*
This function gets the email and password that the suer used to login and sends this information to the backend.
based on the response from the backend it will display errors if the logins details are incorrect, take the user to
a page that will allow them to verify their email or send them to the hoem page.
*/
function checklogin(){
    var email = document.getElementById('email').value.trim();
    var pass = document.getElementById('password').value.trim();
    if(emailRegex(email) && passwordRegex(pass)){
        $.ajax({
            url: '/checklogin',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({'email':email,'password':pass}),
            success: function(response) {
                response = JSON.parse(response)
                if("success" in response){
                    window.location = '/';
                }
                else{
                    if(response["fail"] == "verified"){
                        alert("This Account has not been verified, a code has been sent to this account's email address")
                        sessionStorage.setItem("fname",response['fname'])
                        sessionStorage.setItem("email", response['email'])
			            window.location = '/verify';
                    }
                    else if(response["fail"] == "password"){
                        alert("Incorrect password")
                    }
                    else if(response["fail"] == "email"){
                        alert("This account does not exist")
                    }
                }
            },
        });
    }
    else{
        alert("Incorrect email and password")
    }
    email = ""
    pass = ""
}

//email regex taken from: https://regex-generator.olafneumann.org/?sampleText=Apples1234%40email.com&flags=i&selection=0%7CRFC2822%20e-mail on July.15/2023
function emailRegex(input) {
    let regex = /^[-A-Za-z0-9!#$%&'*+\/=?^_`{|}~]+(?:\.[-A-Za-z0-9!#$%&'*+\/=?^_`{|}~]+)*@(?:[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[-A-Za-z0-9]*[A-Za-z0-9])?$/i;
    return regex.test(input);
}

//password regex taken from: https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a on July.15th/2023
function passwordRegex(input) {
    let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/i;
    return regex.test(input);
}
