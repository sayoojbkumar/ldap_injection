# ldap_injection

## Description

This is a example how bad implementation of ldap cause certain data leak

Used ldap server : 
ldap://ldap.forumsys.com:389

## AIM

Find out anyone of the user mail,login with the mail and finally capture the flag

## Launch Challenge

npm install

node ldap.js

### flag

flag{L_D_A_P}

### Solution

1. find any user uid using search functionality 
2. Do blind based injection for email

### Slides

https://docs.google.com/presentation/d/1EK3KgU7ylt9etJDPIibJznpMHxV_HYLfYeQsWGDznK0/edit?usp=sharing
