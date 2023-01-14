---
title: 'Creating the Logbook Project'
draft: false
hero: images/hero.png
---

Track billed hours to separate buckets


{{< img src="/projects/logbook_screenshot.png" width="650" align="center" title="A boat at the sea" >}}

## The problem
Keeping track of the ‘real’ hours worked vs the adjusted ‘billed’ hours can be tricky. They are different, and we need a system to keep track of billed hours. This is for companies that have clients that buy ‘Buckets’ of hours and then slowly use those hours for support and development. Support staff need to be able to answer the question:

- How many hours does this client have left?
- Can we accept new work or do we need to buy more hours first?

## The project

The project is a simple interface to store hours against buckets and invoices. There are different authorization levels for read only users vs admins who can input hours content.

The demo site is hosted on github pages for the react front end and google cloud run for the backend with a sqlite database for this demo.

The backend was initially done with Google's Firebase, but was migrated over to Yii 2 (PHP framework) + PostgresQL to host on AWS servers for production.

The frontend uses React.js javascript framework.

## Results
This app is currently successfully being used in an internal production billing system to handle vital billing data.

[View a demo of the project](https://kristian-94.github.io/logbook)

[View project source code](https://github.com/kristian-94/logbook)

