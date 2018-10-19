"use strict";

// Importing packages
const express = require('express');
const router  = express.Router();

// Mailgun
const api_key = '15ee2e12e8149b90d5ef7787213e7e15-a3d67641-89656c39';
const DOMAIN = 'sandbox419377d991934b54ac091534aad574dd.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

// base 36 to include all 26 letters and 10 numbers
// returns a numberOfChars long string starting at index 2
function generateRandomString(numberOfChars) {
  return Math.random().toString(36).substr(2, numberOfChars);
}

module.exports = (knex) => {
  const computeBorda = (req) => {
    const sum = {};
    knex('poll')
      .join('response', 'poll.id','=', 'response.poll_id')
      .join('vote', 'vote.response_id', '=', 'response.id')
      .select('*')
      .where('poll.randomURL', req.params.id)
      .then(function(table) {
        table.forEach(vote => {
          if (!sum[vote.response_id]) {
            sum[vote.response_id] = 0;
          }
          sum[vote.response_id] += vote.bordaValue;
        });
        for (let id in sum) {
          knex('response')
            .where('id', Number(id))
            .update('borda', sum[id])
            .then(function(){
              console.log('borda computed');
            })
        }
      });
  }

  // Endpoint for getting the create-new-poll page
  router.get("/new", (req, res) => {
    res.render("../views/new_poll.ejs");
  });

  // Endpoint for creating a poll. Redir to polls/:id/votes if success
  // where :id is a randomly generated 8 char long string

  router.post("/new", (req, res) => {
    // creates an object that knex can insert
    // the keys are the column names in the poll table

    let receivedData = req.body;

    const uniqueURL = generateRandomString(8);
    const newPoll = { text: receivedData.question,
      creator_email: receivedData.email,
      date_created: new Date(),
      randomURL: uniqueURL,
      end_date: receivedData.end};

      // by default this router expects to receive all the options
      // in a JSON.stringify string
      let receivedOptions = receivedData.options;

      // next we insert the new question as a new instance of the poll table
      // insertion returns the unique id of the new poll
      let pollID;
      knex.table('poll').insert(newPoll).returning('id').then(id => {
        pollID = id[0];
      }).then(function() {
        // using the received pollid we can parse an array of objects
        // which knex can insert into the response table
        return receivedOptions.map(element => {
          return {poll_id: pollID, response_text: element, borda: 0};
        });
      }).then((result) => {
        knex.table('response').insert(result).then(function(){
          res.clearCookie('session');
          req.session.email = receivedData.email;
          res.status(200).json({url: `/polls/${uniqueURL}/votes`});
        })
      });
  });

  // This searches for and deletes a poll
  router.delete("/:id", (req, res) => {
    knex("poll")
      .select("*")
      .where("randomURL", req.params.id)
      .then(function(response) {
          if (req.session.email === response[0].creator_email) {
            knex("poll").where("randomURL", req.params.id).del().then(function(){
              console.log('poll deleted');
            });
          } else {
            res.redirect("/error")
          }
      });
  });

  // Endpoint for submitting the vote. Redir to /polls/:id/votes on success
  // Logic is: find poll using randomURL; find responses using poll_id; find votes using
  //  response_id; loop through votes and responses and if reponse_id === id, increment
  router.put("/:id", (req, res) => {
    const options = req.body.obj;
    const borda = {};
    const insertBorda = new Promise(function(resolve, reject) {
      for (let i = 0; i < options.length; i++) {
      knex('response')
        .where('id', options[i])
        .update({
          borda: options.length - i
        })
        .then(function() {
          console.log('updated borda');
        });
        }
      });
    insertBorda;

    // .then(function() {
      computeBorda(req);
      console.log(req.params.id);
      knex('poll')
        .where('randomURL', req.params.id)
        .select('creator_email')
        .then(response => {
          console.log(response);
          const data = {
            from: 'Excited User <me@samples.mailgun.org>',
            to: response[0].creator_email,
            subject: 'Someone has voted on your poll',
            text: `A user has voted on your poll! Check it out at http://localhost:8080/polls/${req.params.id}/admin.
              Use your email and name to log into admin access.`
          };
          mailgun.messages().send(data, function (error, body) {
            console.log('emailed');
          });
        })
    // })
  });


  // Endpoint for displaying the current votes status
  router.get("/:id/votes", (req, res) => {
    let templateVars = {};
    let pollId;

    knex('poll')
      .join('response', 'poll.id','=', 'response.poll_id')
      .select('*')
      .where('poll.randomURL', req.params.id)
      .orderBy('borda')
      .then(function(table) {
        templateVars.owner = false;
        if (req.session.email === table[0].creator_email) {
          templateVars.owner = true;
        }
        templateVars.responses = table;
        res.render("../views/vote_finished.ejs", templateVars);
      });
  });

  router.get("/:id/admin", (req, res) => {
    let templateVars = {};
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then((response) => {
        templateVars.poll = response[0];
        console.log(req.session.email);
        console.log(response[0].creator_email);
        if (req.session.email === response[0].creator_email) {
          res.render('../views/admin.ejs', templateVars);
        } else {
          res.redirect(`/polls/${req.params.id}/votes`);
        }
      });

  });

  // Submit email address to soft-login and assign cookie
  router.put("/:id/login", (req, res) => {
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then((response) => {
        if (req.body.email === response[0].creator_email) {
          res.clearCookie('session');
          req.session.email = req.body.email;
          res.status(200).json({url: `/polls/${uniqueURL}/votes`});
        }
      });
  })

  // Searches for a poll based on randomURL and if owner, searches for specific
  //  response using id, then deletes
  router.delete("/:id/:response", (req, res) => {
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then((response) => {
        if (req.session.email === response[0].creator_email) {
        knex('response')
          .where('poll_id', response[0].id)
          .andWhere('id', req.params.response)
          .del()
          .then(function(){
            console.log('attempting delete')
          });
        }
      });
  });

  // Update a single response: searches for poll using randomURL, then checks if
  //  owner, and if true, searches for response using id, and update the text
  router.put("/:id/:response", (req, res) => {
    knex
      .select('*')
      .from('poll')
      .where('poll.randomURL', req.params.id)
      .then((response) => {
        if (req.session.email === response[0].creator_email) {
        knex('response')
          .where('poll_id', response[0].id)
          .andWhere('id', req.params.response)
          .update({
            text: req.body.text
          })
          .then(function(){
            console.log('attempting update');
            res.redirect(`/polls/${req.params.id}/votes`);
          });
        }
      });
  })

  router.post("/test/email", (req, res) => {
    const data = {
      from: 'Excited User <me@samples.mailgun.org>',
      // to:
      subject: 'Hello',
      text: 'Testing some Mailgun awesomness!'
    };
    mailgun.messages().send(data, function (error, body) {
      console.log('emailed');
    });

  })
  return router;
}
