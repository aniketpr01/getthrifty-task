<!-- Create a virtual environment -->
python -m venv venv
<!-- Activate the virtual environment -->
source venv/bin/activate
<!-- install required packages -->
pip install Flask
pip install flask_pymongo
pip install redis
<!-- Create the requirements.txt file -->
pip freeze > requirements.txt

<!-- //run flask code -->
<!-- In your flask_app directory, open a file named app.py for editing, use nano or your favorite text editor: -->
nano app.py
flask run
<!-- build docker image -->
docker build -t flask_photos_microservice .

<!-- How to run an image as a container -->
docker images
<!-- Using the docker run command, we can run an image by passing the image's name as a parameter. -->
docker run
<!-- run the image in detached mode. Because we need to view this application in the browser -->
<!-- docker run -d -p 5000:5001 flask_photos_microservice -->
docker run -d -p 3000:3000 flask_photos_microservice

<!-- We can use the following command to see which containers are currently running -->
docker ps
<!-- Test the API locally -->
$ FLASK_APP=app.py FLASK_ENV=development flask run

% to run with docker-compose
docker-compose up -d
