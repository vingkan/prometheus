![Prometheus Long Logo](http://vingkan.github.io/prometheus/img/pandora-long-logo.png)

# Pandora's Box
Analytics dashboard and hub for Prometheus.js.

+ Visualize data collected by Prometheus.
+ Track key milestones.
+ Release new features or run A/B tests on specific users.

PandorasBox.js was designed for Prometheus.js, a CRM library designed to help track specific information about website users to better address their needs.

[![Stories in Ready](https://badge.waffle.io/vingkan/prometheus.png?label=ready&title=Ready)](https://waffle.io/vingkan/prometheus) [![Join the chat at https://gitter.im/vingkan/prometheus](https://badges.gitter.im/vingkan/prometheus.svg)](https://gitter.im/vingkan/prometheus?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Demo
Here is a sample of Pandora's Box: viewing data from the Prometheus landing page.

![Pandora Demo: Exploring Visit Data](http://vingkan.github.io/prometheus/img/pandora-demo.gif)

## Setup
Download [the latest version](https://github.com/vingkan/prometheus/tree/master/pandora) of the dashboard: save this whole subfolder to your local machine. Find the `config.js` file and change the `FIREBASE_KEY` value to the subdomain name of the Firebase datastore where data tracked from your website by Prometheus is sent to. Then, run the directory on your localhost. To do this in python, open a command prompt in the folder and run `python -m SimpleHTTPServer` and then navigate to `localhost:8000`. Your dashboard should now be loaded up!

## About Us
Prometheus.js and PandorasBox.js were created by the development team at [Omnipointment](https://www.omnipointment.com/): the omnipotent appointment scheduling tool.