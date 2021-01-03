# API Vinted clone
## User
### /user/signup (POST)
S'incrire

FormData | Type | Required
-----|------|---------
username | String | Yes
email | String | Yes
password | String | Yes
phone | String | No
picture | File | No

### /user/login (POST)
Se connecter

Body | Type | Required
-----|------|---------
email | String | Yes
password | String | Yes

## Offer
### /offer/publish (POST)
Publier une annonce (possible uniquement si authentifié)

FormData | Type | Required
-----|------|---------
title | String | No
description | String | No
price | String | No
condition | String | No
city | String | No
brand | String | No
size | String | No
color | String | No
picture | File or Array | No

### /offer/update (PUT)
Mettre à jour une annonce (possible uniquement si authentifié)

FormData | Type | Required
-----|------|---------
title | String | No
description | String | No
price | String | No
condition | String | No
city | String | No
brand | String | No
size | String | No
color | String | No
picture | File or Array | No

### /offer/delete/:id (DELETE)
Supprimer une annonce (possible uniquement si authentifié)

Body | Required | Description
-----|------|---------
id | Yes | offer id

### /offers (GET)
Récupérer les annonces avec outil de recherche, tri et pagination.

Query | Required | Description
-----|------|---------
title | no | offer title
priceMin | no | minimal price
priceMax | no | maximal price
sort | no | price-asc for ascendant prices / price-desc for descendant prices
page | no | page id (default 1)
limit | no | offers per page (default 10)

### /offer/:id (GET)
Récupérer une annonce via son id

Param | Required | Description
-----|------|---------
id | Yes | offer id

## Pay
### /pay (POST)
Création de la transaction et envoi à Stripe

Body | Type | Required
-----|------|---------
stripeToken | String | Yes
amount | Number | Yes
title | String | Yes

## Déploiement
La base de données est hébergée sur MongoDB Atlas et l'API sur Heroku à l'adresse suivante : https://vinted-backend.herokuapp.com/
