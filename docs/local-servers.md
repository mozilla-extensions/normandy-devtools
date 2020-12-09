# Local Servers

One of Normandy Devtools' primary functions it to interact with remote
services, such as Normandy and Experimenter. These services usually have dev
and stage instances available to work with, but in case you want a local
sandbox to develop against, these steps can help set that up.

The default configuration of NDT is already set up to connect to the servers
started by this process.

Currently we have automatic set up steps for

* Normandy
* Postgres (a dependency of Normandy)
* Autograph (a dependency of Normandy)

## Prerequisites

You'll need Docker and Docker Compose.

## Service installation

Most of the steps are handled automatically by docker-compose. Simply running
the following will do most of the work:

```shell
docker-compose up
```

## Service setup

You'll need permissions to edit Normandy if you want to make changes to recipes on the server. These easiest way to do that is *before interacting with the API*, run the following command:

```shell
docker-compose run normandy python manage.py createsuperuser
```

When prompted, enter your full LDAP email address (name@mozilla.com) for the
*both* username and email address.

If you accidentally create your user before running this step, you can grant
it super user privileges through with the Django shell. The commands to do
that are:

```shell
# Open a Django shell
$ docker-compose run normandy python manage.py shell
# import needed items
>>> from django.contrib.auth.models import User
# get your user
>>> me = User.object.get(username="username@mozilla.com")
# Edit it
>>> me.is_superuser = True
# And save it
>>> me.save()
```
