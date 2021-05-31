# French
OpenSTEAM LMS est un module de gestion de classe (LMS en anglais) co-développé par Vittascience et Cabrilog, qui vous est proposé sur les plateformes [vittascience.com](https://fr.vittascience.com) et [cabri.com](https://cabri.com/fr/) sous forme de service Cloud.

![Vittascience-Cabri-FR](https://user-images.githubusercontent.com/36603099/115318825-d7003b80-a17e-11eb-89e6-2884b40bef60.jpg)

OpenSTEAM LMS a bénéficié du soutien du Ministère de l'Éducation Nationale via [le dispositif Édu-up](https://eduscol.education.fr/1603/le-dispositif-edu).
 
Il est également possible de déployer ce LMS par soi-même, en dupliquant le code source ci-dessus. Celui-ci est libre, disponible [sous licence AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.fr.html).

Le LMS a été pensé de façon modulaire, avec un cœur flexible pour de nombreux usages et un système de plugins permettant d’ajouter des fonctionnalités avancées ou de modifier l’apparence.

Vous souhaitez contribuer ? Votre aide est précieuse à de nombreux niveaux, que ce soit pour faire remonter des problèmes ou des idées, apporter des éléments de traduction, créer un thème ou un plugin personnalisé.

N’hésitez pas à contacter l’équipe [Vittascience](mailto:contact@vittascience.com) ou [Cabri](mailto:contact@cabri.com) pour toute question.

# English
OpenSTEAM LMS is a Learning Management System (LMS) co-developed by Vittascience and Cabrilog, which is offered to you on the [vittascience.com](https://en.vittascience.com) and [cabri.com](https://cabri.com/en/) platforms as a Cloud service.

![Vittascience-Cabri-EN](https://user-images.githubusercontent.com/36603099/115319277-b2589380-a17f-11eb-9f17-2bbfbd4b227c.jpg)

OpenSTEAM LMS benefited from the support of the French Ministry of National Education through [the Édu-up program](https://eduscol.education.fr/1603/le-dispositif-edu).
 
You can also deploy this LMS on your own, by duplicating the source code above. This one is free, available [under the AGPL-3.0 license](https://www.gnu.org/licenses/agpl-3.0.en.html).

The LMS has been designed in a modular fashion, with a flexible core for many uses and a system of plugins to add advanced features or modify the appearance.

Do you want to contribute? Your help is invaluable on many levels, whether it is to raise problems or ideas, to provide translation elements, to create a theme or a custom plugin:

Please do not hesitate to contact the team [Vittascience](mailto:contact@vittascience.com) or [Cabri](mailto:contact@cabri.com) for any questions.


# OpenSTEAM LMS use tutorial

You can find the LMS tutorial on [a video on Youtube](https://www.youtube.com/watch?v=rN3hhDZCRMc) (In french)

# How to setup project environment

1. [Clone the repository](https://github.com/vittascience/STEAMS-LMS#clone-the-repository)
2. [.env file creation](https://github.com/vittascience/STEAMS-LMS#env-file-creation)
3. [VirtualHost Setup](https://github.com/vittascience/STEAMS-LMS#virtualhost-setup)
4. [Database setup](https://github.com/vittascience/STEAMS-LMS#database-setup)
5. [Dependencies](https://github.com/vittascience/STEAMS-LMS#dependencies)
6. [Build](https://github.com/vittascience/STEAMS-LMS#build)
7. [Plugins](https://github.com/vittascience/STEAMS-LMS#plugins)
8. [OpenSTEAM LMS back end core](https://github.com/vittascience/STEAMS-LMS#opensteam-lms-back-end-core)

## Clone the repository

Clone the present repository into your server

## .env file creation

At the root of your current folder (`/OpenSTEAM-LMS/`) create a `.env` file.
Inside of this file, copy/paste the following

``` 
VS_HOST=
VS_DB_HOST=**localhost**
VS_DB_PORT=**3306**
VS_DB_NAME=
VS_DB_USER=
VS_DB_PWD=
VS_MAPS_API_KEY=
VS_CAPTCHA_SECRET=
VS_CAPTCHA_PUBLIC_KEY=
VS_MAIL_SERVER=
VS_MAIL_PORT=
VS_MAIL_TYPE=
VS_MAIL_ADDRESS=
VS_MAIL_PASSWORD=
# setup the new admin data
ADMIN_PSEUDO=PSEUDO_DE_VOTRE_CHOIX
ADMIN_PASSWORD=MOT_DE_PASSE
ADMIN_EMAIL=EMAIL
```

Don't forget to fill/change these constants with relevant information (at least all the VS_DB)

## VirtualHost Setup

1. Open your hosts file with admin privileges (`C:\windows\system32\drivers\etc\hosts`) or  (`sudo nano /etc/hosts`)

2. Modify your hosts file by adding this line: `127.0.0.1 steamlms`

3. 🏗️ Add steamlms:80 as a VirtualHost in your XAMPP/MAMP/hosting software

## Database setup

To setup the database, just load the .sql file that is in the folder ```sql-files``` at the root of the repository. To avoid any issue, it it very important to disactivate the foreign key check.
Then you have to check if the created database name match the VS_DB_NAME in the .env file.

## Dependencies

Run `composer install` to download all the needed PHP dependencies.
Then, run `npm install` to download all the needed JavaScript dependencies (for instance for the gulp build...).

Now you should be able to access the lms on your browser in ```http://steamlms/classroom```
The default account login is ```admin@admin.com``` and password is ```admin``` => Don't forget to remove this account in your database before pushing it online.

## Build

When changing the view files or when working on a plugin, you need to run a gulp build to apply the changes on the L.M.S.

To do so, you just need to follow few steps:

1. Open a terminal

2. Go to the OpenSTEAM LMS folder

3. Type the command ```gulp build```

4. Wait for the tasks to finish and voilà !

## Plugins

If you need to add some features and/or theme design which aren't relevant in the OpenSTEAM LMS core, you must create plugins. To do so you need to respect a certain directory structure for your plugin folder(s) and some recommendations.

### 1. Create your plugin(s) directory

#### Plugin directory tree

```
+---your-plugin-directory
|   +---Controller
|   +---Entities
|   +---public
|   |   +---css
|   |   +---images
|   |   \---js
|   \---Views
```

#### Where do I need to put my plugin directory ?

You just need to put it in a folder named ```plugins``` at the root of the OpenSTEAM LMS (It is in the .gitignore, so you'll probably have to create it).

### 2. Create your plugin files and put them in the relevant folders
- Your custom controller file(s) in the ```Controller``` folder
- Your custom entitie file(s) in the ```Entities``` folder
- Your custom css file(s) in the ```public/css``` folder
- Your custom image file(s) in the ```public/images``` folder
- Your custom javascript file(s) in the ```public/js``` folder
- Your custom view file(s) in the ```Views``` folder

</ul>

*As far as possible, avoid to change the view files. Otherwise, it'll be more difficult to retrieve changes from the LMS core in future updates*

### 3. Launch the Build

Follow the steps described in the Build section above

## OpenSTEAM LMS back end core

The current repository only contains front elements of the LMS. The back end is mainly located in the dependencies (in the vendor folder) :

- [vuser](https://github.com/vittascience/vuser)
- [vclassroom](https://github.com/vittascience/vclassroom)
- [vutils](https://github.com/vittascience/vutils)
- vinterfaces (not public yet)
- vlearn (not public yet)
