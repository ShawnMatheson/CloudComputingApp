from flask import Flask, render_template, request, session, redirect
import boto3, pymysql, json, os, bcrypt
from flask_session import Session
from googletrans import Translator

app = Flask(__name__)

# This function creates a route that opens up the registration page
@app.route('/register')
def register():
    if 'email' in session:
        return redirect("/")
    return render_template('register.html')

# This function creates a route that stores data from a POST request into the database
@app.route('/storedata', methods=['POST'])
def storedata():
    secret = getDatabase()
    array = request.get_json(force=True)
    salt = bcrypt.gensalt()
    array['password'] = bcrypt.hashpw(array['password'].encode('utf-8'),salt)
    dbcon = pymysql.connect(
    host= 'project-database-instance-1.clncimpxmdkz.us-east-1.rds.amazonaws.com', 
    port = 3306,
    user = secret['username'], 
    password = secret['password'],
    db = 'project',    
    )
    dbcur = dbcon.cursor()
    dbcur.execute("INSERT INTO user (email,password,fname,lname,verified) VALUES (%s,%s,%s,%s,%s)", (array['email'],array['password'],array['fname'],array['lname'],0))
    dbcon.commit()
    dbcur.close()
    dbcon.close()
    return(json.dumps({"message": "Success."}))

# This function creates a route that will check the login details that it receives from a POST request
# with login details that are stored in the database
@app.route('/checklogin', methods=['POST'])
def checklogin():
    secret = getDatabase()    
    post = request.get_json(force=True)
    dbcon = pymysql.connect(
    host= 'project-database-instance-1.clncimpxmdkz.us-east-1.rds.amazonaws.com', 
    port = 3306,
    user = secret['username'], 
    password = secret['password'],
    db = 'project',    
    )
    dbcur = dbcon.cursor()
    sql = "SELECT * FROM user WHERE email=%s"
    value  = (str(post['email']),)
    dbcur.execute(sql,value)
    dbdata = dbcur.fetchall()
    dbcon.commit()
    dbcur.close()
    dbcon.close()
    if dbdata:
        dbdata = dbdata[0]
        if(bcrypt.checkpw(post['password'].encode('utf-8'),dbdata[2].encode('utf-8'))):
            if(dbdata[5] != 0):
                session['fname'] = dbdata[3]
                session['lname'] = dbdata[4]
                session['email'] = dbdata[1]
                return json.dumps({'success':'success'})
            else:
                return json.dumps({'fail':"verified",'email':post['email'], 'fname':dbdata[3]})
        else:
            return json.dumps({'fail':"password"})
    else:
        return json.dumps({'fail':'email'})

# This function creates a route that opens up the login page
@app.route('/login')
def login():
    if 'email' in session:
        return redirect("/")
    return render_template('login.html')

# This function creates a route that pulls a users credentials from the database to verify whether or not that user exists.
@app.route('/checkemail', methods=['POST'])
def checkemail():
    secret = getDatabase()
    post = request.get_json(force=True)
    dbcon = pymysql.connect(
    host= 'project-database-instance-1.clncimpxmdkz.us-east-1.rds.amazonaws.com', 
    port = 3306,
    user = secret['username'], 
    password = secret['password'],
    db = 'project',    
    )
    dbcur = dbcon.cursor()
    sql = "SELECT * FROM user WHERE email=%s"
    value  = (str(post['email']),)
    dbcur.execute(sql, value)
    dbdata = dbcur.fetchall()
    dbcon.commit()
    dbcur.close()
    dbcon.close()
    if dbdata:
        return "false"
    else:
        return "true"

# This function creates a route that opens up the index page
@app.route('/', methods=['POST','GET'])
def index():
    if not 'email' in session:
        return redirect("/login")

    return render_template('index.html')

# This function creates a route that calls a lambda function which will send the verification code to an email.
@app.route('/sendCode', methods=['POST'])
def sendCode():
    post = request.get_json(force=True)
    session = boto3.session.Session()
    client = session.client(
        service_name='lambda',
        region_name="us-east-1"
    )
    response = client.invoke(
        FunctionName='Send_Email_Code',
        Payload=json.dumps(post),
    )
    return("success")

# This function creates a route that opens up the verify page.
@app.route('/verify')
def verify():
    if 'email' in session:
        return redirect("/")
    
    return render_template('verify.html')

# This function will create a route that updates the verified status of an account that has been verified.
@app.route('/verifyCode', methods=['POST'])
def verifyCode():
    secret = getDatabase()
    post = request.get_json(force=True)
    dbcon = pymysql.connect(
    host= 'project-database-instance-1.clncimpxmdkz.us-east-1.rds.amazonaws.com', 
    port = 3306,
    user = secret['username'], 
    password = secret['password'],
    db = 'project',    
    )
    dbcur = dbcon.cursor()
    sql = "UPDATE user SET verified=%s where email=%s"
    value =('1',str(post['email']),)
    dbcur.execute(sql,value)
    dbcon.commit()
    dbcur.close()
    dbcon.close()
    return "success"

# This function creates a route that will use the data from a POST request to call the google translate api and make a translation request.
@app.route("/translate", methods=['POST'])
def translate():
    post = request.get_json(force=True)
    translator = Translator()
    if post['curLang'] == 'detect':
        result = translator.translate(post['curText'], dest=post['translatedLang'])
    else:
        result = translator.translate(post['curText'],src=post['curLang'] , dest=post['translatedLang'])

    return result.text

# This function creates a route that logs the user out of the application
@app.route("/logout")
def logout():
    session.pop('fname')
    session.pop('email')
    session.pop('lname')
    return redirect("/login")

# This function will retrieve the database username and password from AWS Secrets Manager.
def getDatabase():
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name="us-east-1"
    )
    db_secret = client.get_secret_value(
        SecretId="project-database"
    )
    secret = db_secret['SecretString']
    return json.loads(secret)

# This function will retrieve the Sessions secret key from AWS Secrets Manager.
def getSessionKey():
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name="us-east-1"
    )
    session_secret = client.get_secret_value(
        SecretId="sessionkey"
    )
    secret = session_secret['SecretString']
    return json.loads(secret)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.secret_key = getSessionKey()
Session(app)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
